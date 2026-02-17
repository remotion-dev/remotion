import {AbsoluteFill, Img, staticFile} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#f0f0f0',
				display: 'grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gridTemplateRows: 'repeat(2, 1fr)',
				gap: 10,
				padding: 10,
			}}
		>
			{/* fill - stretches to fill the container */}
			<div style={{backgroundColor: '#e0e0e0', position: 'relative'}}>
				<Img
					src={staticFile('1.webp')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'fill',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 5,
						left: 5,
						fontSize: 12,
						fontWeight: 'bold',
					}}
				>
					fill
				</div>
			</div>

			{/* contain - maintains aspect ratio, fits inside */}
			<div style={{backgroundColor: '#e0e0e0', position: 'relative'}}>
				<Img
					src={staticFile('1.webp')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'contain',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 5,
						left: 5,
						fontSize: 12,
						fontWeight: 'bold',
					}}
				>
					contain
				</div>
			</div>

			{/* cover - maintains aspect ratio, covers container */}
			<div style={{backgroundColor: '#e0e0e0', position: 'relative'}}>
				<Img
					src={staticFile('1.webp')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 5,
						left: 5,
						fontSize: 12,
						fontWeight: 'bold',
					}}
				>
					cover
				</div>
			</div>

			{/* none - original size, not resized */}
			<div style={{backgroundColor: '#e0e0e0', position: 'relative'}}>
				<Img
					src={staticFile('1.webp')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'none',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 5,
						left: 5,
						fontSize: 12,
						fontWeight: 'bold',
					}}
				>
					none
				</div>
			</div>

			{/* scale-down - behaves like none or contain, whichever is smaller */}
			<div style={{backgroundColor: '#e0e0e0', position: 'relative'}}>
				<Img
					src={staticFile('1.webp')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'scale-down',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 5,
						left: 5,
						fontSize: 12,
						fontWeight: 'bold',
					}}
				>
					scale-down
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const objectFit = {
	component: Component,
	id: 'object-fit',
	width: 600,
	height: 400,
	fps: 25,
	durationInFrames: 1,
} as const;
