import React from 'react';

export const Minus: React.FC<{
	leftOffset: number;
	minusSignOpacity: number;
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
