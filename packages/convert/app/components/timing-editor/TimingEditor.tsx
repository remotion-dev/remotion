import {useCallback, useState} from 'react';
import {measureSpring} from 'remotion';
import {AnimationPreview} from './AnimationPreview';
import {CanvasWrapper} from './CanvasWrapper';
import {
	DEFAULT_INTERPOLATE_CONFIG,
	DEFAULT_SINE_CONFIG,
	DEFAULT_SPRING_CONFIG,
} from './defaults';
import {Sidebar} from './Sidebar';
import type {TimingConfig} from './types';

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

	const onChange = useCallback((newConfig: TimingConfig) => {
		setDraggedConfig(newConfig);
	}, []);

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
			<div
				id="spring-app"
				style={{
					display: 'flex',
					overflow: 'hidden',
					width: '100%',
					flex: 1,
				}}
			>
				<Sidebar
					config={currentConfig}
					calculatedDurationInFrames={duration}
					onModeChange={onModeChange}
					onChange={onChange}
					onRelease={onRelease}
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
