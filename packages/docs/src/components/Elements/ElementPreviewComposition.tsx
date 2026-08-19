import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import type {ElementDefinition} from './element-definitions';
import {getElementDefinition} from './element-utils';

export const ELEMENT_PREVIEW_BACKGROUND = '#eef1f4';

export const getElementPreviewDimensions = (definition: ElementDefinition) => {
	const hasElementDimensions =
		definition.elementWidth !== null && definition.elementHeight !== null;

	return {
		height:
			hasElementDimensions && definition.safeArea > 0
				? definition.elementHeight! + definition.safeArea * 2
				: definition.height,
		width:
			hasElementDimensions && definition.safeArea > 0
				? definition.elementWidth! + definition.safeArea * 2
				: definition.width,
	};
};

export const ElementPreviewComposition: React.FC<{
	readonly definition: ElementDefinition;
}> = ({definition}) => {
	const {
		component: Component,
		elementHeight,
		elementWidth,
		safeArea,
	} = definition;
	const {height, width} = useVideoConfig();
	const hasElementDimensions = elementWidth !== null && elementHeight !== null;

	if (!hasElementDimensions) {
		return <Component />;
	}

	const scale = Math.min(
		1,
		(width - safeArea * 2) / elementWidth,
		(height - safeArea * 2) / elementHeight,
	);

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
			}}
			showInTimeline={false}
		>
			<Sequence height={elementHeight} layout="none" width={elementWidth}>
				<div
					style={{
						height: elementHeight,
						position: 'relative',
						scale,
						width: elementWidth,
					}}
				>
					<Component />
				</div>
			</Sequence>
		</AbsoluteFill>
	);
};

export const ElementAssetComposition: React.FC<{
	readonly slug: string;
}> = ({slug}) => {
	const definition = getElementDefinition(slug);

	return (
		<AbsoluteFill
			style={{backgroundColor: ELEMENT_PREVIEW_BACKGROUND}}
			showInTimeline={false}
		>
			<ElementPreviewComposition definition={definition} />
		</AbsoluteFill>
	);
};
