import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const FIRST_CUSTOMER_CHART_DURATION_IN_FRAMES = 221;

const FONT_FAMILY =
	"Noteworthy, 'Bradley Hand', 'Marker Felt', 'Comic Sans MS', cursive";

const MONTHS = [
	{label: "Feb '21", value: '$0', x: 102, delay: 8, rotate: -2.4},
	{label: "Mar '21", value: '$0', x: 292, delay: 20, rotate: 1.2},
	{label: "April '21", value: '$0', x: 482, delay: 32, rotate: -1},
	{label: "May '21", value: '$0', x: 672, delay: 44, rotate: 1.8},
] as const;

const ZeroMonth: React.FC<(typeof MONTHS)[number]> = ({x, delay}) => {
	const frame = useCurrentFrame();

	return (
		<>
			<path
				d={`M${x - 58} 392 C${x - 28} 387 ${x + 25} 397 ${x + 61} 390`}
				fill="none"
				pathLength={1}
				stroke="#f3edd8"
				strokeDasharray={1}
				strokeDashoffset={interpolate(frame, [delay, delay + 8], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				strokeLinecap="round"
				strokeWidth={8}
			/>
			<path
				d={`M${x - 52} 399 C${x - 16} 395 ${x + 30} 403 ${x + 57} 397`}
				fill="none"
				pathLength={1}
				stroke="#6f98df"
				strokeDasharray={1}
				strokeDashoffset={interpolate(frame, [delay + 3, delay + 11], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				strokeLinecap="round"
				strokeWidth={3}
			/>
		</>
	);
};

export const FirstCustomerChart: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Interactive.Div
				name="First customer chart"
				style={{
					height: 790,
					left: 52,
					opacity: interpolate(frame, [0, 7, 211, 220], [0, 1, 1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					position: 'absolute',
					right: 52,
					top: 166,
					translate: interpolate(frame, [0, 12], ['0px 34px', '0px 0px'], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<Interactive.Div
					name="Four months heading"
					style={{
						color: '#91b7ff',
						fontFamily: FONT_FAMILY,
						fontSize: 42,
						fontWeight: 700,
						letterSpacing: 2.2,
						opacity: interpolate(frame, [2, 10], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						rotate: '-1.2deg',
						textTransform: 'uppercase',
						top: 0,
					}}
				>
					Four months to find...
				</Interactive.Div>

				<Interactive.Div
					name="First customer heading"
					style={{
						color: '#f5f0dc',
						fontFamily: FONT_FAMILY,
						fontSize: 82,
						fontWeight: 700,
						letterSpacing: -1.8,
						lineHeight: 1,
						opacity: interpolate(frame, [42, 51], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						rotate: '0.6deg',
						top: 51,
					}}
				>
					the first customer
				</Interactive.Div>

				<svg
					aria-hidden="true"
					viewBox="0 0 976 520"
					style={{
						height: 520,
						left: 0,
						overflow: 'visible',
						position: 'absolute',
						top: 164,
						width: 976,
					}}
				>
					<defs>
						<clipPath id="june-bar-reveal">
							<rect
								x={760}
								y={interpolate(frame, [107, 129], [410, 40], {
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}
								width={210}
								height={interpolate(frame, [107, 129], [0, 370], {
									easing: Easing.bezier(0.16, 1, 0.3, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								})}
							/>
						</clipPath>
					</defs>
					<path
						d="M13 407 C190 398 364 412 535 404 C694 397 833 410 964 401"
						fill="none"
						pathLength={1}
						stroke="#6f98df"
						strokeDasharray={1}
						strokeDashoffset={interpolate(frame, [4, 18], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						strokeLinecap="round"
						strokeWidth={5}
					/>
					<path
						d="M19 413 C206 407 371 419 546 411 C719 404 849 417 958 409"
						fill="none"
						pathLength={1}
						stroke="rgba(111, 152, 223, 0.28)"
						strokeDasharray={1}
						strokeDashoffset={interpolate(frame, [7, 21], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						strokeLinecap="round"
						strokeWidth={3}
					/>

					{MONTHS.map((month) => (
						<ZeroMonth key={month.label} {...month} />
					))}

					<g clipPath="url(#june-bar-reveal)">
						<path
							d="M805 399 C808 325 801 223 811 126 C845 119 896 126 925 120 C929 226 922 321 934 399 C895 394 849 404 805 399Z"
							fill="rgba(255, 86, 61, 0.22)"
							stroke="#ff674f"
							strokeLinejoin="round"
							strokeWidth={8}
						/>
						<path
							d="M816 390 C820 303 811 218 821 137 C850 132 891 138 915 130 C917 229 913 316 924 389"
							fill="none"
							stroke="rgba(255, 199, 188, 0.62)"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={3}
						/>
						<path
							d="M827 381 L909 145 M841 390 L922 177 M812 352 L904 126"
							fill="none"
							stroke="rgba(255, 103, 79, 0.35)"
							strokeLinecap="round"
							strokeWidth={5}
						/>
					</g>

					<path
						d="M781 83 C816 53 924 50 956 88 C981 119 947 151 879 154 C812 157 764 131 781 83Z"
						fill="none"
						pathLength={1}
						stroke="#ff674f"
						strokeDasharray={1}
						strokeDashoffset={interpolate(frame, [129, 143], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={6}
					/>
					<path
						d="M770 74 C817 41 935 48 962 94"
						fill="none"
						pathLength={1}
						stroke="rgba(255, 103, 79, 0.46)"
						strokeDasharray={1}
						strokeDashoffset={interpolate(frame, [134, 146], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						strokeLinecap="round"
						strokeWidth={3}
					/>
					<path
						d="M748 194 C774 179 790 161 811 139 M795 139 L813 137 L809 156"
						fill="none"
						pathLength={1}
						stroke="#ff674f"
						strokeDasharray={1}
						strokeDashoffset={interpolate(frame, [137, 150], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={6}
					/>
				</svg>

				{MONTHS.map((month) => (
					<React.Fragment key={month.label}>
						<Interactive.Div
							name={`${month.label} value`}
							style={{
								color: '#f5f0dc',
								fontFamily: FONT_FAMILY,
								fontSize: 48,
								fontWeight: 700,
								left: month.x - 58,
								opacity: interpolate(
									frame,
									[month.delay + 2, month.delay + 8],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								position: 'absolute',
								rotate: `${month.rotate}deg`,
								textAlign: 'center',
								top: 451,
								width: 120,
							}}
						>
							{month.value}
						</Interactive.Div>
						<Interactive.Div
							name={`${month.label} label`}
							style={{
								color: '#c9c2ad',
								fontFamily: FONT_FAMILY,
								fontSize: 35,
								fontWeight: 700,
								left: month.x - 78,
								lineHeight: 1,
								opacity: interpolate(
									frame,
									[month.delay + 5, month.delay + 11],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								position: 'absolute',
								rotate: `${month.rotate * -0.6}deg`,
								textAlign: 'center',
								top: 589,
								width: 160,
							}}
						>
							{month.label}
						</Interactive.Div>
					</React.Fragment>
				))}

				<Interactive.Div
					name="June revenue"
					style={{
						color: '#fff4e7',
						fontFamily: FONT_FAMILY,
						fontSize: 49,
						fontWeight: 700,
						left: 770,
						opacity: interpolate(frame, [123, 132], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						rotate: '-2deg',
						textAlign: 'center',
						top: 224,
						width: 200,
					}}
				>
					$15 MRR
				</Interactive.Div>
				<Interactive.Div
					name="June 2021 label"
					style={{
						color: '#ff8b78',
						fontFamily: FONT_FAMILY,
						fontSize: 38,
						fontWeight: 700,
						left: 788,
						opacity: interpolate(frame, [111, 120], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						rotate: '-1.5deg',
						textAlign: 'center',
						top: 589,
						width: 176,
					}}
				>
					June '21
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
