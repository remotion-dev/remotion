import type {DefaultCodingAgent} from '@remotion/renderer';
import React from 'react';
import {AppsIcon} from '../icons/apps';

export const CodingAgentIcon: React.FC<{
	readonly codingAgentId: DefaultCodingAgent | null;
	readonly size: number;
}> = ({codingAgentId, size}) => {
	if (codingAgentId === null) {
		return <AppsIcon height={size} width={size} />;
	}

	return (
		<img
			alt=""
			aria-hidden
			data-coding-agent-icon={codingAgentId}
			draggable={false}
			src={`/api/app-icon/coding-agent/${codingAgentId}.png`}
			style={{flexShrink: 0, height: size, width: size}}
		/>
	);
};
