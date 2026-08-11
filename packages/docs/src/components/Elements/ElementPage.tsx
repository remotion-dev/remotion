import Head from '@docusaurus/Head';
import {
	createElementPayload,
	installInStudio,
	setStudioDragData,
} from '@remotion/studio-protocol';
import React, {
	useCallback,
	useId,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import {BlueButton, PlainButton} from '../../../components/layout/Button';
import {Seo} from '../Seo';
import type {ElementDefinition} from './element-definitions';
import {setElementDragImage} from './element-drag-data';
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
	readonly sourceCode?: string;
};

type InstallStatus =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'success'; message: string}
	| {type: 'error'; message: string};

export const ElementPage: React.FC<ElementPageProps> = ({
	children,
	definition,
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
		installationMode,
	} = definition;
	const [installStatus, setInstallStatus] = useState<InstallStatus>({
		type: 'idle',
	});
	const [isSourceVisible, setIsSourceVisible] = useState(false);
	const sourceId = useId();
	const {height: previewHeight, width: previewWidth} =
		getElementPreviewDimensions(definition);

	const elementPayload = useMemo(() => {
		if (!sourceCode) {
			return null;
		}

		const dimensions =
			elementWidth !== null && elementHeight !== null
				? {
						width: elementWidth,
						height: elementHeight,
					}
				: null;

		return createElementPayload({
			dependencies: definition.dependencies,
			dimensions,
			displayName,
			durationInFrames,
			slug,
			sourceCode,
			installationMode,
		});
	}, [
		definition.dependencies,
		displayName,
		durationInFrames,
		elementHeight,
		elementWidth,
		slug,
		sourceCode,
		installationMode,
	]);

	const installElement = useCallback(async () => {
		if (elementPayload === null) {
			return;
		}

		setInstallStatus({type: 'installing'});
		const result = await installInStudio({payload: elementPayload});
		if (!result.success) {
			setInstallStatus({
				type: 'error',
				message: result.message,
			});
			return;
		}

		const {target} = result;
		setInstallStatus({
			type: 'success',
			message: `Sent to ${target.projectName ?? 'Remotion Studio'} / ${target.compositionId}. Confirm the installation in Studio.`,
		});
	}, [elementPayload]);

	const PreviewComponent = useMemo(() => {
		return () => <ElementPreviewComposition definition={definition} />;
	}, [definition]);

	return (
		<div className={styles.workbench}>
			<Head>
				{Seo.renderVideo({
					height: previewHeight,
					url: definition.preview.videoUrl,
					width: previewWidth,
				})}
			</Head>
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
					{elementPayload === null ? null : (
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
										: 'Install in Studio'}
								</BlueButton>
								<PlainButton
									draggable
									fullWidth
									loading={false}
									onDragStart={(event) => {
										setStudioDragData({
											dataTransfer: event.dataTransfer,
											payload: elementPayload,
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
									{installStatus.message}
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
							<div>
								<dt>Preview FPS</dt>
								<dd>{fps}</dd>
							</div>
							<div>
								<dt>Duration</dt>
								<dd>{durationInFrames / fps}s</dd>
							</div>
							<div className={styles.dependenciesMetadata}>
								<dt>Dependencies</dt>
								<dd>
									{definition.dependencies.length === 0 ? (
										'None'
									) : (
										<ul className={styles.dependencyList}>
											{definition.dependencies.map((dependency) => (
												<li key={dependency.name}>
													<a
														href={`https://www.npmjs.com/package/${dependency.name}`}
														rel="noopener noreferrer"
														target="_blank"
													>
														{dependency.version === null
															? dependency.name
															: `${dependency.name}@${dependency.version}`}
													</a>
												</li>
											))}
										</ul>
									)}
								</dd>
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
