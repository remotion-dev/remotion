import React from 'react';

export const FinderIcon: React.FC<{
	readonly size: number;
}> = ({size}) => {
	return (
		<img
			alt=""
			aria-hidden
			data-file-manager-icon="finder"
			draggable={false}
			src="/api/app-icon/file-manager/finder.png"
			style={{flexShrink: 0, height: size, width: size}}
		/>
	);
};
