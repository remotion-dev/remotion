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
import type {TimingComponent, TimingConfig} from './types';

const fps = 60;

let nextId = 1;
const generateId = () => `timing-${nextId++}`;

export function TimingEditor() {
	const [components, setComponents] = useState<TimingComponent[]>([
		{id: generateId(), config: DEFAULT_SPRING_CONFIG},
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

	const addComponent = useCallback(() => {
		setComponents((prev) => [
			...prev,
			{id: generateId(), config: DEFAULT_SPRING_CONFIG},
		]);
	}, []);

	const removeComponent = useCallback((componentId: string) => {
		setComponents((prev) => prev.filter((c) => c.id !== componentId));
	}, []);

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
			<div className="flex overflow-hidden w-full flex-1 flex-col md:flex-row p-2">
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
				/>
				<div className="flex flex-col h-[300px] w-full border-b border-[#242424] md:h-auto md:flex-1 md:border-b-0">
					<CanvasWrapper
						components={components}
						draggedState={draggedState}
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
