import {evolvePath} from '@remotion/paths';
import type {OpSet, ResolvedOptions} from 'roughjs/bin/core';
import type {Point} from 'roughjs/bin/geometry';
import {ellipse, line, linearPath, rectangle} from 'roughjs/bin/renderer.js';
import type {z} from 'zod';
import type {annotationConfig, AnnotationConfig, Rect} from './types';

const opsToPath = (opList: OpSet[]): string[] => {
	const paths: string[] = [];
	for (const drawing of opList) {
		let path = '';
		for (const item of drawing.ops) {
			const {data} = item;
			if (item.op === 'move') {
				if (path.trim()) {
					paths.push(path.trim());
				}

				path = `M${data[0]} ${data[1]} `;
			} else if (item.op === 'bcurveTo') {
				path += `C${data[0]} ${data[1]}, ${data[2]} ${data[3]}, ${data[4]} ${data[5]} `;
			} else if (item.op === 'lineTo') {
				path += `L${data[0]} ${data[1]} `;
			}
		}

		if (path.trim()) {
			paths.push(path.trim());
		}
	}

	return paths;
};

type RoughOptionsType = 'highlight' | 'single' | 'double';

const getOptions = (
	type: RoughOptionsType,
	seed: number,
	overrides: Partial<ResolvedOptions>,
): ResolvedOptions => {
	return {
		maxRandomnessOffset: 5,
		roughness: type === 'highlight' ? 3 : 1.5,
		bowing: 1,
		stroke: '#000',
		strokeWidth: 1.5,
		curveTightness: 0,
		curveFitting: 0.95,
		curveStepCount: 9,
		fillStyle: 'hachure',
		fillWeight: -1,
		hachureAngle: -41,
		hachureGap: -1,
		dashOffset: -1,
		dashGap: -1,
		zigzagOffset: -1,
		disableMultiStroke: type !== 'double',
		disableMultiStrokeFill: false,
		seed,
		fillShapeRoughnessGain: 1.5,
		preserveVertices: false,
		...overrides,
	};
};

const getCircleItems = (rect: Rect, config: AnnotationConfig) => {
	if (config.type !== 'circle') {
		throw new Error('Not a circle');
	}

	if (config.box === 'inside') {
		const paddedWidth = rect.w + (config.padding.left + config.padding.right);
		const paddedHeight = rect.h + (config.padding.top + config.padding.bottom);
		const x = rect.x - config.padding.left + paddedWidth / 2;
		const y = rect.y - config.padding.top + paddedHeight / 2;
		return {width: paddedWidth, height: paddedHeight, x, y};
	}

	const cx =
		rect.x + rect.w / 2 - config.padding.left / 2 + config.padding.right / 2;
	const cy =
		rect.y + rect.h / 2 - config.padding.top / 2 + config.padding.bottom / 2;

	const width = rect.w + config.padding.left + config.padding.right;
	const height = rect.h + config.padding.top + config.padding.bottom;

	return {
		width: (width / Math.sqrt(2)) * 2,
		height: (height / Math.sqrt(2)) * 2,
		x: cx,
		y: cy,
	};
};

