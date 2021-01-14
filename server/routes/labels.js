export default (app, options, done) => {
  app
    .get('/labels', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const labels = await app.objection.models.label.query()
          .select('id', 'name', 'createdAt');

        res.render('labels/index', { labels });
        return res;
      } catch (e) {
        return e.error;
      }
    })
    .post('/labels', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      try {
        const label = app.objection.models.label.fromJson(req.body.data);

        await app.objection.models.label.query().insert(label);
        req.flash('info', app.t('flash.labels.create.success'));

        res.redirect('/labels');
        return res;
      } catch (e) {
        req.flash('error', app.t('flash.labels.create.error'));
        res.render('/labels/new', { label: req.body.data, errors: e.data });
        return res;
      }
    })
    .get('/labels/new', { preHandler: app.restrictForUnauthorized }, (req, res) => {
      res.render('labels/new');
    })
    .post('/labels/:id', () => {})
    .patch('/labels/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const label = await app.objection.models.label.query().findById(id);

        if (!label) {
          res.callNotFound();

          return res;
        }

        await label.$query().patch(req.body.data);
        req.flash('info', app.t('flash.labels.edit.success'));

        res.redirect('/labels');

        return res;
      } catch (e) {
        req.flash('error', app.t('flash.labels.edit.error'));
        const label = { ...req.body.data };
        label.id = id;

        res.render('labels/edit', { label, errors: e.data });

        return res;
      }
    })
    .delete('/labels/:id', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const label = await app.objection.models.label.query().findById(id);

        if (!label) {
          res.callNotFound();

          return res;
        }

        await label.$query().delete();
        res.redirect('/labels');

        return res;
      } catch (e) {
        return e.error;
      }
    })
    .get('/labels/:id/edit', { preHandler: app.restrictForUnauthorized }, async (req, res) => {
      const { id } = req.params;

      try {
        const label = await app.objection.models.label.query().findById(id);

        if (!label) {
          res.callNotFound();

          return res;
        }

        res.render('labels/edit', { label });
        return res;
      } catch (e) {
        return e.error;
      }
    });

  done();
};
