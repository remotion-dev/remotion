import {parseInputDraggerNumber} from '../NewComposition/InputDragger';

export const parseCompositionDuration = (
	input: string,
	fps: number | null,
	showFrames: boolean,
): number | null => {
	const text = input.trim().toLowerCase();
	const frameValue = parseInputDraggerNumber(
		text.replace(/\s*f(?:rames?)?$/, ''),
	);
	if (
		frameValue !== null &&
		(showFrames || fps === null || /\s*f(?:rames?)?$/.test(text))
	) {
		return frameValue;
	}

	if (fps === null || !Number.isFinite(fps) || fps <= 0) {
		return null;
	}

	const timecode = text.match(
		showFrames
			? /^(?:(\d+):)?(\d+):(\d{1,2})(?:\.(\d+))?$/
			: /^(?:(?:(\d+):)?(\d+):)?(\d+)(?:\.(\d+))?$/,
	);
	if (timecode) {
		const hours = Number(timecode[1] ?? 0);
		const minutes = Number(timecode[2] ?? 0);
		const timecodeSeconds = Number(timecode[3]);
		const frames = Number(timecode[4] ?? 0);
		if (
			(timecode[2] !== undefined && timecodeSeconds >= 60) ||
			(timecode[1] !== undefined && minutes >= 60)
		) {
			return null;
		}

		const timecodeDuration = Math.round(
			(hours * 3600 + minutes * 60 + timecodeSeconds) * fps + frames,
		);
		return Number.isFinite(timecodeDuration) ? timecodeDuration : null;
	}

	if (frameValue !== null) {
		return frameValue;
	}

	const units = text.matchAll(/(\d+(?:\.\d*)?|\.\d+)\s*([hms])\s*/g);
	let consumed = 0;
	let previousUnit = -1;
	let seconds = 0;
	for (const match of units) {
		const unit = 'hms'.indexOf(match[2]);
		if (match.index !== consumed || unit <= previousUnit) {
			return null;
		}

		seconds += Number(match[1]) * [3600, 60, 1][unit];
		consumed += match[0].length;
		previousUnit = unit;
	}

	if (consumed === 0 || consumed !== text.length) {
		return null;
	}

	const duration = Math.round(seconds * fps);
	return Number.isFinite(duration) ? duration : null;
};
