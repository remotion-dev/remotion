import {useCallback, useState} from 'react';
import {measureSpring} from 'remotion';
import {AnimationPreview} from './AnimationPreview';
import {CanvasWrapper} from './CanvasWrapper';
import {
	DEFAULT_INTERPOLATE_CONFIG,
	DEFAULT_SINE_CONFIG,
	DEFAULT_SPRING_CONFIG,
} from './defaults';
import {HARDCODED_FPS} from './generate-code';
import {Sidebar} from './Sidebar';
import type {MixingMode, TimingComponent, TimingConfig} from './types';

let nextId = 1;
const generateId = () => `timing-${nextId++}`;

export function TimingEditor() {
	const [components, setComponents] = useState<TimingComponent[]>([
		{id: generateId(), config: DEFAULT_SPRING_CONFIG, mixingMode: 'additive'},
	]);
	const [draggedState, setDraggedState] = useState<{
		componentId: string;
		config: TimingConfig;
	} | null>(null);
	const [replayKey, setReplayKey] = useState(0);

	const onReplay = useCallback(() => {
		setReplayKey((k) => k + 1);
	}, []);

	const onModeChange = useCallback(
		(componentId: string, mode: 'spring' | 'interpolate' | 'sine') => {
			setComponents((prev) =>
				prev.map((c) => {
					if (c.id !== componentId) return c;
					if (mode === 'spring') {
						return {...c, config: DEFAULT_SPRING_CONFIG};
					}

					if (mode === 'interpolate') {
						return {...c, config: DEFAULT_INTERPOLATE_CONFIG};
					}

					return {...c, config: DEFAULT_SINE_CONFIG};
				}),
			);
			setDraggedState(null);
		},
		[],
	);

	const onRelease = useCallback(
		(componentId: string) => {
			if (draggedState && draggedState.componentId === componentId) {
				setComponents((prev) =>
					prev.map((c) =>
						c.id === componentId ? {...c, config: draggedState.config} : c,
					),
				);
			}

			setDraggedState(null);
		},
		[draggedState],
	);

	const setDraggedConfig = useCallback(
		(componentId: string, config: TimingConfig) => {
			setDraggedState({componentId, config});
		},
		[],
	);

	const onChange = useCallback((componentId: string, config: TimingConfig) => {
		setComponents((prev) =>
			prev.map((c) => (c.id === componentId ? {...c, config} : c)),
		);
	}, []);

	const getDuration = (cfg: TimingConfig) => {
		if (cfg.type === 'spring') {
			return (
				cfg.delay +
				(cfg.durationInFrames ??
					measureSpring({
						fps: HARDCODED_FPS,
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

	const addComponent = useCallback(() => {
		setComponents((prev) => {
			// Calculate total duration of existing components
			const totalDuration = Math.max(...prev.map((c) => getDuration(c.config)));
			const newConfig = {
				...DEFAULT_SPRING_CONFIG,
				delay: totalDuration,
			};
			return [
				...prev,
				{id: generateId(), config: newConfig, mixingMode: 'subtractive'},
			];
		});
	}, []);

	const removeComponent = useCallback((componentId: string) => {
		setComponents((prev) => prev.filter((c) => c.id !== componentId));
	}, []);

	const onMixingModeChange = useCallback(
		(componentId: string, mode: MixingMode) => {
			setComponents((prev) =>
				prev.map((c) => (c.id === componentId ? {...c, mixingMode: mode} : c)),
			);
		},
		[],
	);

	// Get current configs (applying dragged state if any)
	const currentComponents = components.map((c) => {
		if (draggedState && draggedState.componentId === c.id) {
			return {...c, config: draggedState.config};
		}

		return c;
	});

	// Calculate max duration across all configs
	const duration = Math.max(
		...currentComponents.map((c) => getDuration(c.config)),
	);

	// For dragged duration, calculate based on dragged config only if dragging
	const draggedDuration = draggedState
		? Math.max(...currentComponents.map((c) => getDuration(c.config)))
		: null;

	return (
		<div className="flex justify-center items-center h-full w-full absolute flex-col">
			<div className="flex overflow-hidden w-full flex-1 flex-col md:flex-row">
				<Sidebar
					components={components}
					draggedState={draggedState}
					calculatedDurationInFrames={duration}
					onModeChange={onModeChange}
					setDraggedConfig={setDraggedConfig}
					onRelease={onRelease}
					onChange={onChange}
					onReplay={onReplay}
					addComponent={addComponent}
					removeComponent={removeComponent}
					onMixingModeChange={onMixingModeChange}
				/>
				<div className="flex flex-col w-full h-auto flex-1 ">
					<CanvasWrapper
						components={components}
						draggedState={draggedState}
						draggedDuration={draggedDuration}
						duration={duration}
						fps={HARDCODED_FPS}
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
