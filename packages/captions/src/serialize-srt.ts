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
	const cues: Caption[][] = [];

	for (const line of lines) {
		let currentCue: Caption[] = [];

		for (const caption of line) {
			currentCue.push(caption);

			if (caption.pageBreakAfter) {
				cues.push(currentCue);
				currentCue = [];
			}
		}

		if (currentCue.length > 0) {
			cues.push(currentCue);
		}
	}

	return cues
		.map((s, index) => {
			const firstTimestamp = s[0].startMs;
			const lastTimestamp = s[s.length - 1].endMs;

			return [
				// Index
				index + 1,
				formatSrtTimestamp(firstTimestamp, lastTimestamp),
				// Text
				s.map((caption) => caption.text).join(''),
			].join('\n');
		})
		.join('\n\n');
};
