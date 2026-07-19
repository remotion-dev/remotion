import React from 'react';

const componentsToAddStacksTo: unknown[] = [];
let sequenceComponent: unknown = null;

export const getComponentsToAddStacksTo = () => componentsToAddStacksTo;

export const addSequenceStackTraces = (component: unknown) => {
	componentsToAddStacksTo.push(component);
};

export const setSequenceComponent = (component: unknown) => {
	sequenceComponent = component;
};

export const getSequenceComponent = () => sequenceComponent;

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
