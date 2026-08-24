let elementLibraries: string[] = [];

export const addElementLibrary = (url: string) => {
	if (typeof url !== 'string') {
		throw new Error(
			`Config.addElementLibrary() expects a string, got ${typeof url}`,
		);
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(url);
	} catch {
		throw new Error(
			`Config.addElementLibrary() expects an absolute URL, got ${JSON.stringify(url)}`,
		);
	}

	if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
		throw new Error(
			`Config.addElementLibrary() only supports HTTP and HTTPS URLs, got ${JSON.stringify(url)}`,
		);
	}

	elementLibraries.push(parsedUrl.href);
};

export const getElementLibraries = (): readonly string[] => {
	return elementLibraries;
};

export const resetElementLibraries = () => {
	elementLibraries = [];
};
