import {expect, test} from 'bun:test';
import React from 'react';
import {
	getSingleChildComponent,
	setComponentIdentityResolver,
} from '../enable-sequence-stack-traces';

const Child: React.FC = () => null;
const OtherChild: React.FC = () => null;

test('detects one mounted child component', () => {
	expect(getSingleChildComponent(<Child />)).toBe(Child);
	expect(getSingleChildComponent([null, false, <Child key="child" />])).toBe(
		Child,
	);
});

test('does not detect host elements or multiple mounted children', () => {
	expect(getSingleChildComponent(<div />)).toBe(null);
	expect(
		getSingleChildComponent(
			<>
				<Child />
				<OtherChild />
			</>,
		),
	).toBe(null);
	expect(
		getSingleChildComponent([<Child key="a" />, <OtherChild key="b" />]),
	).toBe(null);
});

test('uses a stable component identity supplied by Fast Refresh', () => {
	const family = {};
	const PreviousChild: React.FC = () => null;
	const RefreshedChild: React.FC = () => null;

	setComponentIdentityResolver((component) => {
		if (component === PreviousChild || component === RefreshedChild) {
			return family;
		}

		return component;
	});

	try {
		expect(getSingleChildComponent(<PreviousChild />)).toBe(family);
		expect(getSingleChildComponent(<RefreshedChild />)).toBe(family);
	} finally {
		setComponentIdentityResolver(null);
	}
});
