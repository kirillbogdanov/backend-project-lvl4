export default (app, options, done) => {
  app
    .get('/session/new', (req, res) => {
      res.render('/session/new');
    })
    .post('/session', app.fp.authenticate('form', async (req, res, err, user) => {
      if (err) {
        res.statusCode = 500;
        return 'Internal Server Error';
      }
      if (!user) {
        req.flash('error', app.t('flash.session.new.error'));
        res.render('/session/new', { user: { email: req.body.data.email } });
        return res;
      }
      await req.logIn(user);
      req.flash('info', app.t('flash.session.new.success'));

      res.redirect('/');
      return res;
    }))
    .delete('/session', async (req, res) => {
      await req.logOut();
      res.redirect('/');
      return res;
    });

  done();
};
