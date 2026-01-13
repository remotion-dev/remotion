import {Card} from '@remotion/design';
import React from 'react';
import {Tabs, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {InterpolateEditor} from './InterpolateEditor';
import {SineEditor} from './SineEditor';
import {Spacing} from './Spacing';
import {SpringEditor} from './SpringEditor';
import type {TimingConfig} from './types';

export const Sidebar: React.FC<{
	readonly config: TimingConfig;
	readonly calculatedDurationInFrames: number;
	readonly onModeChange: (mode: 'spring' | 'interpolate' | 'sine') => void;
	readonly setDraggedConfig: (config: TimingConfig) => void;
	readonly onChange: (config: TimingConfig) => void;
	readonly onRelease: () => void;
	readonly onReplay: () => void;
}> = ({
	config,
	calculatedDurationInFrames,
	onModeChange,
	onChange,
	setDraggedConfig,
	onRelease,
	onReplay,
}) => {
	return (
		<Card className="p-4 flex flex-col flex-1 w-full overflow-y-auto md:w-[400px] md:h-full md:flex-none">
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
			<Tabs
				value={config.type}
				onValueChange={(value) =>
					onModeChange(value as 'spring' | 'interpolate' | 'sine')
				}
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
			<Spacing y={2} />

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
