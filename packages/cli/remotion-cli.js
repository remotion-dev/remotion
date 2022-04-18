#! /usr/bin/env node
const {cli} = require('./dist/index');
const dotenv = require('dotenv');
dotenv.config();

cli()
	.then(() => process.exit(0))
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	});
