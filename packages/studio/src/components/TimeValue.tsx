import React from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {LIGHT_TEXT} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {renderFrame} from '../state/render-frame';
import {Flex} from './layout';

const text: React.CSSProperties = {
	color: 'white',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-end',
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1,
	width: '100%',
};

const time: React.CSSProperties = {
	display: 'inline-block',
	fontSize: 18,
	lineHeight: 1,
	fontFamily: 'monospace',
};

const frameStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontWeight: 500,
	lineHeight: 1,
	fontSize: 18,
	fontFamily: 'monospace',
	paddingRight: 10,
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
			<div style={time}>{renderFrame(frame, config.fps)}</div>
			<Flex />
			<div style={frameStyle}>{frame}</div>
		</div>
	);
};
