import {
	EFFECT_CATALOG,
	getEffectCatalogCategories,
	getEffectDocumentationPath,
	getEffectPreviewAlt,
	getEffectPreviewSource,
	makeEffectDragDataFromCatalogItem,
	type EffectCatalogItem,
} from '@remotion/studio-shared';
import React from 'react';
import {
	setEffectDragData,
	setEffectDragImage,
} from '../../components/effects-demos/effect-drag-data';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

const categories = getEffectCatalogCategories(EFFECT_CATALOG);

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
};

const previewImage: React.CSSProperties = {
	width: 150,
	height: 100,
	objectFit: 'cover',
	borderRadius: 4,
	flexShrink: 0,
};

const EffectCard: React.FC<{
	readonly effect: EffectCatalogItem;
}> = ({effect}) => {
	const dragData = makeEffectDragDataFromCatalogItem(effect);

	return (
		<TOCItem
			link={getEffectDocumentationPath(effect)}
			draggable
			onDragStart={(e) => {
				setEffectDragData({
					dataTransfer: e.dataTransfer,
					dragData,
				});
				setEffectDragImage(e.dataTransfer);
			}}
			title="Drag this effect into Remotion Studio"
		>
			<div style={row}>
				<img
					src={getEffectPreviewSource(effect)}
					alt={getEffectPreviewAlt(effect)}
					style={previewImage}
				/>
				<div style={{flex: 1, marginLeft: 10}}>
					<strong>
						<code>{effect.label}</code>
					</strong>
					<div>{effect.description}</div>
				</div>
			</div>
		</TOCItem>
	);
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			{categories.map((category) => {
				return (
					<React.Fragment key={category.title}>
						<h3>{category.title}</h3>
						<Grid>
							{category.effects.map((effect) => {
								return <EffectCard key={effect.id} effect={effect} />;
							})}
						</Grid>
					</React.Fragment>
				);
			})}
		</div>
	);
};
