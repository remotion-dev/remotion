import React from 'react';

export const Header: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				fontFamily: 'GTPlanar',
				fontWeight: 'bold',
				width: '100%',
				height: 60,
				borderBottom: '1px solid #242424',
				alignItems: 'center',
				paddingLeft: 20,
				paddingRight: 18,
			}}
		>
			<div style={{fontSize: 20}}>Timing Editor</div>
			<div style={{flex: 1}} />
			<a href="https://remotion.dev" target="_blank" rel="noreferrer">
				<img style={{height: 60}} src="/remotion.png" alt="Remotion" />
			</a>
		</div>
	);
};
