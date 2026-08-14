const fs = require('fs');
const path = require('path');

module.exports = function elementSourceDependencyLoader(source) {
	const {elementsRoot} = this.getOptions();
	const walk = (directory) => {
		for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
			const absolutePath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				walk(absolutePath);
			} else if (entry.name.endsWith('.tsx')) {
				this.addDependency(absolutePath);
			}
		}
	};

	walk(elementsRoot);
	return source;
};
