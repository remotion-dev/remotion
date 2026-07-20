type FigmaVector = {
	x: number;
	y: number;
};

type FigmaGuid = {
	sessionID?: number;
	localID?: number;
};

type FigmaColor = {
	r?: number;
	g?: number;
	b?: number;
	a?: number;
};

type FigmaPaint = {
	type?: string;
	color?: FigmaColor;
	opacity?: number;
	visible?: boolean;
	blendMode?: string;
};

type FigmaTransform = {
	m00?: number;
	m01?: number;
	m02?: number;
	m10?: number;
	m11?: number;
	m12?: number;
};

export type FigmaNode = {
	guid?: FigmaGuid;
	phase?: string;
	parentIndex?: {
		guid?: FigmaGuid;
		position?: string;
	};
	type?: string;
	name?: string;
	visible?: boolean;
	opacity?: number;
	blendMode?: string;
	size?: FigmaVector;
	transform?: FigmaTransform;
	mask?: boolean;
	maskType?: string;
	maskIsOutline?: boolean;
	fillPaints?: FigmaPaint[];
	backgroundPaints?: FigmaPaint[];
	strokePaints?: FigmaPaint[];
	strokeWeight?: number;
	strokeAlign?: string;
	strokeCap?: string;
	strokeJoin?: string;
	dashPattern?: number[];
	miterLimit?: number;
	cornerRadius?: number;
	cornerSmoothing?: number;
	rectangleTopLeftCornerRadius?: number;
	rectangleTopRightCornerRadius?: number;
	rectangleBottomLeftCornerRadius?: number;
	rectangleBottomRightCornerRadius?: number;
	rectangleCornerRadiiIndependent?: boolean;
	frameMaskDisabled?: boolean;
	resizeToFit?: boolean;
	effects?: Array<{visible?: boolean}>;
	vectorData?: {
		vectorNetworkBlob?: number;
		normalizedSize?: FigmaVector;
	};
};

export type FigmaMessage = {
	type?: string;
	nodeChanges?: FigmaNode[];
	blobs?: Array<{bytes?: Uint8Array}>;
};

type VectorVertex = FigmaVector;

type VectorSegment = {
	start: number;
	end: number;
	tangentStart: FigmaVector;
	tangentEnd: FigmaVector;
};

type VectorRegion = {
	windingRule: 'evenodd' | 'nonzero';
	loops: number[][];
};

type VectorNetwork = {
	vertices: VectorVertex[];
	segments: VectorSegment[];
	regions: VectorRegion[];
};

type Scene = {
	root: FigmaNode;
	children: Map<FigmaNode, FigmaNode[]>;
	blobs: Uint8Array[];
};

type RenderContext = {
	defs: string[];
	nextId: number;
	renderingAlphaMask: number;
	renderingDepth: number;
	scene: Scene;
};

const maxVectorItems = 100_000;
const maxRenderingDepth = 256;
const supportedContainers = new Set(['FRAME', 'GROUP']);

const fail = (message: string): never => {
	throw new Error(`Cannot import Figma selection: ${message}`);
};

const guidKey = (guid: FigmaGuid | undefined): string | null => {
	if (
		guid === undefined ||
		!Number.isInteger(guid.sessionID) ||
		!Number.isInteger(guid.localID)
	) {
		return null;
	}

	return `${guid.sessionID}:${guid.localID}`;
};

const nodeLabel = (node: FigmaNode) => {
	return node.name ? `“${node.name}”` : (node.type ?? 'unknown node');
};

const finiteNumber = ({
	fallback,
	label,
	value,
}: {
	fallback: number;
	label: string;
	value: number | undefined;
}) => {
	const resolved = value ?? fallback;
	if (!Number.isFinite(resolved)) {
		fail(`${label} is not finite`);
	}

	return resolved;
};

const unitInterval = ({
	fallback,
	label,
	value,
}: {
	fallback: number;
	label: string;
	value: number | undefined;
}) => {
	const resolved = finiteNumber({fallback, label, value});
	if (resolved < 0 || resolved > 1) {
		fail(`${label} must be between 0 and 1`);
	}

	return resolved;
};

const formatNumber = (value: number) => {
	const normalized = Math.abs(value) < 0.000_000_5 ? 0 : value;
	return normalized
		.toFixed(6)
		.replace(/\.0+$/, '')
		.replace(/(\.\d*?)0+$/, '$1');
};

const escapeAttribute = (value: string) => {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
};

