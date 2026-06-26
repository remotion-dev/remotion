import {useColorMode} from '@docusaurus/theme-common';
import {Player} from '@remotion/player';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {
	makeShapeComponentDragDataFromDemoState,
	setComponentDragData,
} from '../shapes/shape-component-drag-data';
import {ShapeDragPreview} from '../shapes/shape-drag-preview';
import {Control} from './control';
import type {DemoType, Option} from './types';
import {
	animationMathDemo,
	arrowDemo,
	bookFlipPresentationDemo,
	calloutDemo,
	circleDemo,
	clockWipePresentationDemo,
	crosswarpPresentationDemo,
	crossZoomPresentationDemo,
	cubePresentationDemo,
	customPresentationDemo,
	customTimingDemo,
	dissolvePresentationDemo,
	dreamyZoomPresentationDemo,
	ellipseDemo,
	fadePresentationDemo,
	filmBurnPresentationDemo,
	flipPresentationDemo,
	heartDemo,
	htmlInCanvasDemo2DBlur,
	htmlInCanvasDemoWebGL,
	htmlInCanvasDemoWebGPU,
	irisPresentationDemo,
	lightLeakDemo,
	linearBlurPresentationDemo,
	noiseDemo,
	nonePresentationDemo,
	opacityDemo,
	pieDemo,
	polygonDemo,
	rectDemo,
	ripplePresentationDemo,
	rotateDemo,
	roundedTextBoxDemo,
	scaleDemo,
	shaderDemo,
	skewDemo,
	slidePresentationDemo,
	slidePresentationDemoLongThreshold,
	sparkDemo,
	springDampingDemo,
	springDemo,
	starburstDemo,
	starDemo,
	swapPresentationDemo,
	transitionSeriesEnterExitDemo,
	transitionSeriesOverlayDemo,
	transitionSeriesTransitionDemo,
	translateDemo,
	triangleDemo,
	wipePresentationDemo,
	zoomBlurPresentationDemo,
	zoomInOutPresentationDemo,
} from './types';
import styles from './styles.module.css';

const container: React.CSSProperties = {
	overflow: 'hidden',
	width: '100%',
	border: '1px solid var(--ifm-color-emphasis-300)',
	borderRadius: 'var(--ifm-pre-border-radius)',
	marginBottom: 40,
};

const dragHandle: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: '1px solid var(--ifm-color-emphasis-300)',
	cursor: 'grab',
	display: 'flex',
	fontSize: 13,
	fontWeight: 600,
	gap: 6,
	padding: '8px 10px',
	userSelect: 'none',
};

const draggablePreview: React.CSSProperties = {
	cursor: 'grab',
};

const previewSeparator: React.CSSProperties = {
	borderBottom: '1px solid var(--ifm-color-emphasis-300)',
};

const dragPreviewSource: React.CSSProperties = {
	height: 128,
	left: -10000,
	pointerEvents: 'none',
	position: 'fixed',
	top: -10000,
	width: 128,
};

const demos: DemoType[] = [
	htmlInCanvasDemo2DBlur,
	htmlInCanvasDemoWebGL,
	htmlInCanvasDemoWebGPU,
	noiseDemo,
	arrowDemo,
	triangleDemo,
	rectDemo,
	calloutDemo,
	circleDemo,
	ellipseDemo,
	heartDemo,
	sparkDemo,
	starDemo,
	polygonDemo,
	pieDemo,
	translateDemo,
	skewDemo,
	rotateDemo,
	scaleDemo,
	opacityDemo,
	fadePresentationDemo,
	wipePresentationDemo,
	slidePresentationDemo,
	slidePresentationDemoLongThreshold,
	flipPresentationDemo,
	nonePresentationDemo,
	customPresentationDemo,
	customTimingDemo,
	clockWipePresentationDemo,
	irisPresentationDemo,
	cubePresentationDemo,
	animationMathDemo,
	roundedTextBoxDemo,
	springDemo,
	springDampingDemo,
	shaderDemo,
	lightLeakDemo,
	starburstDemo,
	transitionSeriesTransitionDemo,
	transitionSeriesOverlayDemo,
	transitionSeriesEnterExitDemo,
	bookFlipPresentationDemo,
	zoomBlurPresentationDemo,
	dreamyZoomPresentationDemo,
	filmBurnPresentationDemo,
	linearBlurPresentationDemo,
	zoomInOutPresentationDemo,
	dissolvePresentationDemo,
	ripplePresentationDemo,
	crosswarpPresentationDemo,
	crossZoomPresentationDemo,
	swapPresentationDemo,
];

