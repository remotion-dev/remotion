type FileLocation = {
	readonly source: string | null;
	readonly line: number | null;
};

const normalizeSlashes = (path: string) => path.replace(/\\/g, '/');

const stripTrailingSlashes = (path: string) => path.replace(/\/+$/, '');

const stripLeadingDotSlash = (path: string) => path.replace(/^\.\/+/, '');

export const formatFileLocation = ({
	location,
	root,
}: {
	readonly location: FileLocation | null;
	readonly root: string;
}) => {
	if (!location?.source || location.line === null) {
		return null;
	}

	const source = normalizeSlashes(location.source);
	const normalizedRoot = stripTrailingSlashes(normalizeSlashes(root));
	const shouldCompareCaseInsensitive =
		/^[a-z]:\//i.test(source) || /^[a-z]:\//i.test(normalizedRoot);
	const sourceForComparison = shouldCompareCaseInsensitive
		? source.toLowerCase()
		: source;
	const rootForComparison = shouldCompareCaseInsensitive
		? normalizedRoot.toLowerCase()
		: normalizedRoot;
	const sourceIsInsideRoot =
		normalizedRoot.length > 0 &&
		sourceForComparison.startsWith(rootForComparison + '/');
	const relativeSource = sourceIsInsideRoot
		? source.slice(normalizedRoot.length + 1)
		: source;

	return `${stripLeadingDotSlash(relativeSource)}:${location.line}`;
};

export const formatLocationForAgents = ({
	name,
	location,
	root,
}: {
	readonly name: string | null;
	readonly location: FileLocation | null;
	readonly root: string;
}) => {
	const fileLocation = formatFileLocation({location, root});

	if (!name || !fileLocation) {
		return null;
	}

	return `${name} in ${fileLocation}`;
};
