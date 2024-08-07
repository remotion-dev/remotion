const fs = require('fs');

const wrongDistFileExists = fs.existsSync('dist/index.js', 'utf-8');
if (wrongDistFileExists) {
	throw new Error('Wrong dist file exists');
}

const wrongDistFileExists2 = fs.existsSync('dist/index.mjs', 'utf-8');
if (wrongDistFileExists2) {
	throw new Error('Wrong dist file exists');
}
