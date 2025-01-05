import {getLength} from './get-length';

/*
 * @description Animates an SVG path from being invisible to its full length.
 * @see [Documentation](https://www.remotion.dev/docs/paths/evolve-path)
 */
export const evolvePath = (progress: number, path: string) => {
	const length = getLength(path);

	if (progress === 0) {
		// Because Remotion has not the same rounding as the browser, the length may be a bit too short.
		// This causes a browser artifact https://github.com/remotion-dev/remotion/issues/3960
		// But any line inbetween length and length * 2 will be invisible.
		// So we just select the middle I guess!

		const extendedLength = length * 1.5;
		return {
			strokeDasharray: `${extendedLength} ${extendedLength}`,
			strokeDashoffset: extendedLength,
		};
	}

	const strokeDasharray = `${length} ${length}`;
	const strokeDashoffset = length - progress * length;

	return {strokeDasharray, strokeDashoffset};
};
