import {loadFont} from '@remotion/google-fonts/CormorantGaramond';
import {StrikeThrough} from '@remotion/rough-notation';
import React from 'react';
import {
	Interactive,
	interpolate,
	useCurrentFrame,
	type InteractiveTransformProps,
} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

const StrikeThroughTextInner: React.FC<InteractiveTransformProps> = ({
	style,
}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Container"
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 900,
				height: 220,
				fontSize: 80,
				fontWeight: 700,
				lineHeight: 1.1,
				color: '#171717',
				fontFamily,
				...style,
			}}
		>
			<div>
				<Interactive.Span>The </Interactive.Span>
				<StrikeThrough
					name="Strike-through annotation"
					progress={interpolate(frame, [10, 25], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
					color="#f11515"
					strokeWidth={14}
				>
					forbidden
				</StrikeThrough>{' '}
				<Interactive.Span>fruit</Interactive.Span>
			</div>
		</Interactive.Div>
	);
};

export const StrikeThroughText = Interactive.withSchema({
	Component: StrikeThroughTextInner,
	componentName: '<StrikeThroughText>',
	schema: {},
	wrapInSequence: true,
});
