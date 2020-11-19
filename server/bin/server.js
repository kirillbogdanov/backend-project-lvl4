#! /usr/bin/env node
/* eslint-disable no-console */

import createApp from '../index.js';

const port = 8080;

createApp().listen(port, () => console.log(`Server running on port ${port}`));
