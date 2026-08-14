import {loadFont} from '@remotion/google-fonts/MonaSans';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	Interactive,
	Sequence,
	interpolate,
	spring,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

type SpinningTextWheelProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly item1?: string;
		readonly item2?: string;
		readonly item3?: string;
		readonly item4?: string;
		readonly item5?: string;
		readonly item6?: string;
		readonly item7?: string;
		readonly selectedIndex?: number;
	};

const spinningTextWheelSchema = {
	...Interactive.baseSchema,
	item1: {
		type: 'text-content',
		default: 'Monday',
		description: 'Item 1',
	},
	item2: {
		type: 'text-content',
		default: 'Tuesday',
		description: 'Item 2',
	},
	item3: {
		type: 'text-content',
		default: 'Wednesday',
		description: 'Item 3',
	},
	item4: {
		type: 'text-content',
		default: 'Thursday',
		description: 'Item 4',
	},
	item5: {
		type: 'text-content',
		default: 'Friday',
		description: 'Item 5',
	},
	item6: {
		type: 'text-content',
		default: 'Saturday',
		description: 'Item 6',
	},
	item7: {
		type: 'text-content',
		default: 'Sunday',
		description: 'Item 7',
	},
	selectedIndex: {
		type: 'number',
		min: 0,
		max: 6,
		step: 1,
		default: 4,
		description: 'Selected item index',
		hiddenFromList: false,
		keyframable: false,
	},
	...Interactive.textSchema,
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const SpinningTextWheelInner = forwardRef<
	HTMLDivElement,
	SpinningTextWheelProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			controls,
			item1 = 'Monday',
			item2 = 'Tuesday',
			item3 = 'Wednesday',
			item4 = 'Thursday',
			item5 = 'Friday',
			item6 = 'Saturday',
			item7 = 'Sunday',
			name,
			selectedIndex = 4,
			style,
			...sequenceProps
		},
		ref,
	) => {
		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const outlineRef = useRef<HTMLDivElement>(null);
		const values = [item1, item2, item3, item4, item5, item6, item7];
		const progress = spring({
			fps,
			frame,
			config: {
				mass: 10,
				damping: 200,
				stiffness: 200,
			},
			durationInFrames: 90,
			durationRestThreshold: 0.0001,
		});
		const rotation = interpolate(progress, [0, 1], [1, 0]);
		const activeIndex = Math.max(
			0,
			Math.min(values.length - 1, Math.round(selectedIndex)),
		);

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...sequenceProps}
				controls={controls}
				name={name ?? '<SpinningTextWheel>'}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						height: 420,
						maskImage:
							'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
						overflow: 'hidden',
						perspective: 1000,
						position: 'relative',
						transformStyle: 'preserve-3d',
						width: 640,
						...style,
					}}
				>
					{values.map((value, index) => {
						const wheelIndex = index / values.length + rotation;
						const valueIndex = (index + activeIndex) % values.length;
						const angle = wheelIndex * Math.PI * 2;
						const rotateX = wheelIndex * 360;

						return (
							<div
								key={`${index}-${value}`}
								style={{
									alignItems: 'center',
									backfaceVisibility: 'hidden',
									display: 'flex',
									height: '100%',
									justifyContent: 'center',
									left: 0,
									opacity:
										valueIndex === activeIndex
											? interpolate(progress, [0.88, 1], [0.28, 1], {
													extrapolateLeft: 'clamp',
													extrapolateRight: 'clamp',
												})
											: 0.28,
									position: 'absolute',
									top: 0,
									transform: `translateZ(${Math.cos(angle) * 130}px) translateY(${Math.sin(angle) * 130}px) rotateX(${rotateX}deg)`,
									transformStyle: 'preserve-3d',
									width: '100%',
								}}
							>
								<div
									style={{
										backfaceVisibility: 'hidden',
										textAlign: 'center',
										transform: `rotateX(${-rotateX}deg)`,
										width: '100%',
									}}
								>
									{values[valueIndex]}
								</div>
							</div>
						);
					})}
				</div>
			</Sequence>
		);
	},
);

const InteractiveSpinningTextWheel = Interactive.withSchema({
	Component: SpinningTextWheelInner,
	componentName: '<SpinningTextWheel>',
	componentIdentity: null,
	schema: spinningTextWheelSchema,
	supportsEffects: false,
}) as React.FC<SpinningTextWheelProps>;

export const SpinningTextWheel: React.FC<SpinningTextWheelProps> = (props) => {
	return (
		<InteractiveSpinningTextWheel
			item1="Monday"
			item2="Tuesday"
			item3="Wednesday"
			item4="Thursday"
			item5="Friday"
			item6="Saturday"
			item7="Sunday"
			name="Spinning text wheel"
			selectedIndex={4}
			style={{
				color: '#182033',
				fontFamily: 'Mona Sans',
				fontSize: 72,
				fontWeight: 700,
				lineHeight: 1,
			}}
			{...props}
		/>
	);
};
