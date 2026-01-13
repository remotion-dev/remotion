import {Button, Card} from '@remotion/design';
import React from 'react';
import {Tabs, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {InterpolateEditor} from './InterpolateEditor';
import {SineEditor} from './SineEditor';
import {SpringEditor} from './SpringEditor';
import type {TimingComponent, TimingConfig} from './types';
import {XIcon} from './x-icon';

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
		<Card className="p-3 mb-3 relative group">
			{canRemove ? (
				<div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						type="button"
						onClick={onRemove}
						className=" hover:text-white hover:bg-warn transition-colors w-6 h-6 p-0 rounded-full"
						title="Remove timing component"
						depth={0.5}
					>
						<XIcon />
					</Button>
				</div>
			) : null}
			<div className="flex items-center justify-between mb-5">
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
