import React from 'react';

export const Minus: React.FC<{
	readonly leftOffset: number;
	readonly minusSignOpacity: number;
}> = ({leftOffset, minusSignOpacity}) => {
	return (
		<div
			style={{
				position: 'relative',
				marginLeft: -40 - leftOffset,
				marginTop: 5,
				width: 40,
				opacity: minusSignOpacity,
				textAlign: 'right',
			}}
		>
			-
		</div>
	);
};
