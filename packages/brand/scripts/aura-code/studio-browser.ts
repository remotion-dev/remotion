import {PageCapture} from '../../../canvas-capture-extension/src/capture';

type StudioTool = {
	readonly name: string;
	readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
};

const tools = new Map<string, StudioTool>();
const call = async (name: string, input: Record<string, unknown>) => {
	const tool = tools.get(name);
	if (!tool) throw new Error(`Studio has not registered ${name}`);
	return tool.execute(input);
};

// The real Studio registers its own tools here. This shim only exposes their
// native implementations to the isolated capture browser.
Object.defineProperty(document, 'modelContext', {
	configurable: true,
	value: {
		registerTool: async (
			tool: StudioTool,
			options: {readonly signal: AbortSignal},
		) => {
			tools.set(tool.name, tool);
			options.signal.addEventListener('abort', () => {
				if (tools.get(tool.name) === tool) tools.delete(tool.name);
			});
		},
	},
});

const inspect = () => {
	const tracks = document.querySelector<HTMLElement>(
		'[data-timeline-scrollable="true"]',
	);
	const timeline = tracks?.closest<HTMLElement>(
		'.__remotion-vertical-scrollbar',
	);
	if (!tracks || !timeline)
		throw new Error('Native Studio timeline is missing');
	const rect = timeline.getBoundingClientRect();
	const crop = {
		left: Math.round(rect.left),
		top: Math.round(rect.top),
		width: Math.round(rect.width),
		height: Math.round(rect.height),
	};
	const canvases = [...timeline.querySelectorAll('canvas')].map((canvas) => {
		const box = canvas.getBoundingClientRect();
		const context = canvas.getContext('2d');
		let hash = 0;
		let occupiedSamples = 0;
		let samples = 0;
		if (context && canvas.width && canvas.height) {
			const {data} = context.getImageData(0, 0, canvas.width, canvas.height);
			for (
				let y = 0;
				y < canvas.height;
				y += Math.max(1, Math.floor(canvas.height / 20))
			) {
				for (
					let x = 0;
					x < canvas.width;
					x += Math.max(1, Math.floor(canvas.width / 100))
				) {
					const offset = (y * canvas.width + x) * 4;
					if (data[offset + 3] !== 0) occupiedSamples++;
					for (let channel = 0; channel < 4; channel++) {
						hash = ((hash * 31) ^ data[offset + channel]) >>> 0;
					}
					samples++;
				}
			}
		}
		return {
			width: canvas.width,
			height: canvas.height,
			cssWidth: box.width,
			cssHeight: box.height,
			x: box.left - rect.left,
			y: box.top - rect.top,
			hash,
			occupiedSamples,
			samples,
		};
	});
	return {
		crop,
		tracks: {
			left: tracks.getBoundingClientRect().left,
			scrollLeft: tracks.scrollLeft,
			scrollTop: timeline.scrollTop,
		},
		text: timeline.innerText,
		rows: [...timeline.querySelectorAll<HTMLElement>('[data-name]')].map(
			(row) => {
				const box = row.getBoundingClientRect();
				return {
					name: row.dataset.name,
					x: box.left - rect.left,
					y: box.top - rect.top,
					width: box.width,
					height: box.height,
				};
			},
		),
		clips: [
			...tracks.querySelectorAll<HTMLElement>('[role="group"][aria-label]'),
		].map((clip) => {
			const box = clip.getBoundingClientRect();
			return {
				name: clip.getAttribute('aria-label'),
				text: clip.innerText,
				x: box.left - rect.left,
				y: box.top - rect.top,
				width: box.width,
				height: box.height,
			};
		}),
		canvases,
		buttons: [...timeline.querySelectorAll('button')].map((button) => ({
			label: button.getAttribute('aria-label'),
			text: button.textContent,
		})),
	};
};

const capture = async (crop: ReturnType<typeof inspect>['crop']) => {
	const pageCapture = new PageCapture({scale: 4, format: 'webm', crop});
	try {
		const blob = await pageCapture.preview();
		return await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result).split(',')[1]);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	} finally {
		pageCapture.restore();
	}
};

declare global {
	interface Window {
		auraTimeline: {
			readonly tools: Map<string, StudioTool>;
			readonly call: typeof call;
			readonly inspect: typeof inspect;
			readonly capture: typeof capture;
		};
	}
}

window.auraTimeline = {tools, call, inspect, capture};