export function getInstructions({
	rect,
	config,
	seed,
	options,
}: {
	readonly rect: Rect;
	readonly config: z.output<typeof annotationConfig>;
	readonly seed: number;
	readonly options: Partial<ResolvedOptions>;
}): {opList: OpSet[]; strokeWidth: number} {
	if (config.type === 'underline') {
		const o = getOptions('single', seed, options);
		const {iterations} = config;
		const rtl = config.rtl ? 1 : 0;
		const opList: OpSet[] = [];
		const y = rect.y + rect.h + config.padding.top;

		for (let i = rtl; i < iterations + rtl; i++) {
			if (i % 2) {
				opList.push(line(rect.x + rect.w, y, rect.x, y, o));
			} else {
				opList.push(line(rect.x, y, rect.x + rect.w, y, o));
			}
		}

		return {opList, strokeWidth: config.strokeWidth};
	}

	if (config.type === 'strike-through') {
		const o = getOptions('single', seed, options);
		const {iterations} = config;
		const rtl = config.rtl ? 1 : 0;
		const opList: OpSet[] = [];
		const y = rect.y + rect.h / 2;

		for (let i = rtl; i < iterations + rtl; i++) {
			if (i % 2) {
				opList.push(line(rect.x + rect.w, y, rect.x, y, o));
			} else {
				opList.push(line(rect.x, y, rect.x + rect.w, y, o));
			}
		}

		return {opList, strokeWidth: config.strokeWidth};
	}

	if (config.type === 'box') {
		const o = getOptions('single', seed, options);
		const {iterations} = config;
		const opList: OpSet[] = [];
		const x = rect.x - config.padding.left;
		const y = rect.y - config.padding.top;
		const width = rect.w + (config.padding.left + config.padding.right);
		const height = rect.h + (config.padding.top + config.padding.bottom);

		for (let i = 0; i < iterations; i++) {
			opList.push(rectangle(x, y, width, height, o));
		}

		return {opList, strokeWidth: config.strokeWidth};
	}

	if (config.type === 'bracket') {
		const o = getOptions('single', seed, options);
		const opList: OpSet[] = [];
		const {brackets} = config;
		const lx = rect.x - config.padding.left * 2;
		const rx = rect.x + rect.w + config.padding.right * 2;
		const ty = rect.y - config.padding.top * 2;
		const by = rect.y + rect.h + config.padding.bottom * 2;

		for (const br of brackets) {
			let points: Point[];
			if (br === 'bottom') {
				points = [
					[lx, rect.y + rect.h],
					[lx, by],
					[rx, by],
					[rx, rect.y + rect.h],
				];
			} else if (br === 'top') {
				points = [
					[lx, rect.y],
					[lx, ty],
					[rx, ty],
					[rx, rect.y],
				];
			} else if (br === 'left') {
				points = [
					[rect.x, ty],
					[lx, ty],
					[lx, by],
					[rect.x, by],
				];
			} else {
				points = [
					[rect.x + rect.w, ty],
					[rx, ty],
					[rx, by],
					[rect.x + rect.w, by],
				];
			}

			opList.push(linearPath(points, false, o));
		}

		return {opList, strokeWidth: config.strokeWidth};
	}

	if (config.type === 'crossed-off') {
		const o = getOptions('single', seed, options);
		const {iterations} = config;
		const rtl = config.rtl ? 1 : 0;
		const opList: OpSet[] = [];
		const {x} = rect;
		const {y} = rect;
		const x2 = x + rect.w;
		const y2 = y + rect.h;

		for (let i = rtl; i < iterations + rtl; i++) {
			if (i % 2) {
				opList.push(line(x2, y2, x, y, o));
			} else {
				opList.push(line(x, y, x2, y2, o));
			}
		}

		for (let i = rtl; i < iterations + rtl; i++) {
			if (i % 2) {
				opList.push(line(x, y2, x2, y, o));
			} else {
				opList.push(line(x2, y, x, y2, o));
			}
		}

		return {opList, strokeWidth: config.strokeWidth};
	}

	if (config.type === 'circle') {
		const o = getOptions('single', seed, options);
		const {iterations} = config;
		const opList: OpSet[] = [];
		const doubleO = getOptions('double', seed, options);
		const fullItr = Math.floor(iterations / 2);
		const singleItr = iterations - fullItr * 2;
		const {width, height, x, y} = getCircleItems(rect, config);

		for (let i = 0; i < fullItr; i++) {
			opList.push(ellipse(x, y, width, height, doubleO));
		}

		for (let i = 0; i < singleItr; i++) {
			opList.push(ellipse(x, y, width, height, o));
		}

		return {opList, strokeWidth: config.strokeWidth};
	}

	if (config.type === 'highlight') {
		const {iterations} = config;
		const rtl = config.rtl ? 1 : 0;
		const opList: OpSet[] = [];
		const y =
			rect.y + rect.h / 2 + (config.padding.bottom - config.padding.top) / 2;

		for (let i = rtl; i < iterations + rtl; i++) {
			const o = getOptions('highlight', seed + i, options);
			if (i % 2) {
				opList.push(
					line(
						rect.x + rect.w + config.padding.right,
						y,
						rect.x - config.padding.left,
						y,
						o,
					),
				);
			} else {
				opList.push(
					line(
						rect.x - config.padding.left,
						y,
						rect.x + rect.w + config.padding.right,
						y,
						o,
					),
				);
			}
		}

		return {
			opList,
			strokeWidth: rect.h + config.padding.top + config.padding.bottom,
		};
	}

	throw new Error(`Unrecognized annotation type: ${config}`);
}

export const renderAnnotation = ({
	rect,
	config,
	seed,
	progress,
	options,
}: {
	readonly rect: Rect;
	readonly config: z.infer<typeof annotationConfig>;
	readonly seed: number;
	readonly progress: number;
	readonly options: Partial<ResolvedOptions>;
}) => {
	const {opList, strokeWidth} = getInstructions({
		config,
		rect,
		seed,
		options,
	});

	const pathStrings = opsToPath(opList);

	return pathStrings.map((d, i) => {
		const isLast = i === pathStrings.length - 1;
		const progressForIteration = Math.max(
			0,
			Math.min(isLast ? Infinity : 1, progress * pathStrings.length - i),
		);
		const {strokeDasharray, strokeDashoffset} = evolvePath(
			progressForIteration,
			d,
		);

		return (
			<path
				key={d}
				d={d}
				fill="none"
				stroke={config.color}
				strokeWidth={strokeWidth}
				strokeDasharray={strokeDasharray}
				strokeDashoffset={strokeDashoffset}
			/>
		);
	});
};
