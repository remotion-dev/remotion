import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {KineticType} from './KineticType';

export function ApplicationSimpleApp({
	kineticTypeFrame,
}: {
	readonly kineticTypeFrame?: number;
}) {
	const frame = useCurrentFrame();
	const titleFrame = kineticTypeFrame ?? frame;

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<ExtrudeDiv
				backFace={
					<div
						style={{
							backgroundColor: '#cfd6df',
							border: '4px solid #111111',
							borderRadius: 30,
							height: '100%',
							width: '100%',
						}}
					/>
				}
				cornerRadius={30}
				depth={46}
				height={590}
				name="Simple application"
				rotationX={-Math.PI / 24}
				rotationY={-Math.PI / 30}
				rotationZ={0.01}
				width={820}
				style={{
					translate: '-3.9px 60.7px',
				}}
			>
				<div
					style={{
						backgroundColor: '#ffffff',
						border: '4px solid #111111',
						borderRadius: 30,
						fontFamily: 'GT Planar, sans-serif',
						fontFeatureSettings: "'ss03'",
						height: '100%',
						overflow: 'hidden',
						width: '100%',
					}}
				>
					<div
						style={{
							alignItems: 'center',
							borderBottom: '2px solid #e5e7eb',
							display: 'flex',
							height: 72,
							justifyContent: 'space-between',
							padding: '0 26px',
						}}
					>
						<div style={{display: 'flex', gap: 9}}>
							<div
								style={{
									backgroundColor: '#ff5f57',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
							<div
								style={{
									backgroundColor: '#febc2e',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
							<div
								style={{
									backgroundColor: '#28c840',
									borderRadius: '50%',
									height: 16,
									width: 16,
								}}
							/>
						</div>
						<div style={{width: 66}} />
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 22,
							padding: 28,
						}}
					>
						<div
							style={{
								alignItems: 'center',
								backgroundColor: '#111827',
								borderRadius: 18,
								display: 'flex',
								height: 332,
								justifyContent: 'center',
								overflow: 'hidden',
							}}
						>
							<KineticType
								frame={titleFrame}
								style={{
									alignItems: 'center',
									color: '#ffffff',
									fontSize: 64,
									fontWeight: 500,
									gap: 8,
									justifyContent: 'center',
									letterSpacing: 1,
									lineHeight: 1,
								}}
							/>
						</div>
						<div
							style={{
								alignItems: 'center',
								backgroundColor: '#f8fafc',
								border: '2px solid #d9dee7',
								borderRadius: 12,
								color: '#15171a',
								display: 'flex',
								fontSize: 22,
								height: 58,
								padding: '0 18px',
							}}
						>
							Summer collection
						</div>
					</div>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
