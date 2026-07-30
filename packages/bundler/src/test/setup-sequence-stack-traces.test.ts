import {expect, test} from 'bun:test';
import React from 'react';
import {Internals} from 'remotion';

test('injects a namespaced source stack without conflicting with application props', async () => {
	const Component: React.FC<{readonly stack: string}> = () => null;
	Internals.addSequenceStackTraces(Component);
	await import('../setup-sequence-stack-traces');

	const element = React.createElement(Component, {stack: 'application-stack'});
	const props = element.props as typeof element.props & {
		readonly _remotionInternalStack: string;
	};

	expect(props.stack).toBe('application-stack');
	expect(props._remotionInternalStack).toContain('Error');

	const existingStackElement = React.createElement(Component, {
		stack: 'application-stack',
		_remotionInternalStack: 'existing-source-stack',
	} as React.ComponentProps<typeof Component> & {
		readonly _remotionInternalStack: string;
	});
	const existingProps =
		existingStackElement.props as typeof existingStackElement.props & {
			readonly _remotionInternalStack: string;
		};
	expect(existingProps._remotionInternalStack).toBe('existing-source-stack');
});
