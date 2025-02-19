import {evolvePath} from '@remotion/paths';
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const path1 = 'M70.0708 -74.7021C120.649 196.82 515.72 572.643 1156.38 910.447';

const path2 =
	'M835.861 203.393C629.777 453.394 415.916 655.36 237.6 780.052C148.205 842.563 69.6438 884.304 6.78505 903.743C-57.91 923.749 -95.0356 917.089 -114.147 901.335C-133.259 885.58 -146.881 850.408 -139.586 783.084C-132.498 717.671 -106.514 632.589 -62.2091 532.908C26.1669 334.076 183.616 85.6076 389.701 -164.393C595.785 -414.394 809.646 -616.36 987.962 -741.051C1077.36 -803.563 1155.92 -845.303 1218.78 -864.742C1283.47 -884.749 1320.6 -878.089 1339.71 -862.334C1358.82 -846.58 1372.44 -811.407 1365.15 -744.083C1358.06 -678.67 1332.08 -593.589 1287.77 -493.908C1199.4 -295.075 1041.95 -46.6073 835.861 203.393Z';

const PathEvolve: React.FC = () => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const spr = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});

	const evolution1 = evolvePath(spr, path1);
	const evolution2 = evolvePath(spr, path2);

	return (
		<AbsoluteFill>
			<svg
				width="1080"
				height="1080"
				viewBox="0 0 1080 1080"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clipPath="url(#clip0_9_2)">
					<g filter="url(#filter0_d_9_2)">
						<path
							d={path1}
							stroke="url(#paint0_linear_9_2)"
							strokeWidth="89.9167"
							shapeRendering="crispEdges"
							strokeDasharray={evolution1.strokeDasharray}
							strokeDashoffset={evolution1.strokeDashoffset}
						/>
					</g>
					<g filter="url(#filter1_d_9_2)">
						<path
							d={path2}
							stroke="url(#paint1_linear_9_2)"
							strokeWidth="79.2391"
							shapeRendering="crispEdges"
							strokeDasharray={evolution2.strokeDasharray}
							strokeDashoffset={evolution2.strokeDashoffset}
						/>
					</g>
				</g>
				<defs>
					<filter
						id="filter0_d_9_2"
						x="23.6248"
						y="-82.9353"
						width="1155.97"
						height="1037.65"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feOffset dy="2.24792" />
						<feGaussianBlur stdDeviation="1.12396" />
						<feComposite in2="hardAlpha" operator="out" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
						/>
						<feBlend
							mode="normal"
							in2="BackgroundImageFix"
							result="effect1_dropShadow_9_2"
						/>
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="effect1_dropShadow_9_2"
							result="shape"
						/>
					</filter>
					<filter
						id="filter1_d_9_2"
						x="-258.175"
						y="-991.508"
						width="1741.91"
						height="2026.51"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feOffset dy="2.24792" />
						<feGaussianBlur stdDeviation="38.4956" />
						<feComposite in2="hardAlpha" operator="out" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
						/>
						<feBlend
							mode="normal"
							in2="BackgroundImageFix"
							result="effect1_dropShadow_9_2"
						/>
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="effect1_dropShadow_9_2"
							result="shape"
						/>
					</filter>
					<linearGradient
						id="paint0_linear_9_2"
						x1="571.918"
						y1="-147.714"
						x2="571.918"
						y2="942.075"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#0B84F3" />
						<stop offset="1" stopColor="#0B84F3" stopOpacity="0.52" />
					</linearGradient>
					<linearGradient
						id="paint1_linear_9_2"
						x1="1294.73"
						y1="-144.472"
						x2="-309.635"
						y2="-195.201"
						gradientUnits="userSpaceOnUse"
					>
						<stop stopColor="#0B84F3" />
						<stop offset="1" stopColor="#0B84F3" stopOpacity="0.46" />
					</linearGradient>
					<clipPath id="clip0_9_2">
						<rect width="1080" height="1080" fill="white" />
					</clipPath>
				</defs>
			</svg>
		</AbsoluteFill>
	);
};

export default PathEvolve;
