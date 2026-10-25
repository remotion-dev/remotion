import {
	centerPath,
	getBoundingBox,
	parsePath,
	reduceInstructions,
	scalePath,
} from '@remotion/paths';
import {makeRect, makeTriangle} from '@remotion/shapes';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {threeDIntoSvgPath} from './3d-svg';
import {makeElement, transformElement} from './element';
import {ApplicationEditorSurface} from './ApplicationEditorSurface';
import {BLUE} from './colors';
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

// Match the visible half of RenderProgress's stroke after its SVG/outer scale.
const frameBorderWidth = (30 / 2) * (1920 / 3200) * 0.68;

// Use the same rounded silhouette as the Remotion logo in Parameterization.
const trianglePath = centerPath(
	makeTriangle({direction: 'right', length: 240, edgeRoundness: 0.71}).path,
);
const triangleTail: Vector4D = [getBoundingBox(trianglePath).x1, 0, 0, 1];
const triangle = extrudeElement({
	points: parsePath(trianglePath),
	depth: 24,
	sideColor: 'black',
	frontFaceColor: BLUE,
	backFaceColor: BLUE,
	strokeWidth: frameBorderWidth * 2,
	strokeColor: 'black',
	description: 'Remotion triangle',
	crispEdges: false,
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
				frameBorderWidth /
				(1 +
					incomingNormal[0] * outgoingNormal[0] +
					incomingNormal[1] * outgoingNormal[1]);
			return `${index === 0 ? 'M' : 'L'} ${x + (incomingNormal[0] + outgoingNormal[0]) * offset} ${y + (incomingNormal[1] + outgoingNormal[1]) * offset}`;
		})
		.join(' ') + ' Z';

const cursorDepth = 24;
const cursor = extrudeElement({
	points: parsePath(cursorPath),
	depth: cursorDepth,
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
			[translateZ((side === 'front' ? -1 : 1) * (cursorDepth / 2 + 0.001))],
		).faces,
	);
}

const cursorTail: Vector4D = [
	(cursorPoints[0][0] + cursorPoints[2][0]) / 2,
	(cursorPoints[0][1] + cursorPoints[2][1]) / 2,
	0,
	1,
];

const isOrbitCap = (description: string) =>
	(description.startsWith('Remotion triangle') ||
		description.startsWith('macOS cursor')) &&
	(description.endsWith('(front)') || description.endsWith('(back)'));

const appWidth = 840;
const appHeight = (appWidth * 724) / 1080;
const appDepth = 60;
const app = extrudeElement({
	points: parsePath(
		centerPath(
			makeRect({
				width: appWidth,
				height: appHeight,
				cornerRadius: (42 * appWidth) / 1080,
			}).path,
		),
	),
	depth: appDepth,
	sideColor: '#111111',
	frontFaceColor: '#16181d',
	backFaceColor: '#141414',
	strokeWidth: frameBorderWidth * 2,
	strokeColor: '#000000',
	description: 'Application',
	crispEdges: false,
});

