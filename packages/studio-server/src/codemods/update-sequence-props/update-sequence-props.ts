import type {File} from '@babel/types';
import {
	type RemovedProp,
	type SequencePropsNodeUpdate,
	type SequencePropsNodeUpdateResult,
	type SequencePropUpdate,
	updateMultipleSequenceProps as updateMultipleSequencePropsUnformatted,
	updateSequencePropsAst,
} from '@remotion/studio-codemods';
import type {
	InteractivitySchema,
	SequenceNodePath,
	VideoConfigValues,
} from 'remotion';
import {formatFileContent} from '../format-file-content';
import {formatInlineContent} from '../format-inline-content';

export {
	type RemovedProp,
	type SequencePropsNodeUpdate,
	type SequencePropsNodeUpdateResult,
	type SequencePropUpdate,
	updateSequencePropsAst,
};

type PrettierConfigOverride = Record<string, unknown> | null;

type UpdateMultipleSequencePropsResult = {
	output: string;
	formatted: boolean;
	results: SequencePropsNodeUpdateResult[];
	ast: File;
};

type UpdateSequencePropsResult = {
	output: string;
	oldValueStrings: string[];
	formatted: boolean;
	logLine: number;
	removedProps: RemovedProp[];
};

export const updateMultipleSequenceProps = async ({
	input,
	changes,
	prettierConfigOverride,
	ast: providedAst,
}: {
	input: string;
	changes: SequencePropsNodeUpdate[];
	prettierConfigOverride: PrettierConfigOverride;
	ast?: File;
}): Promise<UpdateMultipleSequencePropsResult> => {
	const {
		output: unformattedOutput,
		results,
		ast,
		openingElementRanges,
	} = updateMultipleSequencePropsUnformatted({
		input,
		changes,
		ast: providedAst,
	});
	if (unformattedOutput === input) {
		return {output: input, formatted: true, results, ast};
	}

	if (openingElementRanges?.length === 1) {
		const [range] = openingElementRanges;
		const openingElement = unformattedOutput.slice(range.start, range.end);
		const formattableOpeningElement = range.selfClosing
			? openingElement
			: openingElement.slice(0, -1) + ' />';
		const lineStart = unformattedOutput.lastIndexOf('\n', range.start) + 1;
		const linePrefix = unformattedOutput.slice(lineStart, range.start);
		const {formatted: formattedOpeningElement, didFormat} =
			await formatInlineContent({
				inlineContent: formattableOpeningElement,
				linePrefix,
				endOfLine: 'lf',
				prettierConfigOverride,
			});
		let finalOpeningElement = formattedOpeningElement;
		if (!range.selfClosing) {
			const slashIndex = finalOpeningElement.lastIndexOf('/>');
			if (slashIndex !== finalOpeningElement.length - 2) {
				throw new Error('Could not format JSX opening element');
			}

			const lastLineStart = finalOpeningElement.lastIndexOf('\n') + 1;
			const beforeSlash = finalOpeningElement.slice(lastLineStart, slashIndex);
			finalOpeningElement =
				beforeSlash.trim().length === 0
					? finalOpeningElement.slice(0, slashIndex) + '>'
					: finalOpeningElement.slice(0, slashIndex).trimEnd() + '>';
		}

		return {
			output:
				unformattedOutput.slice(0, range.start) +
				finalOpeningElement +
				unformattedOutput.slice(range.end),
			formatted: didFormat,
			results,
			ast,
		};
	}

	const {output, formatted} = await formatFileContent({
		input: unformattedOutput,
		prettierConfigOverride,
	});

	return {output, formatted, results, ast};
};

export const updateSequenceProps = async ({
	input,
	nodePath,
	updates,
	schema,
	prettierConfigOverride,
	videoConfigValues,
}: {
	input: string;
	nodePath: SequenceNodePath;
	updates: SequencePropUpdate[];
	schema: InteractivitySchema;
	prettierConfigOverride: PrettierConfigOverride;
	videoConfigValues: VideoConfigValues | null;
}): Promise<UpdateSequencePropsResult> => {
	const {serialized, oldValueStrings, logLine, removedProps} =
		updateSequencePropsAst({
			input,
			nodePath,
			updates,
			schema,
			videoConfigValues,
		});
	const {output, formatted} = await formatFileContent({
		input: serialized,
		prettierConfigOverride,
	});

	return {output, oldValueStrings, formatted, logLine, removedProps};
};
