import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';

type MouseMovement = {
	readonly timeInSeconds: number;
	readonly clientX: number;
	readonly clientY: number;
	readonly pageX: number;
	readonly pageY: number;
	readonly canvasX: number | null;
	readonly canvasY: number | null;
	readonly cursor: string;
};

type CaptureMetadata = {
	readonly density: number;
	readonly contentRect: {
		readonly left: number;
		readonly top: number;
		readonly width: number;
		readonly height: number;
	};
	readonly canvasSize: {
		readonly width: number;
		readonly height: number;
	};
	readonly viewport: {
		readonly width: number;
		readonly height: number;
		readonly scrollX: number;
		readonly scrollY: number;
	};
};

type PointerClick = {
	readonly timeInSeconds: number;
	readonly type: 'pointer-down' | 'pointer-up';
};

type CursorRecording = {
	readonly startedAt: number;
	readonly endedAt: number;
	readonly captureMetadata: CaptureMetadata;
	readonly mouseMovements: MouseMovement[];
	readonly pointerClicks?: PointerClick[];
};

export const canvasCapturePreviewSchema = z.object({
	videoFile: z.string(),
	hidden: z.enum(['cursor', 'screen']).nullable(),
});

export type CanvasCapturePreviewProps = z.infer<
	typeof canvasCapturePreviewSchema
> & {
	readonly cursorData?: CursorRecording | null;
	readonly width: number | null;
	readonly height: number | null;
};

const findCursorAtTime = (
	mouseMovements: readonly MouseMovement[],
	timeInSeconds: number,
) => {
	let low = 0;
	let high = mouseMovements.length - 1;
	let latest: MouseMovement | null = null;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		const movement = mouseMovements[middle];

		if (movement.timeInSeconds <= timeInSeconds) {
			latest = movement;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	return latest;
};

const CLICK_SCALE = 0.9;

const isPointerDown = (
	pointerClicks: readonly PointerClick[] | undefined,
	timeInSeconds: number,
) => {
	if (!pointerClicks) {
		return false;
	}

	let down = false;
	for (const click of pointerClicks) {
		if (click.timeInSeconds > timeInSeconds) {
			break;
		}

		down = click.type === 'pointer-down';
	}

	return down;
};

const CursorOverlay: React.FC<{
	readonly cursorData: CursorRecording;
}> = ({cursorData}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const timeInSeconds = frame / fps;
	const cursor = findCursorAtTime(cursorData.mouseMovements, timeInSeconds);

	if (!cursor || cursor.canvasX === null || cursor.canvasY === null) {
		return null;
	}

	const clickScale = isPointerDown(cursorData.pointerClicks, timeInSeconds)
		? CLICK_SCALE
		: 1;
	const x = cursor.canvasX;
	const y = cursor.canvasY;

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				transform: `translate(${x}px, ${y}px) scale(${clickScale})`,
				pointerEvents: 'none',
				height: 32,
				width: 32,
			}}
		>
			<MacOSCursor
				cursor={interpolate(
					frame,
					[6, 64, 68, 99, 164, 166],
					['default', 'auto', 'pointer', 'e-resize', 'auto', 'default'],
					{
						easing: Easing.step1,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				)}
				style={{scale: 6}}
			/>
		</div>
	);
};

const CAPTURE_METADATA_TAG_KEY = 'REMOTION_CAPTURE_DATA';

export const calculateCanvasCapturePreviewMetadata: CalculateMetadataFunction<
	CanvasCapturePreviewProps
> = async ({props}) => {
	const fps = 30;
	const videoSrc = props.videoFile;

	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(videoSrc, {
			getRetryDelay: () => null,
		}),
	});

	const [durationInSeconds, videoTrack, tags] = await Promise.all([
		input.computeDuration(),
		input.getPrimaryVideoTrack(),
		input.getMetadataTags(),
	]);

	const dimensions = videoTrack
		? {
				width: await videoTrack.getDisplayWidth(),
				height: await videoTrack.getDisplayHeight(),
			}
		: null;

	const rawCaptureData = tags.raw?.[CAPTURE_METADATA_TAG_KEY];
	const cursorData =
		typeof rawCaptureData === 'string'
			? (JSON.parse(rawCaptureData) as CursorRecording)
			: null;

	if (!dimensions) {
		throw new Error('Could not determine canvas capture video dimensions.');
	}

	return {
		width: dimensions.width,
		height: dimensions.height,
		durationInFrames: Math.ceil(durationInSeconds * fps),
		fps,
		defaultCodec: 'prores',
		defaultProResProfile: '4444',
		defaultPixelFormat: 'yuva444p10le',
		defaultVideoImageFormat: 'png',
		props: {
			...props,
			cursorData,
			width: dimensions.width,
			height: dimensions.height,
		},
	};
};

export const CanvasCapturePreview: React.FC<CanvasCapturePreviewProps> = ({
	cursorData,
	videoFile,
	width,
	height,
	hidden,
}) => {
	const showScreen = hidden !== 'screen';
	const showCursor = hidden !== 'cursor';

	return (
		<AbsoluteFill>
			{showScreen ? (
				<Video
					src={videoFile}
					style={{
						width: width!,
						height: height!,
					}}
				/>
			) : null}
			{showCursor && cursorData ? (
				<CursorOverlay cursorData={cursorData} />
			) : null}
		</AbsoluteFill>
	);
};
