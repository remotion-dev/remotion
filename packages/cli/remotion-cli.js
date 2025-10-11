#!/usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();
const {cli} = require('./dist/index');

cli()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
