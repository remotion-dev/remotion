import React from 'react';

export const JumpToVideoLink: React.FC<{
	readonly children: string;
}> = ({children}) => {
	return (
		<a
			style={{cursor: 'pointer'}}
			onClick={(e) => {
				const parts = children.split(':');
				const time = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

				e.preventDefault();
				// @ts-expect-error
				window.global_seek_to(time);
			}}
		>
			{children}
		</a>
	);
};
