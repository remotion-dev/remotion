import path from 'path';
import zl = require('zip-lib');

export const bundleLambda = () => {
	return zl.archiveFolder(
		path.join(__dirname, '..', 'template'),
		'function.zip'
	);
};
