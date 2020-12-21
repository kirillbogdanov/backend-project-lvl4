export default (app, options, done) => {
  app
    .get('/statuses', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const statuses = await app.objection.models.status.query()
          .select('id', 'name', 'createdAt');

        res.render('statuses/index', { statuses });
        return res;
      } catch (e) {
        return e.error;
      }
    })
    .post('/statuses', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const status = app.objection.models.status.fromJson(req.body.data);

        await app.objection.models.status.query().insert(status);
        req.flash('info', app.t('flash.statuses.create.success'));

        res.redirect('/statuses');
        return res;
      } catch (e) {
        req.flash('error', app.t('flash.statuses.create.error'));
        res.render('/statuses/new', { status: req.body.data, errors: e.data });
        return res;
      }
    })
    .get('/statuses/new', { preHandler: app.restrictForUnauthorized }, (req, res) => {
      res.render('statuses/new');
    })
    .post('/statuses/:id', () => {})
    .patch('/statuses/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const status = await app.objection.models.status.query().findById(id);

        if (!status) {
          res.callNotFound();

          return res;
        }

        await status.$query().patch(req.body.data);
        req.flash('info', app.t('flash.statuses.edit.success'));

        res.redirect('/statuses');

        return res;
      } catch (e) {
        req.flash('error', app.t('flash.statuses.edit.error'));
        const status = { ...req.body.data };
        status.id = id;

        res.render('statuses/edit', { status, errors: e.data });

        return res;
      }
    })
    .delete('/statuses/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const status = await app.objection.models.status.query().findById(id);

        if (!status) {
          res.callNotFound();

          return res;
        }

        await status.$query().delete();
        res.redirect('/statuses');

        return res;
      } catch (e) {
        return e.error;
      }
    })
    .get('/statuses/:id/edit', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const status = await app.objection.models.status.query().findById(id);

        if (!status) {
          res.callNotFound();

          return res;
        }

        res.render('statuses/edit', { status });
        return res;
      } catch (e) {
        return e.error;
      }
    });

  done();
};
