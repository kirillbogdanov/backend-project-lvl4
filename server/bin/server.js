#! /usr/bin/env node

import createApp from '../index.js';

const port = process.env.PORT || 8080;
const app = createApp();

app.listen(port, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
