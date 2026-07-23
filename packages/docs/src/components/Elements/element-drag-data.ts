import {
	ELEMENT_DRAG_MIME_TYPE,
	type ElementDragData,
} from '@remotion/studio-shared';

const ELEMENT_ICON_PATH =
	'M3 3.5C3 2.67157 3.67157 2 4.5 2H11.5C12.3284 2 13 2.67157 13 3.5V12.5C13 13.3284 12.3284 14 11.5 14H4.5C3.67157 14 3 13.3284 3 12.5V3.5ZM4.5 3.5V6H11.5V3.5H4.5ZM11.5 7.5H4.5V12.5H11.5V7.5Z';

const makeElementDragImage = () => {
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
	path.setAttribute('d', ELEMENT_ICON_PATH);
	path.setAttribute('fill', 'white');

	svg.appendChild(path);
	wrapper.appendChild(svg);

	return wrapper;
};

export const setElementDragData = ({
	dataTransfer,
	dragData,
}: {
	readonly dataTransfer: DataTransfer;
	readonly dragData: ElementDragData;
}) => {
	const serialized = JSON.stringify(dragData);
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(ELEMENT_DRAG_MIME_TYPE, serialized);
	dataTransfer.setData('application/json', serialized);
	dataTransfer.setData('text/plain', serialized);
};

export const setElementDragImage = (dataTransfer: DataTransfer) => {
	const dragImage = makeElementDragImage();
	document.body.appendChild(dragImage);
	dataTransfer.setDragImage(dragImage, 22, 22);
	requestAnimationFrame(() => {
		document.body.removeChild(dragImage);
	});
};
