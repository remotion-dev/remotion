import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateX,
	RotateY,
	Scale,
	TranslateX,
	TranslateY,
} from '../3DContext/transformation-context';

const height = 700;
const width = (height / 16) * 9;

export const Compose = () => {
	const cornerRadius = 10;

	const angle = Math.PI / 4;

	const progress = useCurrentFrame();

	return (
		<AbsoluteFill className="flex justify-center items-center">
			<Scale factor={1.3}>
				<RotateX radians={progress / 10}>
					<RotateX radians={Math.sin(angle) / 4}>
						<RotateY radians={-Math.cos(angle) / 4}>
							<AbsoluteFill className="flex justify-center items-center">
								<ExtrudeDiv
									width={width}
									height={height}
									depth={40}
									cornerRadius={10}
									bottomFace={
										<div
											className="text-white "
											style={{
												fontFamily: 'GT Planar',
												height: '100%',
												display: 'flex',
												flexDirection: 'column',
												justifyContent: 'center',
												paddingLeft: 10,
											}}
										>
											&lt;Video /&gt;
										</div>
									}
								>
									<div
										style={{
											borderRadius: cornerRadius,
											overflow: 'hidden',
											fontFamily: 'GT Planar',
											backgroundColor: 'white',
										}}
										className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
									>
										<Img src={staticFile('bg.png')}></Img>
									</div>
								</ExtrudeDiv>
							</AbsoluteFill>
							<TranslateX px={30}>
								<TranslateY px={120}>
									<AbsoluteFill className="flex justify-center items-center">
										<ExtrudeDiv
											width={300}
											height={60}
											depth={40}
											cornerRadius={10}
											bottomFace={
												<div
													className="text-white "
													style={{
														fontFamily: 'GT Planar',
														height: '100%',
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'center',
														paddingLeft: 10,
													}}
												>
													&lt;Captions /&gt;
												</div>
											}
										>
											<div
												style={{
													borderRadius: cornerRadius,
													overflow: 'hidden',
													fontFamily: 'GT Planar',
													backgroundColor: 'white',
												}}
												className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
											>
												<div>
													Hallo{' '}
													<span className="bg-blue-600 px-2 py-1 rounded text-white">
														IPT!
													</span>
												</div>
											</div>
										</ExtrudeDiv>
									</AbsoluteFill>
								</TranslateY>
							</TranslateX>
							<TranslateX px={110}>
								<TranslateY px={-280}>
									<AbsoluteFill className="flex justify-center items-center">
										<ExtrudeDiv
											width={120}
											height={120}
											depth={40}
											cornerRadius={10}
											bottomFace={
												<div
													className="text-white "
													style={{
														fontFamily: 'GT Planar',
														height: '100%',
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'center',
														paddingLeft: 10,
													}}
												>
													&lt;Img /&gt;
												</div>
											}
										>
											<div
												style={{
													borderRadius: cornerRadius,
													overflow: 'hidden',
													fontFamily: 'GT Planar',
													backgroundColor: 'white',
												}}
												className="text-black flex justify-center items-center font-sans text-2xl font-bold flex-1"
											>
												<Img
													style={{
														width: '80%',
													}}
													src="https://ipt.ch/static/img/logo_ipt.e41536c42e31.svg"
												></Img>
											</div>
										</ExtrudeDiv>
									</AbsoluteFill>
								</TranslateY>
							</TranslateX>
						</RotateY>
					</RotateX>
				</RotateX>
			</Scale>
		</AbsoluteFill>
	);
};
