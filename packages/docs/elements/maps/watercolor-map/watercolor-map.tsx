import {fontFamily, loadFont} from '@remotion/google-fonts/Lora';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	Easing,
	Img,
	Interactive,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';

loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

const TILE_SIZE = 256;
const TILE_BASE_URL =
	'https://watercolormaps.collection.cooperhewitt.org/tile/watercolor';

type Coordinates = readonly [longitude: number, latitude: number];

type WatercolorMapProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly destination?: Coordinates;
		readonly destinationLabel?: string;
		readonly origin?: Coordinates;
		readonly originLabel?: string;
		readonly routeColor?: string;
		readonly routeWidth?: number;
	};

const watercolorMapSchema = {
	...Interactive.baseSchema,
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
		type: 'text-content',
		default: 'Los Angeles',
		description: 'Origin label',
	},
	destinationLabel: {
		type: 'text-content',
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
	...Interactive.transformSchema,
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

const WatercolorMapContent: React.FC<{
	readonly destination: Coordinates;
	readonly destinationLabel: string;
	readonly origin: Coordinates;
	readonly originLabel: string;
	readonly outlineRef: React.RefObject<HTMLDivElement | null>;
	readonly routeColor: string;
	readonly routeWidth: number;
	readonly style: React.CSSProperties | undefined;
}> = ({
	destination,
	destinationLabel,
	origin,
	originLabel,
	outlineRef,
	routeColor,
	routeWidth,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps, height, width} = useVideoConfig();
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

	const travelProgress = interpolate(frame, [40, 130], [0, 1], {
		easing: Easing.inOut(Easing.ease),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const centerX = interpolate(
		travelProgress,
		[0, 1],
		[projectedOrigin.x, destinationX],
	);
	const centerY = interpolate(
		travelProgress,
		[0, 1],
		[projectedOrigin.y, projectedDestination.y],
	);
	const originX = projectedOrigin.x - centerX + width / 2;
	const originY = projectedOrigin.y - centerY + height / 2;
	const destinationScreenX = destinationX - centerX + width / 2;
	const destinationScreenY = projectedDestination.y - centerY + height / 2;
	const routePath = `M ${originX} ${originY} Q ${(originX + destinationScreenX) / 2} ${(originY + destinationScreenY) / 2 - Math.min(400, height * 0.37)} ${destinationScreenX} ${destinationScreenY}`;
	const originLabelOpacity =
		1 -
		spring({
			fps,
			frame: frame - 40,
			config: {damping: 200},
			durationInFrames: 20,
		});
	const destinationMarkerScale = spring({
		fps,
		frame: frame - 133,
		config: {damping: 200},
		durationInFrames: 20,
	});
	const destinationLabelOpacity = spring({
		fps,
		frame: frame - 130,
		config: {damping: 200},
		durationInFrames: 20,
	});
	const tiles = getTiles({centerX, centerY, height, width, zoom});
	const originLabelIsAbove = origin[1] > destination[1];
	const destinationLabelIsAbove = destination[1] > origin[1];

	return (
		<div
			ref={outlineRef}
			style={{
				backgroundColor: '#e6ec88',
				height,
				overflow: 'hidden',
				position: 'absolute',
				width,
				...style,
			}}
		>
			{tiles.map((tile) => (
				<Img
					key={tile.key}
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
					pointerEvents: 'none',
					position: 'absolute',
					width,
				}}
			>
				<path
					d={routePath}
					fill="none"
					pathLength={1}
					stroke="white"
					strokeDasharray={1}
					strokeDashoffset={1 - travelProgress}
					strokeLinecap="round"
					strokeWidth={routeWidth + 24}
				/>
				<path
					d={routePath}
					fill="none"
					pathLength={1}
					stroke={routeColor}
					strokeDasharray={1}
					strokeDashoffset={1 - travelProgress}
					strokeLinecap="round"
					strokeWidth={routeWidth}
				/>
			</svg>
			<div
				style={{
					backgroundColor: routeColor,
					border: '12px solid white',
					borderRadius: '50%',
					boxSizing: 'border-box',
					height: 60,
					left: originX,
					position: 'absolute',
					top: originY,
					translate: '-50% -50%',
					width: 60,
				}}
			/>
			<div
				style={{
					backgroundColor: routeColor,
					border: '12px solid white',
					borderRadius: '50%',
					boxSizing: 'border-box',
					height: 60,
					left: destinationScreenX,
					position: 'absolute',
					scale: destinationMarkerScale,
					top: destinationScreenY,
					translate: '-50% -50%',
					width: 60,
				}}
			/>
			<div
				style={{
					backgroundColor: 'white',
					borderRadius: 32,
					boxShadow: '0 0 30px white',
					fontFamily,
					fontSize: 40,
					fontWeight: 700,
					left: originX,
					opacity: originLabelOpacity,
					padding: '14px 36px',
					pointerEvents: 'none',
					position: 'absolute',
					top: originY,
					translate: `-50% ${originLabelIsAbove ? '-145%' : '45%'}`,
					whiteSpace: 'nowrap',
				}}
			>
				{originLabel}
			</div>
			<div
				style={{
					backgroundColor: 'white',
					borderRadius: 32,
					boxShadow: '0 0 30px white',
					fontFamily,
					fontSize: 40,
					fontWeight: 700,
					left: destinationScreenX,
					opacity: destinationLabelOpacity,
					padding: '14px 36px',
					pointerEvents: 'none',
					position: 'absolute',
					top: destinationScreenY,
					translate: `-50% ${destinationLabelIsAbove ? '-145%' : '45%'}`,
					whiteSpace: 'nowrap',
				}}
			>
				{destinationLabel}
			</div>
			<div
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
			</div>
		</div>
	);
};

const WatercolorMapInner = forwardRef<
	HTMLDivElement,
	WatercolorMapProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			controls,
			destination = [8.5417, 47.3769],
			destinationLabel = 'Zurich',
			name,
			origin = [-118.2437, 34.0522],
			originLabel = 'Los Angeles',
			routeColor = '#ff0041',
			routeWidth = 18,
			style,
			...sequenceProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);
		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...sequenceProps}
				controls={controls}
				name={name ?? '<WatercolorMap>'}
				outlineRef={outlineRef}
			>
				<WatercolorMapContent
					destination={destination}
					destinationLabel={destinationLabel}
					origin={origin}
					originLabel={originLabel}
					outlineRef={outlineRef}
					routeColor={routeColor}
					routeWidth={routeWidth}
					style={style}
				/>
			</Sequence>
		);
	},
);

const InteractiveWatercolorMap = Interactive.withSchema({
	Component: WatercolorMapInner,
	componentName: '<WatercolorMap>',
	componentIdentity: null,
	schema: watercolorMapSchema,
	supportsEffects: false,
}) as React.FC<WatercolorMapProps>;

export const WatercolorMap: React.FC<WatercolorMapProps> = (props) => {
	return (
		<InteractiveWatercolorMap
			destination={[8.5417, 47.3769]}
			destinationLabel="Zurich"
			name="Watercolor map"
			origin={[-118.2437, 34.0522]}
			originLabel="Los Angeles"
			routeColor="#ff0041"
			routeWidth={18}
			{...props}
		/>
	);
};
