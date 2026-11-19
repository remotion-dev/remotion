import {linearGradientTint} from '@remotion/effects';
import {Gif} from '@remotion/gif';
import {Audio, Video} from '@remotion/media';
import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	CanvasImage,
	Freeze,
	HtmlInCanvas,
	Img,
	Loop,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {makeToneWav} from './pitch-shift-audio';

export const fractionalRgbSource = () => staticFile('fractional-rgb-loop.webm');

const LoopedVideo = () => (
	<Video
		src={fractionalRgbSource()}
		loop
		trimAfter={3}
		muted
		style={{width: 64, height: 64}}
	/>
);

const ShortVideo = () => (
	<Sequence durationInFrames={1.0001}>
		<Video src={fractionalRgbSource()} muted style={{width: 64, height: 64}} />
	</Sequence>
);

const NestedAudio = () => {
	const [src] = useState(makeToneWav);
	return (
		<Loop durationInFrames={1.2}>
			<Loop durationInFrames={0.4}>
				<Audio src={src} />
			</Loop>
		</Loop>
	);
};

const UnusedImage = () => {
	const [src] = useState(makeToneWav);
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(16, 40, 80)'}}>
			<Sequence from={0.25} durationInFrames={0.12}>
				<Audio src={src} />
				<Img src="/missing-fractional-boundary-image.png" maxRetries={0} />
			</Sequence>
		</AbsoluteFill>
	);
};

const LoopingSequenceAudio = () => {
	const [src] = useState(makeToneWav);
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(16, 40, 80)'}}>
			<Sequence from={0.25} durationInFrames={2.1}>
				<Sequence durationInFrames={0.7} loop>
					<Audio src={src} />
				</Sequence>
			</Sequence>
		</AbsoluteFill>
	);
};

const dimensions = {width: 64, height: 64, fps: 24, durationInFrames: 4};

type HtmlAudioProps = {
	readonly boundary: boolean;
	readonly onLifetime: ((event: 'mount' | 'unmount') => void) | null;
};

const ContinuousPitchedAudio = ({
	onLifetime,
}: Pick<HtmlAudioProps, 'onLifetime'>) => {
	const [src] = useState(makeToneWav);
	useEffect(() => {
		onLifetime?.('mount');
		return () => onLifetime?.('unmount');
	}, [onLifetime]);
	return <Audio src={src} toneFrequency={1.5} />;
};

const HtmlAudio = ({boundary, onLifetime}: HtmlAudioProps) => {
	const [src] = useState(makeToneWav);
	return (
		<>
			<HtmlInCanvas width={64} height={64}>
				<AbsoluteFill style={{backgroundColor: 'rgb(16, 40, 80)'}}>
					<ContinuousPitchedAudio onLifetime={onLifetime} />
				</AbsoluteFill>
			</HtmlInCanvas>
			{boundary ? (
				<Sequence from={0.25} durationInFrames={0.12}>
					<Audio src={src} volume={0} />
				</Sequence>
			) : null}
		</>
	);
};

export const fractionalHtmlAudio = {
	...dimensions,
	durationInFrames: 12,
	component: HtmlAudio,
	id: 'fractional-html-audio',
	defaultProps: {boundary: true, onLifetime: null} as HtmlAudioProps,
};

const UnusedCanvas = ({
	onUnexpectedPaint,
}: {
	readonly onUnexpectedPaint: (() => void) | null;
}) => {
	const [src] = useState(makeToneWav);
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(16, 40, 80)'}}>
			<Sequence from={0.25} durationInFrames={0.12}>
				<HtmlInCanvas
					width={64}
					height={64}
					onInit={() => {
						onUnexpectedPaint?.();
						return () => {};
					}}
					onPaint={() => {
						onUnexpectedPaint?.();
					}}
				>
					<Audio src={src} />
				</HtmlInCanvas>
			</Sequence>
		</AbsoluteFill>
	);
};

export const fractionalUnusedCanvas = {
	...dimensions,
	component: UnusedCanvas,
	id: 'fractional-unused-canvas',
	defaultProps: {onUnexpectedPaint: null as (() => void) | null},
};

export const fractionalLoopedVideo = {
	...dimensions,
	component: LoopedVideo,
	id: 'fractional-looped-video',
	fps: 30000 / 1001,
	durationInFrames: 12,
};

