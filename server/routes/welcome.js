export default (app, options, done) => {
  app.get('/', (req, res) => {
    res.render('welcome');
  });

  done();
};
