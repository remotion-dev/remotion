import React from 'react';
import {renderQueueItemSubtitleStyle} from './item-style';

const savingStyle: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
	cursor: 'default',
};

export const RenderQueueSavingMessage: React.FC = () => {
	return <span style={savingStyle}>Saving to out/...</span>;
};
