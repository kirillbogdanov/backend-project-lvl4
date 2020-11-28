export default (app, options, done) => {
  app.get('/', (req, res) => {
    res.view('welcome');
  });

  done();
};