const shouldShowOption = (
	option: Option,
	state: Record<string, unknown>,
): boolean => {
	if (!option.showIf) {
		return true;
	}

	return state[option.showIf.option] === option.showIf.value;
};

export const Demo: React.FC<{
	readonly type: string;
}> = ({type}) => {
	const demo = demos.find((d) => d.id === type);
	if (!demo) {
		throw new Error('no demo');
	}

	const {colorMode} = useColorMode();

	const [key, setKey] = useState(() => 0);
	const previewRef = useRef<SVGSVGElement>(null);

	const initialState = useMemo(() => {
		return demo.options
			.map(
				(o) =>
					[
						o.name,
						o.optional === 'default-disabled' ? null : o.default,
					] as const,
			)
			.reduce((a, b) => {
				a[b[0]] = b[1];
				return a;
			}, {});
	}, [demo.options]);

	const [state, setState] = useState(() => initialState);

	const shapeDragData = useMemo(() => {
		return makeShapeComponentDragDataFromDemoState({
			demoId: demo.id,
			state,
		});
	}, [demo.id, state]);

	const onDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			if (shapeDragData !== null) {
				setComponentDragData({
					dataTransfer: e.dataTransfer,
					dragData: shapeDragData,
					dragImage: previewRef.current,
				});
			}
		},
		[shapeDragData],
	);

	const restart = useCallback(() => {
		setState(initialState);
		setKey((k) => k + 1);
	}, [initialState]);

	if (!demo) {
		throw new Error('Demo not found');
	}

	return (
		<div style={container}>
			<div
				draggable={shapeDragData !== null}
				onDragStart={shapeDragData === null ? undefined : onDragStart}
				style={{
					...(shapeDragData === null ? {} : draggablePreview),
					...(demo.options.length > 0 || shapeDragData !== null
						? previewSeparator
						: {}),
				}}
				title={
					shapeDragData === null
						? undefined
						: 'Drag this shape into Remotion Studio'
				}
			>
				<div>
					<Player
						key={key}
						acknowledgeRemotionLicense
						component={demo.comp}
						compositionWidth={demo.compWidth}
						compositionHeight={demo.compHeight}
						durationInFrames={demo.durationInFrames}
						fps={demo.fps}
						style={{
							width: '100%',
							aspectRatio: demo.compWidth / demo.compHeight,
						}}
						logLevel={demo.logLevel}
						errorFallback={({error}) => {
							return (
								<AbsoluteFill
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										fontSize: 30,
										textAlign: 'center',
										lineHeight: 1.5,
									}}
								>
									{error.message}
									<br />
									<button
										style={{
											fontSize: 30,
										}}
										onClick={restart}
										type="button"
									>
										Restart
									</button>
								</AbsoluteFill>
							);
						}}
						inputProps={{...state, darkMode: colorMode === 'dark'}}
						autoPlay={demo.autoPlay}
						controls={demo.controls}
						initiallyMuted
						loop
					/>
				</div>
			</div>
			{shapeDragData === null ? null : (
				<div style={dragPreviewSource}>
					<ShapeDragPreview
						ref={previewRef}
						dragData={shapeDragData}
						size={128}
					/>
				</div>
			)}
			{shapeDragData === null ? null : (
				<div
					draggable
					onDragStart={onDragStart}
					style={dragHandle}
					title="Drag this shape into Remotion Studio"
				>
					<span aria-hidden="true">::</span>
					<span>Drag current shape into a layer in the Studio</span>
				</div>
			)}
			<div className={styles.containerrow}>
				{demo.options
					.filter((option) => shouldShowOption(option, state))
					.map((option) => {
						return (
							<Control
								key={option.name}
								option={option}
								value={state[option.name]}
								setValue={(value) => {
									setState((s) => ({
										...s,
										[option.name]: value,
									}));
								}}
							/>
						);
					})}
			</div>
		</div>
	);
};
