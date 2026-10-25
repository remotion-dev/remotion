import {
	centerPath,
	parsePath,
	reduceInstructions,
	scalePath,
} from '@remotion/paths';
import {makeRect} from '@remotion/shapes';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {makeElement, transformElement} from './element';
import {ApplicationEditorSurface} from './ApplicationEditorSurface';
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

const isCursorCap = (description: string) =>
	description.startsWith('macOS cursor') &&
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
	strokeWidth: cursorBorderWidth * 2,
	strokeColor: '#000000',
	description: 'Application',
	crispEdges: false,
});

export const CursorOrbit = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const angle = (frame / durationInFrames) * Math.PI * 2 - Math.PI / 2;
	const radius = 480;
	const camera = [rotateX(0.2), rotateY(-0.12)];
	const cursorAlignment = Math.atan2(17.145, -7.876);
	const orbitTilt = [rotateZ(-0.38), rotateX(-0.18)];
	const cursorPosition = orbitTilt.reduce(
		(point, matrix) => multiplyMatrix(matrix, point),
		[Math.cos(angle) * radius, 0, Math.sin(angle) * radius, 1] as Vector4D,
	);
	const appTransforms = [
		rotateX((cursorPosition[1] / radius) * 0.12),
		rotateY((-cursorPosition[0] / radius) * 0.15),
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

	const elements = [
		transformElement(app, appTransforms),
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
			{/* Keep the app and its complete cursor orbit inside the composition. */}
			<svg
				width="100%"
				height="100%"
				viewBox="-521 -697 1080 1080"
				style={{position: 'absolute', inset: 0}}
			>
				<defs>
					<filter
						id="cursor-orbit-shadow"
						filterUnits="userSpaceOnUse"
						x="-600"
						y="-600"
						width="1200"
						height="1200"
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
				{/* The UI and its prism share the cursor's camera-space depth sorting. */}
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
								// every side projected inside its concave silhouette.
								...element.faces.filter((face) =>
									isCursorCap(face.description),
								),
							].map((face, index) => (
								<Face key={index} {...face} />
							))}
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
											<ApplicationEditorSurface
												borderWidth={(cursorBorderWidth * 1080) / appWidth}
											/>
										</div>
									</foreignObject>
									<rect
										x={-appWidth / 2 + cursorBorderWidth / 2}
										y={-appHeight / 2 + cursorBorderWidth / 2}
										width={appWidth - cursorBorderWidth}
										height={appHeight - cursorBorderWidth}
										rx={(42 * appWidth) / 1080 - cursorBorderWidth / 2}
										fill="none"
										stroke="#000000"
										strokeWidth={cursorBorderWidth}
									/>
								</g>
							) : null}
						</g>
					))}
			</svg>
		</AbsoluteFill>
	);
};
