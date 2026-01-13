import {useCallback, useState} from 'react';
import {measureSpring} from 'remotion';
import {AnimationPreview} from './AnimationPreview';
import {CanvasWrapper} from './CanvasWrapper';
import {
	DEFAULT_INTERPOLATE_CONFIG,
	DEFAULT_SINE_CONFIG,
	DEFAULT_SPRING_CONFIG,
} from './defaults';
import {Header} from './Header';
import {Sidebar} from './Sidebar';
import type {EasingType, TimingConfig} from './types';

const fps = 60;

export function TimingEditor() {
	const [config, setConfig] = useState<TimingConfig>(DEFAULT_SPRING_CONFIG);
	const [draggedConfig, setDraggedConfig] = useState<TimingConfig | null>(null);

	const onModeChange = useCallback(
		(mode: 'spring' | 'interpolate' | 'sine') => {
			if (mode === 'spring') {
				setConfig(DEFAULT_SPRING_CONFIG);
			} else if (mode === 'interpolate') {
				setConfig(DEFAULT_INTERPOLATE_CONFIG);
			} else {
				setConfig(DEFAULT_SINE_CONFIG);
			}

			setDraggedConfig(null);
		},
		[],
	);

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
				// Interpolate mode: only set draggedConfig during drag
				setDraggedConfig({...config, durationInFrames: e});
			}
		},
		[config],
	);

	const onDelayChange = useCallback(
		(e: number) => {
			if (config.type === 'sine') return;
			setDraggedConfig({...config, delay: e});
			// Only immediately commit for spring mode
			if (config.type === 'spring') {
				setConfig({...config, delay: e});
			}
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

	const onAmplitudeChange = useCallback(
		(amplitude: number) => {
			if (config.type !== 'sine') return;
			setDraggedConfig({...config, amplitude});
		},
		[config],
	);

	const onFrequencyChange = useCallback(
		(frequency: number) => {
			if (config.type !== 'sine') return;
			setDraggedConfig({...config, frequency});
		},
		[config],
	);

	const onFrameOffsetChange = useCallback(
		(frameOffset: number) => {
			if (config.type !== 'sine') return;
			setDraggedConfig({...config, frameOffset});
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

	const getDuration = (cfg: TimingConfig) => {
		if (cfg.type === 'spring') {
			return (
				cfg.delay +
				(cfg.durationInFrames ??
					measureSpring({
						fps,
						threshold: 0.001,
						config: cfg.springConfig,
					}))
			);
		}

		if (cfg.type === 'interpolate') {
			return cfg.delay + cfg.durationInFrames;
		}

		// sine
		return cfg.durationInFrames;
	};

	const duration = getDuration(currentConfig);
	const draggedDuration = draggedConfig ? getDuration(draggedConfig) : null;

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
					onAmplitudeChange={onAmplitudeChange}
					onFrequencyChange={onFrequencyChange}
					onFrameOffsetChange={onFrameOffsetChange}
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
