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
	readonly onChange: (config: TimingConfig) => void;
	readonly onRelease: () => void;
}> = ({config, calculatedDurationInFrames, onModeChange, onChange, onRelease}) => {
	return (
		<div
			id="spring-sidebar"
			className="p-4"
			style={{
				display: 'flex',
				flexDirection: 'column',
				borderRight: '1px solid #242424',
			}}
		>
			<div
				style={{
					fontFamily: 'GTPlanar',
					fontWeight: 'bold',
					fontSize: 20,
					marginBottom: 16,
				}}
			>
				Timing Editor
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
					onChange={onChange}
					onRelease={onRelease}
				/>
			) : config.type === 'interpolate' ? (
				<InterpolateEditor
					config={config}
					onChange={onChange}
					onRelease={onRelease}
				/>
			) : (
				<SineEditor config={config} onChange={onChange} onRelease={onRelease} />
			)}
			<Spacing y={2} />
		</div>
	);
};
