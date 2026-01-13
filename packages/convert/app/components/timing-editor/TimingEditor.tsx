import {useCallback, useState} from 'react';
import {measureSpring} from 'remotion';
import {AnimationPreview} from './AnimationPreview';
import {CanvasWrapper} from './CanvasWrapper';
import {
	DEFAULT_INTERPOLATE_CONFIG,
	DEFAULT_SPRING_CONFIG,
} from './defaults';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import type {EasingType, TimingConfig} from './types';

const fps = 60;

export function TimingEditor() {
	const [config, setConfig] = useState<TimingConfig>(DEFAULT_SPRING_CONFIG);
	const [draggedConfig, setDraggedConfig] = useState<TimingConfig | null>(null);

	const onModeChange = useCallback((mode: 'spring' | 'interpolate') => {
		if (mode === 'spring') {
			setConfig(DEFAULT_SPRING_CONFIG);
		} else {
			setConfig(DEFAULT_INTERPOLATE_CONFIG);
		}

		setDraggedConfig(null);
	}, []);

	const onMassChange = useCallback(
		(e: [number]) => {
			if (config.type !== 'spring') return;
			setDraggedConfig({
				...config,
				springConfig: {...config.springConfig, mass: e[0]},
			});
		},
		[config],
	);

	const onDampingChange = useCallback(
		(e: number[]) => {
			if (config.type !== 'spring') return;
			setDraggedConfig({
				...config,
				springConfig: {...config.springConfig, damping: e[0]},
			});
		},
		[config],
	);

	const onStiffnessChange = useCallback(
		(e: number[]) => {
			if (config.type !== 'spring') return;
			setDraggedConfig({
				...config,
				springConfig: {...config.springConfig, stiffness: e[0]},
			});
		},
		[config],
	);

	const onDurationInFramesChange = useCallback(
		(e: number | null) => {
			if (config.type === 'spring') {
				setDraggedConfig({...config, durationInFrames: e});
				setConfig({...config, durationInFrames: e});
			} else if (e !== null) {
				setDraggedConfig({...config, durationInFrames: e});
				setConfig({...config, durationInFrames: e});
			}
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
			if (config.type !== 'spring') return;
			const newConfig = {
				...config,
				springConfig: {...config.springConfig, overshootClamping: checked},
			};
			setDraggedConfig(newConfig);
			setConfig(newConfig);
		},
		[config],
	);

	const onReverseChange = useCallback(
		(checked: boolean) => {
			if (config.type !== 'spring') return;
			const newConfig = {...config, reverse: checked};
			setDraggedConfig(newConfig);
			setConfig(newConfig);
		},
		[config],
	);

	const onEasingChange = useCallback(
		(easing: EasingType) => {
			if (config.type !== 'interpolate') return;
			const newConfig = {...config, easing};
			setDraggedConfig(null);
			setConfig(newConfig);
		},
		[config],
	);

	const onRelease = useCallback(() => {
		if (draggedConfig) {
			setConfig(draggedConfig);
		}

		setDraggedConfig(null);
	}, [draggedConfig]);

	const currentConfig = draggedConfig ?? config;

	const duration =
		currentConfig.delay +
		(currentConfig.type === 'spring'
			? currentConfig.durationInFrames ??
				measureSpring({
					fps,
					threshold: 0.001,
					config: currentConfig.springConfig,
				})
			: currentConfig.durationInFrames);

	const draggedDuration = draggedConfig
		? draggedConfig.delay +
			(draggedConfig.type === 'spring'
				? draggedConfig.durationInFrames ??
					measureSpring({
						fps,
						threshold: 0.001,
						config: draggedConfig.springConfig,
					})
				: draggedConfig.durationInFrames)
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
				<Sidebar
					config={currentConfig}
					calculatedDurationInFrames={duration}
					onModeChange={onModeChange}
					onMassChange={onMassChange}
					onDampingChange={onDampingChange}
					onStiffnessChange={onStiffnessChange}
					onRelease={onRelease}
					onOvershootClampingChange={onOvershootClampingChange}
					onReverseChange={onReverseChange}
					onDurationInFramesChange={onDurationInFramesChange}
					onDelayChange={onDelayChange}
					onEasingChange={onEasingChange}
				/>
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
			</div>
		</div>
	);
}
