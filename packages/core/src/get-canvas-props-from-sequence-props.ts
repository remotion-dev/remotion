import type React from 'react';

export type CanvasDomProps = React.AriaAttributes &
	Record<`data-${string}`, string | undefined>;

export const getCanvasPropsFromSequenceProps = (
	props: Record<string, unknown>,
): CanvasDomProps => {
	const canvasProps: CanvasDomProps = {};
	const mutableCanvasProps = canvasProps as Record<string, unknown>;

	for (const key in props) {
		if (
			Object.prototype.hasOwnProperty.call(props, key) &&
			(key.startsWith('data-') || key.startsWith('aria-'))
		) {
			mutableCanvasProps[key] = props[key];
		}
	}

	return canvasProps;
};
