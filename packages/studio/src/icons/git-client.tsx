import type {GitClientId} from '@remotion/studio-shared';
import React from 'react';

export const GitClientIcon: React.FC<{
	readonly gitClientId: GitClientId;
	readonly size: number;
}> = ({gitClientId, size}) => {
	return (
		<img
			alt=""
			aria-hidden
			data-git-client-icon={gitClientId}
			draggable={false}
			src={`/api/app-icon/git-client/${gitClientId}.png`}
			style={{flexShrink: 0, height: size, width: size}}
		/>
	);
};
