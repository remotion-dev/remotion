import {liquidContours} from '@remotion/effects/liquid-contours';
import React from 'react';
import {
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type LiquidContoursProps = InteractiveTransformProps & {
	readonly firstColor?: string;
	readonly secondColor?: string;
};

const liquidContoursSchema = {
	firstColor: {
		type: 'color',
		default: '#dff4ff',
		description: 'First color',
	},
	secondColor: {
		type: 'color',
		default: '#7cc6ff',
		description: 'Second color',
	},
} as const satisfies InteractivitySchema;

const LiquidContoursInner: React.FC<LiquidContoursProps> = ({
	firstColor = '#dff4ff',
	secondColor = '#7cc6ff',
	style,
}) => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();

	return (
		<Solid
			showInTimeline={false}
			style={{position: 'absolute', left: 0, top: 0, ...style}}
			color="#dff4ff"
			width={width}
			height={height}
			effects={[
				liquidContours({
					firstColor,
					secondColor,
					phase: interpolate(frame, [0, 240], [3.23, 4.23]),
				}),
			]}
		/>
	);
};

export const LiquidContours = Interactive.withSchema({
	Component: LiquidContoursInner,
	componentName: '<LiquidContours>',
	schema: liquidContoursSchema,
	wrapInSequence: true,
});
