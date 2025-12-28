import {Img, staticFile} from 'remotion';

export const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'black',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					color: 'rgb(1, 6, 74)',
					fontFamily: '"Mona Sans"',
					fontSize: 40,
					marginTop: '-163.472px',
					perspective: 1000,
					scale: 1,
				}}
			>
				<div
					style={{
						position: 'relative',
						transform: 'scale(1) rotateY(2deg) rotateX(0rad) translateY(0px)',
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<div
							style={{height: '100%', width: '100%', zIndex: -1, opacity: 1}}
						>
							<img
								decoding="sync"
								src={staticFile('WhiteHighlight.png')}
								style={{
									height: '130%',
									marginTop: '-5%',
									width: '100%',
									objectFit: 'fill',
									scale: '1.45',
									opacity: '0.2',
								}}
							/>
						</div>
					</div>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							width: '100%',
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<div
							style={{
								height: '100%',
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								zIndex: -1,
							}}
						>
							<Img
								src={staticFile('PinkHighlight.png')}
								style={{
									height: '100%',
									marginTop: '-5%',
									aspectRatio: '1 / 1',
									scale: 4,
									opacity: '0.97027',
								}}
							/>
						</div>
					</div>
					<div
						style={{
							padding: '19.4054px',
							backgroundColor: 'rgba(255, 255, 255, 0.1)',
							border: '1px solid rgba(255, 255, 255, 0.2)',
							borderRadius: '69.4054px',
						}}
					>
						<div
							style={{
								background: 'rgba(230, 225, 252, 0.8)',
								display: 'inline-flex',
								flexDirection: 'row',
								padding: '20px 70px 20px 20px',
								alignItems: 'center',
								borderRadius: 50,
							}}
						>
							<div style={{height: 70, width: 400}} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const transparentImage = {
	component: Component,
	id: 'transparent-image',
	width: 1080,
	height: 1080,
	durationInFrames: 1,
	fps: 30,
};
