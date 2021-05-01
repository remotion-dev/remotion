#! /usr/bin/env node

const {init} = require('./dist/init');
init()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
