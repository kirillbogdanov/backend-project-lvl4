#! /usr/bin/env node

import createApp from '../index.js';

const port = process.env.PORT || 8080;
const address = '0.0.0.0';
const app = createApp();

app.listen(port, address, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
