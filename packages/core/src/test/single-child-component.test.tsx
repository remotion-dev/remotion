import {expect, test} from 'bun:test';
import React from 'react';
import {getSingleChildComponent} from '../enable-sequence-stack-traces';

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