export const fractionalShortVideo = {
	...dimensions,
	component: ShortVideo,
	id: 'fractional-short-video',
	fps: 30,
	durationInFrames: 2,
};

export const fractionalNestedAudio = {
	...dimensions,
	component: NestedAudio,
	id: 'fractional-nested-audio',
};

export const fractionalUnusedImage = {
	...dimensions,
	component: UnusedImage,
	id: 'fractional-unused-image',
};

export const fractionalLoopingSequence = {
	...dimensions,
	component: LoopingSequenceAudio,
	id: 'fractional-looping-sequence',
};

type FreezeLifetimeProps = {
	readonly kind: 'sequence' | 'loop';
	readonly onLifetime: ((event: 'mount' | 'unmount') => void) | null;
};

const FrozenState = ({onLifetime}: Pick<FreezeLifetimeProps, 'onLifetime'>) => {
	const frame = useCurrentFrame();
	const [initialFrame] = useState(frame);
	useEffect(() => {
		onLifetime?.('mount');
		return () => onLifetime?.('unmount');
	}, [onLifetime]);
	return (
		<AbsoluteFill
			style={{backgroundColor: initialFrame === 0 ? 'rgb(16, 40, 80)' : 'red'}}
		/>
	);
};

const FreezeLifetime = ({kind, onLifetime}: FreezeLifetimeProps) => {
	const [src] = useState(makeToneWav);
	const child = <FrozenState onLifetime={onLifetime} />;
	return (
		<>
			<Freeze frame={0} active={(frame) => frame < 1}>
				{kind === 'sequence' ? (
					<Sequence durationInFrames={4}>{child}</Sequence>
				) : (
					<Loop durationInFrames={4}>{child}</Loop>
				)}
			</Freeze>
			<Audio src={src} />
		</>
	);
};

export const fractionalFreezeLifetime = {
	...dimensions,
	component: FreezeLifetime,
	id: 'fractional-freeze-lifetime',
	defaultProps: {kind: 'sequence', onLifetime: null} as FreezeLifetimeProps,
};

const RevokedImage = ({
	onImageLoad,
}: {
	readonly onImageLoad: (() => void) | null;
}) => {
	const [tone] = useState(makeToneWav);
	const [src] = useState(() =>
		URL.createObjectURL(
			new Blob(
				[
					'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="rgb(16,40,80)" /></svg>',
				],
				{type: 'image/svg+xml'},
			),
		),
	);
	useEffect(() => () => URL.revokeObjectURL(src), [src]);
	return (
		<>
			<Img
				src={src}
				maxRetries={0}
				onLoad={() => {
					URL.revokeObjectURL(src);
					onImageLoad?.();
				}}
				style={{width: 64, height: 64}}
			/>
			<Sequence from={0.25} durationInFrames={0.12}>
				<Audio src={tone} volume={0} />
			</Sequence>
		</>
	);
};

export const fractionalRevokedImage = {
	...dimensions,
	component: RevokedImage,
	id: 'fractional-revoked-image',
	defaultProps: {onImageLoad: null} as {onImageLoad: (() => void) | null},
};

export type FractionalResourceKind = 'canvas' | 'effects' | 'animated' | 'gif';

type CanvasResourceProps = {
	readonly kind: FractionalResourceKind;
	readonly unused: boolean;
	readonly onResourceReady: ((revoke: () => void) => void) | null;
	readonly onResourceCanvas:
		| ((canvas: HTMLCanvasElement | null) => void)
		| null;
	readonly onImageLoad: (() => void) | null;
};

