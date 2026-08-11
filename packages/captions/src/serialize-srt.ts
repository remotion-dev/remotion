import type {Caption} from './caption';

const formatSingleSrtTimestamp = (timestamp: number) => {
	const hours = Math.floor(timestamp / 3600000);
	const minutes = Math.floor((timestamp % 3600000) / 60000);
	const seconds = Math.floor((timestamp % 60000) / 1000);
	const milliseconds = Math.floor(timestamp % 1000);

	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
};

const formatSrtTimestamp = (startMs: number, endMs: number) => {
	return `${formatSingleSrtTimestamp(startMs)} --> ${formatSingleSrtTimestamp(endMs)}`;
};

export type SerializeSrtInput = {
	lines: Caption[][];
};

export const serializeSrt = ({lines}: SerializeSrtInput) => {
	let currentIndex = 0;

	return lines
		.map((s) => {
			currentIndex++;
			if (s.length === 0) {
				return null;
			}

			const firstTimestamp = s[0].startMs;
			const lastTimestamp = s[s.length - 1].endMs;

			return [
				// Index
				currentIndex,
				formatSrtTimestamp(firstTimestamp, lastTimestamp),
				// Text
				s.map((caption) => caption.text).join(''),
			].join('\n');
		})
		.filter(Boolean)
		.join('\n\n');
};
