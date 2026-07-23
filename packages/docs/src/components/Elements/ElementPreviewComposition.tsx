import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import type {ElementDefinition} from './element-definitions';
import {getElementDefinition} from './element-utils';

export const ELEMENT_PREVIEW_BACKGROUND = '#eef1f4';

export const getElementPreviewDimensions = (definition: ElementDefinition) => {
	const hasElementDimensions =
		definition.elementWidth !== null && definition.elementHeight !== null;

	return {
		height:
			hasElementDimensions && definition.previewPadding > 0
				? definition.elementHeight! + definition.previewPadding * 2
				: definition.height,
		width:
			hasElementDimensions && definition.previewPadding > 0
				? definition.elementWidth! + definition.previewPadding * 2
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
		previewPadding,
	} = definition;
	const hasElementDimensions = elementWidth !== null && elementHeight !== null;

	if (!hasElementDimensions) {
		return <Component />;
	}

	if (previewPadding > 0) {
		return (
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Sequence height={elementHeight} layout="none" width={elementWidth}>
					<div
						style={{
							height: elementHeight,
							position: 'relative',
							width: elementWidth,
						}}
					>
						<Component />
					</div>
				</Sequence>
			</AbsoluteFill>
		);
	}

	return (
		<Sequence height={elementHeight} width={elementWidth}>
			<Component />
		</Sequence>
	);
};

export const ElementAssetComposition: React.FC<{
	readonly slug: string;
}> = ({slug}) => {
	const definition = getElementDefinition(slug);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: definition.transparentPreview
					? 'transparent'
					: ELEMENT_PREVIEW_BACKGROUND,
			}}
		>
			<ElementPreviewComposition definition={definition} />
		</AbsoluteFill>
	);
};
