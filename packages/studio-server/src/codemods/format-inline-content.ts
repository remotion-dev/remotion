import {formatInlineContentWithFormatter} from '@remotion/studio-codemods';

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
 */
export const formatInlineContent = async ({
	inlineContent,
	linePrefix,
	endOfLine,
	prettierConfigOverride,
}: {
	inlineContent: string;
	linePrefix: string;
	endOfLine: 'auto' | 'lf';
	prettierConfigOverride?: Record<string, unknown> | null;
}): Promise<{formatted: string; didFormat: boolean}> => {
	let prettier: PrettierType | null = null;

	try {
		prettier = await import('prettier');
	} catch {
		return {formatted: inlineContent, didFormat: false};
	}

	const {format, resolveConfig, resolveConfigFile} = prettier as PrettierType;

	let prettierConfig: Record<string, unknown> | null;
	if (prettierConfigOverride !== undefined && prettierConfigOverride !== null) {
		prettierConfig = prettierConfigOverride;
	} else {
		const configFilePath = await resolveConfigFile();
		if (!configFilePath) {
			return {formatted: inlineContent, didFormat: false};
		}

		prettierConfig = await resolveConfig(configFilePath);
		if (!prettierConfig) {
			return {formatted: inlineContent, didFormat: false};
		}
	}

	return formatInlineContentWithFormatter({
		inlineContent,
		linePrefix,
		endOfLine,
		prettierConfig,
		format: (source, options) => format(source, {...options, plugins: []}),
	});
};
