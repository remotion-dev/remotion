import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['800'],
});

type NumberCounterProps = InteractiveTransformProps & {
	readonly startValue?: number;
	readonly endValue?: number;
	readonly animationDuration?: number;
};

const numberCounterSchema = {
	...Interactive.textSchema,
	'style.fontFamily': {
		...Interactive.textSchema['style.fontFamily'],
		default: 'Inter',
	},
	'style.fontSize': {
		...Interactive.textSchema['style.fontSize'],
		default: 150,
	},
	'style.fontWeight': {
		...Interactive.textSchema['style.fontWeight'],
		default: 800,
	},
	'style.color': {
		...Interactive.textSchema['style.color'],
		default: '#171717',
	},
	'style.lineHeight': {
		...Interactive.textSchema['style.lineHeight'],
		default: 1,
	},
	'style.letterSpacing': {
		...Interactive.textSchema['style.letterSpacing'],
		default: -4.5,
	},
	startValue: {
		type: 'number',
		step: 1,
		default: 0,
		description: 'Start value',
		hiddenFromList: false,
	},
	endValue: {
		type: 'number',
		step: 1,
		default: 24813,
		description: 'End value',
		hiddenFromList: false,
	},
	animationDuration: {
		type: 'number',
		min: 1,
		step: 1,
		default: 90,
		description: 'Animation duration in frames',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const NumberCounterInner: React.FC<NumberCounterProps> = ({
	startValue = 0,
	endValue = 24813,
	animationDuration = 90,
	style,
}) => {
	const frame = useCurrentFrame();

	const progress = interpolate(frame, [0, animationDuration], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.exp),
	});

	const current = Math.round(startValue + progress * (endValue - startValue));

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				display: 'flex',
				width: 640,
				height: 200,
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'Inter',
				fontSize: 150,
				fontWeight: 800,
				color: '#171717',
				fontVariantNumeric: 'tabular-nums',
				letterSpacing: -4.5,
				lineHeight: 1,
				...style,
			}}
		>
			{current.toLocaleString('en-US')}
		</div>
	);
};

export const NumberCounter = Interactive.withSchema({
	Component: NumberCounterInner,
	componentName: '<NumberCounter>',
	schema: numberCounterSchema,
	wrapInSequence: true,
});
