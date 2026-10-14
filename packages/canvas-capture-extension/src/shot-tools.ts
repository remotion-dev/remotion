export const shotRequestEvent = 'remotion-canvas-capture-shot-request';
export const shotResponseEvent = 'remotion-canvas-capture-shot-response';

export type ShotToolName = 'setup_shot' | 'get_shot' | 'save_recording';

export const shotTools: {
	readonly name: ShotToolName;
	readonly title: string;
	readonly description: string;
	readonly inputSchema: Record<string, unknown>;
	readonly annotations: {readonly readOnlyHint: boolean};
}[] = [
	{
		name: 'setup_shot',
		title: 'Set up Canvas Capture shot',
		description:
			'Frame a Canvas Capture shot without recording or moving the cursor. Prepare the page and scroll first. Element bounds are resolved once; the crop stays fixed in viewport CSS pixels. The user starts and stops recording manually.',
		inputSchema: {
			type: 'object',
			properties: {
				target: {
					oneOf: [
						{
							type: 'object',
							properties: {type: {const: 'viewport'}},
							required: ['type'],
							additionalProperties: false,
						},
						{
							type: 'object',
							properties: {
								type: {const: 'element'},
								selector: {
									type: 'string',
									description:
										'A CSS selector matching exactly one visible element.',
								},
								padding: {
									type: 'number',
									minimum: 0,
									description:
										'Padding in CSS pixels. Defaults to 0. Clipped to the viewport.',
								},
							},
							required: ['type', 'selector'],
							additionalProperties: false,
						},
						{
							type: 'object',
							properties: {
								type: {const: 'rectangle'},
								left: {type: 'number', minimum: 0},
								top: {type: 'number', minimum: 0},
								width: {type: 'number', minimum: 10},
								height: {type: 'number', minimum: 10},
							},
							required: ['type', 'left', 'top', 'width', 'height'],
							additionalProperties: false,
						},
					],
				},
				resolution: {
					type: 'object',
					description:
						'Output bounding box in pixels. Fits the crop inside it, preserving aspect ratio. Defaults to 2560×1440.',
					properties: {
						width: {type: 'integer', minimum: 2},
						height: {type: 'integer', minimum: 2},
					},
					required: ['width', 'height'],
					additionalProperties: false,
				},
				format: {
					type: 'string',
					enum: ['mp4', 'webm'],
					description:
						'Omit to prefer MP4 with WebM fallback. An explicit format never falls back.',
				},
			},
			required: ['target'],
			additionalProperties: false,
		},
		annotations: {readOnlyHint: false},
	},
	{
		name: 'get_shot',
		title: 'Inspect Canvas Capture shot',
		description:
			'Read the crop, viewport, output size and recording readiness. Optionally return a PNG still preview without recording. Preview is unavailable during recording or finalization.',
		inputSchema: {
			type: 'object',
			properties: {
				preview: {
					type: 'boolean',
					description: 'Include a PNG still preview. Defaults to false.',
				},
			},
			additionalProperties: false,
		},
		annotations: {readOnlyHint: true},
	},
	{
		name: 'save_recording',
		title: 'Save completed Canvas Capture recording',
		description:
			'Download a completed recording or open it in Remotion Browser Studio or Convert. The user must have stopped recording manually first. This tool cannot start or stop recording.',
		inputSchema: {
			type: 'object',
			properties: {
				destination: {type: 'string', enum: ['download', 'new', 'convert']},
			},
			required: ['destination'],
			additionalProperties: false,
		},
		annotations: {readOnlyHint: false},
	},
];
