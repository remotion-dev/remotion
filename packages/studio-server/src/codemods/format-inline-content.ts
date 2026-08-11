// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type PrettierType = typeof import('prettier');

/**
 * Instead of running prettier on the entire file (which is slow),
 * format only a small snippet of inline content (e.g. stringified defaultProps).
 *
 * @param inlineContent - The raw content to format (e.g. stringified props)
 * @param linePrefix - Everything from the start of the line to where
 *   inlineContent will appear (used to calculate column offset and indentation)
 * @param endOfLine - Prettier endOfLine option
 *
 * We wrap the content in `const __x__ = CONTENT;` and adjust printWidth
 * so prettier makes the same line-breaking decisions as if the content
 * were at its actual column position in the file.
 */
export const formatInlineContent = async ({
	inlineContent,
	linePrefix,
	endOfLine,
}: {
	inlineContent: string;
	linePrefix: string;
	endOfLine: 'auto' | 'lf';
}): Promise<{formatted: string; didFormat: boolean}> => {
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch {
		return {formatted: inlineContent, didFormat: false};
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		return {formatted: inlineContent, didFormat: false};
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		return {formatted: inlineContent, didFormat: false};
	}

	const tabWidth = (prettierConfig.tabWidth as number) ?? 2;
	const baseIndent = linePrefix.match(/^(\s*)/)?.[1] ?? '';

	// Calculate visual column offset (tabs expand to tabWidth columns)
	const columnOffset = [...linePrefix].reduce(
		(col, ch) => (ch === '\t' ? col + tabWidth : col + 1),
		0,
	);

	// Adjust printWidth so the wrapper prefix occupies the same visual
	// width as the actual file prefix, ensuring identical line breaks.
	const configPrintWidth = (prettierConfig.printWidth as number) ?? 80;
	const wrapperPrefix = 'const __x__ = ';
	const effectivePrintWidth = Math.max(
		configPrintWidth - columnOffset + wrapperPrefix.length,
		20,
	);

	const wrappedSource = `${wrapperPrefix}${inlineContent};\n`;
	const formattedWrapped = await format(wrappedSource, {
		...prettierConfig,
		printWidth: effectivePrintWidth,
		filepath: 'test.tsx',
		plugins: [],
		endOfLine,
	});

	// Extract the formatted value from the wrapper
	const withoutSemicolon = formattedWrapped.replace(/;\s*$/, '');
	let formattedProps: string;

	if (withoutSemicolon.startsWith(wrapperPrefix)) {
		formattedProps = withoutSemicolon.slice(wrapperPrefix.length);
	} else {
		// Prettier broke the line after `=` — extract and dedent one level
		const lines = withoutSemicolon.split('\n').slice(1);
		const useTabs = prettierConfig.useTabs as boolean;
		const oneIndent = useTabs ? '\t' : ' '.repeat(tabWidth);
		formattedProps = lines
			.map((l) => (l.startsWith(oneIndent) ? l.slice(oneIndent.length) : l))
			.join('\n');
	}

	// Add base indentation to all lines except the first
	const indentedProps = formattedProps
		.split('\n')
		.map((line, i) =>
			i === 0 ? line : line.length > 0 ? baseIndent + line : line,
		)
		.join('\n');

	return {formatted: indentedProps, didFormat: true};
};
