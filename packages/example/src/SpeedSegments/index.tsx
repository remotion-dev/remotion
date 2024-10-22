import {OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';

const segments = [
	{
		duration: 100,
		speed: 0.5,
	},
	{
		duration: 100,
		speed: 1,
	},
	{
		duration: 200,
		speed: 2,
	},
	{
		duration: 400,
		speed: 4,
	},
];

type AccumulatedSegment = {
	start: number;
	passedVideoTime: number;
	end: number;
	speed: number;
};

export const accumulateSegments = () => {
	const accumulatedSegments: AccumulatedSegment[] = [];
	let accumulatedDuration = 0;
	let accumulatedPassedVideoTime = 0;

	for (const segment of segments) {
		const duration = segment.duration / segment.speed;
		accumulatedSegments.push({
			end: accumulatedDuration + duration,
			speed: segment.speed,
			start: accumulatedDuration,
			passedVideoTime: accumulatedPassedVideoTime,
		});

		accumulatedPassedVideoTime += segment.duration;
		accumulatedDuration += duration;
	}

	return accumulatedSegments;
};

export const SpeedSegments = () => {
	const frame = useCurrentFrame();
	const accumulated = accumulateSegments();

	const currentSegment = accumulated.find(
		(segment) => frame > segment.start && frame <= segment.end,
	);

	if (!currentSegment) {
		return;
	}

	return (
		<Sequence from={currentSegment.start}>
			<OffthreadVideo
				pauseWhenBuffering
				startFrom={currentSegment.passedVideoTime}
				src={`${staticFile('bigbuckbunny.mp4')}#disable`}
				playbackRate={currentSegment.speed}
			/>
		</Sequence>
	);
};
