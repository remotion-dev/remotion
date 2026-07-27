import {
	DragAndDropInternals,
	type ComponentDimensions,
} from '@remotion/drag-and-drop';
import React, {
	useCallback,
	useId,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import {BlueButton, PlainButton} from '../../../components/layout/Button';
import type {ElementDefinition} from './element-definitions';
import {setElementDragData, setElementDragImage} from './element-drag-data';
import {getElementDimensionsLabel} from './element-utils';
import {ElementPreview} from './ElementPreview';
import {
	ElementPreviewComposition,
	getElementPreviewDimensions,
} from './ElementPreviewComposition';
import styles from './ElementPage.module.css';

type ElementPageProps = {
	readonly children?: ReactNode;
	readonly definition: ElementDefinition;
	readonly dependencies: string[];
	readonly sourceCode?: string;
};

type InstallStatus =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'success'; message: string; studioUrl: string}
	| {type: 'error'; message: string};

export const ElementPage: React.FC<ElementPageProps> = ({
	children,
	definition,
	dependencies,
	sourceCode,
}) => {
	const {
		contributors,
		description,
		displayName,
		durationInFrames,
		elementHeight,
		elementWidth,
		fps,
		slug,
	} = definition;
	const [installStatus, setInstallStatus] = useState<InstallStatus>({
		type: 'idle',
	});
	const [isSourceVisible, setIsSourceVisible] = useState(false);
	const sourceId = useId();
	const {height: previewHeight, width: previewWidth} =
		getElementPreviewDimensions(definition);

	const dragData = useMemo(() => {
		if (!sourceCode) {
			return null;
		}

		const dimensions: ComponentDimensions | null =
			elementWidth !== null && elementHeight !== null
				? {
						width: elementWidth,
						height: elementHeight,
					}
				: null;

		return DragAndDropInternals.makeDragData({
			type: 'element',
			dependencies,
			dimensions,
			displayName,
			durationInFrames,
			slug,
			sourceCode,
		});
	}, [
		dependencies,
		displayName,
		durationInFrames,
		elementHeight,
		elementWidth,
		slug,
		sourceCode,
	]);

	const installElement = useCallback(async () => {
		if (dragData === null) {
			return;
		}

		setInstallStatus({type: 'installing'});
		const result = await DragAndDropInternals.installInStudio(dragData);
		if (!result.success) {
			setInstallStatus({
				type: 'error',
				message: result.reason,
			});
			return;
		}

		const {target} = result;
		setInstallStatus({
			type: 'success',
			message: `Sent to ${target.projectName ?? 'Remotion Studio'}${
				target.activeCompositionId ? ` / ${target.activeCompositionId}` : ''
			}. Confirm the install in Studio.`,
			studioUrl: target.origin,
		});
	}, [dragData]);

	const PreviewComponent = useMemo(() => {
		return () => <ElementPreviewComposition definition={definition} />;
	}, [definition]);

	return (
		<div className={styles.workbench}>
			<section aria-label="Preview" className={styles.previewColumn}>
				<div className={styles.previewAndSource}>
					<ElementPreview
						component={PreviewComponent}
						durationInFrames={durationInFrames}
						fps={fps}
						height={previewHeight}
						width={previewWidth}
					/>
					{children ? (
						<div className={styles.sourceArea}>
							<div
								aria-label="Element source code"
								className={`${styles.sourceViewport} ${
									isSourceVisible ? '' : styles.sourceViewportCollapsed
								}`}
								id={sourceId}
								inert={!isSourceVisible}
								role="region"
							>
								{children}
							</div>
							{isSourceVisible ? null : (
								<div className={styles.sourceReveal}>
									<button
										aria-controls={sourceId}
										aria-expanded={isSourceVisible}
										className={styles.sourceToggle}
										onClick={() => setIsSourceVisible(true)}
										type="button"
									>
										View code
									</button>
								</div>
							)}
						</div>
					) : null}
				</div>
			</section>

			<aside
				aria-label="Element details and actions"
				className={styles.actionsColumn}
			>
				<div className={styles.useIt}>
					{dragData === null ? null : (
						<>
							<div className={styles.actionRow}>
								<BlueButton
									fullWidth
									loading={installStatus.type === 'installing'}
									onClick={installElement}
									size="sm"
									style={{padding: '7px 12px'}}
									title="Install into the most recently focused Remotion Studio"
								>
									{installStatus.type === 'installing'
										? 'Finding Studio…'
										: 'Install Element'}
								</BlueButton>
								<PlainButton
									draggable
									fullWidth
									loading={false}
									onDragStart={(event) => {
										setElementDragData({
											dataTransfer: event.dataTransfer,
											dragData,
										});
										setElementDragImage(event.dataTransfer);
									}}
									size="sm"
									style={{cursor: 'grab', padding: '7px 12px'}}
									title="Drag into Remotion Studio"
								>
									Drag into Studio
								</PlainButton>
							</div>
							{installStatus.type === 'success' ||
							installStatus.type === 'error' ? (
								<p
									aria-live="polite"
									className={
										installStatus.type === 'success'
											? styles.successStatus
											: styles.errorStatus
									}
								>
									{installStatus.message}{' '}
									{installStatus.type === 'success' ? (
										<a
											href={installStatus.studioUrl}
											rel="noreferrer"
											target="_blank"
										>
											Open Studio
										</a>
									) : null}
								</p>
							) : null}
						</>
					)}

					<div className={styles.details}>
						<p className={styles.description}>{description}</p>
						<dl className={styles.metadata}>
							<div>
								<dt>Dimensions</dt>
								<dd>{getElementDimensionsLabel(definition)}</dd>
							</div>
						</dl>
					</div>

					{contributors.length ? (
						<div aria-label="Contributors" className={styles.contributors}>
							<span className={styles.contributorsLabel}>Created by</span>
							<div className={styles.contributorList}>
								{contributors.map((contributor) => (
									<a
										key={contributor.username}
										className={styles.contributor}
										href={`https://github.com/${contributor.username}`}
										rel="noopener noreferrer"
										target="_blank"
									>
										<img
											alt=""
											className={styles.contributorAvatar}
											src={`https://github.com/${contributor.username}.png`}
										/>
										<span className={styles.contributorText}>
											<strong>@{contributor.username}</strong>
											{contributor.contribution === 'Author' ? null : (
												<span>{contributor.contribution}</span>
											)}
										</span>
									</a>
								))}
							</div>
						</div>
					) : null}
				</div>
			</aside>
		</div>
	);
};
