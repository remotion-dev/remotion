import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {renderQueueItemSubtitleStyle} from './item-style';

const cancelledStyle: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
	color: LIGHT_TEXT,
	cursor: 'default',
};

export const RenderQueueCancelledMessage: React.FC = () => {
	return <span style={cancelledStyle}>Cancelled</span>;
};