const readCount = ({
	data,
	label,
	offset,
	view,
}: {
	data: Uint8Array;
	label: string;
	offset: number;
	view: DataView;
}) => {
	if (offset + 4 > data.length) {
		fail(`vector geometry ended while reading ${label}`);
	}

	const count = view.getUint32(offset, true);
	if (count > maxVectorItems) {
		fail(`vector geometry has too many ${label}`);
	}

	return count;
};

const readFloat = ({
	data,
	label,
	offset,
	view,
}: {
	data: Uint8Array;
	label: string;
	offset: number;
	view: DataView;
}) => {
	if (offset + 4 > data.length) {
		fail(`vector geometry ended while reading ${label}`);
	}

	const value = view.getFloat32(offset, true);
	if (!Number.isFinite(value)) {
		fail(`vector geometry contains an invalid ${label}`);
	}

	return value;
};

export const decodeFigmaVectorNetwork = (data: Uint8Array): VectorNetwork => {
	if (data.length < 12) {
		fail('vector geometry is truncated');
	}

	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	const vertexCount = readCount({
		data,
		label: 'vertices',
		offset: 0,
		view,
	});
	const segmentCount = readCount({
		data,
		label: 'segments',
		offset: 4,
		view,
	});
	const regionCount = readCount({
		data,
		label: 'regions',
		offset: 8,
		view,
	});
	let itemCount = vertexCount + segmentCount + regionCount;
	const countItems = (count: number) => {
		if (count > maxVectorItems - itemCount) {
			fail('vector geometry has too many items');
		}

		itemCount += count;
	};

	if (itemCount > maxVectorItems) {
		fail('vector geometry has too many items');
	}

	const fixedLength = 12 + vertexCount * 12 + segmentCount * 28;
	if (fixedLength > data.length) {
		fail('vector geometry is truncated');
	}

	let offset = 12;
	const vertices: VectorVertex[] = [];
	for (let index = 0; index < vertexCount; index++) {
		offset += 4;
		const x = readFloat({data, label: 'vertex x', offset, view});
		offset += 4;
		const y = readFloat({data, label: 'vertex y', offset, view});
		offset += 4;
		vertices.push({x, y});
	}

	const segments: VectorSegment[] = [];
	for (let index = 0; index < segmentCount; index++) {
		offset += 4;
		const start = view.getUint32(offset, true);
		offset += 4;
		const tangentStartX = readFloat({
			data,
			label: 'start tangent x',
			offset,
			view,
		});
		offset += 4;
		const tangentStartY = readFloat({
			data,
			label: 'start tangent y',
			offset,
			view,
		});
		offset += 4;
		const end = view.getUint32(offset, true);
		offset += 4;
		const tangentEndX = readFloat({
			data,
			label: 'end tangent x',
			offset,
			view,
		});
		offset += 4;
		const tangentEndY = readFloat({
			data,
			label: 'end tangent y',
			offset,
			view,
		});
		offset += 4;
		if (start >= vertices.length || end >= vertices.length) {
			fail('vector geometry references a missing vertex');
		}

		segments.push({
			start,
			end,
			tangentStart: {x: tangentStartX, y: tangentStartY},
			tangentEnd: {x: tangentEndX, y: tangentEndY},
		});
	}

	const regions: VectorRegion[] = [];
	for (let regionIndex = 0; regionIndex < regionCount; regionIndex++) {
		if (offset + 8 > data.length) {
			fail('vector region is truncated');
		}

		const windingRuleValue = view.getUint32(offset, true);
		offset += 4;
		if (windingRuleValue !== 0 && windingRuleValue !== 1) {
			fail('vector geometry has an unknown winding rule');
		}

		const loopCount = readCount({
			data,
			label: 'region loops',
			offset,
			view,
		});
		countItems(loopCount);
		offset += 4;
		const loops: number[][] = [];
		for (let loopIndex = 0; loopIndex < loopCount; loopIndex++) {
			const segmentIndexCount = readCount({
				data,
				label: 'loop segments',
				offset,
				view,
			});
			countItems(segmentIndexCount);
			offset += 4;
			if (offset + segmentIndexCount * 4 > data.length) {
				fail('vector loop is truncated');
			}

			const loop: number[] = [];
			for (let index = 0; index < segmentIndexCount; index++) {
				const segmentIndex = view.getUint32(offset, true);
				offset += 4;
				if (segmentIndex >= segments.length) {
					fail('vector loop references a missing segment');
				}

				loop.push(segmentIndex);
			}

			loops.push(loop);
		}

		regions.push({
			windingRule: windingRuleValue === 1 ? 'evenodd' : 'nonzero',
			loops,
		});
	}

	if (offset !== data.length) {
		fail('vector geometry uses a newer unsupported format');
	}

	return {vertices, segments, regions};
};

