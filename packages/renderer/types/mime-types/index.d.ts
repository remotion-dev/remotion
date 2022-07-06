declare module 'mime-types' {
	function lookup(filenameOrExt: string): string | false;
	function contentType(filenameOrExt: string): string | false;
	function extension(typeString: string): string | false;
	function charset(typeString: string): string | false;
	namespace charsets {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		const lookup: typeof charset;
	}
	const types: {
		[key: string]: string;
	};
	const extensions: {
		[key: string]: string[];
	};
}
