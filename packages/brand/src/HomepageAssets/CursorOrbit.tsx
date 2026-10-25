import {loadFont} from '@remotion/fonts';
import {
	centerPath,
	parsePath,
	reduceInstructions,
	scalePath,
} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	interpolateColors,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {makeElement, transformElement} from './element';
import {Face} from './Face';
import {extrudeElement} from './join-inbetween-tiles';
import {makeFace} from './map-face';
import {
	rotateX,
	rotateY,
	rotateZ,
	multiplyMatrix,
	translateX,
	translateZ,
	type Vector4D,
} from './matrix';

loadFont({
	family: 'Cursor Button Variable',
	url: staticFile('variable.woff2'),
	weight: '100 900',
});

// Outer silhouette of MacOSCursor's default.svg, extruded in 3D.
// Source: packages/mac-cursors/src/cursor-assets.ts.
const cursorPath = centerPath(
	scalePath(
		'm6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z',
		11,
		11,
	),
);

// Match the visible half of RenderProgress's stroke after its SVG/outer scale.
const cursorBorderWidth = (30 / 2) * (1920 / 3200) * 0.68;
const cursorPoints = reduceInstructions(parsePath(cursorPath)).flatMap(
	(instruction) =>
		instruction.type === 'M' || instruction.type === 'L'
			? [[instruction.x, instruction.y] as const]
			: [],
);
const cursorFillPath =
	cursorPoints
		.map(([x, y], index) => {
			const previous =
				cursorPoints[(index + cursorPoints.length - 1) % cursorPoints.length];
			const next = cursorPoints[(index + 1) % cursorPoints.length];
			const incomingLength = Math.hypot(x - previous[0], y - previous[1]);
			const outgoingLength = Math.hypot(next[0] - x, next[1] - y);
			// Right-hand normals point inside this counterclockwise contour.
			const incomingNormal = [
				(y - previous[1]) / incomingLength,
				(previous[0] - x) / incomingLength,
			];
			const outgoingNormal = [
				(next[1] - y) / outgoingLength,
				(x - next[0]) / outgoingLength,
			];
			// Intersect the two inward-offset edges to preserve a uniform border.
			const offset =
				cursorBorderWidth /
				(1 +
					incomingNormal[0] * outgoingNormal[0] +
					incomingNormal[1] * outgoingNormal[1]);
			return `${index === 0 ? 'M' : 'L'} ${x + (incomingNormal[0] + outgoingNormal[0]) * offset} ${y + (incomingNormal[1] + outgoingNormal[1]) * offset}`;
		})
		.join(' ') + ' Z';

const cursor = extrudeElement({
	points: parsePath(cursorPath),
	depth: 12,
	sideColor: 'white',
	frontFaceColor: 'white',
	backFaceColor: 'white',
	strokeWidth: 0,
	strokeColor: 'white',
	description: 'macOS cursor',
	crispEdges: false,
});

// The inset black polygons and white outer faces rotate together in 3D.
// No screen-space stroke is added after projection.
for (const side of ['front', 'back'] as const) {
	cursor.faces.push(
		...transformElement(
			makeElement(
				makeFace({
					points: cursorFillPath,
					fill: 'black',
					strokeWidth: 0,
					strokeColor: 'black',
					description: `macOS cursor fill(${side})`,
					crispEdges: false,
				}),
				[0, 0, 0, 1],
				`macOS cursor fill(${side})`,
			),
			[translateZ(side === 'front' ? -6.001 : 6.001)],
		).faces,
	);
}

const isCursorCap = (description: string) =>
	description.startsWith('macOS cursor') &&
	(description.endsWith('(front)') || description.endsWith('(back)'));

const buttonStyles = [
	{
		name: 'Blue',
		front: '#0b84f3',
		back: '#075cb0',
		text: '#ffffff',
		width: 550,
		radius: 75,
		depth: 60,
		fontSize: 100,
		fontWeight: 800,
	},
	{
		name: 'Shadcn',
		front: '#ffffff',
		back: '#f4f4f5',
		text: '#18181b',
		width: 510,
		radius: 40,
		depth: 60,
		fontSize: 90,
		fontWeight: 400,
	},
] as const;

