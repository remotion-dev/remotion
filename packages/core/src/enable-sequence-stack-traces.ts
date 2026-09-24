import React from 'react';
import type {SequenceControls} from './CompositionManager.js';

const componentsToAddStacksTo: unknown[] = [];
let sequenceComponent: unknown = null;
const stacksByControls = new WeakMap<SequenceControls, string>();
type ComponentIdentityResolver = (component: unknown) => unknown;
// Studio installs a resolver that maps refreshed component implementations to
// the stable family object maintained by React Refresh.
let componentIdentityResolver: ComponentIdentityResolver | null = null;

export const REMOTION_INTERNAL_STACK_PROP = '_remotionInternalStack';

// Bundlers that know where a JSX element was written encode its source
// location as a synthetic stack frame, so consumers can skip symbolication.
const ORIGINAL_SOURCE_STACK_PREFIX = 'studio-original://';
const originalSourceStackPattern =
	/\(studio-original:\/\/([^\s:)]*):(\d+):(\d+)\)/;

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

export const setSequenceComponent = (component: unknown) => {
	sequenceComponent = component;
};

export const getSequenceComponent = () => sequenceComponent;

export const setComponentIdentityResolver = (
	resolver: ComponentIdentityResolver | null,
) => {
	componentIdentityResolver = resolver;
};

export const resolveComponentIdentity = (component: unknown): unknown => {
	return componentIdentityResolver?.(component) ?? component;
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

export const getSingleChildComponent = (children: React.ReactNode): unknown => {
	const mountedChildren = React.Children.toArray(children);
	if (mountedChildren.length !== 1) {
		return null;
	}

	const child = mountedChildren[0];
	if (!React.isValidElement(child)) {
		return null;
	}

	if (typeof child.type !== 'function' && typeof child.type !== 'object') {
		return null;
	}

	return resolveComponentIdentity(child.type);
};
