import {loadFont} from '@remotion/google-fonts/Lora';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

const TILE_SIZE = 256;
const TILE_BASE_URL =
	'https://watercolormaps.collection.cooperhewitt.org/tile/watercolor';

type Coordinates = readonly [longitude: number, latitude: number];

type WatercolorMapProps = InteractiveTransformProps & {
	readonly destination?: Coordinates;
	readonly destinationLabel?: string;
	readonly origin?: Coordinates;
	readonly originLabel?: string;
	readonly routeColor?: string;
	readonly routeWidth?: number;
};

const watercolorMapSchema = {
	origin: {
		type: 'array',
		item: {type: 'number', step: 0.0001},
		default: [-118.2437, 34.0522],
		minLength: 2,
		maxLength: 2,
		newItemDefault: 0,
		description: 'Origin [longitude, latitude]',
	},
	destination: {
		type: 'array',
		item: {type: 'number', step: 0.0001},
		default: [8.5417, 47.3769],
		minLength: 2,
		maxLength: 2,
		newItemDefault: 0,
		description: 'Destination [longitude, latitude]',
	},
	originLabel: {
		type: 'string',
		default: 'Los Angeles',
		description: 'Origin label',
	},
	destinationLabel: {
		type: 'string',
		default: 'Zurich',
		description: 'Destination label',
	},
	routeColor: {
		type: 'color',
		default: '#ff0041',
		description: 'Route color',
	},
	routeWidth: {
		type: 'number',
		min: 4,
		max: 30,
		step: 1,
		default: 18,
		description: 'Route width',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const getZoom = (origin: Coordinates, destination: Coordinates) => {
	const longitudeDelta =
		((((destination[0] - origin[0] + 540) % 360) + 360) % 360) - 180;
	const latitudeDelta = destination[1] - origin[1];
	const distanceInDegrees = Math.hypot(longitudeDelta, latitudeDelta);
	const preferredDistanceInTiles = 1920 / TILE_SIZE;
	const degreesPerTile = distanceInDegrees / preferredDistanceInTiles;
	let closestZoom = 0;
	let closestDifference = Infinity;

	for (let zoom = 0; zoom <= 18; zoom++) {
		const difference = Math.abs(360 / 2 ** zoom - degreesPerTile);
		if (difference < closestDifference) {
			closestDifference = difference;
			closestZoom = zoom;
		}
	}

	return closestZoom;
};

const projectCoordinates = (coordinates: Coordinates, zoom: number) => {
	const worldSize = TILE_SIZE * 2 ** zoom;
	const latitude = Math.max(-85.05112, Math.min(85.05112, coordinates[1]));
	const latitudeRadians = (latitude * Math.PI) / 180;

	return {
		x: ((coordinates[0] + 180) / 360) * worldSize,
		y:
			(0.5 -
				Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) / (2 * Math.PI)) *
			worldSize,
	};
};

const getTiles = ({
	centerX,
	centerY,
	height,
	width,
	zoom,
}: {
	centerX: number;
	centerY: number;
	height: number;
	width: number;
	zoom: number;
}) => {
	const tileCount = 2 ** zoom;
	const viewportLeft = centerX - width / 2;
	const viewportTop = centerY - height / 2;
	const firstColumn = Math.floor(viewportLeft / TILE_SIZE);
	const lastColumn = Math.floor((viewportLeft + width) / TILE_SIZE);
	const firstRow = Math.max(0, Math.floor(viewportTop / TILE_SIZE));
	const lastRow = Math.min(
		tileCount - 1,
		Math.floor((viewportTop + height) / TILE_SIZE),
	);
	const tiles: {
		key: string;
		left: number;
		src: string;
		top: number;
	}[] = [];

	for (let column = firstColumn; column <= lastColumn; column++) {
		const wrappedColumn = ((column % tileCount) + tileCount) % tileCount;
		for (let row = firstRow; row <= lastRow; row++) {
			tiles.push({
				key: `${zoom}/${column}/${row}`,
				left: column * TILE_SIZE - viewportLeft,
				src: `${TILE_BASE_URL}/${zoom}/${wrappedColumn}/${row}.jpg`,
				top: row * TILE_SIZE - viewportTop,
			});
		}
	}

	return tiles;
};

const WatercolorMapContent: React.FC<WatercolorMapProps> = ({
	destination = [8.5417, 47.3769],
	destinationLabel = 'Zurich',
	origin = [-118.2437, 34.0522],
	originLabel = 'Los Angeles',
	routeColor = '#ff0041',
	routeWidth = 18,
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();
	const zoom = getZoom(origin, destination);
	const worldSize = TILE_SIZE * 2 ** zoom;
	const projectedOrigin = projectCoordinates(origin, zoom);
	const projectedDestination = projectCoordinates(destination, zoom);
	let destinationX = projectedDestination.x;

	while (destinationX - projectedOrigin.x > worldSize / 2) {
		destinationX -= worldSize;
	}

	while (destinationX - projectedOrigin.x < -worldSize / 2) {
		destinationX += worldSize;
	}

	const travelProgress = interpolate(
		frame,
		[durationInFrames * 0.2, durationInFrames * 0.65],
		[0, 1],
		{
			easing: Easing.inOut(Easing.ease),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const centerX = interpolate(
		travelProgress,
		[0, 1],
		[projectedOrigin.x, destinationX],
	);
	const interpolatedCenterY = interpolate(
		travelProgress,
		[0, 1],
		[projectedOrigin.y, projectedDestination.y],
	);
	const centerY = Math.max(
		height / 2,
		Math.min(worldSize - height / 2, interpolatedCenterY),
	);
	const originX = projectedOrigin.x - centerX + width / 2;
	const originY = projectedOrigin.y - centerY + height / 2;
	const destinationScreenX = destinationX - centerX + width / 2;
	const destinationScreenY = projectedDestination.y - centerY + height / 2;
	const routeDistance = Math.hypot(
		destinationScreenX - originX,
		destinationScreenY - originY,
	);
	const routeArcHeight = Math.min(400, height * 0.37, routeDistance * 0.35);
	const routePath = `M ${originX} ${originY} Q ${(originX + destinationScreenX) / 2} ${(originY + destinationScreenY) / 2 - routeArcHeight} ${destinationScreenX} ${destinationScreenY}`;
	const tiles = getTiles({centerX, centerY, height, width, zoom});
	const originLabelIsAbove =
		originY > 120 && (originY > height - 120 || origin[1] > destination[1]);
	const destinationLabelIsAbove =
		destinationScreenY > 120 &&
		(destinationScreenY > height - 120 || destination[1] >= origin[1]);

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				backgroundColor: '#e6ec88',
				overflow: 'hidden',
				...style,
			}}
		>
			{tiles.map((tile) => (
				<Img
					key={tile.key}
					pauseWhenLoading
					showInTimeline={false}
					src={tile.src}
					style={{
						height: TILE_SIZE + 1,
						left: tile.left,
						maxWidth: 'none',
						position: 'absolute',
						top: tile.top,
						width: TILE_SIZE + 1,
					}}
				/>
			))}
			<svg
				viewBox={`0 0 ${width} ${height}`}
				style={{
					height,
					inset: 0,
					overflow: 'visible',
					position: 'absolute',
					width,
				}}
			>
				<Interactive.Path
					name="Route outline"
					d={routePath}
					fill="none"
					pathLength={1}
					stroke="white"
					strokeDasharray={1}
					strokeDashoffset={interpolate(
						frame,
						[
							durationInFrames * 0.2,
							durationInFrames * 0.425,
							durationInFrames * 0.65,
						],
						[1, 0.5, 0],
						{
							easing: [Easing.ease, Easing.out(Easing.ease)],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
					strokeLinecap="round"
					strokeWidth={routeWidth + 24}
				/>
				<Interactive.Path
					name="Route"
					d={routePath}
					fill="none"
					pathLength={1}
					stroke={routeColor}
					strokeDasharray={1}
					strokeDashoffset={interpolate(
						frame,
						[
							durationInFrames * 0.2,
							durationInFrames * 0.425,
							durationInFrames * 0.65,
						],
						[1, 0.5, 0],
						{
							easing: [Easing.ease, Easing.out(Easing.ease)],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
					strokeLinecap="round"
					strokeWidth={routeWidth}
				/>
			</svg>
			<div
				style={{
					left: originX,
					position: 'absolute',
					top: originY,
					translate: '-50% -50%',
				}}
			>
				<Interactive.Div
					name="Origin marker"
					style={{
						backgroundColor: routeColor,
						border: '12px solid white',
						borderRadius: '50%',
						boxSizing: 'border-box',
						height: 60,
						translate: '0px 0px',
						width: 60,
					}}
				/>
			</div>
			<div
				style={{
					left: destinationScreenX,
					position: 'absolute',
					top: destinationScreenY,
					translate: '-50% -50%',
				}}
			>
				<Interactive.Div
					name="Destination marker"
					style={{
						backgroundColor: routeColor,
						border: '12px solid white',
						borderRadius: '50%',
						boxSizing: 'border-box',
						height: 60,
						scale: interpolate(
							frame,
							[durationInFrames * 0.665, durationInFrames * 0.765],
							[0, 1],
							{
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						translate: '0px 0px',
						width: 60,
					}}
				/>
			</div>
			<div
				style={{
					left: originX,
					position: 'absolute',
					top: originY,
					translate: `-50% ${originLabelIsAbove ? '-145%' : '45%'}`,
				}}
			>
				<Interactive.Div
					name="Origin label"
					style={{
						backgroundColor: 'white',
						borderRadius: 32,
						boxShadow: '0 0 30px white',
						color: '#182026',
						fontFamily: 'Lora',
						fontSize: 40,
						fontWeight: 700,
						opacity: interpolate(
							frame,
							[durationInFrames * 0.2, durationInFrames * 0.3],
							[1, 0],
							{
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						padding: '14px 36px',
						translate: '0px 0px',
						whiteSpace: 'nowrap',
					}}
				>
					{originLabel}
				</Interactive.Div>
			</div>
			<div
				style={{
					left: destinationScreenX,
					position: 'absolute',
					top: destinationScreenY,
					translate: `-50% ${destinationLabelIsAbove ? '-145%' : '45%'}`,
				}}
			>
				<Interactive.Div
					name="Destination label"
					style={{
						backgroundColor: 'white',
						borderRadius: 32,
						boxShadow: '0 0 30px white',
						color: '#182026',
						fontFamily: 'Lora',
						fontSize: 40,
						fontWeight: 700,
						opacity: interpolate(
							frame,
							[durationInFrames * 0.65, durationInFrames * 0.75],
							[0, 1],
							{
								easing: Easing.spring({damping: 200}),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						padding: '14px 36px',
						translate: '0px 0px',
						whiteSpace: 'nowrap',
					}}
				>
					{destinationLabel}
				</Interactive.Div>
			</div>
			<Interactive.Div
				name="Map attribution"
				style={{
					backgroundColor: 'rgba(255, 255, 255, 0.82)',
					borderRadius: 4,
					bottom: 8,
					color: '#182026',
					fontFamily: 'sans-serif',
					fontSize: 12,
					padding: '3px 6px',
					position: 'absolute',
					right: 8,
				}}
			>
				Map tiles by Stamen Design, under CC BY 3.0 · Data by OpenStreetMap,
				under CC BY-SA
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const WatercolorMap = Interactive.withSchema({
	Component: WatercolorMapContent,
	componentName: '<WatercolorMap>',
	schema: watercolorMapSchema,
	wrapInSequence: true,
});