const segmentCommand = ({
	network,
	reversed,
	segment,
}: {
	network: VectorNetwork;
	reversed: boolean;
	segment: VectorSegment;
}) => {
	const originalStart = network.vertices[segment.start];
	const originalEnd = network.vertices[segment.end];
	const end = reversed ? originalStart : originalEnd;
	const control1 = reversed
		? {
				x: originalEnd.x + segment.tangentEnd.x,
				y: originalEnd.y + segment.tangentEnd.y,
			}
		: {
				x: originalStart.x + segment.tangentStart.x,
				y: originalStart.y + segment.tangentStart.y,
			};
	const control2 = reversed
		? {
				x: originalStart.x + segment.tangentStart.x,
				y: originalStart.y + segment.tangentStart.y,
			}
		: {
				x: originalEnd.x + segment.tangentEnd.x,
				y: originalEnd.y + segment.tangentEnd.y,
			};
	const hasCurve =
		segment.tangentStart.x !== 0 ||
		segment.tangentStart.y !== 0 ||
		segment.tangentEnd.x !== 0 ||
		segment.tangentEnd.y !== 0;

	if (!hasCurve) {
		return `L ${formatNumber(end.x)} ${formatNumber(end.y)}`;
	}

	return `C ${formatNumber(control1.x)} ${formatNumber(control1.y)} ${formatNumber(control2.x)} ${formatNumber(control2.y)} ${formatNumber(end.x)} ${formatNumber(end.y)}`;
};

const buildOrderedPath = ({
	close,
	network,
	segmentIndices,
}: {
	close: boolean;
	network: VectorNetwork;
	segmentIndices: number[];
}): string | null => {
	if (segmentIndices.length === 0) {
		return null;
	}

	for (const reverseFirst of [false, true]) {
		const firstSegment = network.segments[segmentIndices[0]];
		const startIndex = reverseFirst ? firstSegment.end : firstSegment.start;
		let endIndex = reverseFirst ? firstSegment.start : firstSegment.end;
		const start = network.vertices[startIndex];
		const commands = [
			`M ${formatNumber(start.x)} ${formatNumber(start.y)}`,
			segmentCommand({
				network,
				reversed: reverseFirst,
				segment: firstSegment,
			}),
		];
		let valid = true;
		for (let index = 1; index < segmentIndices.length; index++) {
			const segment = network.segments[segmentIndices[index]];
			const reversed = segment.end === endIndex;
			if (segment.start !== endIndex && !reversed) {
				valid = false;
				break;
			}

			commands.push(segmentCommand({network, reversed, segment}));
			endIndex = reversed ? segment.start : segment.end;
		}

		if (valid && (!close || endIndex === startIndex)) {
			if (close) {
				commands.push('Z');
			}

			return commands.join(' ');
		}
	}

	return null;
};

const traceNetworkPaths = (network: VectorNetwork) => {
	const degree = Array.from({length: network.vertices.length}, () => 0);
	for (const segment of network.segments) {
		degree[segment.start]++;
		degree[segment.end]++;
	}

	if (degree.some((value) => value > 2)) {
		fail('branched vector networks are not supported yet');
	}

	const unvisited = new Set(network.segments.map((_, index) => index));
	const paths: Array<{closed: boolean; d: string}> = [];
	while (unvisited.size > 0) {
		let firstIndex = unvisited.values().next().value as number;
		for (const candidate of unvisited) {
			const segment = network.segments[candidate];
			if (degree[segment.start] === 1 || degree[segment.end] === 1) {
				firstIndex = candidate;
				break;
			}
		}

		const first = network.segments[firstIndex];
		const reverseFirst = degree[first.end] === 1 && degree[first.start] !== 1;
		const startIndex = reverseFirst ? first.end : first.start;
		let endIndex = reverseFirst ? first.start : first.end;
		const start = network.vertices[startIndex];
		const commands = [
			`M ${formatNumber(start.x)} ${formatNumber(start.y)}`,
			segmentCommand({network, reversed: reverseFirst, segment: first}),
		];
		unvisited.delete(firstIndex);

		while (true) {
			let nextIndex: number | null = null;
			for (const candidate of unvisited) {
				const candidateSegment = network.segments[candidate];
				if (
					candidateSegment.start === endIndex ||
					candidateSegment.end === endIndex
				) {
					nextIndex = candidate;
					break;
				}
			}

			if (nextIndex === null) {
				break;
			}

			const segment = network.segments[nextIndex];
			const reversed = segment.end === endIndex;
			commands.push(segmentCommand({network, reversed, segment}));
			endIndex = reversed ? segment.start : segment.end;
			unvisited.delete(nextIndex);
		}

		const closed = endIndex === startIndex;
		if (closed) {
			commands.push('Z');
		}

		paths.push({closed, d: commands.join(' ')});
	}

	return paths;
};

