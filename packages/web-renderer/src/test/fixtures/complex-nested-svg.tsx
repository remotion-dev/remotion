import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{}}>
				<AbsoluteFill>
					<AbsoluteFill
						style={{
							transformOrigin: 'center center',
							transform: 'scale(0.68) translateX(0px) translateY(0px)',
						}}
					>
						<AbsoluteFill>
							<AbsoluteFill
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									transform: 'scale(1.24643)',
								}}
							>
								<svg
									width="311.7691453623979"
									height="360"
									viewBox="0 0 311.7691453623979 360"
									xmlns="http://www.w3.org/2000/svg"
									style={{
										overflow: 'visible',
										marginLeft: 90,
									}}
								>
									<path
										// `transform-origin` is not a valid SVG prop, skipping or put into style if necessary
										// transformOrigin is not a valid property on SVG path in React.
										d="M 0 180 C 0 307.26 45.6741797955913 333.63 155.88457268119896 270 C 266.09496556680665 206.37 266.09496556680665 153.63 155.88457268119896 90 C 45.6741797955913 26.370000000000005 0 52.74000000000001 0 180 Z"
										fill="rgba(236, 245, 254, 1)"
										style={{
											transformBox: 'fill-box',
										}}
									/>
								</svg>
							</AbsoluteFill>
							<AbsoluteFill
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									transform: 'scale(1.27459)',
								}}
							>
								<svg
									width="233.82685902179844"
									height="270"
									viewBox="0 0 233.82685902179844 270"
									xmlns="http://www.w3.org/2000/svg"
									style={{
										overflow: 'visible',
										marginLeft: 70,
									}}
								>
									<path
										d="M 0 135 C 0 230.445 34.25563484669348 250.2225 116.91342951089922 202.5 C 199.57122417510496 154.7775 199.57122417510496 115.2225 116.91342951089922 67.5 C 34.25563484669348 19.777500000000003 0 39.55500000000001 0 135 Z"
										fill="rgba(182, 218, 251, 1)"
										style={{
											transformBox: 'fill-box',
										}}
									/>
								</svg>
							</AbsoluteFill>
							<AbsoluteFill
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									transform: 'scale(1.30414)',
								}}
							>
								<svg
									width="155.88457268119896"
									height="180"
									viewBox="0 0 155.88457268119896 180"
									xmlns="http://www.w3.org/2000/svg"
									style={{
										overflow: 'visible',
										marginLeft: 50,
									}}
								>
									<path
										d="M 0 90 C 0 153.63 22.83708989779565 166.815 77.94228634059948 135 C 133.04748278340332 103.185 133.04748278340332 76.815 77.94228634059948 45 C 22.83708989779565 13.185000000000002 0 26.370000000000005 0 90 Z"
										fill="rgba(12, 133, 243, 1)"
										style={{
											transformBox: 'fill-box',
										}}
									/>
								</svg>
							</AbsoluteFill>
						</AbsoluteFill>
					</AbsoluteFill>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const complexNestedSvg = {
	component: Component,
	id: 'complex-nested-svg',
	width: 1080,
	height: 1080,
	fps: 30,
	durationInFrames: 100,
} as const;
