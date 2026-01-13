import {useCallback, useState} from 'react';
import type {SpringConfig} from 'remotion';
import {measureSpring} from 'remotion';
import {AnimationPreview} from './AnimationPreview';
import {CanvasWrapper} from './CanvasWrapper';
import {DEFAULT_DAMPING, DEFAULT_MASS, DEFAULT_STIFFNESS} from './defaults';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import type {DraggedConfig} from './types';

const fps = 60;

export function TimingEditor() {
	const [config, setConfig] = useState<
		SpringConfig & {
			reverse: boolean;
			durationInFrames: number | null;
			delay: number;
		}
	>({
		damping: DEFAULT_DAMPING,
		mass: DEFAULT_MASS,
		stiffness: DEFAULT_STIFFNESS,
		overshootClamping: false,
		reverse: false,
		durationInFrames: null,
		delay: 0,
	});

	const [draggedConfig, setDraggedConfig] = useState<DraggedConfig | null>(
		null,
	);

	const onMassChange = useCallback(
		(e: [number]) => {
			setDraggedConfig({...config, mass: e[0]});
		},
		[config],
	);

	const onDampingChange = useCallback(
		(e: number[]) => {
			setDraggedConfig({...config, damping: e[0]});
		},
		[config],
	);

	const onStiffnessChange = useCallback(
		(e: number[]) => {
			setDraggedConfig({...config, stiffness: e[0]});
		},
		[config],
	);

	const onDurationInFramesChange = useCallback(
		(e: number | null) => {
			setDraggedConfig({...config, durationInFrames: e});
			setConfig({...config, durationInFrames: e});
		},
		[config],
	);

	const onDelayChange = useCallback(
		(e: number) => {
			setDraggedConfig({...config, delay: e});
			setConfig({...config, delay: e});
		},
		[config],
	);

	const onOvershootClampingChange = useCallback(
		(checked: boolean) => {
			setDraggedConfig({
				...config,
				overshootClamping: checked,
			});
			setConfig({
				...config,
				overshootClamping: checked,
			});
		},
		[config],
	);

	const onReverseChange = useCallback(
		(checked: boolean) => {
			setDraggedConfig({
				...config,
				reverse: checked,
			});
			setConfig({
				...config,
				reverse: checked,
			});
		},
		[config],
	);

	const onRelease = useCallback(() => {
		if (draggedConfig) {
			setConfig(draggedConfig as DraggedConfig);
		}

		setDraggedConfig(null);
	}, [draggedConfig]);

	const duration =
		config.delay +
		(config.durationInFrames
			? config.durationInFrames
			: measureSpring({
					fps,
					threshold: 0.001,
					config,
				}));
	const draggedDuration = draggedConfig
		? draggedConfig.durationInFrames
			? draggedConfig.durationInFrames + draggedConfig.delay
			: measureSpring({
					fps,
					threshold: 0.001,
					config: draggedConfig,
				}) + draggedConfig.delay
		: null;

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100%',
				width: '100%',
				position: 'absolute',
				flexDirection: 'column',
			}}
		>
			<Header />
			<div
				id="spring-app"
				style={{
					boxShadow: '0 3px 10px var(--shadow-color)',
					display: 'flex',
					borderRadius: 8,
					overflow: 'hidden',
					width: '100%',
					flex: 1,
				}}
			>
				<div id="spring-canvas">
					<CanvasWrapper
						config={config}
						draggedConfig={draggedConfig}
						draggedDuration={draggedDuration}
						duration={duration}
						fps={fps}
					/>
					<div id="spring-animation-preview">
						<AnimationPreview animation="Scale" id="spring-scale" />
						<AnimationPreview animation="Translate" id="spring-translate" />
						<AnimationPreview animation="Rotate" id="spring-rotate" />
					</div>
				</div>
				<Sidebar
					mass={draggedConfig?.mass ?? config.mass}
					damping={draggedConfig?.damping ?? config.damping}
					stiffness={draggedConfig?.stiffness ?? config.stiffness}
					overshootClamping={config.overshootClamping}
					reverse={config.reverse}
					fixedDurationInFrames={
						draggedConfig?.durationInFrames ?? config.durationInFrames
					}
					calculatedDurationInFrames={duration}
					delay={draggedConfig?.delay ?? config.delay}
					onMassChange={onMassChange}
					onDampingChange={onDampingChange}
					onStiffnessChange={onStiffnessChange}
					onRelease={onRelease}
					onOvershootClampingChange={onOvershootClampingChange}
					onReverseChange={onReverseChange}
					onDurationInFramesChange={onDurationInFramesChange}
					onDelayChange={onDelayChange}
				/>
			</div>
		</div>
	);
}
