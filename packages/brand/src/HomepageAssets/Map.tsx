import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';
import {
	RotateX,
	RotateY,
	RotateZ,
	Scale,
	TranslateX,
	TranslateY,
} from '../3DContext/transformation-context';
import {BLUE, GREEN} from './colors';

const width = 1080;
const height = 600;
const depth = 95;
const cornerRadius = 42;
const playheadRed = '#ff3232';
const dotPopDurationInFrames = 18;
const dotPopGapInFrames = 12;
const defaultLineStartFrame = 32;
const lineAnimationDurationInFrames = 52;

const landPaths = [
	'M586 280L611 292L611 297L615 276L733 304L848 320L980 326L983 319L986 330L998 335L1010 333L1029 344L1039 339L1057 343L1039 353L1025 371L1039 364L1039 372L1046 373L1079 352L1084 353L1073 365L1083 364L1089 371L1121 362L1122 368L1134 365L1135 372L1144 376L1127 380L1115 377L1105 380L1101 389L1098 384L1083 407L1084 411L1097 394L1087 436L1090 456L1098 469L1107 464L1112 455L1106 419L1110 401L1125 389L1123 382L1147 389L1150 408L1143 421L1147 423L1150 416L1159 413L1167 433L1156 460L1171 465L1216 434L1220 428L1215 420L1245 414L1254 406L1250 394L1266 374L1314 361L1315 355L1322 355L1331 306L1337 310L1344 304L1352 307L1360 334L1377 347L1359 370L1352 367L1353 372L1336 391L1334 401L1339 404L1335 412L1346 421L1352 419L1350 413L1354 423L1340 430L1342 425L1302 450L1329 440L1296 460L1301 461L1302 474L1294 493L1281 485L1294 503L1286 533L1286 515L1281 517L1274 507L1272 490L1269 493L1278 518L1277 529L1299 559L1300 569L1287 585L1273 591L1267 604L1253 610L1247 626L1226 644L1219 669L1226 695L1257 751L1256 778L1259 778L1254 788L1243 795L1254 784L1243 787L1238 777L1219 763L1206 744L1211 738L1206 742L1203 738L1203 716L1183 699L1174 696L1160 708L1138 695L1110 700L1107 691L1105 699L1091 698L1076 707L1080 710L1087 704L1081 715L1092 723L1085 728L1077 721L1059 727L1045 714L1042 720L1016 715L992 722L951 753L944 770L948 792L943 794L913 782L906 758L874 713L852 712L841 726L820 711L815 691L791 666L761 661L760 670L711 663L653 629L655 625L615 620L613 604L599 585L568 566L571 555L557 527L561 514L555 507L556 495L561 502L561 491L558 489L557 494L550 488L544 467L548 449L543 435L554 417L556 388L568 369L583 325L590 326L582 323L587 316Z',
] as const;

const coastalDots = [
	{x: 604, y: 586},
	{x: 1299, y: 455},
] as const;

const FrontFace: React.FC<{
	readonly lineStartFrame: number;
}> = ({lineStartFrame}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const lineProgress = interpolate(
		frame,
		[lineStartFrame, lineStartFrame + lineAnimationDurationInFrames],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const [from, to] = coastalDots;
	const easedLineProgress = Easing.inOut(Easing.cubic)(lineProgress);
	const flightPath = `M${from.x} ${from.y}Q935 250 ${to.x} ${to.y}`;

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				borderRadius: cornerRadius,
				border: '9px solid #050505',
				backgroundColor: BLUE,
				boxSizing: 'border-box',
				overflow: 'hidden',
			}}
		>
			<svg viewBox="0 0 1920 1080" width="100%" height="100%">
				<rect x={0} y={0} width={1920} height={1080} fill={BLUE} />
				<g transform="translate(960 540) scale(1.45) translate(-960 -520)">
					{landPaths.map((d, index) => {
						return (
							<path
								key={index}
								d={d}
								fill={GREEN}
								stroke="black"
								strokeWidth={5}
							/>
						);
					})}
					<path
						d={flightPath}
						fill="none"
						pathLength={1}
						stroke={playheadRed}
						strokeLinecap="round"
						strokeDasharray={1}
						strokeDashoffset={1 - easedLineProgress}
						strokeWidth={12}
					/>
					{coastalDots.map(({x, y}, index) => {
						const dotScale = spring({
							fps,
							frame:
								frame -
								Math.max(0, lineStartFrame - 28) -
								index * dotPopGapInFrames,
							config: {
								damping: 10,
								mass: 0.55,
								stiffness: 220,
							},
							durationInFrames: dotPopDurationInFrames,
						});

						return (
							<g
								key={index}
								transform={`translate(${x} ${y}) scale(${dotScale}) translate(${-x} ${-y})`}
							>
								<circle
									cx={x}
									cy={y}
									r={18}
									fill={playheadRed}
									stroke="black"
									strokeWidth={5}
								/>
							</g>
						);
					})}
				</g>
			</svg>
		</div>
	);
};

export const Map: React.FC<{
	readonly lineStartFrame?: number;
}> = ({lineStartFrame = defaultLineStartFrame}) => {
	return (
		<AbsoluteFill className="justify-center items-center">
			<TranslateX px={20}>
				<TranslateY px={5}>
					<Scale factor={1.15}>
						<RotateZ radians={-0.06}>
							<RotateY radians={-0.3}>
								<RotateX radians={-0.35}>
									<ExtrudeDiv
										width={width}
										height={height}
										depth={depth}
										cornerRadius={cornerRadius}
										backFace={
											<AbsoluteFill
												style={{
													borderRadius: cornerRadius,
													backgroundColor: '#141414',
													border: '9px solid #050505',
												}}
											/>
										}
										style={{
											scale: 0.907,
											translate: '-37.2px -1px',
										}}
									>
										<FrontFace lineStartFrame={lineStartFrame} />
									</ExtrudeDiv>
								</RotateX>
							</RotateY>
						</RotateZ>
					</Scale>
				</TranslateY>
			</TranslateX>
		</AbsoluteFill>
	);
};
