import {Button} from '@remotion/design';
import React from 'react';
import {ReplayIcon} from './ReplayIcon';
import {TimingComponentEditor} from './TimingComponentEditor';
import type {MixingMode, TimingComponent, TimingConfig} from './types';

export const Sidebar: React.FC<{
	readonly components: TimingComponent[];
	readonly draggedState: {componentId: string; config: TimingConfig} | null;
	readonly calculatedDurationInFrames: number;
	readonly onModeChange: (
		componentId: string,
		mode: 'spring' | 'interpolate' | 'sine',
	) => void;
	readonly setDraggedConfig: (
		componentId: string,
		config: TimingConfig,
	) => void;
	readonly onChange: (componentId: string, config: TimingConfig) => void;
	readonly onRelease: (componentId: string) => void;
	readonly onReplay: () => void;
	readonly addComponent: () => void;
	readonly removeComponent: (componentId: string) => void;
	readonly onMixingModeChange: (componentId: string, mode: MixingMode) => void;
}> = ({
	components,
	draggedState,
	calculatedDurationInFrames,
	onModeChange,
	onChange,
	setDraggedConfig,
	onRelease,
	onReplay,
	addComponent,
	removeComponent,
	onMixingModeChange,
}) => {
	return (
		<div className="p-4 flex flex-col flex-1 w-full md:w-[400px] md:h-full md:flex-none overflow-y-auto">
			<div className="flex items-center justify-between mb-4">
				<div className="font-brand font-bold text-xl">Timing Editor</div>
				<Button
					type="button"
					onClick={onReplay}
					className="rounded-full w-10 h-10"
				>
					<ReplayIcon />
				</Button>
			</div>
			{components.map((component, index) => (
				<TimingComponentEditor
					key={component.id}
					component={component}
					draggedConfig={
						draggedState?.componentId === component.id
							? draggedState.config
							: null
					}
					calculatedDurationInFrames={calculatedDurationInFrames}
					onModeChange={(mode) => onModeChange(component.id, mode)}
					setDraggedConfig={(config) => setDraggedConfig(component.id, config)}
					onChange={(config) => onChange(component.id, config)}
					onRelease={() => onRelease(component.id)}
					onRemove={() => removeComponent(component.id)}
					canRemove={components.length > 1}
					onMixingModeChange={(mode) => onMixingModeChange(component.id, mode)}
					isFirst={index === 0}
				/>
			))}
			<div className="flex row justify-center">
				<Button
					type="button"
					onClick={addComponent}
					depth={0.5}
					className="px-3 py-0 text-sm h-9 rounded-full font-brand font-medium"
				>
					+ Add component
				</Button>
			</div>
		</div>
	);
};
