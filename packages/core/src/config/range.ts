export type FrameRange = number | [number, number] | null;

let range: FrameRange = null;

export const setRange = (newFrameRange: string | number) => {
	if (typeof newFrameRange === 'number') {
		range = newFrameRange;
		return;
	}
	if (typeof newFrameRange === 'string') {
		const parsed = newFrameRange.split('-').map((f) => Number(f)) as number[];
		if (parsed.length > 2 || parsed.length <= 0) {
			throw new Error(
				`--frames flag must be a number or 2 numbers separate by '-', instead got ${parsed.length} numbers`
			);
		}
		if (parsed.length === 2 && parsed[1] < parsed[0]) {
			throw new Error(
				'in --frames flag second number should be greater than first number'
			);
		}
		for (const value of parsed) {
			if (typeof value !== 'number') {
				throw new Error(
					'--frames flag must be a number or 2 numbers separate by `-`'
				);
			}
		}
		range = parsed as [number, number];
	}
};

export const getRange = () => range;
