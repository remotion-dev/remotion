import React, {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	cancelRender,
	delayRender,
	useCurrentFrame,
} from 'remotion';

export const CancelRender: React.FC = () => {
	const frame = useCurrentFrame();
	useState(() => delayRender('Rendering...'));

	useEffect(() => {
		Promise.resolve()
			.then(() => {
				// Worst case: Inside a promise without a catch handler
				// and with a timeout running
				cancelRender(new Error('This should be the error message'));
			})
			// And then with a catch handler
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<AbsoluteFill
			style={{
				fontFamily: 'ubuntu',
				fontSize: '500',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#fff',
			}}
		>
			<h1>The current frame is {frame}</h1>
			<button
				type="button"
				style={{
					color: '#fff',
					height: '50px',
					width: '35%',
					fontSize: '22px',
					textAlign: 'center',
					borderRadius: '4px',
					backgroundColor: '#0b84f3',
					border: 'none',
				}}
				onClick={cancelRender}
			>
				Click me to cancel this render
			</button>
		</AbsoluteFill>
	);
};
