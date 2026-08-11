module.exports = function customLoader(source) {
	return `export default ${JSON.stringify(`CUSTOM_LOADER:${source.trim()}`)};`;
};
