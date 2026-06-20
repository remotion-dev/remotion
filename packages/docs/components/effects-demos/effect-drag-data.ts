import {
	EFFECT_DRAG_MIME_TYPE,
	type EffectDragData,
} from '@remotion/studio-shared';

const FX_ICON_PATH =
	'M4.405 4.48C4.575 3.82 4.865 3.325 5.275 2.995C5.695 2.665 6.25 2.5 6.94 2.5H9.235V4.06H7.045C6.555 4.06 6.235 4.3 6.085 4.78L5.83 5.68H7.975V7.255H5.395L3.805 13H2.02L3.625 7.255H1.96V5.68H4.075L4.405 4.48ZM8.57102 9.085L6.87602 5.68H8.79602L9.86102 7.99L11.991 5.68H14.331L10.686 9.415L12.426 13H10.491L9.35102 10.585L7.02602 13H4.68602L8.57102 9.085Z';

const makeEffectDragImage = () => {
	const wrapper = document.createElement('div');
	wrapper.style.position = 'fixed';
	wrapper.style.top = '-1000px';
	wrapper.style.left = '-1000px';
	wrapper.style.width = '44px';
	wrapper.style.height = '44px';
	wrapper.style.display = 'flex';
	wrapper.style.alignItems = 'center';
	wrapper.style.justifyContent = 'center';
	wrapper.style.borderRadius = '8px';
	wrapper.style.background = '#0b0b0f';
	wrapper.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.28)';

	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('viewBox', '0 0 16 16');
	svg.setAttribute('width', '26');
	svg.setAttribute('height', '26');

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('d', FX_ICON_PATH);
	path.setAttribute('fill', 'white');

	svg.appendChild(path);
	wrapper.appendChild(svg);

	return wrapper;
};

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

export const setEffectDragImage = (dataTransfer: DataTransfer) => {
	const dragImage = makeEffectDragImage();
	document.body.appendChild(dragImage);
	dataTransfer.setDragImage(dragImage, 22, 22);
	requestAnimationFrame(() => {
		document.body.removeChild(dragImage);
	});
};