export const CursorOrbit = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const styleDuration = durationInFrames / buttonStyles.length;
	const styleIndex = Math.floor(frame / styleDuration) % buttonStyles.length;
	const styleFrame = frame % styleDuration;
	const currentStyle = buttonStyles[styleIndex];
	const nextStyle = buttonStyles[(styleIndex + 1) % buttonStyles.length];
	const transition = interpolate(
		styleFrame,
		[styleDuration - 12, styleDuration],
		[0, 1],
		{extrapolateLeft: 'clamp', easing: Easing.inOut(Easing.cubic)},
	);
	const mix = (from: number, to: number) => from + (to - from) * transition;
	const mixColor = (from: string, to: string) =>
		interpolateColors(transition, [0, 1], [from, to]);
	const buttonDepth = mix(currentStyle.depth, nextStyle.depth);
	const renderButton = extrudeElement({
		points: parsePath(
			centerPath(
				makeRect({
					// Keep padding differences subtle as the button changes style.
					width: mix(currentStyle.width, nextStyle.width),
					height: 260,
					cornerRadius: mix(currentStyle.radius, nextStyle.radius),
				}).path,
			),
		),
		depth: buttonDepth,
		sideColor: '#111111',
		frontFaceColor: mixColor(currentStyle.front, nextStyle.front),
		backFaceColor: mixColor(currentStyle.back, nextStyle.back),
		strokeWidth: cursorBorderWidth * 2,
		strokeColor: '#111111',
		description: 'Render button',
		crispEdges: false,
	});
	const labelWeight = mix(currentStyle.fontWeight, nextStyle.fontWeight);
	const angle = (frame / durationInFrames) * Math.PI * 2 - Math.PI / 2;
	const radius = 280;
	const camera = [rotateX(0.2), rotateY(-0.12)];
	const cursorAlignment = Math.atan2(17.145, -7.876);
	const orbitTilt = [rotateZ(-cursorAlignment / 2), rotateX(-0.18)];
	const cursorPosition = orbitTilt.reduce(
		(point, matrix) => multiplyMatrix(matrix, point),
		[Math.cos(angle) * radius, 0, Math.sin(angle) * radius, 1] as Vector4D,
	);
	const buttonTransforms = [
		rotateX((cursorPosition[1] / radius) * 0.24),
		rotateY((-cursorPosition[0] / radius) * 0.3),
		...camera,
	];
	// Project the label with the button's front plane instead of placing flat
	// screen-space text over the 3D button.
	const [origin, xAxis, yAxis] = [
		[0, 0, -buttonDepth / 2 - 0.01, 1],
		[1, 0, -buttonDepth / 2 - 0.01, 1],
		[0, 1, -buttonDepth / 2 - 0.01, 1],
	].map((point) =>
		buttonTransforms.reduce(
			(transformed, matrix) => multiplyMatrix(matrix, transformed),
			point as Vector4D,
		),
	);
	const labelTransform = `matrix(${xAxis[0] - origin[0]} ${xAxis[1] - origin[1]} ${yAxis[0] - origin[0]} ${yAxis[1] - origin[1]} ${origin[0]} ${origin[1]})`;

	const elements = [
		transformElement(renderButton, buttonTransforms),
		transformElement(cursor, [
			// Point the cursor along the circle's tangent before tilting both
			// the cursor and its position into the same diagonal orbit plane.
			rotateZ(cursorAlignment),
			rotateY(-angle - Math.PI / 2),
			translateX(Math.cos(angle) * radius),
			translateZ(Math.sin(angle) * radius),
			...orbitTilt,
			...camera,
		]),
	].map((element) => ({
		...element,
		faces: element.faces
			.filter((face) => {
				if (element.description !== 'macOS cursor') {
					return true;
				}

				// The cursor contour winds counterclockwise. A negative
				// projected area faces the camera. The legacy engine gives both
				// caps the same winding, so reverse the test for the back cap.
				const points = face.points.map(({point}) => point);
				const area = points.reduce((sum, point, index) => {
					const next = points[(index + 1) % points.length];
					return sum + point[0] * next[1] - next[0] * point[1];
				}, 0);

				return face.description.endsWith('(back)')
					? area > 0.0001
					: area < -0.0001;
			})
			.map((face) => {
				// The legacy engine initializes side-face centers at the origin.
				// Recompute from transformed geometry before sorting the faces.
				const points = face.points.filter((point) => point.type !== 'Z');
				const centerPoint: Vector4D = [0, 0, 0, 1];
				for (const {point} of points) {
					centerPoint[0] += point[0] / points.length;
					centerPoint[1] += point[1] / points.length;
					centerPoint[2] += point[2] / points.length;
				}

				return {...face, centerPoint};
			}),
	}));

	return (
		<AbsoluteFill>
			{/* Keep the button and its tighter cursor orbit near the bottom left. */}
			<svg width="100%" height="100%" viewBox="-315 -759 1080 1080">
				<defs>
					<filter
						id="cursor-orbit-shadow"
						filterUnits="userSpaceOnUse"
						x="-540"
						y="-540"
						width="1080"
						height="1080"
						colorInterpolationFilters="sRGB"
					>
						<feDropShadow
							dx="0"
							dy="4"
							stdDeviation="5"
							floodColor="#000000"
							floodOpacity="0.16"
						/>
					</filter>
				</defs>
				{/* The label and button share the cursor's camera-space depth sorting. */}
				{elements
					.sort((a, b) => b.centerPoint[2] - a.centerPoint[2])
					.map((element) => (
						<g
							key={element.description}
							filter={
								element.description === 'macOS cursor'
									? 'url(#cursor-orbit-shadow)'
									: undefined
							}
						>
							{[
								...element.faces
									.filter(
										(face) =>
											!isCursorCap(face.description) &&
											face.description !== 'Render button(front)' &&
											face.description !== 'Render button(back)',
									)
									.sort((a, b) => b.centerPoint[2] - a.centerPoint[2]),
								// The button always faces the camera. Paint its complete
								// front after the sides so the thin outline stays intact.
								...element.faces.filter(
									(face) => face.description === 'Render button(front)',
								),
								// For this non-intersecting prism the visible cap covers
								// every side projected inside its concave silhouette.
								...element.faces.filter((face) =>
									isCursorCap(face.description),
								),
							].map((face, index) => (
								<Face key={index} {...face} />
							))}
							{element.description === 'Render button' ? (
								<text
									transform={labelTransform}
									textAnchor="middle"
									dominantBaseline="central"
									fill={mixColor(currentStyle.text, nextStyle.text)}
									fontFamily="Cursor Button Variable"
									fontSize={mix(currentStyle.fontSize, nextStyle.fontSize)}
									fontWeight={labelWeight}
									style={{
										fontFeatureSettings: "'ss03'",
										fontVariationSettings: `"wght" ${labelWeight}`,
									}}
								>
									Render
								</text>
							) : null}
						</g>
					))}
			</svg>
		</AbsoluteFill>
	);
};
