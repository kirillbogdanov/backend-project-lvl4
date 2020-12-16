import _ from 'lodash';

export default (app, options, done) => {
  app
    .get('/users', async (req, res) => {
      try {
        const users = await app.objection.models.user.query()
          .select('id', 'email', 'firstName', 'LastName');

        res.render('users/index', { users });
        return res;
      } catch (e) {
        return e.error;
      }
    })
    .post('/users', async (req, res) => {
      try {
        const user = app.objection.models.user.fromJson(req.body.data);

        await app.objection.models.user.query().insert(user);
        req.flash('info', app.t('flash.users.create.success'));

        res.redirect('/session/new');
        return res;
      } catch (e) {
        req.flash('error', app.t('flash.users.create.error'));
        const user = _.omit(req.body.data, ['password']);

        res.render('/users/new', { user, errors: e.data });
        return res;
      }
    })
    .get('/users/new', (req, res) => {
      res.render('users/new');
    })
    .post('/users/:id', () => {})
    .patch('/users/:id', async (req, res) => {
      const { id } = req.params;

      if (!req.user || req.user.id !== Number(id)) {
        req.flash('error', app.t('flash.users.unauthenticated'));
        res.redirect('/users');

        return res;
      }

      try {
        const user = await app.objection.models.user.query().findById(id);

        await user.$query().patch(req.body.data);
        req.flash('info', app.t('flash.users.edit.success'));

        res.redirect('/users');

        return res;
      } catch (e) {
        req.flash('error', app.t('flash.users.edit.error'));
        const user = _.omit(req.body.data, ['password']);
        user.id = id;

        res.render('users/edit', { user, errors: e.data });

        return res;
      }
    })
    .delete('/users/:id', async (req, res) => {
      const { id } = req.params;

      if (!req.user || req.user.id !== Number(id)) {
        req.flash('error', app.t('flash.users.unauthenticated'));
        res.redirect('/users');

        return res;
      }

      try {
        const user = await app.objection.models.user.query().findById(id);

        await req.logOut();
        await user.$query().delete();
        res.redirect('/users');

        return res;
      } catch (e) {
        return e.error;
      }
    })
    .get('/users/:id/edit', async (req, res) => {
      const { id } = req.params;

      if (!req.user || req.user.id !== Number(id)) {
        req.flash('error', app.t('flash.users.unauthenticated'));
        res.redirect('/users');

        return res;
      }

      try {
        const user = await app.objection.models.user.query().findById(id);

        if (!user) {
          res.callNotFound();

          return res;
        }

        res.render('users/edit', { user });
        return res;
      } catch (e) {
        return e.error;
      }
    });

  done();
};