const getVisiblePaint = ({
	kind,
	node,
	paints,
}: {
	kind: 'fill' | 'stroke';
	node: FigmaNode;
	paints: FigmaPaint[] | undefined;
}): FigmaPaint | null => {
	const visible = (paints ?? []).filter(
		(candidatePaint) => candidatePaint.visible !== false,
	);
	if (visible.length > 1) {
		fail(`${nodeLabel(node)} has multiple visible ${kind}s`);
	}

	const paint = visible[0];
	if (paint === undefined) {
		return null;
	}

	if (paint.type !== 'SOLID' || paint.color === undefined) {
		fail(`${nodeLabel(node)} uses an unsupported ${kind} type`);
	}

	if (paint.blendMode !== undefined && paint.blendMode !== 'NORMAL') {
		fail(`${nodeLabel(node)} uses an unsupported ${kind} blend mode`);
	}

	return paint;
};

const getPaintAttributes = ({
	forceWhite,
	kind,
	paint,
}: {
	forceWhite: boolean;
	kind: 'fill' | 'stroke';
	paint: FigmaPaint;
}) => {
	const color = paint.color as FigmaColor;
	const r = Math.round(
		unitInterval({fallback: 0, label: `${kind} red`, value: color.r}) * 255,
	);
	const g = Math.round(
		unitInterval({fallback: 0, label: `${kind} green`, value: color.g}) * 255,
	);
	const b = Math.round(
		unitInterval({fallback: 0, label: `${kind} blue`, value: color.b}) * 255,
	);
	const alpha =
		unitInterval({fallback: 1, label: `${kind} alpha`, value: color.a}) *
		unitInterval({
			fallback: 1,
			label: `${kind} opacity`,
			value: paint.opacity,
		});
	const hex = forceWhite
		? '#ffffff'
		: `#${r.toString(16).padStart(2, '0')}${g
				.toString(16)
				.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	const attributes = [`${kind}="${hex}"`];
	if (alpha < 1) {
		attributes.push(`${kind}-opacity="${formatNumber(alpha)}"`);
	}

	return attributes;
};

const getTransform = (node: FigmaNode) => {
	const {transform} = node;
	const values = {
		m00: finiteNumber({
			fallback: 1,
			label: `${nodeLabel(node)} transform`,
			value: transform?.m00,
		}),
		m01: finiteNumber({
			fallback: 0,
			label: `${nodeLabel(node)} transform`,
			value: transform?.m01,
		}),
		m02: finiteNumber({
			fallback: 0,
			label: `${nodeLabel(node)} transform`,
			value: transform?.m02,
		}),
		m10: finiteNumber({
			fallback: 0,
			label: `${nodeLabel(node)} transform`,
			value: transform?.m10,
		}),
		m11: finiteNumber({
			fallback: 1,
			label: `${nodeLabel(node)} transform`,
			value: transform?.m11,
		}),
		m12: finiteNumber({
			fallback: 0,
			label: `${nodeLabel(node)} transform`,
			value: transform?.m12,
		}),
	};
	const identity =
		values.m00 === 1 &&
		values.m01 === 0 &&
		values.m02 === 0 &&
		values.m10 === 0 &&
		values.m11 === 1 &&
		values.m12 === 0;
	return {
		identity,
		value: `matrix(${formatNumber(values.m00)} ${formatNumber(values.m10)} ${formatNumber(values.m01)} ${formatNumber(values.m11)} ${formatNumber(values.m02)} ${formatNumber(values.m12)})`,
	};
};

const getNodeSize = (node: FigmaNode) => {
	const width = finiteNumber({
		fallback: 0,
		label: `${nodeLabel(node)} width`,
		value: node.size?.x,
	});
	const height = finiteNumber({
		fallback: 0,
		label: `${nodeLabel(node)} height`,
		value: node.size?.y,
	});
	if (width < 0 || height < 0) {
		fail(`${nodeLabel(node)} has negative dimensions`);
	}

	return {height, width};
};

const getCornerRadius = (node: FigmaNode) => {
	const cornerSmoothing = finiteNumber({
		fallback: 0,
		label: `${nodeLabel(node)} corner smoothing`,
		value: node.cornerSmoothing,
	});
	if (cornerSmoothing !== 0) {
		fail(`${nodeLabel(node)} uses unsupported corner smoothing`);
	}

	const independentRadii = [
		node.rectangleTopLeftCornerRadius,
		node.rectangleTopRightCornerRadius,
		node.rectangleBottomRightCornerRadius,
		node.rectangleBottomLeftCornerRadius,
	].map((value) =>
		finiteNumber({
			fallback: 0,
			label: `${nodeLabel(node)} corner radius`,
			value,
		}),
	);
	if (
		node.rectangleCornerRadiiIndependent === true &&
		independentRadii.some((corner) => corner !== 0)
	) {
		fail(`${nodeLabel(node)} uses independent corner radii`);
	}

	const radius = finiteNumber({
		fallback: 0,
		label: `${nodeLabel(node)} corner radius`,
		value: node.cornerRadius,
	});
	if (radius < 0) {
		fail(`${nodeLabel(node)} has a negative corner radius`);
	}

	if (independentRadii.some((corner) => corner < 0)) {
		fail(`${nodeLabel(node)} has a negative corner radius`);
	}

	return radius;
};

const renderFrameShape = ({
	context,
	node,
}: {
	context: RenderContext;
	node: FigmaNode;
}) => {
	const fill = getVisiblePaint({kind: 'fill', node, paints: node.fillPaints});
	const stroke = getVisiblePaint({
		kind: 'stroke',
		node,
		paints: node.strokePaints,
	});
	if (fill === null && stroke === null) {
		return '';
	}

	const {height, width} = getNodeSize(node);
	const radius = getCornerRadius(node);
	const attributes = [
		'x="0"',
		'y="0"',
		`width="${formatNumber(width)}"`,
		`height="${formatNumber(height)}"`,
	];
	if (radius > 0) {
		attributes.push(`rx="${formatNumber(radius)}"`);
	}

	if (fill) {
		attributes.push(
			...getPaintAttributes({
				forceWhite: context.renderingAlphaMask > 0,
				kind: 'fill',
				paint: fill,
			}),
		);
	} else {
		attributes.push('fill="none"');
	}

	if (stroke) {
		if (node.strokeAlign !== undefined && node.strokeAlign !== 'CENTER') {
			fail(`${nodeLabel(node)} uses non-centered frame strokes`);
		}

		const strokeWidth = finiteNumber({
			fallback: 1,
			label: `${nodeLabel(node)} stroke width`,
			value: node.strokeWeight,
		});
		if (strokeWidth < 0) {
			fail(`${nodeLabel(node)} has a negative stroke width`);
		}

		attributes.push(
			...getPaintAttributes({
				forceWhite: context.renderingAlphaMask > 0,
				kind: 'stroke',
				paint: stroke,
			}),
			`stroke-width="${formatNumber(strokeWidth)}"`,
		);
		if (node.dashPattern && node.dashPattern.length > 0) {
			const dashes = node.dashPattern.map((dash) =>
				finiteNumber({
					fallback: 0,
					label: `${nodeLabel(node)} stroke dash`,
					value: dash,
				}),
			);
			if (dashes.some((dash) => dash < 0)) {
				fail(`${nodeLabel(node)} has a negative stroke dash`);
			}

			attributes.push(
				`stroke-dasharray="${dashes.map(formatNumber).join(' ')}"`,
			);
		}

		const miterLimit = finiteNumber({
			fallback: 4,
			label: `${nodeLabel(node)} miter limit`,
			value: node.miterLimit,
		});
		if (miterLimit <= 0) {
			fail(`${nodeLabel(node)} has an invalid miter limit`);
		}

		if (miterLimit !== 4) {
			attributes.push(`stroke-miterlimit="${formatNumber(miterLimit)}"`);
		}
	}

	return `<rect ${attributes.join(' ')} />`;
};

const getVectorNetwork = ({
	context,
	node,
}: {
	context: RenderContext;
	node: FigmaNode;
}) => {
	const blobIndex = node.vectorData?.vectorNetworkBlob;
	if (typeof blobIndex !== 'number' || !Number.isInteger(blobIndex)) {
		fail(`${nodeLabel(node)} has no supported vector geometry`);
	}

	const blob = context.scene.blobs[blobIndex as number];
	if (blob === undefined) {
		fail(`${nodeLabel(node)} references missing vector geometry`);
	}

	const network = decodeFigmaVectorNetwork(blob);
	const normalizedSize = node.vectorData?.normalizedSize;
	const {height, width} = getNodeSize(node);
	if (normalizedSize !== undefined) {
		const normalizedWidth = finiteNumber({
			fallback: width,
			label: `${nodeLabel(node)} normalized width`,
			value: normalizedSize.x,
		});
		const normalizedHeight = finiteNumber({
			fallback: height,
			label: `${nodeLabel(node)} normalized height`,
			value: normalizedSize.y,
		});
		const scaleX = normalizedWidth === 0 ? 1 : width / normalizedWidth;
		const scaleY = normalizedHeight === 0 ? 1 : height / normalizedHeight;
		if (scaleX !== 1 || scaleY !== 1) {
			for (const vertex of network.vertices) {
				vertex.x *= scaleX;
				vertex.y *= scaleY;
			}

			for (const segment of network.segments) {
				segment.tangentStart.x *= scaleX;
				segment.tangentStart.y *= scaleY;
				segment.tangentEnd.x *= scaleX;
				segment.tangentEnd.y *= scaleY;
			}
		}
	}

	return network;
};

const getFillPaths = (network: VectorNetwork) => {
	if (network.regions.length === 0) {
		return [
			{
				d: traceNetworkPaths(network)
					.map(({closed, d}) => (closed ? d : `${d} Z`))
					.join(' '),
				windingRule: 'nonzero' as const,
			},
		];
	}

	return network.regions.map((region) => {
		const paths = region.loops.map((loop) => {
			const path = buildOrderedPath({
				close: true,
				network,
				segmentIndices: loop,
			});
			if (path === null) {
				fail('a vector fill loop is disconnected');
			}

			return path;
		});
		return {d: paths.join(' '), windingRule: region.windingRule};
	});
};

const renderVector = ({
	context,
	node,
}: {
	context: RenderContext;
	node: FigmaNode;
}) => {
	const fill = getVisiblePaint({kind: 'fill', node, paints: node.fillPaints});
	const stroke = getVisiblePaint({
		kind: 'stroke',
		node,
		paints: node.strokePaints,
	});
	if (fill === null && stroke === null) {
		return '';
	}

	const network = getVectorNetwork({context, node});
	const paths: string[] = [];
	if (fill) {
		for (const fillPath of getFillPaths(network)) {
			paths.push(
				`<path d="${escapeAttribute(fillPath.d)}" ${getPaintAttributes({forceWhite: context.renderingAlphaMask > 0, kind: 'fill', paint: fill}).join(' ')} fill-rule="${fillPath.windingRule}" />`,
			);
		}
	}

	if (stroke) {
		if (node.strokeAlign !== undefined && node.strokeAlign !== 'CENTER') {
			fail(`${nodeLabel(node)} uses non-centered vector strokes`);
		}

		const strokeWidth = finiteNumber({
			fallback: 1,
			label: `${nodeLabel(node)} stroke width`,
			value: node.strokeWeight,
		});
		if (strokeWidth < 0) {
			fail(`${nodeLabel(node)} has a negative stroke width`);
		}

		const cap =
			node.strokeCap === undefined || node.strokeCap === 'NONE'
				? 'butt'
				: node.strokeCap === 'ROUND'
					? 'round'
					: node.strokeCap === 'SQUARE'
						? 'square'
						: null;
		if (cap === null) {
			fail(`${nodeLabel(node)} uses an unsupported stroke cap`);
		}

		const join =
			node.strokeJoin === undefined || node.strokeJoin === 'MITER'
				? 'miter'
				: node.strokeJoin === 'ROUND'
					? 'round'
					: node.strokeJoin === 'BEVEL'
						? 'bevel'
						: null;
		if (join === null) {
			fail(`${nodeLabel(node)} uses an unsupported stroke join`);
		}

		const miterLimit = finiteNumber({
			fallback: 4,
			label: `${nodeLabel(node)} miter limit`,
			value: node.miterLimit,
		});
		if (miterLimit <= 0) {
			fail(`${nodeLabel(node)} has an invalid miter limit`);
		}

		const strokePaths = traceNetworkPaths(network);
		for (const {d} of strokePaths) {
			const attributes = [
				`d="${escapeAttribute(d)}"`,
				'fill="none"',
				...getPaintAttributes({
					forceWhite: context.renderingAlphaMask > 0,
					kind: 'stroke',
					paint: stroke,
				}),
				`stroke-width="${formatNumber(strokeWidth)}"`,
				`stroke-linecap="${cap}"`,
				`stroke-linejoin="${join}"`,
			];
			if (miterLimit !== 4) {
				attributes.push(`stroke-miterlimit="${formatNumber(miterLimit)}"`);
			}

			if (node.dashPattern && node.dashPattern.length > 0) {
				const dashes = node.dashPattern.map((dash) =>
					finiteNumber({
						fallback: 0,
						label: `${nodeLabel(node)} stroke dash`,
						value: dash,
					}),
				);
				if (dashes.some((dash) => dash < 0)) {
					fail(`${nodeLabel(node)} has a negative stroke dash`);
				}

				attributes.push(
					`stroke-dasharray="${dashes.map(formatNumber).join(' ')}"`,
				);
			}

			paths.push(`<path ${attributes.join(' ')} />`);
		}
	}

	return paths.join('\n');
};

const validateNodeFeatures = (node: FigmaNode) => {
	if (
		node.maskIsOutline === true ||
		node.backgroundPaints?.some((paint) => paint.visible !== false) ||
		node.effects?.some((effect) => effect.visible !== false) ||
		(node.blendMode !== undefined &&
			node.blendMode !== 'NORMAL' &&
			node.blendMode !== 'PASS_THROUGH')
	) {
		fail(`${nodeLabel(node)} uses unsupported effects or blending`);
	}

	unitInterval({
		fallback: 1,
		label: `${nodeLabel(node)} opacity`,
		value: node.opacity,
	});
};

const renderChildren = ({
	context,
	node,
}: {
	context: RenderContext;
	node: FigmaNode;
}) => {
	const children = context.scene.children.get(node) ?? [];
	const output: string[] = [];
	let activeMask: {id: string; parts: string[]} | null = null;
	const flushMask = () => {
		if (activeMask === null) {
			return;
		}

		output.push(
			`<g mask="url(#${activeMask.id})">${activeMask.parts.join('\n')}</g>`,
		);
		activeMask = null;
	};

	for (const child of children) {
		if (child.mask === true) {
			flushMask();
			if (child.maskType !== undefined && child.maskType !== 'ALPHA') {
				fail(`${nodeLabel(child)} uses an unsupported mask type`);
			}

			const id = `figma-mask-${context.nextId++}`;
			const {height, width} = getNodeSize(node);
			// SVG masks default to luminance in some renderers. Painting an alpha
			// mask white preserves Figma's alpha semantics everywhere.
			context.renderingAlphaMask++;
			let maskMarkup: string;
			try {
				maskMarkup = renderNode({
					context,
					includeTransform: true,
					node: child,
				});
			} finally {
				context.renderingAlphaMask--;
			}

			context.defs.push(
				`<mask id="${id}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${formatNumber(width)}" height="${formatNumber(height)}">${maskMarkup}</mask>`,
			);
			activeMask = {id, parts: []};
			continue;
		}

		const markup = renderNode({
			context,
			includeTransform: true,
			node: child,
		});
		if (activeMask) {
			activeMask.parts.push(markup);
		} else {
			output.push(markup);
		}
	}

	flushMask();
	return output.join('\n');
};

const renderContainerChildren = ({
	childrenMarkup,
	context,
	node,
}: {
	childrenMarkup: string;
	context: RenderContext;
	node: FigmaNode;
}) => {
	if (
		childrenMarkup === '' ||
		node.frameMaskDisabled !== false ||
		// Figma serializes auto-bounds groups as frames with resizeToFit. Their
		// bounds describe their children; they are not clipping rectangles.
		node.resizeToFit === true
	) {
		return childrenMarkup;
	}

	const {height, width} = getNodeSize(node);
	if (width === 0 || height === 0) {
		return childrenMarkup;
	}

	const id = `figma-clip-${context.nextId++}`;
	const radius = getCornerRadius(node);
	context.defs.push(
		`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect x="0" y="0" width="${formatNumber(width)}" height="${formatNumber(height)}"${radius > 0 ? ` rx="${formatNumber(radius)}"` : ''} /></clipPath>`,
	);
	return `<g clip-path="url(#${id})">${childrenMarkup}</g>`;
};

const renderNode = ({
	context,
	includeTransform,
	node,
}: {
	context: RenderContext;
	includeTransform: boolean;
	node: FigmaNode;
}): string => {
	if (node.visible === false) {
		return '';
	}

	if (context.renderingDepth >= maxRenderingDepth) {
		fail('clipboard scene is nested too deeply');
	}

	context.renderingDepth++;
	try {
		validateNodeFeatures(node);
		let content = '';
		if (supportedContainers.has(node.type ?? '')) {
			const childrenMarkup = renderContainerChildren({
				childrenMarkup: renderChildren({context, node}),
				context,
				node,
			});
			content = [renderFrameShape({context, node}), childrenMarkup]
				.filter(Boolean)
				.join('\n');
		} else if (node.type === 'VECTOR') {
			if ((context.scene.children.get(node) ?? []).length > 0) {
				fail(`${nodeLabel(node)} has unsupported nested content`);
			}

			content = renderVector({context, node});
		} else {
			fail(`${nodeLabel(node)} has unsupported type ${node.type ?? 'UNKNOWN'}`);
		}

		const opacity = unitInterval({
			fallback: 1,
			label: `${nodeLabel(node)} opacity`,
			value: node.opacity,
		});
		if (opacity < 1 && content !== '') {
			content = `<g opacity="${formatNumber(opacity)}">${content}</g>`;
		}

		if (includeTransform && content !== '') {
			const transform = getTransform(node);
			if (!transform.identity) {
				content = `<g transform="${transform.value}">${content}</g>`;
			}
		}

		return content;
	} finally {
		context.renderingDepth--;
	}
};

const buildScene = ({
	message,
	selectedNodeId,
}: {
	message: FigmaMessage;
	selectedNodeId: string;
}): Scene => {
	if (message.type !== 'NODE_CHANGES') {
		fail('clipboard data is not a Figma scene');
	}

	const {blobs: messageBlobs, nodeChanges} = message;
	if (!Array.isArray(nodeChanges) || !Array.isArray(messageBlobs)) {
		fail('Pasting images from Figma is not supported');
	}

	const validNodeChanges = nodeChanges as FigmaNode[];
	const validMessageBlobs = messageBlobs as Array<{bytes?: Uint8Array}>;

	const nodesById = new Map<string, FigmaNode>();
	const orderByNode = new Map<FigmaNode, number>();
	for (let index = 0; index < validNodeChanges.length; index++) {
		const change = validNodeChanges[index];
		const key = guidKey(change.guid);
		if (key === null) {
			continue;
		}

		if (change.phase === 'DELETED') {
			nodesById.delete(key);
			continue;
		}

		const previous = nodesById.get(key);
		const node = previous ? {...previous, ...change} : change;
		nodesById.set(key, node);
		orderByNode.set(node, index);
	}

	const root =
		nodesById.get(selectedNodeId) ??
		fail('the selected Figma node is missing from the clipboard');

	const children = new Map<FigmaNode, FigmaNode[]>();
	for (const node of nodesById.values()) {
		const parentKey = guidKey(node.parentIndex?.guid);
		const parent = parentKey ? nodesById.get(parentKey) : undefined;
		if (parent === undefined) {
			continue;
		}

		const siblings = children.get(parent) ?? [];
		siblings.push(node);
		children.set(parent, siblings);
	}

	for (const siblings of children.values()) {
		siblings.sort((left, right) => {
			const leftPosition = left.parentIndex?.position ?? '';
			const rightPosition = right.parentIndex?.position ?? '';
			const positionDifference =
				leftPosition < rightPosition
					? -1
					: leftPosition > rightPosition
						? 1
						: 0;
			return (
				positionDifference ||
				(orderByNode.get(left) ?? 0) - (orderByNode.get(right) ?? 0)
			);
		});
	}

	const blobs = validMessageBlobs.map((blob) => {
		const {bytes} = blob;
		if (!(bytes instanceof Uint8Array)) {
			fail('clipboard scene contains an invalid geometry blob');
		}

		return bytes as Uint8Array;
	});
	return {blobs, children, root};
};

export const renderFigmaMessageToSvg = ({
	message,
	selectedNodeId,
}: {
	message: FigmaMessage;
	selectedNodeId: string;
}) => {
	const scene = buildScene({message, selectedNodeId});
	const {height, width} = getNodeSize(scene.root);
	if (width <= 0 || height <= 0) {
		fail('the selected node has empty bounds');
	}

	const context: RenderContext = {
		defs: [],
		nextId: 0,
		renderingAlphaMask: 0,
		renderingDepth: 0,
		scene,
	};
	const content = renderNode({
		context,
		includeTransform: false,
		node: scene.root,
	});
	if (content === '') {
		fail('the selected node has no visible supported content');
	}

	const defs =
		context.defs.length === 0
			? ''
			: `<defs>\n${context.defs.join('\n')}\n</defs>\n`;
	return {
		height,
		svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${formatNumber(width)}" height="${formatNumber(height)}" viewBox="0 0 ${formatNumber(width)} ${formatNumber(height)}">\n${defs}${content}\n</svg>`,
		width,
	};
};
