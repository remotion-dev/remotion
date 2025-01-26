import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ExtrudeDiv} from './Div3D';
import {RotateX, RotateY, Scale} from './transformation-context';

const Comp = () => {
	const width = 200;
	const height = 70;

	const cornerRadius = 10;

	const angle = Math.PI / 4;

	const progress = useCurrentFrame();

	return (
		<AbsoluteFill className="flex justify-center items-center bg-[#F8FAFC]">
			<Scale factor={1.3}>
				<RotateX radians={progress / 10}>
					<RotateX radians={Math.sin(angle) / 4}>
						<RotateY radians={-Math.cos(angle) / 4}>
							<ExtrudeDiv
								width={width}
								height={height}
								depth={40}
								cornerRadius={10}
								backFace={
									<div
										style={{
											borderRadius: cornerRadius,
											width,
											height,
											fontFamily: 'GT Planar',
											backgroundColor: 'white',
											border: '2px solid black',
										}}
										className="text-red-800 flex justify-center items-center font-sans text-2xl border-solid border-black font-bold cursor-pointer"
									>
										Back side
									</div>
								}
							>
								<div
									style={{
										borderRadius: cornerRadius,
										fontFamily: 'GT Planar',
										backgroundColor: 'white',
										border: '2px solid #000',
									}}
									className="text-black flex justify-center items-center font-sans text-2xl font-bold cursor-pointer flex-1"
								>
									Get started
								</div>
							</ExtrudeDiv>
						</RotateY>
					</RotateX>
				</RotateX>
			</Scale>
		</AbsoluteFill>
	);
};

export const ThreeDContext = Comp;
