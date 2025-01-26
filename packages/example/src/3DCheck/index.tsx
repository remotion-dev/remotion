import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {RotateY} from '../3DContext/transformation-context';

const Comp = () => {
	const width = 70;
	const height = 70;

	const cornerRadius = 70 / 2;
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		fps,
		frame,
	});

	return (
		<AbsoluteFill className="flex justify-center items-center bg-[#F8FAFC]">
			<RotateY radians={progress * Math.PI}>
				<ExtrudeDiv
					width={width}
					height={height}
					depth={20}
					cornerRadius={cornerRadius}
					backFace={
						<svg
							style={{
								height: '100%',
								width: '100%',
								border: '4px solid black',
								borderRadius: cornerRadius,
							}}
							viewBox="0 0 12 12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="6" cy="6" r="6" fill="#D9D9D9" />
							<path
								d="M6.29386 4.43263L6.32673 5.43569C6.33097 5.56525 6.44102 5.66787 6.57057 5.66307L7.57347 5.62589C7.63615 5.62357 7.69592 5.59624 7.73836 5.55073L9.11055 4.07924C9.2217 3.96004 9.41711 3.98627 9.47441 4.13898C9.84428 5.11594 9.65493 6.26427 8.89103 7.08346C8.1726 7.85388 7.12965 8.13734 6.17487 7.91957L4.94515 9.23828C4.67738 9.52543 4.22817 9.54208 3.94225 9.27546L2.90647 8.30959C2.62056 8.04297 2.60583 7.59368 2.8736 7.30653L4.10332 5.98782C3.81949 5.05056 4.0295 3.99038 4.74793 3.21995C5.51183 2.40077 6.64416 2.13178 7.64556 2.43151C7.80188 2.47802 7.84168 2.67112 7.72952 2.7914L6.35733 4.2629C6.31489 4.30841 6.2918 4.36994 6.29386 4.43263Z"
								fill="#333"
							/>
						</svg>
					}
				>
					<div
						style={{
							backgroundColor: '#0B84F3',
							flex: 1,
							borderRadius: '50%',
							border: '4px solid black',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
							style={{
								height: '70%',
								marginTop: 4,
							}}
						>
							<path
								fill="white"
								d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
							/>
						</svg>
					</div>
				</ExtrudeDiv>
			</RotateY>
		</AbsoluteFill>
	);
};

export const ThreeDCheck = Comp;
