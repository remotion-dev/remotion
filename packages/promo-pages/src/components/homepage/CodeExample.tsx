'use client';

import {Player} from '@remotion/player';
import React, {useState} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

const IMG_WIDTH = 1120;
const IMG_HEIGHT = 760;
const ASPECT = IMG_WIDTH / IMG_HEIGHT;

const Demo: React.FC = () => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 10, 40, 49], [0, 1, 1, 0]);
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flex: 1,
				backgroundColor: 'black',
			}}
		>
			<img style={{transform: `scale(${scale})`}} src="/img/logo-small.png" />
		</div>
	);
};

const container = {
	maxWidth: 500,
	height: (1 / ASPECT) * 500,
	position: 'relative' as const,
};

const Preview: React.FC = () => {
	return (
		<Player
			component={Demo}
			compositionHeight={IMG_HEIGHT}
			compositionWidth={IMG_WIDTH}
			durationInFrames={50}
			style={container}
			controls
			fps={30}
		/>
	);
};

const tabStyle = {
	appearance: 'none',
	backgroundColor: 'transparent',
	fontFamily: 'inherit',
	border: 'none',
	cursor: 'pointer',
	color: 'var(--text-color)',
} as const;

type Tab = 'code' | 'preview';

export const CodeExample: React.FC = () => {
	const [tab, setTab] = useState<Tab>('code');
	return (
		<div style={{flex: 1, textAlign: 'left', maxWidth: 700}}>
			<button
				type="button"
				style={{...tabStyle, opacity: tab === 'code' ? 1 : 0.5}}
				onClick={() => setTab('code')}
			>
				Code
			</button>
			|
			<button
				type="button"
				style={{...tabStyle, opacity: tab === 'preview' ? 1 : 0.5}}
				onClick={() => setTab('preview')}
			>
				Preview
			</button>
			<div>
				{tab === 'code' && (
					<div style={container}>
						<img src="/img/code-sample-new.png" className="w-full" />
					</div>
				)}
				{tab === 'preview' && <Preview />}
			</div>
		</div>
	);
};
