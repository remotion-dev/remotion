import type {CanvasCaptureData} from '@remotion/studio-shared';
import {formatOutput} from '../codemods/duplicate-composition';

type FramedMouseMovement = CanvasCaptureData['mouseMovements'][number] & {
	readonly frame: number;
};

const customCursorRegex = /^\s*url\(/;

const collapseMouseMovementsByFrame = ({
	data,
	keyframeFps,
}: {
	readonly data: CanvasCaptureData;
	readonly keyframeFps: number;
}) => {
	const movements: FramedMouseMovement[] = [];

	for (const movement of data.mouseMovements) {
		if (movement.canvasX === null || movement.canvasY === null) {
			continue;
		}

		const framedMovement = {
			...movement,
			frame: Math.ceil(movement.timeInSeconds * keyframeFps),
		};
		const previous = movements.at(-1);
		if (previous?.frame === framedMovement.frame) {
			movements[movements.length - 1] = framedMovement;
		} else {
			movements.push(framedMovement);
		}
	}

	return movements;
};

const getCursorName = (cursor: string) => {
	if (customCursorRegex.test(cursor)) {
		return 'custom';
	}

	return cursor.split(',').at(-1)?.trim().toLowerCase() || 'default';
};

const serialize = (value: unknown) => JSON.stringify(value);

export const generateCanvasCaptureComposition = ({
	componentName,
	compositionId,
	data,
	durationInFrames,
	fps,
	height,
	keyframeFps,
	videoFileName,
	videoHeight,
	videoWidth,
	width,
}: {
	readonly componentName: string;
	readonly compositionId: string;
	readonly data: CanvasCaptureData;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly height: number;
	readonly keyframeFps: number;
	readonly videoFileName: string;
	readonly videoHeight: number;
	readonly videoWidth: number;
	readonly width: number;
}) => {
	const movements = collapseMouseMovementsByFrame({data, keyframeFps});
	if (movements.length === 0) {
		throw new Error('The Canvas Capture does not contain cursor movements');
	}

	const cursorKeyframes = movements.reduce<
		Array<{readonly frame: number; readonly value: string}>
	>((keyframes, movement) => {
		const value = getCursorName(movement.cursor);
		if (keyframes.at(-1)?.value !== value) {
			keyframes.push({frame: movement.frame, value});
		}

		return keyframes;
	}, []);

	const positionKeyframes: Array<{
		readonly frame: number;
		readonly value: string;
	}> = [];
	for (const movement of movements) {
		const previous = positionKeyframes.at(-1);
		if (previous !== undefined && movement.frame - previous.frame > 1) {
			positionKeyframes.push({
				frame: movement.frame - 1,
				value: previous.value,
			});
		}

		positionKeyframes.push({
			frame: movement.frame,
			value: `${movement.canvasX}px ${movement.canvasY}px`,
		});
	}

	const scaleKeyframes = [
		{frame: 0, value: data.captureMetadata.density},
		...data.pointerClicks.map((click) => ({
			frame: Math.ceil(click.timeInSeconds * keyframeFps),
			value:
				click.type === 'pointer-down'
					? data.captureMetadata.density * 0.9
					: data.captureMetadata.density,
		})),
	].reduce<Array<{readonly frame: number; readonly value: number}>>(
		(keyframes, keyframe) => {
			if (keyframes.at(-1)?.frame === keyframe.frame) {
				keyframes[keyframes.length - 1] = keyframe;
			} else if (keyframes.at(-1)?.value !== keyframe.value) {
				keyframes.push(keyframe);
			}

			return keyframes;
		},
		[],
	);

	const customCursor = movements.find((movement) =>
		customCursorRegex.test(movement.cursor),
	)?.cursor;
	const cursorProp =
		cursorKeyframes.length === 1
			? `cursor=${serialize(cursorKeyframes[0].value)}`
			: `cursor={interpolate(
					frame,
					${serialize(cursorKeyframes.map((keyframe) => keyframe.frame))},
					${serialize(cursorKeyframes.map((keyframe) => keyframe.value))},
					{
						easing: Easing.step1,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				)}`;
	const scale =
		scaleKeyframes.length === 1
			? serialize(scaleKeyframes[0].value)
			: `interpolate(
						frame,
						${serialize(scaleKeyframes.map((keyframe) => keyframe.frame))},
						${serialize(scaleKeyframes.map((keyframe) => keyframe.value))},
						{
							easing: Easing.step1,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)`;
	const translate =
		positionKeyframes.length === 1
			? serialize(positionKeyframes[0].value)
			: `interpolate(
						frame,
						${serialize(positionKeyframes.map((keyframe) => keyframe.frame))},
						${serialize(positionKeyframes.map((keyframe) => keyframe.value))},
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)`;

	const previewComponentName = componentName.endsWith('Composition')
		? `${componentName.slice(0, -'Composition'.length)}Preview`
		: `${componentName}Preview`;

	return formatOutput(`import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Composition,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

export const ${previewComponentName} = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				width: ${videoWidth},
				height: ${videoHeight},
			}}
		>
			<Video
				src={staticFile(${serialize(videoFileName)})}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				${cursorProp}
${customCursor === undefined ? '' : `\t\t\t\tcustomCursor={${serialize(customCursor)}}\n`}				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					scale: ${scale},
					translate: ${translate},
				}}
			/>
		</AbsoluteFill>
	);
};

export const ${componentName} = () => {
	return (
		<Composition
			id=${serialize(compositionId)}
			component={${previewComponentName}}
			width={${width}}
			height={${height}}
			fps={${fps}}
			durationInFrames={${durationInFrames}}
		/>
	);
};
`);
};
