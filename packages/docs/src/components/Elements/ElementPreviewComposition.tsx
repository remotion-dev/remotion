import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import type {ElementDefinition} from './element-definitions';
import {getElementDefinition} from './element-utils';

export const ELEMENT_PREVIEW_BACKGROUND = '#eef1f4';
export const ELEMENT_PREVIEW_DARK_BACKGROUND = '#20262f';

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
	const element = React.createElement(
		Component as React.ComponentType<Record<string, unknown>>,
		definition.initialProps ?? {},
	);

	// Elements without fixed dimensions fill their own composition size,
	// which is centered if it differs from the preview size.
	if (
		!hasElementDimensions &&
		definition.width === width &&
		definition.height === height
	) {
		return element;
	}

	const contentWidth = elementWidth ?? definition.width;
	const contentHeight = elementHeight ?? definition.height;
	const scale = Math.min(
		1,
		(width - safeArea * 2) / contentWidth,
		(height - safeArea * 2) / contentHeight,
	);

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
			}}
			showInTimeline={false}
		>
			<Sequence height={contentHeight} layout="none" width={contentWidth}>
				<div
					style={{
						height: contentHeight * scale,
						position: 'relative',
						width: contentWidth * scale,
					}}
				>
					<div
						style={{
							height: contentHeight,
							left: 0,
							position: 'absolute',
							top: 0,
							transform: `scale(${scale})`,
							transformOrigin: 'top left',
							width: contentWidth,
						}}
					>
						{element}
					</div>
				</div>
			</Sequence>
		</AbsoluteFill>
	);
};

export const ElementAssetComposition: React.FC<{
	readonly slug: string;
}> = ({slug}) => {
	const definition: ElementDefinition = getElementDefinition(slug);

	return (
		<AbsoluteFill
			style={{
				backgroundColor:
					definition.preview.backgroundTheme === 'dark'
						? ELEMENT_PREVIEW_DARK_BACKGROUND
						: ELEMENT_PREVIEW_BACKGROUND,
			}}
			showInTimeline={false}
		>
			<ElementPreviewComposition definition={definition} />
		</AbsoluteFill>
	);
};
