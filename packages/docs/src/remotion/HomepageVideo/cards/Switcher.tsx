import React from 'react';

export const Switcher: React.FC<{
	type: 'left' | 'right';
}> = ({type}) => {
	return (
		<div
			style={{
				height: 30,
				width: 30,
				backgroundColor: 'red',
				borderRadius: 15,
				position: 'absolute',
				marginLeft: -15,
				top: '50%',
				left: type === 'left' ? 0 : '100%',
				marginTop: -15,
			}}
		/>
	);
};
