import {loadFont} from '@remotion/google-fonts/MonaSans';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	Interactive,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';

loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

type SpinningTextWheelProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly items?: string;
	};

type InteractiveSpinningTextWheelProps = SpinningTextWheelProps & {
	readonly callerStyle: React.CSSProperties | null;
};

const spinningTextWheelSchema = {
	...Interactive.baseSchema,
	items: {
		type: 'text-content',
		default: 'Friday\nSaturday\nSunday\nMonday\nTuesday\nWednesday\nThursday',
		description: 'Items (selected first, one per line)',
	},
	...Interactive.textSchema,
	callerStyle: {type: 'hidden'},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const SpinningTextWheelInner = forwardRef<
	HTMLDivElement,
	InteractiveSpinningTextWheelProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			callerStyle,
			controls,
			items = 'Friday\nSaturday\nSunday\nMonday\nTuesday\nWednesday\nThursday',
			name,
			style,
			...sequenceProps
		},
		ref,
	) => {
		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const outlineRef = useRef<HTMLDivElement>(null);
		const values = items
			.split('\n')
			.map((item) => item.trim())
			.filter(Boolean);
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
		const {
			rotate: callerRotate,
			scale: callerScale,
			transform: callerTransform,
			transformBox: callerTransformBox,
			transformOrigin: callerTransformOrigin,
			transformStyle: callerTransformStyle,
			translate: callerTranslate,
			...callerContentStyle
		} = callerStyle ?? {};

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
					style={{
						rotate: callerRotate,
						scale: callerScale,
						transform: callerTransform,
						transformBox: callerTransformBox,
						transformOrigin: callerTransformOrigin,
						transformStyle: callerTransformStyle,
						translate: callerTranslate,
					}}
				>
					<div
						ref={outlineRef}
						style={{
							height: 200,
							maskImage:
								'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, transparent 100%)',
							overflow: 'hidden',
							WebkitMaskImage:
								'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 1) 30%, rgba(0, 0, 0, 1) 70%, transparent 100%)',
							perspective: 10000,
							position: 'relative',
							width: 400,
							...style,
							...callerContentStyle,
						}}
					>
						{values.map((value, index) => {
							const wheelIndex = index / values.length + rotation;
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
											index === 0
												? interpolate(progress, [0.88, 1], [0.28, 1], {
														extrapolateLeft: 'clamp',
														extrapolateRight: 'clamp',
													})
												: 0.28,
										position: 'absolute',
										top: 0,
										perspective: 1000,
										transform: `translateZ(${Math.cos(angle) * 100}px) translateY(${Math.sin(angle) * 100}px) rotateX(${rotateX}deg)`,
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
										{value}
									</div>
								</div>
							);
						})}
					</div>
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
}) as React.FC<InteractiveSpinningTextWheelProps>;

export const SpinningTextWheel: React.FC<SpinningTextWheelProps> = ({
	style,
	...props
}) => {
	return (
		<InteractiveSpinningTextWheel
			items={'Friday\nSaturday\nSunday\nMonday\nTuesday\nWednesday\nThursday'}
			name="Spinning text wheel"
			{...props}
			callerStyle={style ?? null}
			style={{
				color: '#182033',
				fontFamily: 'Mona Sans',
				fontSize: 65,
				fontWeight: 700,
				lineHeight: 1,
				translate: '0px 0px',
			}}
		/>
	);
};
