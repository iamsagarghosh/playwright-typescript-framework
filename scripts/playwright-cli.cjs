/* global __dirname, process, require */

const path = require('node:path');

process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.resolve(__dirname, '..', '.playwright-browsers');

require('@playwright/test/cli');