export const CursorOrbit = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const angle = (frame / durationInFrames) * Math.PI * 2 - Math.PI / 2;
	const radius = 535;
	const camera = [rotateX(0.2), rotateY(-0.12)];
	const orbitTilt = [rotateZ(-0.38), rotateX(-0.18)];
	const orbitPosition = orbitTilt.reduce(
		(point, matrix) => multiplyMatrix(matrix, point),
		[Math.cos(angle) * radius, 0, Math.sin(angle) * radius, 1] as Vector4D,
	);
	const appTransforms = [
		rotateX((orbitPosition[1] / radius) * 0.12),
		rotateY((-orbitPosition[0] / radius) * 0.15),
		rotateX(0.1),
		rotateY(-0.06),
	];
	// Project the complete UI onto the app's front face.
	const [origin, xAxis, yAxis] = [
		[0, 0, -appDepth / 2 - 0.01, 1],
		[1, 0, -appDepth / 2 - 0.01, 1],
		[0, 1, -appDepth / 2 - 0.01, 1],
	].map((point) =>
		appTransforms.reduce(
			(transformed, matrix) => multiplyMatrix(matrix, transformed),
			point as Vector4D,
		),
	);
	const panelTransform = `matrix(${xAxis[0] - origin[0]} ${xAxis[1] - origin[1]} ${yAxis[0] - origin[0]} ${yAxis[1] - origin[1]} ${origin[0]} ${origin[1]})`;
	const orbiters = [
		{
			element: cursor,
			phase: 0,
			alignment: Math.atan2(17.145, -7.876),
			tail: cursorTail,
			trailColor: '140, 140, 140',
		},
		{
			element: triangle,
			phase: Math.PI,
			alignment: 0,
			tail: triangleTail,
			trailColor: '65, 145, 210',
		},
	];
	const orbitElements = orbiters.flatMap(
		({element, phase, alignment, tail, trailColor}) => {
			const orbitAngle = angle + phase;
			const transformations = (position: number) => [
				rotateZ(alignment),
				rotateY(-position - Math.PI / 2),
				translateX(Math.cos(position) * radius),
				translateZ(Math.sin(position) * radius),
				...orbitTilt,
				...camera,
			];
			const trailPoints = Array.from({length: 49}, (_, index) => {
				const trailAngle = orbitAngle - (index / 48) * Math.PI * 0.35;
				return transformations(trailAngle).reduce(
					(point, matrix) => multiplyMatrix(matrix, point),
					tail,
				);
			});
			return [
				transformElement(element, transformations(orbitAngle)),
				...trailPoints.slice(0, -1).map((from, index) => {
					const to = trailPoints[index + 1];
					const description = `Orbit trail ${element.description} ${index}`;
					return makeElement(
						makeFace({
							points: `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`,
							fill: 'none',
							strokeWidth: 26,
							strokeColor: `rgba(${trailColor}, ${0.6 * (1 - (index + 0.5) / 48) ** 1.5})`,
							description,
							crispEdges: false,
						}),
						[
							(from[0] + to[0]) / 2,
							(from[1] + to[1]) / 2,
							(from[2] + to[2]) / 2,
							1,
						],
						description,
					);
				}),
			];
		},
	);
	const elements = [transformElement(app, appTransforms), ...orbitElements].map(
		(element) => ({
			...element,
			faces: element.faces
				.filter((face) => {
					if (
						element.description !== 'Remotion triangle' &&
						element.description !== 'macOS cursor'
					) {
						return true;
					}

					// Both contours wind counterclockwise. A negative
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
		}),
	);

	return (
		<AbsoluteFill>
			{/* Keep the app and both complete orbits inside the composition. */}
			<svg
				width="100%"
				height="100%"
				viewBox="-620 -477 1280 1080"
				style={{position: 'absolute', inset: 0}}
			>
				{/* The UI and its prism share the orbiters’ camera-space depth sorting. */}
				{elements
					.sort((a, b) => b.centerPoint[2] - a.centerPoint[2])
					.map((element) => (
						<g key={element.description}>
							{[
								...element.faces
									.filter(
										(face) =>
											!isOrbitCap(face.description) &&
											face.description !== 'Application(front)' &&
											face.description !== 'Application(back)',
									)
									.sort((a, b) => b.centerPoint[2] - a.centerPoint[2]),
								// The app always faces the camera. Paint its complete
								// front after the sides so the thin outline stays intact.
								...element.faces.filter(
									(face) => face.description === 'Application(front)',
								),
								// For this non-intersecting prism the visible cap covers
								// every side projected inside its silhouette.
								...element.faces.filter((face) => isOrbitCap(face.description)),
							].map((face, index) =>
								face.description.startsWith('Orbit trail') ? (
									<path
										key={index}
										d={threeDIntoSvgPath(face.points)}
										fill="none"
										stroke={face.strokeColor}
										strokeWidth={face.strokeWidth}
									/>
								) : (
									<Face key={index} {...face} />
								),
							)}
							{element.description === 'Application' ? (
								<g transform={panelTransform}>
									<foreignObject
										x={-appWidth / 2}
										y={-appHeight / 2}
										width={appWidth}
										height={appHeight}
									>
										<div
											style={{
												width: 1080,
												height: 724,
												scale: appWidth / 1080,
												transformOrigin: 'top left',
											}}
										>
											<ApplicationEditorSurface />
										</div>
									</foreignObject>
									<rect
										x={-appWidth / 2 + frameBorderWidth / 2}
										y={-appHeight / 2 + frameBorderWidth / 2}
										width={appWidth - frameBorderWidth}
										height={appHeight - frameBorderWidth}
										rx={(42 * appWidth) / 1080 - frameBorderWidth / 2}
										fill="none"
										stroke="#000000"
										strokeWidth={frameBorderWidth}
									/>
								</g>
							) : null}
						</g>
					))}
			</svg>
		</AbsoluteFill>
	);
};
