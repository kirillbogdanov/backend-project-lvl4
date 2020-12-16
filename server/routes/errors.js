export default (app, options, done) => {
  app
    .setNotFoundHandler((req, res) => {
      res.statusCode = 404;
      res.render('404');
    });

  done();
};
