import {Audio, Video} from '@remotion/media';
import {RemotionRiveCanvas} from '@remotion/rive';
import {
	Arrow,
	Callout,
	Circle,
	Ellipse,
	Heart,
	Pie,
	Polygon,
	Rect,
	Spark,
	Star,
	Triangle,
} from '@remotion/shapes';
import React from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	CanvasImage,
	Html5Audio,
	Html5Video,
	HtmlInCanvas,
	Img,
	Interactive,
	OffthreadVideo,
	Sequence,
	Solid,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const TILE_WIDTH = 220;
const TILE_HEIGHT = 140;
const GAP = 18;
const LEFT = 44;
const TOP = 54;

const getTileTransform = (index: number) => {
	const col = index % 5;
	const row = Math.floor(index / 5);

	return `translate(${LEFT + col * (TILE_WIDTH + GAP)}px, ${
		TOP + row * (TILE_HEIGHT + GAP)
	}px)`;
};

const baseTileStyle: React.CSSProperties = {
	width: TILE_WIDTH,
	height: TILE_HEIGHT,
	borderRadius: 8,
	overflow: 'hidden',
	boxShadow: '0 0 0 1px rgba(255,255,255,0.18)',
	backgroundColor: '#18202e',
};

const shapeStyle = (index: number): React.CSSProperties => ({
	...baseTileStyle,
	padding: 28,
	translate: `${LEFT + (index % 5) * (TILE_WIDTH + GAP)}px ${
		TOP + Math.floor(index / 5) * (TILE_HEIGHT + GAP)
	}px`,
});

const Label: React.FC<{
	readonly index: number;
	readonly children: React.ReactNode;
}> = ({index, children}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: LEFT + (index % 5) * (TILE_WIDTH + GAP) + 10,
				top: TOP + Math.floor(index / 5) * (TILE_HEIGHT + GAP) + 9,
				zIndex: 20,
				color: 'white',
				fontFamily: 'monospace',
				fontSize: 16,
				fontWeight: 700,
				textShadow: '0 1px 5px rgba(0,0,0,0.7)',
			}}
		>
			{children}
		</div>
	);
};

const Counter: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				position: 'absolute',
				right: 10,
				bottom: 8,
				color: '#f8fafc',
				fontFamily: 'monospace',
				fontSize: 13,
				backgroundColor: 'rgba(0,0,0,0.45)',
				borderRadius: 4,
				padding: '3px 5px',
			}}
		>
			frame {frame}
		</div>
	);
};

const TrimmedSequenceBox: React.FC<{
	readonly index: number;
	readonly name: string;
	readonly backgroundColor: string;
}> = ({index, name, backgroundColor}) => {
	return (
		<Sequence
			name={name}
			trimBefore={20}
			durationInFrames={109}
			style={{
				...baseTileStyle,
				backgroundColor,
				transform: getTileTransform(index),
			}}
			from={3}
		>
			<Counter />
		</Sequence>
	);
};

