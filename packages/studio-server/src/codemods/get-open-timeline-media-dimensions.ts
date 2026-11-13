import {readFile} from 'node:fs/promises';
import {RenderInternals} from '@remotion/renderer';

export const getOpenTimelineMediaDimensions = async ({
	src,
	binariesDirectory,
}: {
	src: string;
	binariesDirectory: string | null;
}): Promise<{width: number; height: number}> => {
	let width: number;
	let height: number;
	if (/\.svg(?:[?#].*)?$/i.test(src)) {
		const response = /^https?:/i.test(src) ? await fetch(src) : null;
		if (response !== null && !response.ok) {
			throw new Error(`Could not read ${src}: ${response.status}`);
		}

		const contents =
			response === null ? await readFile(src, 'utf8') : await response.text();
		const root = contents.match(/<svg\b[^>]*>/i)?.[0] ?? '';
		const [svgWidth, svgHeight] = ['width', 'height'].map((attribute) => {
			const value = root.match(
				new RegExp(`\\s${attribute}\\s*=\\s*["']([^"']*)["']`, 'i'),
			)?.[1];
			const pixels = value?.match(/^\s*([\d.e+-]+)(?:px)?\s*$/i)?.[1];
			return pixels === undefined ? Number.NaN : Number(pixels);
		});
		const viewBox = root.match(/\sviewBox\s*=\s*["']([^"']*)["']/i)?.[1];
		const bounds = viewBox
			?.trim()
			.split(/[\s,]+/)
			.map(Number);
		const ratio =
			bounds?.length === 4 && bounds[2] > 0 && bounds[3] > 0
				? bounds[2] / bounds[3]
				: Number.NaN;
		width = Number.isFinite(svgWidth)
			? svgWidth
			: Number.isFinite(svgHeight)
				? svgHeight * ratio
				: (bounds?.[2] ?? Number.NaN);
		height = Number.isFinite(svgHeight)
			? svgHeight
			: Number.isFinite(svgWidth)
				? svgWidth / ratio
				: (bounds?.[3] ?? Number.NaN);
	} else {
		const {stdout} = await RenderInternals.callFf({
			bin: 'ffprobe',
			args: [
				'-v',
				'error',
				'-select_streams',
				'v:0',
				'-show_entries',
				'stream=width,height,sample_aspect_ratio:stream_tags=rotate:stream_side_data=rotation',
				'-of',
				'json',
				src,
			],
			indent: false,
			logLevel: 'error',
			binariesDirectory,
			cancelSignal: undefined,
		});
		const metadata = JSON.parse(stdout) as {
			streams: {
				width?: number;
				height?: number;
				sample_aspect_ratio?: string;
				tags?: {rotate?: string};
				side_data_list?: {rotation?: number}[];
			}[];
		};
		const stream = metadata.streams[0];
		const [numerator, denominator] = (stream?.sample_aspect_ratio ?? '1:1')
			.split(':')
			.map(Number);
		const ratio = numerator / denominator;
		width =
			(stream?.width ?? Number.NaN) *
			(Number.isFinite(ratio) && ratio > 0 ? ratio : 1);
		height = stream?.height ?? Number.NaN;
		const rotation =
			stream?.side_data_list?.find((entry) => entry.rotation !== undefined)
				?.rotation ?? Number(stream?.tags?.rotate ?? 0);
		if (Math.abs(rotation) % 180 === 90) {
			[width, height] = [height, width];
		}
	}

	width = Math.round(width);
	height = Math.round(height);
	if (
		!Number.isSafeInteger(width) ||
		width <= 0 ||
		!Number.isSafeInteger(height) ||
		height <= 0
	) {
		throw new Error(`Cannot determine the dimensions of ${src}`);
	}

	return {width, height};
};
