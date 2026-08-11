import React from 'react';
import type {SequenceControls} from './CompositionManager.js';

const componentsToAddStacksTo: unknown[] = [];
let sequenceComponent: unknown = null;
const stacksByControls = new WeakMap<SequenceControls, string>();

export const REMOTION_INTERNAL_STACK_PROP = '_remotionInternalStack';

export const getComponentsToAddStacksTo = () => componentsToAddStacksTo;

export const addSequenceStackTraces = (component: unknown) => {
	componentsToAddStacksTo.push(component);
};

export const setSequenceComponent = (component: unknown) => {
	sequenceComponent = component;
};

export const getSequenceComponent = () => sequenceComponent;

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

	return child.type;
};
