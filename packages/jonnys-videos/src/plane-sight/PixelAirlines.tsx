import {
	AbsoluteFill,
	type InteractiveTransformProps,
	CanvasImage,
	Interactive,
	useVideoConfig,
} from 'remotion';

export type AircraftAirframe = 'narrowbody' | 'widebody';

type PlaneProps = InteractiveTransformProps & {
	width: number | null;
	height: number | null;
	airframe: AircraftAirframe | null;
};

const CloudCodePlaneContent = ({
	airframe,
	width,
	height,
	style,
}: PlaneProps) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{width: width ?? '100%', height: height ?? '100%', ...style}}
		>
			<CanvasImage
				name="Cloud Code plane"
				src={
					airframe === 'widebody'
						? 'https://remotion.media/jonnys-videos/plane-sight/airlines/cloud-code-widebody-orange.png'
						: 'https://remotion.media/jonnys-videos/plane-sight/airlines/cloud-code-narrowbody-orange.png'
				}
				premountFor={fps}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'contain',
					imageRendering: 'pixelated',
				}}
			/>
		</AbsoluteFill>
	);
};

export const CloudCodePlane = Interactive.create({
	Component: CloudCodePlaneContent,
	componentName: 'CloudCodePlane',
	schema: {
		airframe: {
			type: 'enum',
			default: 'narrowbody',
			description: 'Aircraft type',
			variants: {narrowbody: {}, widebody: {}},
		},
	},
});

const OpenAirPlaneContent = ({airframe, width, height, style}: PlaneProps) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{width: width ?? '100%', height: height ?? '100%', ...style}}
		>
			<CanvasImage
				name="OpenAir plane"
				src={
					airframe === 'widebody'
						? 'https://remotion.media/jonnys-videos/plane-sight/airlines/openair-widebody.png'
						: 'https://remotion.media/jonnys-videos/plane-sight/airlines/openair-plane-top-down.png'
				}
				premountFor={fps}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'contain',
					imageRendering: 'pixelated',
				}}
			/>
		</AbsoluteFill>
	);
};

export const OpenAirPlane = Interactive.create({
	Component: OpenAirPlaneContent,
	componentName: 'OpenAirPlane',
	schema: {
		airframe: {
			type: 'enum',
			default: 'narrowbody',
			description: 'Aircraft type',
			variants: {narrowbody: {}, widebody: {}},
		},
	},
});

export const PixelAirlines = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<CloudCodePlane
				name="Cloud Code narrowbody"
				airframe="narrowbody"
				premountFor={fps}
				width={250}
				height={250}
				style={{position: 'absolute', left: 195, top: 40}}
			/>
			<OpenAirPlane
				name="OpenAir narrowbody"
				airframe="narrowbody"
				premountFor={fps}
				width={250}
				height={250}
				style={{position: 'absolute', left: 835, top: 40}}
			/>
			<Interactive.Div
				name="Cloud Code narrowbody label"
				style={{
					position: 'absolute',
					left: 80,
					top: 300,
					width: 480,
					textAlign: 'center',
					fontFamily: "'Courier New', monospace",
					fontSize: 24,
					fontWeight: 700,
					color: '#a3410e',
				}}
			>
				Cloud Code · Narrowbody
			</Interactive.Div>
			<Interactive.Div
				name="OpenAir narrowbody label"
				style={{
					position: 'absolute',
					left: 720,
					top: 300,
					width: 480,
					textAlign: 'center',
					fontFamily: "'Courier New', monospace",
					fontSize: 24,
					fontWeight: 700,
					color: '#105734',
				}}
			>
				OpenAir · Narrowbody
			</Interactive.Div>
			<CloudCodePlane
				name="Cloud Code widebody"
				airframe="widebody"
				premountFor={fps}
				width={300}
				height={300}
				style={{position: 'absolute', left: 170, top: 365}}
			/>
			<OpenAirPlane
				name="OpenAir widebody"
				airframe="widebody"
				premountFor={fps}
				width={300}
				height={300}
				style={{position: 'absolute', left: 810, top: 365}}
			/>
			<Interactive.Div
				name="Cloud Code widebody label"
				style={{
					position: 'absolute',
					left: 80,
					top: 680,
					width: 480,
					textAlign: 'center',
					fontFamily: "'Courier New', monospace",
					fontSize: 24,
					fontWeight: 700,
					color: '#a3410e',
				}}
			>
				Cloud Code · Widebody
			</Interactive.Div>
			<Interactive.Div
				name="OpenAir widebody label"
				style={{
					position: 'absolute',
					left: 720,
					top: 680,
					width: 480,
					textAlign: 'center',
					fontFamily: "'Courier New', monospace",
					fontSize: 24,
					fontWeight: 700,
					color: '#105734',
				}}
			>
				OpenAir · Widebody
			</Interactive.Div>
		</>
	);
};
