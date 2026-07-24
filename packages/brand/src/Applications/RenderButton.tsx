import {AbsoluteFill} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';

export function ApplicationRenderButton() {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				paddingTop: 700,
			}}
		>
			<ExtrudeDiv
				backFace={
					<div
						style={{
							backgroundColor: '#075cb0',
							border: '5px solid black',
							borderRadius: 30,
							height: '100%',
							width: '100%',
						}}
					/>
				}
				cornerRadius={30}
				depth={48}
				height={104}
				name="Render video button"
				rotationX={-0.14}
				rotationY={-0.08}
				rotationZ={0.01}
				translationX={-4}
				translationY={2}
				width={300}
				style={{
					translate: '262.5px 27.7px',
					scale: 1.291,
				}}
			>
				<div
					style={{
						alignItems: 'center',
						backgroundColor: '#0b84f3',
						border: '5px solid black',
						borderRadius: 30,
						color: 'white',
						display: 'flex',
						fontFamily: 'GT Planar, sans-serif',
						fontFeatureSettings: "'ss03'",
						fontSize: 40,
						fontWeight: 500,
						gap: 22,
						height: '100%',
						justifyContent: 'center',
						overflow: 'hidden',
						position: 'relative',
						width: '100%',
					}}
				>
					<span>Render</span>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
