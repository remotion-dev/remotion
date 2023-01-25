import React from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {useIsStill} from '../helpers/is-current-selected-still';
import {renderFrame} from '../state/render-frame';
import {SPACING_UNIT} from './layout';

const text: React.CSSProperties = {
	color: 'white',
	fontSize: 18,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1,
};

const time: React.CSSProperties = {
	display: 'inline-block',
	fontSize: 18,
};

const frameStyle: React.CSSProperties = {
	color: '#ccc',
	fontSize: 10,
	fontWeight: 500,
};

const spacer: React.CSSProperties = {
	width: SPACING_UNIT,
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
			<div style={spacer} />
			<div style={frameStyle}>
				{frame} <span style={frameStyle}>({config.fps} fps)</span>
			</div>
		</div>
	);
};
