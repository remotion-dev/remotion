const fs = require('fs');
const path = require('path');

const paths = [path.join(__dirname, 'dist', 'init.js')];

const prefix = '#! /usr/bin/env node\n';

paths.forEach((p) => {
	const contents = fs.readFileSync(p, 'utf8');

	if (!contents.startsWith(prefix)) {
		fs.writeFileSync(p, prefix + contents);
	}
});
