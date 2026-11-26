import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import {
	getEffectDocumentationPath,
	getEffectPreviewAlt,
	getEffectPreviewSource,
} from '@remotion/studio-shared';
import React from 'react';
import {
	setEffectDragData,
	setEffectDragImage,
} from '../../../components/effects-demos/effect-drag-data';
import {CatalogHero} from '../Catalog/CatalogHero';
import {effectCategories} from './effect-library-data';
import styles from '../Elements/ElementLibrary.module.css';

export const EffectLibrary: React.FC = () => {
	const brokenLinks = useBrokenLinks();
	brokenLinks.collectAnchor('available-effects');

	return (
		<>
			<CatalogHero title="Remotion Effects">
				Drag an effect into Studio or{' '}
				<Link to="/docs/effects#programmatically">apply it in code</Link>.
			</CatalogHero>
			<div className={styles.library} id="available-effects">
				{effectCategories.map(({title, headingId, effects}) => {
					brokenLinks.collectAnchor(headingId);
					return (
						<section
							key={headingId}
							className={styles.section}
							aria-labelledby={headingId}
						>
							<h2
								id={headingId}
								data-catalog-category
								className={`anchor ${styles.categoryTitle}`}
							>
								{title}
							</h2>
							<ul className={styles.grid} role="list">
								{effects.map((effect) => (
									<li key={effect.id} className={styles.cardItem}>
										<Link
											className={styles.card}
											to={getEffectDocumentationPath(effect)}
											title={effect.description}
											draggable
											onDragStart={(event) => {
												setEffectDragData({
													dataTransfer: event.dataTransfer,
													dragData: StudioProtocolInternals.makeDragData({
														type: 'effect',
														...effect.effect,
													}),
												});
												setEffectDragImage(event.dataTransfer);
											}}
										>
											<div className={styles.preview}>
												<img
													alt={getEffectPreviewAlt(effect)}
													className={styles.previewMedia}
													style={{objectFit: 'cover'}}
													draggable={false}
													loading="lazy"
													decoding="async"
													src={getEffectPreviewSource(effect)}
												/>
											</div>
											<div className={styles.content}>
												<span className={styles.title}>{effect.label}</span>
											</div>
										</Link>
									</li>
								))}
							</ul>
						</section>
					);
				})}
			</div>
		</>
	);
};
