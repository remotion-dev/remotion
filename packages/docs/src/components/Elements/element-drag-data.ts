import {
	createElementPayload,
	type StudioElementPayload,
} from '@remotion/studio-protocol';
import type {ElementDefinition} from './element-definitions';

export const createElementPayloadFromDefinition = ({
	definition,
	sourceCode,
}: {
	readonly definition: ElementDefinition;
	readonly sourceCode: string;
}): StudioElementPayload => {
	const dimensions =
		definition.elementWidth !== null && definition.elementHeight !== null
			? {
					width: definition.elementWidth,
					height: definition.elementHeight,
				}
			: null;

	return createElementPayload({
		dependencies: definition.dependencies,
		dimensions,
		displayName: definition.displayName,
		durationInFrames: definition.durationInFrames,
		installationMode: definition.installationMode,
		slug: definition.slug,
		sourceCode,
	});
};

export const setElementDragImage = (
	dataTransfer: DataTransfer,
	poster: HTMLImageElement | null,
) => {
	if (
		!poster?.complete ||
		poster.naturalWidth === 0 ||
		poster.naturalHeight === 0
	) {
		return;
	}

	const scale = Math.min(
		1,
		96 / poster.naturalWidth,
		64 / poster.naturalHeight,
	);
	const width = poster.naturalWidth * scale;
	const height = poster.naturalHeight * scale;
	const wrapper = document.createElement('div');
	wrapper.style.position = 'fixed';
	wrapper.style.top = '-1000px';
	wrapper.style.left = '-1000px';
	wrapper.style.width = `${width}px`;
	wrapper.style.height = `${height}px`;

	const image = document.createElement('img');
	image.src = poster.currentSrc || poster.src;
	image.style.display = 'block';
	image.style.width = '100%';
	image.style.height = '100%';
	wrapper.appendChild(image);

	document.body.appendChild(wrapper);
	dataTransfer.setDragImage(wrapper, width / 2, height / 2);
	requestAnimationFrame(() => wrapper.remove());
};
