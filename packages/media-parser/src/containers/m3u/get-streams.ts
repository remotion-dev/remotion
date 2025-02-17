import type {Dimensions} from '../../get-dimensions';
import type {Structure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';

export type M3uStream = {
	url: string;
	bandwidth: number | null;
	averageBandwidth: number | null;
	resolution: Dimensions | null;
	codecs: string[] | null;
	id: number;
};

export const getM3uStreams = (
	structure: Structure | null,
	originalSrc: string | null,
): M3uStream[] | null => {
	if (structure === null || structure.type !== 'm3u') {
		return null;
	}

	const boxes: M3uStream[] = [];

	for (let i = 0; i < structure.boxes.length; i++) {
		const str = structure.boxes[i];
		if (str.type === 'm3u-stream-info') {
			const next = structure.boxes[i + 1];
			if (next.type !== 'm3u-text-value') {
				throw new Error('Expected m3u-text-value');
			}

			boxes.push({
				url:
					originalSrc && originalSrc.startsWith('http')
						? new URL(next.value, originalSrc).href
						: next.value,
				averageBandwidth: str.averageBandwidth,
				bandwidth: str.bandwidth,
				codecs: str.codecs,
				resolution: str.resolution,
				id: boxes.length,
			});
		}
	}

	return boxes;
};

export const m3uHasStreams = (state: ParserState): boolean => {
	const structure = state.getStructureOrNull();

	if (!structure) {
		return false;
	}

	if (structure.type !== 'm3u') {
		return true;
	}

	return state.m3u.hasFinishedManifest();
};
