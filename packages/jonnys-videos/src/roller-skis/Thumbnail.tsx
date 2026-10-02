import {AbsoluteFill, CanvasImage, Interactive} from 'remotion';
import {rollerSkiAsset} from './assets';

export const Thumbnail: React.FC = () => {
	return (
		<>
			<AbsoluteFill
				style={{
					translate: '-91.1px 0px',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 960,
						height: 1080,
						overflow: 'hidden',
					}}
				></div>

				<div
					style={{
						position: 'absolute',
						left: 960,
						top: 0,
						width: 960,
						height: 1080,
						overflow: 'hidden',
					}}
				>
					<CanvasImage
						src={rollerSkiAsset('images/thumbnail-selfie.png')}
						style={{
							position: 'absolute',
							left: -135,
							top: 0,
							width: 1920,
							height: 1080,
							scale: 1.186,
							translate: '-66.5px -75.7px',
						}}
					/>
				</div>

				<Interactive.Div
					style={{
						position: 'absolute',
						left: 954,
						top: 0,
						width: 12,
						height: 1080,
						backgroundColor: '#FFFFFF',
						translate: '-127.7px 0px',
					}}
				/>
			</AbsoluteFill>
		</>
	);
};
