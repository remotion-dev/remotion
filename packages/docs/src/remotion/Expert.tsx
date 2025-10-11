import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {experts} from '../data/experts';
import './font.css';

export const Expert: React.FC<{
	readonly expertId: string;
}> = ({expertId}) => {
	const expert = experts.find((e) => e.slug === expertId);

	return (
		<AbsoluteFill
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				backgroundColor: '#fff',
				fontSize: 32,
				fontWeight: 600,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						height: 150,
						backgroundColor: '#222',
						paddingRight: 40,
					}}
				>
					<div
						style={{
							flex: 1,
							fontFamily: 'GTPlanar',
							color: 'white',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							paddingLeft: 40,
							fontSize: 40,
						}}
					>
						Experts
					</div>
					<div
						style={{
							height: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Img
							style={{
								height: 60,
							}}
							src="https://www.remotion.dev/img/remotion-white.png"
						/>
					</div>
				</div>
				<div
					style={{
						height: 350,
						display: 'flex',
						flexDirection: 'row',
					}}
				>
					<Img height="350" src={staticFile(expert!.image)} />
					<div
						style={{
							width: 700,
							backgroundColor: '#0B84F3',
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'flex-end',
							padding: 50,
						}}
					>
						<div
							style={{
								color: 'white',
								fontFamily: 'GTPlanar',
								fontSize: 60,
							}}
						>
							{expert!.name}
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
