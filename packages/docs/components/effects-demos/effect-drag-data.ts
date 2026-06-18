import {
	EFFECT_DRAG_MIME_TYPE,
	type EffectDragData,
} from '@remotion/studio-shared';

export const makeEffectDragData = ({
	effectName,
	effectImportPath,
	effectConfig,
}: {
	readonly effectName: string;
	readonly effectImportPath: string;
	readonly effectConfig: Record<string, unknown>;
}): EffectDragData => {
	return {
		type: 'remotion-effect',
		version: 1,
		effect: {
			name: effectName,
			importPath: effectImportPath,
			config: effectConfig,
		},
	};
};

export const setEffectDragData = ({
	dataTransfer,
	dragData,
}: {
	readonly dataTransfer: DataTransfer;
	readonly dragData: EffectDragData;
}) => {
	const serialized = JSON.stringify(dragData);
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(EFFECT_DRAG_MIME_TYPE, serialized);
	dataTransfer.setData('application/json', serialized);
	dataTransfer.setData('text/plain', serialized);
};
