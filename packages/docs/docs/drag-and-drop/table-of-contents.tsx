import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

const apis = [
	['makeAssetDragData()', 'make-asset-drag-data', 'Construct an asset payload'],
	['parseAssetDragData()', 'parse-asset-drag-data', 'Parse an asset payload'],
	[
		'makeComponentDragData()',
		'make-component-drag-data',
		'Construct a component payload',
	],
	[
		'parseComponentDragData()',
		'parse-component-drag-data',
		'Parse a component payload',
	],
	[
		'makeCompositionDragData()',
		'make-composition-drag-data',
		'Construct a composition payload',
	],
	[
		'parseCompositionDragData()',
		'parse-composition-drag-data',
		'Parse a composition payload',
	],
	[
		'makeEffectDragData()',
		'make-effect-drag-data',
		'Construct an effect payload',
	],
	[
		'parseEffectDragData()',
		'parse-effect-drag-data',
		'Parse an effect payload',
	],
	[
		'makeElementDragData()',
		'make-element-drag-data',
		'Construct an element payload',
	],
	[
		'parseElementDragData()',
		'parse-element-drag-data',
		'Parse an element payload',
	],
	['makeSfxDragData()', 'make-sfx-drag-data', 'Construct an SFX payload'],
	['parseSfxDragData()', 'parse-sfx-drag-data', 'Parse an SFX payload'],
] as const;

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			{apis.map(([name, slug, description]) => (
				<TOCItem key={slug} link={`/docs/drag-and-drop/${slug}`}>
					<strong>
						<code>{name}</code>
					</strong>
					<div>{description}</div>
				</TOCItem>
			))}
		</Grid>
	);
};
