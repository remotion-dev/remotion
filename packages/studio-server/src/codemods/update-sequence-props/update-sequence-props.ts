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
}: {
	input: string;
	changes: SequencePropsNodeUpdate[];
	prettierConfigOverride: PrettierConfigOverride;
}): Promise<UpdateMultipleSequencePropsResult> => {
	const {output: unformattedOutput, results} =
		updateMultipleSequencePropsUnformatted({input, changes});
	const {output, formatted} = await formatFileContent({
		input: unformattedOutput,
		prettierConfigOverride,
	});

	return {output, formatted, results};
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