const TrimBeforeSupportTest: React.FC = () => {
	const img = staticFile('1.jpg');
	const gif = staticFile('giphy.gif');
	const video = staticFile('blush-1x.mp4');
	const audio = staticFile('sine.wav');
	const rive = 'https://cdn.rive.app/animations/vehicles.riv';

	const demos = [
		{
			name: 'Sequence',
			element: (
				<TrimmedSequenceBox
					index={0}
					name="<Sequence>"
					backgroundColor="#2962ff"
				/>
			),
		},
		{
			name: 'Interactive.Div',
			element: (
				<Interactive.Div
					name="<Interactive.Div>"
					trimBefore={20}
					durationInFrames={103}
					style={{
						...baseTileStyle,
						backgroundColor: '#0b7a75',
						transform: getTileTransform(1),
					}}
					from={17}
				>
					<Counter />
				</Interactive.Div>
			),
		},
		{
			name: 'Solid',
			element: (
				<Solid
					name="<Solid>"
					color="#e11d48"
					width={TILE_WIDTH}
					height={TILE_HEIGHT}
					trimBefore={20}
					durationInFrames={103}
					style={{transform: getTileTransform(2)}}
					from={17}
				/>
			),
		},
		{
			name: 'HtmlInCanvas',
			element: (
				<HtmlInCanvas
					name="<HtmlInCanvas>"
					width={TILE_WIDTH}
					height={TILE_HEIGHT}
					trimBefore={20}
					durationInFrames={101}
					style={{
						...baseTileStyle,
						transform: getTileTransform(3),
					}}
					from={19}
				>
					<div
						style={{
							width: TILE_WIDTH,
							height: TILE_HEIGHT,
							background: '#3b0764',
							color: 'white',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: 'monospace',
							fontSize: 20,
						}}
					>
						HTML
					</div>
				</HtmlInCanvas>
			),
		},
		{
			name: 'Img',
			element: (
				<Img
					name="<Img>"
					src={img}
					trimBefore={20}
					durationInFrames={105}
					style={{
						...baseTileStyle,
						objectFit: 'cover',
						transform: getTileTransform(4),
					}}
					from={15}
				/>
			),
		},
		{
			name: 'AnimatedImage',
			element: (
				<AnimatedImage
					name="<AnimatedImage>"
					src={gif}
					fit="cover"
					trimBefore={20}
					durationInFrames={113}
					style={{
						...baseTileStyle,
						transform: getTileTransform(5),
					}}
					from={7}
				/>
			),
		},
		{
			name: 'CanvasImage',
			element: (
				<CanvasImage
					name="<CanvasImage>"
					src={img}
					width={TILE_WIDTH}
					height={TILE_HEIGHT}
					fit="cover"
					trimBefore={20}
					durationInFrames={111}
					style={{
						...baseTileStyle,
						transform: getTileTransform(6),
					}}
					from={9}
				/>
			),
		},
		{
			name: 'Video',
			element: (
				<Video
					name="<Video>"
					src={video}
					trimBefore={20}
					muted
					style={{
						...baseTileStyle,
						transform: getTileTransform(7),
					}}
				/>
			),
		},
		{
			name: 'Html5Video',
			element: (
				<Html5Video
					name="<Html5Video>"
					src={video}
					trimBefore={20}
					muted
					style={{
						...baseTileStyle,
						objectFit: 'cover',
						transform: getTileTransform(8),
					}}
				/>
			),
		},
		{
			name: 'OffthreadVideo',
			element: (
				<OffthreadVideo
					name="<OffthreadVideo>"
					src={video}
					trimBefore={20}
					muted
					style={{
						...baseTileStyle,
						objectFit: 'cover',
						transform: getTileTransform(9),
					}}
				/>
			),
		},
		{
			name: 'Audio',
			element: (
				<Audio name="<Audio>" src={audio} trimBefore={20} volume={0.15} />
			),
		},
		{
			name: 'Html5Audio',
			element: (
				<Html5Audio
					name="<Html5Audio>"
					src={audio}
					trimBefore={20}
					volume={0.15}
				/>
			),
		},
		{
			name: 'RiveCanvas',
			element: (
				<RemotionRiveCanvas
					name="<RemotionRiveCanvas>"
					src={rive}
					trimBefore={20}
					durationInFrames={120}
					style={{
						...baseTileStyle,
						transform: getTileTransform(12),
					}}
				/>
			),
		},
		{
			name: 'Arrow',
			element: (
				<Arrow
					name="<Arrow>"
					length={120}
					headWidth={72}
					headLength={48}
					shaftWidth={30}
					fill="#38bdf8"
					trimBefore={20}
					durationInFrames={120}
					style={shapeStyle(13)}
				/>
			),
		},
		{
			name: 'Callout',
			element: (
				<Callout
					name="<Callout>"
					width={130}
					height={70}
					pointerLength={22}
					pointerBaseWidth={32}
					pointerPosition={0.5}
					pointerDirection="down"
					fill="#fde047"
					trimBefore={20}
					durationInFrames={120}
					style={shapeStyle(14)}
				/>
			),
		},
		{
			name: 'Circle',
			element: (
				<Circle
					name="<Circle>"
					radius={48}
					fill="#4ade80"
					trimBefore={20}
					durationInFrames={120}
					style={shapeStyle(15)}
				/>
			),
		},
		{
			name: 'Ellipse',
			element: (
				<Ellipse
					name="<Ellipse>"
					rx={62}
					ry={36}
					fill="#f97316"
					trimBefore={20}
					durationInFrames={120}
					style={shapeStyle(16)}
					from={5}
				/>
			),
		},
		{
			name: 'Heart',
			element: (
				<Heart
					name="<Heart>"
					height={96}
					aspectRatio={1.1}
					fill="#fb7185"
					trimBefore={20}
					durationInFrames={121}
					style={shapeStyle(17)}
					from={4}
				/>
			),
		},
		{
			name: 'Pie',
			element: (
				<Pie
					name="<Pie>"
					radius={55}
					progress={0.7}
					closePath
					counterClockwise={false}
					rotation={0}
					fill="#a78bfa"
					trimBefore={20}
					durationInFrames={99}
					style={shapeStyle(18)}
					from={8}
				/>
			),
		},
		{
			name: 'Polygon',
			element: (
				<Polygon
					name="<Polygon>"
					points={6}
					radius={58}
					fill="#22d3ee"
					trimBefore={20}
					durationInFrames={121}
					style={shapeStyle(19)}
					from={-1}
				/>
			),
		},
		{
			name: 'Rect',
			element: (
				<Rect
					name="<Rect>"
					width={104}
					height={76}
					fill="#60a5fa"
					trimBefore={20}
					durationInFrames={105}
					style={shapeStyle(20)}
					from={15}
				/>
			),
		},
		{
			name: 'Spark',
			element: (
				<Spark
					name="<Spark>"
					width={84}
					height={104}
					fill="#facc15"
					trimBefore={20}
					durationInFrames={106}
					style={shapeStyle(21)}
					from={14}
				/>
			),
		},
		{
			name: 'Star',
			element: (
				<Star
					name="<Star>"
					points={5}
					innerRadius={28}
					outerRadius={62}
					fill="#f472b6"
					trimBefore={20}
					durationInFrames={110}
					style={shapeStyle(22)}
					from={15}
				/>
			),
		},
		{
			name: 'Triangle',
			element: (
				<Triangle
					name="<Triangle>"
					length={100}
					direction="up"
					fill="#34d399"
					trimBefore={20}
					durationInFrames={100}
					style={shapeStyle(23)}
					from={20}
				/>
			),
		},
		{
			name: 'Video remote',
			element: (
				<Video
					name="<Video> remote"
					src="https://remotion.media/video.mp4"
					trimBefore={20}
					muted
					style={{
						...baseTileStyle,
						transform: getTileTransform(24),
					}}
					from={2}
				/>
			),
		},
	];

	return (
		<AbsoluteFill style={{backgroundColor: '#0f172a'}}>
			{demos.map((demo, index) => (
				<React.Fragment key={demo.name}>
					<Label index={index}>{demo.name}</Label>
					{demo.element}
				</React.Fragment>
			))}
		</AbsoluteFill>
	);
};

export default TrimBeforeSupportTest;
