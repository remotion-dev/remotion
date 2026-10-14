import type {SequenceControls} from './CompositionManager.js';

const componentsToAddStacksTo: unknown[] = [];
let sequenceComponent: unknown = null;

export const setSequenceComponent = (component: unknown) => {
	sequenceComponent = component;
};

export const getSequenceComponent = () => sequenceComponent;

const stacksByControls = new WeakMap<SequenceControls, string>();
export const REMOTION_INTERNAL_STACK_PROP = '_remotionInternalStack';

// Bundlers that know where a JSX element was written encode its source
// location as a synthetic stack frame, so consumers can skip symbolication.
const ORIGINAL_SOURCE_STACK_PREFIX = 'studio-original://';
const originalSourceStackPattern =
	/\(studio-original:\/\/([^\r\n]+):(\d+):(\d+)\)/;

export type OriginalSourceLocation = {
	fileName: string;
	line: number;
	column: number;
};

export const makeOriginalSourceStack = ({
	fileName,
	lineNumber,
	columnNumber,
}: {
	fileName: string;
	lineNumber: number;
	columnNumber: number;
}): string => {
	return `Error\n    at remotionOriginalSource (${ORIGINAL_SOURCE_STACK_PREFIX}${encodeURIComponent(fileName)}:${lineNumber}:${columnNumber})`;
};

export const parseOriginalSourceStack = (
	stack: string | null,
): OriginalSourceLocation | null => {
	if (!stack) {
		return null;
	}

	const match = stack.match(originalSourceStackPattern);
	if (!match) {
		return null;
	}

	return {
		fileName: decodeURIComponent(match[1]),
		line: Number(match[2]),
		column: Number(match[3]),
	};
};

export const getComponentsToAddStacksTo = () => componentsToAddStacksTo;

export const addSequenceStackTraces = (component: unknown) => {
	componentsToAddStacksTo.push(component);
};

export const setStackForControls = (
	controls: SequenceControls,
	stack: string | undefined,
) => {
	if (stack === undefined) {
		stacksByControls.delete(controls);
		return;
	}

	stacksByControls.set(controls, stack);
};

export const getStackForControls = (
	controls: SequenceControls,
): string | null => {
	return stacksByControls.get(controls) ?? null;
};
