import {defineUnlistedScript} from 'wxt/utils/define-unlisted-script';
import {shotRequestEvent, shotResponseEvent, shotTools} from '../shot-tools';

type ModelContext = {
	readonly registerTool: (
		tool: (typeof shotTools)[number] & {
			readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
		},
		options: {readonly signal: AbortSignal},
	) => Promise<void>;
};

export default defineUnlistedScript(() => {
	const {modelContext} = document as Document & {
		readonly modelContext: ModelContext | undefined;
	};
	if (typeof modelContext?.registerTool !== 'function') {
		return;
	}

	const toolsWindow = window as unknown as Window & {
		__remotionCanvasCaptureTools: AbortController | undefined;
	};
	if (toolsWindow.__remotionCanvasCaptureTools) {
		return;
	}

	const controller = new AbortController();
	toolsWindow.__remotionCanvasCaptureTools = controller;
	Promise.all(
		shotTools.map((tool) =>
			modelContext.registerTool(
				{
					...tool,
					execute: (input) =>
						new Promise((resolve, reject) => {
							const id = crypto.randomUUID();
							let timeout = 0;
							const onResponse = (event: Event) => {
								if (
									!(event instanceof CustomEvent) ||
									typeof event.detail !== 'string'
								) {
									return;
								}

								let response;
								try {
									response = JSON.parse(event.detail);
								} catch {
									return;
								}

								if (response?.id !== id) {
									return;
								}

								clearTimeout(timeout);
								document.removeEventListener(shotResponseEvent, onResponse);
								if (typeof response.error === 'string') {
									reject(new Error(response.error));
								} else {
									resolve(response.result);
								}
							};

							timeout = window.setTimeout(() => {
								document.removeEventListener(shotResponseEvent, onResponse);
								reject(
									new Error(
										'Canvas Capture did not respond. Reopen the extension controls and retry.',
									),
								);
							}, 30_000);
							document.addEventListener(shotResponseEvent, onResponse);
							document.dispatchEvent(
								new CustomEvent(shotRequestEvent, {
									detail: JSON.stringify({id, name: tool.name, input}),
								}),
							);
						}),
				},
				{signal: controller.signal},
			),
		),
	).catch((error) => {
		controller.abort();
		toolsWindow.__remotionCanvasCaptureTools = undefined;
		// eslint-disable-next-line no-console -- Surface tool registration failures in DevTools.
		console.error(
			'[Remotion Canvas Capture] Could not register shot tools',
			error,
		);
	});
});
