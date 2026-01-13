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
	const [replayKey, setReplayKey] = useState(0);

	const onReplay = useCallback(() => {
		setReplayKey((k) => k + 1);
	}, []);

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
		<div className="flex justify-center items-center h-full w-full absolute flex-col">
			<div className="flex overflow-hidden w-full flex-1 flex-col md:flex-row">
				<Sidebar
					config={currentConfig}
					calculatedDurationInFrames={duration}
					onModeChange={onModeChange}
					setDraggedConfig={setDraggedConfig}
					onRelease={onRelease}
					onChange={setConfig}
					onReplay={onReplay}
				/>
				<div className="flex flex-col h-[300px] w-full border-b border-[#242424] md:h-auto md:flex-1 md:border-b-0">
					<CanvasWrapper
						config={config}
						draggedConfig={draggedConfig}
						draggedDuration={draggedDuration}
						duration={duration}
						fps={fps}
						replayKey={replayKey}
					/>
					<div className="hidden md:flex flex-row justify-center">
						<AnimationPreview animation="Scale" id="spring-scale" />
						<AnimationPreview animation="Translate" id="spring-translate" />
						<AnimationPreview animation="Rotate" id="spring-rotate" />
					</div>
				</div>
			</div>
		</div>
	);
}
