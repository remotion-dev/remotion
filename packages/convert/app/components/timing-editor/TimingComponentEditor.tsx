import {Card} from '@remotion/design';
import React from 'react';
import {Tabs, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {InterpolateEditor} from './InterpolateEditor';
import {SineEditor} from './SineEditor';
import {SpringEditor} from './SpringEditor';
import type {TimingComponent, TimingConfig} from './types';

export const TimingComponentEditor: React.FC<{
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
