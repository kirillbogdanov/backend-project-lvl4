import Task from '../models/Task.js';
import Status from '../models/Status.js';
import User from '../models/User.js';

export default (app, options, done) => {
  const getStatusesSelectOptions = async () => {
    const statuses = await Status.query()
      .select('id', 'name');

    return statuses.map((status) => ({
      value: status.id,
      label: status.name,
    }));
  };

  const getUsersSelectOptions = async () => {
    const users = await User.query()
      .select('id', 'firstName', 'lastName');

    return users.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName}`,
    }));
  };

  const parseTaskData = (taskData) => ({
    ...taskData,
    statusId: taskData.statusId ? Number(taskData.statusId) : null,
    executorId: taskData.executorId ? Number(taskData.executorId) : null,
  });

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
        req.flash('info', app.t('flash.tasks.create.success'));

        res.redirect('/tasks');
        return res;
      } catch (e) {
        const [statuses, users] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(),
        ]);

        req.flash('error', app.t('flash.tasks.create.error'));
        res.render('/tasks/new', {
          task: req.body.data, statuses, users, errors: e.data,
        });
        return res;
      }
    })
    .get('/tasks/new', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const [statuses, users] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(),
        ]);

        res.render('tasks/new', { statuses, users });
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
          '[status(selectStatus), creator(selectUser), executor(selectUser)]',
        ).modifiers({
          selectStatus(builder) {
            builder.select('name');
          },
          selectUser(builder) {
            builder.select('firstName', 'lastName');
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

        await task.$query().patch(parseTaskData(req.body.data));
        req.flash('info', app.t('flash.tasks.edit.success'));

        res.redirect('/tasks');

        return res;
      } catch (e) {
        req.flash('error', app.t('flash.tasks.edit.error'));
        const task = { ...req.body.data };
        const [statuses, users] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(),
        ]);
        task.id = id;

        res.render('tasks/edit', {
          task, statuses, users, errors: e.data,
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

        const [statuses, users] = await Promise.all([
          getStatusesSelectOptions(), getUsersSelectOptions(),
        ]);

        res.render('tasks/edit', { task, statuses, users });
        return res;
      } catch (e) {
        return e.error;
      }
    });

  done();
};