const CanvasResource = ({
	kind,
	unused,
	onResourceReady,
	onResourceCanvas,
	onImageLoad,
}: CanvasResourceProps) => {
	const [tone] = useState(makeToneWav);
	const [src] = useState(() =>
		URL.createObjectURL(
			new Blob(
				[
					Uint8Array.from(
						atob('R0lGODlhAQABAIAAABAoUAAAACwAAAAAAQABAAACAkQBADs='),
						(char) => char.charCodeAt(0),
					),
				],
				{type: 'image/gif'},
			),
		),
	);
	useEffect(() => {
		onResourceReady?.(() => URL.revokeObjectURL(src));
		return () => URL.revokeObjectURL(src);
	}, [onResourceReady, src]);
	const imageSrc = unused ? 'http://127.0.0.1:1/fractional-unused-image' : src;
	const visual =
		kind === 'canvas' ? (
			<CanvasImage
				ref={onResourceCanvas}
				src={imageSrc}
				width={64}
				height={64}
				maxRetries={0}
			/>
		) : kind === 'effects' ? (
			<Img
				src={imageSrc}
				width={64}
				height={64}
				maxRetries={0}
				effects={[linearGradientTint({amount: 0})]}
			/>
		) : kind === 'animated' ? (
			<AnimatedImage
				src={imageSrc}
				width={64}
				height={64}
				loop={false}
				durationInFrames={4}
				loopBehavior="pause-after-finish"
			/>
		) : (
			<Gif
				src={imageSrc}
				width={64}
				height={64}
				loop={false}
				durationInFrames={4}
				loopBehavior="pause-after-finish"
				onLoad={() => onImageLoad?.()}
			/>
		);
	return (
		<>
			<AbsoluteFill
				style={{backgroundColor: unused ? 'rgb(16,40,80)' : 'red'}}
			/>
			{unused ? (
				<Sequence from={0.25} durationInFrames={0.12}>
					{visual}
				</Sequence>
			) : (
				visual
			)}
			<Sequence from={0.25} durationInFrames={0.12}>
				<Audio src={tone} volume={0} />
			</Sequence>
		</>
	);
};

export const fractionalCanvasResource = {
	...dimensions,
	component: CanvasResource,
	id: 'fractional-canvas-resource',
	defaultProps: {
		kind: 'canvas',
		unused: false,
		onResourceReady: null,
		onResourceCanvas: null,
		onImageLoad: null,
	} as CanvasResourceProps,
};

type TimedImageProps = {
	readonly kind: FractionalResourceKind | 'native';
	readonly unused: boolean;
	readonly revokeEarly: boolean;
	readonly onResourceReady: ((revoke: () => void) => void) | null;
	readonly onImageLoad: (() => void) | null;
};

const TimedImage = ({
	kind,
	unused,
	revokeEarly,
	onResourceReady,
	onImageLoad,
}: TimedImageProps) => {
	const frame = useCurrentFrame();
	const [tone] = useState(makeToneWav);
	const [sources] = useState(() =>
		Array.from({length: 2}, () =>
			URL.createObjectURL(
				new Blob(
					[
						Uint8Array.from(
							atob('R0lGODlhAQABAIAAABAoUAAAACwAAAAAAQABAAACAkQBADs='),
							(char) => char.charCodeAt(0),
						),
					],
					{type: 'image/gif'},
				),
			),
		),
	);
	useEffect(() => {
		onResourceReady?.(() => URL.revokeObjectURL(sources[0]!));
		return () => sources.forEach((source) => URL.revokeObjectURL(source));
	}, [onResourceReady, sources]);
	const props = {
		src: unused
			? 'http://127.0.0.1:1/fractional-internal-unused-image'
			: sources[revokeEarly && frame < 1 ? 0 : 1]!,
		from: 0.25,
		durationInFrames: unused ? 0.12 : 1.5,
		width: 64,
		height: 64,
	};
	return (
		<>
			<AbsoluteFill style={{backgroundColor: 'red'}} />
			{kind === 'canvas' ? (
				<CanvasImage {...props} maxRetries={0} />
			) : kind === 'effects' ? (
				<Img
					{...props}
					maxRetries={0}
					effects={[linearGradientTint({amount: 0})]}
				/>
			) : kind === 'native' ? (
				<Img {...props} maxRetries={0} onLoad={() => onImageLoad?.()} />
			) : kind === 'animated' ? (
				<AnimatedImage
					{...props}
					loop={false}
					loopBehavior="pause-after-finish"
				/>
			) : (
				<Gif
					{...props}
					loop={false}
					loopBehavior="pause-after-finish"
					onLoad={() => onImageLoad?.()}
				/>
			)}
			<Sequence from={0.25} durationInFrames={0.12}>
				<Audio src={tone} volume={0} />
			</Sequence>
		</>
	);
};

export const fractionalTimedImage = {
	...dimensions,
	durationInFrames: 3,
	component: TimedImage,
	id: 'fractional-timed-image',
	defaultProps: {
		kind: 'canvas',
		unused: false,
		revokeEarly: false,
		onResourceReady: null,
		onImageLoad: null,
	} as TimedImageProps,
};
