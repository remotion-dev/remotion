import {Card} from '@remotion/design';
import React from 'react';
import {Tabs, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {InterpolateEditor} from './InterpolateEditor';
import {SineEditor} from './SineEditor';
import {SpringEditor} from './SpringEditor';
import type {TimingComponent, TimingConfig} from './types';

const TimingComponentEditor: React.FC<{
	readonly component: TimingComponent;
	readonly draggedConfig: TimingConfig | null;
	readonly calculatedDurationInFrames: number;
	readonly onModeChange: (mode: 'spring' | 'interpolate' | 'sine') => void;
	readonly setDraggedConfig: (config: TimingConfig) => void;
	readonly onChange: (config: TimingConfig) => void;
	readonly onRelease: () => void;
	readonly onRemove: () => void;
	readonly canRemove: boolean;
}> = ({
	component,
	draggedConfig,
	calculatedDurationInFrames,
	onModeChange,
	onChange,
	setDraggedConfig,
	onRelease,
	onRemove,
	canRemove,
}) => {
	const config = draggedConfig ?? component.config;

	return (
		<Card className="p-3 mb-3">
			<div className="flex items-center justify-between mb-2">
				<Tabs
					value={config.type}
					onValueChange={(value) =>
						onModeChange(value as 'spring' | 'interpolate' | 'sine')
					}
					className="flex-1"
				>
					<TabsList style={{width: '100%'}}>
						<TabsTrigger value="spring" style={{flex: 1}}>
							Spring
						</TabsTrigger>
						<TabsTrigger value="interpolate" style={{flex: 1}}>
							Interpolate
						</TabsTrigger>
						<TabsTrigger value="sine" style={{flex: 1}}>
							Sine
						</TabsTrigger>
					</TabsList>
				</Tabs>
				{canRemove ? (
					<button
						type="button"
						onClick={onRemove}
						className="ml-2 px-2 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
						title="Remove timing component"
					>
						Remove
					</button>
				) : null}
			</div>

			{config.type === 'spring' ? (
				<SpringEditor
					config={config}
					calculatedDurationInFrames={calculatedDurationInFrames}
					onDragChange={setDraggedConfig}
					onRelease={onRelease}
					onChange={onChange}
				/>
			) : config.type === 'interpolate' ? (
				<InterpolateEditor
					config={config}
					onDragChange={setDraggedConfig}
					onRelease={onRelease}
					onChange={onChange}
				/>
			) : (
				<SineEditor
					config={config}
					onChange={setDraggedConfig}
					onRelease={onRelease}
				/>
			)}
		</Card>
	);
};

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
}) => {
	return (
		<div className="p-4 flex flex-col flex-1 w-full overflow-y-auto md:w-[400px] md:h-full md:flex-none overflow-y-auto">
			<div className="flex items-center justify-between mb-4">
				<div className="font-brand font-bold text-xl">Timing Editor</div>
				<button
					type="button"
					onClick={onReplay}
					className="px-3 py-1 text-sm bg-[#0b84f3] text-white rounded font-brand font-medium hover:bg-[#0a75d9] transition-colors"
				>
					Replay
				</button>
			</div>

			{components.map((component) => (
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
				/>
			))}
			<button
				type="button"
				onClick={addComponent}
				className="w-full px-3 py-2 text-sm border border-dashed border-[#444] text-[#888] hover:border-[#666] hover:text-[#aaa] rounded font-brand font-medium transition-colors"
			>
				+ Add Timing Component
			</button>
		</div>
	);
};
