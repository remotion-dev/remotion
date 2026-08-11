import React from 'react';
import {Img} from 'remotion';

export const Expert: React.FC = () => {
	return (
		<div
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				backgroundColor: '#fff',
				fontSize: 32,
				fontWeight: 600,
			}}
		>
			<div
				style={{
					position: 'absolute',
					height: 350,
					width: 700,
					left: 60,
					top: 230,
					backgroundColor: '#0B84F3',
				}}
			/>
			<Img
				width="400"
				height="160"
				src="https://jonnyburger.s3.eu-central-1.amazonaws.com/element-0+(1).png"
				style={{
					top: 50,
					left: 43,
					position: 'absolute',
				}}
			/>
			<Img
				width="350"
				height="350"
				src="https://www.remotion.dev/img/freelancers/benjamin.jpeg"
				style={{
					top: 230,
					left: 750,
					position: 'absolute',
				}}
			/>
			<div
				style={{
					bottom: 90,
					left: 100,
					position: 'absolute',
					color: 'white',
					fontFamily: 'GTPlanar',
					fontSize: 60,
				}}
			>
				Benjamin Jameson
			</div>
		</div>
	);
};
