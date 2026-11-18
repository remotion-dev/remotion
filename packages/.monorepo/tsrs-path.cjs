const {createRequire} = require('node:module');
const {dirname, join} = require('node:path');

module.exports = (resolvePackage) => {
	const {arch, platform} = process;
	if (
		(platform === 'darwin' || platform === 'linux') &&
		(arch === 'arm64' || arch === 'x64')
	) {
		return join(dirname(resolvePackage('tsrs/package.json')), 'bin', 'tsrs');
	}

	if (platform === 'win32' && arch === 'x64') {
		const tsrsRequire = createRequire(resolvePackage('tsrs/package.json'));
		return join(
			dirname(tsrsRequire.resolve('@tsrs/win32-x64/package.json')),
			'tsrs.exe',
		);
	}

	return null;
};
