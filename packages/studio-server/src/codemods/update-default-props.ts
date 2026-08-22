import {
	updateDefaultProps as updateDefaultPropsCodemod,
	type FormatInline,
} from '@remotion/studio-codemods';
import type {EnumPath} from '@remotion/studio-shared';
import {formatInlineContent} from './format-inline-content';

export {getCompositionDefaultPropsLine} from '@remotion/studio-codemods';

const formatInline: FormatInline = ({inlineContent, linePrefix, endOfLine}) =>
	formatInlineContent({inlineContent, linePrefix, endOfLine});

export const updateDefaultProps = ({
	input,
	compositionId,
	newDefaultProps,
	enumPaths,
}: {
	input: string;
	compositionId: string;
	newDefaultProps: Record<string, unknown>;
	enumPaths: EnumPath[];
}): Promise<{output: string; formatted: boolean}> =>
	updateDefaultPropsCodemod({
		input,
		compositionId,
		newDefaultProps,
		enumPaths,
		formatInline,
	});
