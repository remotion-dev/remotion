import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {
	Easing,
	Interactive,
	interpolate,
	measureSpring,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import {z} from 'zod';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateY,
	Scale,
	TranslateX,
	TranslateY,
	TranslateZ,
} from '../3DContext/transformation-context';
import {Captions} from './Captions';
import {CodeFrame} from './CodeFrame';
import {EndCard} from './EndCard';
import {LabelOpacityContext, useLabelOpacity} from './LabelOpacity';
import {Rotations} from './Rotations';

type LabelProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Partial<{
		readonly stack: string;
	}> & {
		readonly children: string;
	};

const labelSchema = {
	...Interactive.baseSchema,
	...Interactive.transformSchema,
	...Interactive.textSchema,
	...Interactive.backgroundSchema,
	...Interactive.borderSchema,
	children: {
		type: 'text-content',
		default: '',
		description: 'Text',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

const setRef = <ElementType,>(
	ref: React.ForwardedRef<ElementType>,
	value: ElementType | null,
) => {
	if (typeof ref === 'function') {
		ref(value);
	} else if (ref) {
		ref.current = value;
	}
};

const LabelInner = React.forwardRef<
	HTMLDivElement,
	LabelProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			children,
			durationInFrames,
			from,
			trimBefore,
			freeze,
			hidden,
			name,
			showInTimeline,
			stack,
			controls,
			style,
		},
		ref,
	) => {
		const opacity = useLabelOpacity();
		const outlineRef = React.useRef<HTMLDivElement | null>(null);
		const callbackRef = React.useCallback(
			(element: HTMLDivElement | null) => {
				outlineRef.current = element;
				setRef(ref, element);
			},
			[ref],
		);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? '<Label>'}
				showInTimeline={showInTimeline ?? true}
				controls={controls ?? undefined}
				_remotionInternalStack={stack}
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/studio/make-component-interactive"
				outlineRef={outlineRef}
			>
				<div
					ref={callbackRef}
					className="text-white "
					style={{
						fontFamily: 'GT Planar',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						paddingLeft: 20,
						fontSize: 24,
						opacity,
						...style,
					}}
				>
					{children}
				</div>
			</Sequence>
		);
	},
);

LabelInner.displayName = '<Label>';

const Label = Interactive.withSchema({
	Component: LabelInner,
	componentName: '<Label>',
	componentIdentity: null,
	schema: labelSchema,
	supportsEffects: false,
});

Label.displayName = 'Label';

export const whatIsRemotionSchema = z.object({
	fade: z.boolean(),
	whiteBackground: z.boolean(),
	reel: z.boolean(),
});

export const whatIsRemotionCalculateMetadata: CalculateMetadataFunction<
	z.infer<typeof whatIsRemotionSchema>
> = ({props}) => {
	return {
		width: props.reel ? 1080 : 1080,
		height: props.reel ? 1920 : 1080,
		durationInFrames: props.reel ? 276 : 273,
		props,
	};
};

