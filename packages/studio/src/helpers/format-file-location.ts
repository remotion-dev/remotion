type FileLocation = {
	readonly source: string | null;
	readonly line: number | null;
};

export type RelativeFileLocation = {
	readonly filename: string;
	readonly line: number;
};

const normalizeSlashes = (path: string) => path.replace(/\\/g, '/');

const stripTrailingSlashes = (path: string) => path.replace(/\/+$/, '');

const stripLeadingDotSlash = (path: string) => path.replace(/^\.\/+/, '');

export const getRelativeFileLocation = ({
	location,
	root,
}: {
	readonly location: FileLocation | null;
	readonly root: string;
}): RelativeFileLocation | null => {
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

	return {
		filename: stripLeadingDotSlash(relativeSource),
		line: location.line,
	};
};

export const formatFileLocation = ({
	location,
	root,
}: {
	readonly location: FileLocation | null;
	readonly root: string;
}) => {
	const relativeLocation = getRelativeFileLocation({location, root});
	if (relativeLocation === null) {
		return null;
	}

	return `${relativeLocation.filename}:${relativeLocation.line}`;
};

export const formatContextForAgents = ({
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
