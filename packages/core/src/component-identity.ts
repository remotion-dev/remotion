import React from 'react';
import {IsNotInsideSeriesProvider} from './series/is-inside-series.js';

type ComponentIdentityResolver = (component: unknown) => unknown;
// Studio installs a resolver that maps refreshed component implementations to
// the stable family object maintained by React Refresh.
let componentIdentityResolver: ComponentIdentityResolver | null = null;

export const setComponentIdentityResolver = (
	resolver: ComponentIdentityResolver | null,
) => {
	componentIdentityResolver = resolver;
};

export const resolveComponentIdentity = (component: unknown): unknown => {
	return componentIdentityResolver?.(component) ?? component;
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

	// Series inserts this transparent context boundary around its authored children.
	if (child.type === IsNotInsideSeriesProvider) {
		return getSingleChildComponent(
			(child.props as {children: React.ReactNode}).children,
		);
	}

	if (typeof child.type !== 'function' && typeof child.type !== 'object') {
		return null;
	}

	return resolveComponentIdentity(child.type);
};
