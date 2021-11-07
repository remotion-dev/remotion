import React from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {renderFrame} from '../state/render-frame';

const text: React.CSSProperties = {
	color: 'white',
	fontSize: 16,
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1,
};

const time: React.CSSProperties = {
	display: 'inline-block',
	fontSize: 16,
};

const frameStyle: React.CSSProperties = {
	color: '#ccc',
	fontSize: 10,
	fontWeight: 500,
};

export const TimeValue: React.FC = () => {
	const frame = useCurrentFrame();
	const config = Internals.useUnsafeVideoConfig();
	const isStill = useIsStill();

	if (!config) {
		return null;
	}

	if (isStill) {
		return null;
	}

	return (
		<div style={text}>
			<div style={time}>{renderFrame(frame, config.fps)}</div>{' '}
			<div style={frameStyle}>
				{frame} <span style={frameStyle}>({config.fps} fps)</span>
			</div>
		</div>
	);
};
