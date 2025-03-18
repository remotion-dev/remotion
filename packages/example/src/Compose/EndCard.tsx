import React, {useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {TranslateX, TranslateY} from '../3DContext/transformation-context';
import {AtRemotionButton} from './AtRemotionButton';
import {DepthContext, JumpThenDisappear} from './JumpThenDisappear';
import {Rotations} from './Rotations';

const Item: React.FC<{
	cornerRadius: number;
	children: React.ReactNode;
}> = ({cornerRadius, children}) => {
	const context = useContext(DepthContext);

	return (
		<Rotations zIndexHack={false} delay={0}>
			<ExtrudeDiv width={150} height={150} depth={context} cornerRadius={10}>
				<AbsoluteFill
					className="bg-white justify-center items-center"
					style={{
						borderRadius: cornerRadius,
						border: '3px solid black',
					}}
				>
					{children}
				</AbsoluteFill>
			</ExtrudeDiv>
		</Rotations>
	);
};

const CallToAction: React.FC<{
	cornerRadius: number;
	children: React.ReactNode;
}> = ({cornerRadius, children}) => {
	const depth = useContext(DepthContext);

	return (
		<Rotations zIndexHack={false} delay={0}>
			<ExtrudeDiv
				width={300}
				height={100}
				depth={depth}
				cornerRadius={cornerRadius}
			>
				<AbsoluteFill
					className="bg-white justify-center items-center"
					style={{
						borderRadius: cornerRadius,
						border: '3px solid black',
						overflow: 'hidden',
					}}
				>
					{children}
				</AbsoluteFill>
			</ExtrudeDiv>
		</Rotations>
	);
};

export const EndCard: React.FC<{
	cornerRadius: number;
}> = ({cornerRadius}) => {
	return (
		<AbsoluteFill
			style={{
				borderRadius: 10,
			}}
		>
			<div className="flex flex-row">
				<TranslateX px={220}>
					<div style={{position: 'absolute'}}>
						<JumpThenDisappear delay={2}>
							<Item cornerRadius={cornerRadius}>
								<svg
									style={{height: 70}}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 448 512"
								>
									<path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
								</svg>
							</Item>
						</JumpThenDisappear>
					</div>
				</TranslateX>
				<TranslateY px={220}>
					<TranslateX px={220}>
						<div style={{position: 'absolute'}}>
							<JumpThenDisappear delay={6}>
								<Item cornerRadius={cornerRadius}>
									<svg style={{height: 70}} viewBox="0 0 512 512">
										<path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
									</svg>
								</Item>
							</JumpThenDisappear>
						</div>
					</TranslateX>
				</TranslateY>
				<div style={{position: 'absolute'}}>
					<JumpThenDisappear delay={0}>
						<Item cornerRadius={cornerRadius}>
							<svg style={{height: 70}} viewBox="0 0 448 512">
								<path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
							</svg>
						</Item>
					</JumpThenDisappear>
				</div>

				<TranslateY px={220}>
					<div style={{position: 'absolute'}}>
						<JumpThenDisappear delay={4}>
							<Item cornerRadius={cornerRadius}>
								<svg
									style={{height: 70}}
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 576 512"
								>
									<path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
								</svg>
							</Item>
						</JumpThenDisappear>
					</div>
				</TranslateY>

				<TranslateY px={550}>
					<TranslateX px={110}>
						<div style={{position: 'absolute'}}>
							<JumpThenDisappear delay={8}>
								<CallToAction cornerRadius={75}>
									<AtRemotionButton />
								</CallToAction>
							</JumpThenDisappear>
						</div>
					</TranslateX>
				</TranslateY>
			</div>
		</AbsoluteFill>
	);
};
