import {render} from '@testing-library/react';
import React from 'react';

// When fixed, can import  `renderHook` from @testing-library/react

interface RenderHookOptions<Props> {
	/**
	 * The argument passed to the renderHook callback. Can be useful if you plan
	 * to use the rerender utility to change the values passed to your hook.
	 */
	initialProps?: Props;
	/**
	 * Pass a React Component as the wrapper option to have it rendered around the inner element. This is most useful for creating
	 *  reusable custom render functions for common data providers. See setup for examples.
	 *
	 *  @see https://testing-library.com/docs/react-testing-library/api/#wrapper
	 */
	wrapper?: React.JSXElementConstructor<{children: React.ReactElement}>;
}

export function renderHook<Result, Props>(
	renderCallback: (initialProps: Props) => Result,
	options: RenderHookOptions<Props> = {}
) {
	const {initialProps, wrapper} = options;
	const result = React.createRef<unknown>();

	const TestComponent = ({
		renderCallbackProps,
	}: {
		renderCallbackProps: Props;
	}) => {
		const pendingResult = renderCallback(renderCallbackProps);

		React.useEffect(() => {
			// @ts-expect-error
			result.current = pendingResult;
		});

		return null;
	};

	const {rerender: baseRerender, unmount} = render(
		<TestComponent renderCallbackProps={initialProps as Props} />,
		{wrapper}
	);

	function rerender(rerenderCallbackProps: Props) {
		return baseRerender(
			<TestComponent renderCallbackProps={rerenderCallbackProps} />
		);
	}

	return {result, rerender, unmount};
}
