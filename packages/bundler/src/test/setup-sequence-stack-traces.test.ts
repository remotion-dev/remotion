import {expect, test} from 'bun:test';
import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import {Composition, Internals} from 'remotion';

test('defers and idempotently enables source stack injection in production', async () => {
	const Component: React.FC<{readonly stack: string}> = () => null;
	Internals.addSequenceStackTraces(Component);
	const previousNodeEnv = process.env.NODE_ENV;
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_cwd: '/project',
		},
	});

	try {
		process.env.NODE_ENV = 'production';
		const originalCreateElement = React.createElement;
		await import('../setup-sequence-stack-traces');
		expect(React.createElement).toBe(originalCreateElement);

		window.remotion_enableSequenceStackTraces?.();
		const proxiedCreateElement = React.createElement;
		expect(proxiedCreateElement).not.toBe(originalCreateElement);
		window.remotion_enableSequenceStackTraces?.();
		expect(React.createElement).toBe(proxiedCreateElement);

		const element = React.createElement(Component, {
			stack: 'application-stack',
		});
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

		const renderingElement = React.createElement(Component, {
			stack: 'application-stack',
		});
		expect(
			(renderingElement.props as {_remotionInternalStack?: string})
				._remotionInternalStack,
		).toContain('Error');

		const sourceElement = JsxRuntimeDev.jsxDEV(
			Composition,
			{
				component: Component,
				durationInFrames: 30,
				fps: 30,
				height: 1080,
				id: 'read-only-stack-test',
				width: 1920,
			},
			undefined,
			false,
			{
				fileName: '/project/src/Video.tsx',
				lineNumber: 12,
				columnNumber: 4,
			},
			undefined,
		);
		const sourceProps = sourceElement.props as typeof sourceElement.props & {
			readonly _remotionInternalStack: string;
		};
		expect(sourceProps._remotionInternalStack).toBe(
			'Error\n    at remotionOriginalSource (studio-original://.%2Fsrc%2FVideo.tsx:12:4)',
		);
	} finally {
		if (previousNodeEnv === undefined) {
			delete process.env.NODE_ENV;
		} else {
			process.env.NODE_ENV = previousNodeEnv;
		}

		Reflect.deleteProperty(globalThis, 'window');
	}
});
