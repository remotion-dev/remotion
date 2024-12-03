#!/usr/bin/env deno --allow-env --allow-read --allow-write --allow-net --allow-run --allow-sys
const {cli} = require('./dist/index');

// Just like "remotion", but it uses Bun
cli()
	.then(() => process.exit(0))
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	});