export const WhatIsRemotion = ({
	fade,
	whiteBackground,
	reel,
}: z.infer<typeof whatIsRemotionSchema>) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Sequence
			style={{
				backgroundColor: whiteBackground ? 'white' : undefined,
				scale: 1.13,
			}}
			className="flex justify-center items-center"
		>
			<Scale factor={reel ? 1.3 : 1.1}>
				<Interactive.Div
					style={{
						position: 'absolute',
						inset: 0,
						maskImage:
							frame > 100 && fade
								? 'linear-gradient( -98deg, transparent 5%, red 15%, red 80%, transparent 90%)'
								: 'none',
					}}
				>
					<TranslateX
						px={interpolate(
							interpolate(frame, [175, 200], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.42, 0, 0.58, 1),
							}),
							[0.7, 1],
							[0, -1500],
							{
								extrapolateLeft: 'clamp',
							},
						)}
					>
						<TranslateZ
							px={
								1.5 *
								60 *
								(interpolate(
									spring({
										fps,
										frame,
										config: {
											damping: 200,
										},
										delay: 105,
										durationInFrames: 25,
										durationRestThreshold: 0.0001,
									}),
									[0, 0.5],
									[0, 1],
									{
										extrapolateRight: 'clamp',
									},
								) -
									interpolate(
										spring({
											fps,
											frame,
											config: {
												damping: 200,
											},
											delay: 145,
											durationInFrames: 25,
											durationRestThreshold: 0.0001,
										}),
										[0.5, 1],
										[0, 1],
										{
											extrapolateLeft: 'clamp',
										},
									))
							}
						>
							<Rotations zIndexHack={false} delay={55}>
								<ExtrudeDiv
									width={interpolate(
										spring({
											fps,
											frame,
											delay: 55,
											config: {
												damping: 200,
											},
											durationInFrames: measureSpring({fps, config: {}}),
										}),
										[0, 1],
										[590.625, 393.75],
									)}
									height={700}
									depth={60}
									cornerRadius={10}
									backFace={
										<Interactive.Div
											className="bg-gray-700"
											style={{
												position: 'absolute',
												inset: 0,
												borderRadius: 10,
												border: '3px solid black',
											}}
										>
											<CodeFrame />
										</Interactive.Div>
									}
									bottomFace={<Label>&lt;Video /&gt;</Label>}
								>
									<Interactive.Div
										style={{
											borderRadius: 10,
											overflow: 'hidden',
											fontFamily: 'GT Planar',
											backgroundColor: 'black',
											border: '3px solid black',
										}}
										className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
									>
										<Interactive.Div
											style={{
												backgroundColor: 'black',
												width: '100%',
												height: '100%',
												overflow: 'hidden',
											}}
										>
											<Sequence from={55} layout="none">
												<OffthreadVideo
													muted
													style={{
														width: '100%',
														height: '100%',
														objectFit: 'cover',
													}}
													src={staticFile('video.mp4')}
												/>
											</Sequence>
										</Interactive.Div>
									</Interactive.Div>
								</ExtrudeDiv>
							</Rotations>
						</TranslateZ>
					</TranslateX>
				</Interactive.Div>
				<Interactive.Div
					style={{
						position: 'absolute',
						inset: 0,
						maskImage: fade
							? 'linear-gradient( -7deg, transparent 6%, red 15%, red 84%, transparent 94%)'
							: 'none',
					}}
				>
					<TranslateY
						px={interpolate(
							spring({
								fps,
								frame,
								config: {
									damping: 200,
								},
								delay: 105,
								durationInFrames: 25,
								durationRestThreshold: 0.0001,
							}) +
								spring({
									fps,
									frame,
									config: {
										damping: 200,
									},
									delay: 145,
									durationInFrames: 25,
									durationRestThreshold: 0.0001,
								}),
							[0, 1, 2],
							[1900, 0, -1900],
						)}
					>
						<Rotations zIndexHack={false} delay={55}>
							<ExtrudeDiv
								width={393.75}
								height={700}
								depth={60}
								cornerRadius={10}
								backFace={
									<Interactive.Div
										className="bg-gray-700"
										style={{
											position: 'absolute',
											inset: 0,
											borderRadius: 10,
											border: '3px solid black',
										}}
									/>
								}
								bottomFace={<Label>&lt;BRoll /&gt;</Label>}
							>
								<Interactive.Div
									style={{
										borderRadius: 10,
										overflow: 'hidden',
										fontFamily: 'GT Planar',
										backgroundColor: 'black',
										border: '3px solid black',
									}}
									className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
								>
									<Interactive.Div
										style={{
											backgroundColor: 'black',
											width: '100%',
											height: '100%',
											overflow: 'hidden',
										}}
									>
										<Sequence from={55} layout="none">
											<OffthreadVideo
												muted
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
												src={staticFile('spiral_.mp4')}
											/>
										</Sequence>
									</Interactive.Div>
								</Interactive.Div>
							</ExtrudeDiv>
						</Rotations>
					</TranslateY>
				</Interactive.Div>
				<Interactive.Div
					style={{
						position: 'absolute',
						inset: 0,
						maskImage:
							frame > 100 && fade
								? 'linear-gradient( -98deg, transparent 10%, red 18%, red 80%, transparent 90%)'
								: 'none',
					}}
				>
					{interpolate(frame, [175, 200], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.42, 0, 0.58, 1),
					}) > 0 && (
						<TranslateX
							px={interpolate(frame, [175, 200], [1500, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.42, 0, 0.58, 1),
							})}
						>
							<RotateY
								radians={interpolate(
									spring({
										fps,
										frame,
										config: {
											damping: 200,
										},
										delay: 250,
										durationInFrames: 20,
									}),
									[0, 1],
									[0, Math.PI],
								)}
							>
								<LabelOpacityContext.Provider
									value={
										1 -
										spring({
											fps,
											frame,
											config: {
												damping: 200,
											},
											delay: 250,
											durationInFrames: 20,
										})
									}
								>
									<Rotations zIndexHack={false} delay={55}>
										<ExtrudeDiv
											width={interpolate(
												spring({
													fps,
													frame,
													config: {
														damping: 200,
													},
													delay: 250,
													durationInFrames: 20,
												}),
												[0, 1],
												[393.75, 590.625],
											)}
											height={700}
											depth={60}
											cornerRadius={10}
											backFace={
												<Interactive.Div
													className="bg-gray-700"
													style={{
														position: 'absolute',
														inset: 0,
														borderRadius: 10,
														border: '3px solid black',
													}}
												/>
											}
											bottomFace={<Label>&lt;EndCard /&gt;</Label>}
										>
											<Interactive.Div
												style={{
													borderRadius: 10,
													overflow: 'hidden',
													fontFamily: 'GT Planar',
													backgroundColor: 'black',
													border: '3px solid black',
												}}
												className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
											>
												<Interactive.Div
													style={{
														backgroundColor: 'black',
														width: '100%',
														height: '100%',
														overflow: 'hidden',
													}}
												>
													<Interactive.Div
														className="bg-white"
														style={{
															position: 'absolute',
															inset: 0,
															borderRadius: 10,
															border: '3px solid black',
														}}
													/>
												</Interactive.Div>
											</Interactive.Div>
										</ExtrudeDiv>
									</Rotations>
								</LabelOpacityContext.Provider>
							</RotateY>
						</TranslateX>
					)}
					<Interactive.Div
						style={{
							position: 'absolute',
							inset: 0,
							maskImage: fade
								? 'linear-gradient(to bottom, transparent , black 10%)'
								: undefined,
						}}
					>
						<TranslateX
							px={interpolate(frame, [175, 200], [1500, 0], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.42, 0, 0.58, 1),
							})}
						>
							<Interactive.Div
								style={{
									position: 'absolute',
									inset: 0,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Sequence layout="none" from={100}>
									<Interactive.Div
										style={{
											width: 393.75,
											height: 700,
											position: 'relative',
										}}
									>
										{interpolate(frame, [175, 200], [0, 1], {
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
											easing: Easing.bezier(0.42, 0, 0.58, 1),
										}) ? (
											<EndCard cornerRadius={10} />
										) : null}
									</Interactive.Div>
								</Sequence>
							</Interactive.Div>
						</TranslateX>
					</Interactive.Div>
				</Interactive.Div>
				<TranslateY px={190}>
					<TranslateZ
						px={interpolate(frame, [175, 200], [-120, -2120], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.42, 0, 0.58, 1),
						})}
					>
						<Rotations zIndexHack delay={56}>
							<ExtrudeDiv
								width={300}
								height={60}
								depth={60}
								cornerRadius={10}
								bottomFace={<Label>&lt;Captions /&gt;</Label>}
								backFace={
									<Interactive.Div
										className="bg-black"
										style={{
											position: 'absolute',
											inset: 0,
											borderRadius: 10,
											overflow: 'hidden',
										}}
									/>
								}
							>
								<Interactive.Div
									style={{
										borderRadius: 10,
										overflow: 'hidden',
										fontFamily: 'GT Planar',
										backgroundColor: 'white',
										border: '3px solid black',
									}}
									className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
								>
									<Sequence from={55}>
										<Captions />
									</Sequence>
								</Interactive.Div>
							</ExtrudeDiv>
						</Rotations>
					</TranslateZ>
				</TranslateY>
			</Scale>
		</Sequence>
	);
};
