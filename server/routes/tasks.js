import _ from 'lodash';
import Task from '../models/Task.js';
import Status from '../models/Status.js';
import User from '../models/User.js';
import Label from '../models/Label.js';

export default (app, options, done) => {
  const getStatusesSelectOptions = async () => {
    const statuses = await Status.query()
      .select('id', 'name');

    return [
      { label: '' },
      ...statuses.map((status) => ({
        value: status.id,
        label: status.name,
      })),
    ];
  };

  const getUsersSelectOptions = async () => {
    const users = await User.query()
      .select('id', 'firstName', 'lastName');

    return [
      { label: '' },
      ...users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
      })),
    ];
  };

  const getLabelsSelectOptions = async () => {
    const labels = await Label.query()
      .select('id', 'name');

    return labels.map((label) => ({
      value: label.id,
      label: label.name,
    }));
  };

  const parseTaskData = (taskData) => {
    let labels;

    if (Array.isArray(taskData.labels)) {
      labels = taskData.labels.map((labelId) => Number(labelId));
    } else if (taskData.labels) {
      labels = [Number(taskData.labels)];
    } else {
      labels = [];
    }

    return {
      ...taskData,
      statusId: taskData.statusId ? Number(taskData.statusId) : null,
      executorId: taskData.executorId ? Number(taskData.executorId) : null,
      labels,
    };
  };

  app
    .get('/tasks', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const tasks = await Task.query();
        const graph = await Task.fetchGraph(
          tasks,
          '[status(selectStatus), creator(selectUser), executor(selectUser)]',
        ).modifiers({
          selectStatus(builder) {
            builder.select('name');
          },
          selectUser(builder) {
            builder.select('firstName', 'lastName');
          },
        });

        res.render('tasks/index', {
          tasks: graph,
        });
        return res;
      } catch (e) {
        return e.error;
      }
    })
    .post('/tasks', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const taskData = {
          ...parseTaskData(req.body.data),
          creatorId: req.user.id,
        };
        const task = Task.fromJson(taskData);

        await Task.query().insert(task);
        if (taskData.labels.length > 0) {
          await task.addLabels(taskData.labels);
        }
        req.flash('info', app.t('flash.tasks.create.success'));

        res.redirect('/tasks');
        return res;
      } catch (e) {
        const [statuses, users, labels] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(), getLabelsSelectOptions(),
        ]);

        req.flash('error', app.t('flash.tasks.create.error'));
        res.render('/tasks/new', {
          task: parseTaskData(req.body.data), statuses, users, labels, errors: e.data,
        });
        return res;
      }
    })
    .get('/tasks/new', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const [statuses, users, labels] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(), getLabelsSelectOptions(),
        ]);

        res.render('tasks/new', { statuses, users, labels });
        return res;
      } catch (e) {
        return e.error;
      }
    })
    .get('/tasks/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const task = await Task.query().findById(id);

        if (!task) {
          res.callNotFound();

          return res;
        }

        const graph = await Task.fetchGraph(
          task,
          '[status(selectStatus), creator(selectUser), executor(selectUser), labels(selectLabel)]',
        ).modifiers({
          selectStatus(builder) {
            builder.select('name');
          },
          selectUser(builder) {
            builder.select('firstName', 'lastName');
          },
          selectLabel(builder) {
            builder.select('name');
          },
        });

        res.render('tasks/card', {
          task: graph,
        });
        return res;
      } catch (e) {
        return e.error;
      }
    })
    .post('/tasks/:id', () => {})
    .patch('/tasks/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const task = await Task.query().findById(id);

        if (!task) {
          res.callNotFound();

          return res;
        }

        const taskData = parseTaskData(req.body.data);

        const graph = await Task.fetchGraph(task, 'labels');
        const currentLabels = graph.labels.map((label) => label.id);
        const labelsToDelete = _.difference(currentLabels, taskData.labels);
        const labelsToAdd = _.difference(taskData.labels, currentLabels);

        await task.$query().patch(parseTaskData(req.body.data));
        if (labelsToAdd.length > 0) {
          await task.addLabels(labelsToAdd);
        }
        if (labelsToDelete.length > 0) {
          await task.deleteLabels(labelsToDelete);
        }
        req.flash('info', app.t('flash.tasks.edit.success'));

        res.redirect('/tasks');

        return res;
      } catch (e) {
        req.flash('error', app.t('flash.tasks.edit.error'));
        const task = parseTaskData(req.body.data);
        const [statuses, users, labels] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(), getLabelsSelectOptions(),
        ]);
        task.id = id;

        res.render('tasks/edit', {
          task, statuses, users, labels, errors: e.data,
        });

        return res;
      }
    })
    .delete('/tasks/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const task = await Task.query().findById(id);

        if (!task) {
          res.callNotFound();

          return res;
        }

        if (task.creatorId !== req.user.id) {
          req.flash('error', app.t('flash.tasks.delete.unauthorized'));
        } else {
          await task.$query().delete();
          req.flash('info', app.t('flash.tasks.delete.success'));
        }

        res.redirect('/tasks');

        return res;
      } catch (e) {
        return e.error;
      }
    })
    .get('/tasks/:id/edit', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const task = await Task.query().findById(id);

        if (!task) {
          res.callNotFound();

          return res;
        }

        const graph = await Task.fetchGraph(task, 'labels(selectLabel)').modifiers({
          selectLabel(builder) {
            builder.select('labels.id');
          },
        });
        graph.labels = graph.labels.map((label) => label.id);

        const [statuses, users, labels] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(), getLabelsSelectOptions(),
        ]);

        res.render('tasks/edit', {
          task: graph, statuses, users, labels,
        });
        return res;
      } catch (e) {
        return e.error;
      }
    });

  done();
};
