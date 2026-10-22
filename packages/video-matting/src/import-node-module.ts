// Called only in Node.js branches. An indirect import keeps native Node modules
// out of browser bundles without making bundlers resolve a variable import.
export const importNodeModule = <T>(specifier: string): Promise<T> => {
	// eslint-disable-next-line no-new-func
	const dynamicImport = new Function(
		'specifier',
		'return import(specifier)',
	) as (module: string) => Promise<T>;
	return dynamicImport(specifier);
};
