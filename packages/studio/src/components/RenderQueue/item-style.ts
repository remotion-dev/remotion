import type React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {SPACING_UNIT} from '../layout';

export const RENDER_QUEUE_ITEM_SELECTED_CLASSNAME =
	'__remotion_selected_classname';

export const renderQueueItemSubtitleStyle: React.CSSProperties = {
	fontSize: 13,
	color: LIGHT_TEXT,
	appearance: 'none',
	border: 'none',
	padding: 0,
	cursor: 'pointer',
	lineHeight: 1.2,
	textAlign: 'left',
	whiteSpace: 'nowrap',
	marginRight: SPACING_UNIT,
	overflowX: 'hidden',
	// size smaller than viewport causes actual ellipse
	maxWidth: 500,
	textOverflow: 'ellipsis',
};
