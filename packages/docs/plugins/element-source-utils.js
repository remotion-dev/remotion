import fs from 'fs';
import path from 'path';

const getFence = (source) => {
	const longestBacktickRun = Math.max(
		0,
		...Array.from(source.matchAll(/`+/g)).map((match) => match[0].length),
	);

	return '`'.repeat(Math.max(3, longestBacktickRun + 1));
};

export const getRemotionElementSource = ({file, sourceFilePath}) => {
	const absoluteSourcePath = path.resolve(path.dirname(sourceFilePath), file);

	try {
		return fs.readFileSync(absoluteSourcePath, 'utf8').trimEnd();
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);

		throw new Error(
			`Could not read Element source file "${absoluteSourcePath}" ` +
				`referenced from "${sourceFilePath}": ${message}`,
		);
	}
};

export const getElementSourceCodeBlock = ({file, sourceFilePath}) => {
	const source = getRemotionElementSource({file, sourceFilePath});
	const extension = path.extname(file).slice(1) || 'tsx';
	const fence = getFence(source);

	return `${fence}${extension} twoslash title="${path.basename(file)}"\n${source}\n${fence}`;
};

const parseAttributes = (attributes) => {
	const parsed = new Map();
	const regex = /(\w+)="([^"]*)"/g;
	let match = regex.exec(attributes);

	while (match) {
		parsed.set(match[1], match[2]);
		match = regex.exec(attributes);
	}

	return parsed;
};

const appendSourceCodeBlock = ({attributes, match, sourceFilePath}) => {
	const parsed = parseAttributes(attributes);
	const file = parsed.get('sourceFile');

	if (!file) {
		return match;
	}

	return `${match}\n\n${getElementSourceCodeBlock({
		file,
		sourceFilePath,
	})}`;
};

export const expandElementSourceReferences = ({raw, sourceFilePath}) => {
	return raw.replace(/<ElementPage\b([\s\S]*?)\/>/g, (match, attributes) => {
		return appendSourceCodeBlock({attributes, match, sourceFilePath});
	});
};
