import React from 'react';
import {AppsIcon} from '../icons/apps';

const iconStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 18,
	width: 18,
};

export const CodingAgentIcon: React.FC<{
	readonly iconDataUrl: string | null;
}> = ({iconDataUrl}) => {
	if (iconDataUrl === null) {
		return <AppsIcon height={18} width={18} />;
	}

	return (
		<img
			alt=""
			aria-hidden
			draggable={false}
			src={iconDataUrl}
			style={iconStyle}
		/>
	);
};
