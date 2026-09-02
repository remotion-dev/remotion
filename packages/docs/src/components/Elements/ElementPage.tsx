import Head from '@docusaurus/Head';
import {
	installInStudio,
	isInsideStudio,
	setStudioDragData,
	StudioProtocolInternals,
} from '@remotion/studio-protocol';
import React, {
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {BlueButton, PlainButton} from '../../../components/layout/Button';
import {Seo} from '../Seo';
import type {ElementDefinition} from './element-definitions';
import {
	createElementPayloadFromDefinition,
	setElementDragImage,
} from './element-drag-data';
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
	const {contributors, description, durationInFrames, fps} = definition;
	const [installStatus, setInstallStatus] = useState<InstallStatus>({
		type: 'idle',
	});
	const [isInstallHintVisible, setIsInstallHintVisible] = useState(false);
	const [isSourceVisible, setIsSourceVisible] = useState(false);
	const [isBrowserStudioActionVisible, setIsBrowserStudioActionVisible] =
		useState(false);
	const [isEmbeddedInStudio, setIsEmbeddedInStudio] = useState(false);
	const posterRef = useRef<HTMLImageElement>(null);
	const sourceId = useId();
	const {height: previewHeight, width: previewWidth} =
		getElementPreviewDimensions(definition);

	const elementPayload = useMemo(() => {
		if (!sourceCode) {
			return null;
		}

		return createElementPayloadFromDefinition({definition, sourceCode});
	}, [definition, sourceCode]);

	useLayoutEffect(() => {
		setIsEmbeddedInStudio(isInsideStudio());
	}, []);

	useEffect(() => {
		if (installStatus.type !== 'installing') {
			return;
		}

		const timeout = window.setTimeout(() => {
			setIsInstallHintVisible(true);
		}, 1000);
		return () => window.clearTimeout(timeout);
	}, [installStatus.type]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				event.repeat ||
				!event.altKey ||
				!event.shiftKey ||
				event.ctrlKey ||
				event.metaKey ||
				event.code !== 'KeyB'
			) {
				return;
			}

			const {target} = event;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					target.tagName === 'INPUT' ||
					target.tagName === 'SELECT' ||
					target.tagName === 'TEXTAREA')
			) {
				return;
			}

			event.preventDefault();
			setIsBrowserStudioActionVisible(true);
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, []);

	const installElement = useCallback(async () => {
		if (elementPayload === null) {
			return;
		}

		setIsInstallHintVisible(false);
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
			message: `Sent to ${target.projectName ?? 'Remotion Studio'} (currently ${target.compositionId}). Confirm the installation destination in Studio.`,
		});

		if (window.location.origin === 'https://www.remotion.dev') {
			navigator.sendBeacon(
				`https://www.remotion.pro/api/track/element-install-request?slug=${encodeURIComponent(definition.slug)}`,
			);
		}
	}, [definition.slug, elementPayload]);

	const openInBrowserStudio = useCallback(() => {
		if (elementPayload === null) {
			return;
		}

		StudioProtocolInternals.openInBrowserStudio({
			endpoint: null,
			payload: elementPayload,
		});
	}, [elementPayload]);

	const PreviewComponent = useMemo(() => {
		return () => <ElementPreviewComposition definition={definition} />;
	}, [definition]);

	return (
		<div className={styles.workbench}>
			<img
				ref={posterRef}
				alt=""
				decoding="async"
				draggable={false}
				hidden
				src={definition.preview.posterUrl}
			/>
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
						elementHeight={definition.elementHeight}
						elementWidth={definition.elementWidth}
						fps={fps}
						previewLayout={definition.preview.previewLayout}
						safeArea={definition.safeArea}
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
				<div>
					{elementPayload === null ? null : (
						<>
							<div className={styles.actionRow}>
								<BlueButton
									fullWidth
									loading={installStatus.type === 'installing'}
									onClick={installElement}
									size="sm"
									style={{padding: '7px 12px'}}
									title="Install in the most recently focused Remotion Studio"
								>
									{installStatus.type === 'installing'
										? 'Finding Studio…'
										: 'Install in Studio'}
								</BlueButton>
								{isBrowserStudioActionVisible ? (
									<PlainButton
										fullWidth
										loading={false}
										onClick={openInBrowserStudio}
										size="sm"
										style={{padding: '7px 12px'}}
									>
										Open in Browser Studio
									</PlainButton>
								) : null}
							</div>
							{isEmbeddedInStudio === false ? (
								<div
									className={styles.dragHandle}
									draggable
									onDragStart={(event) => {
										setStudioDragData({
											dataTransfer: event.dataTransfer,
											payload: elementPayload,
										});
										setElementDragImage(event.dataTransfer, posterRef.current);
									}}
									title="Drag into your Studio browser tab to choose where the element is placed on the canvas or timeline"
								>
									<span aria-hidden="true" className={styles.dragHandleIcon}>
										⠿
									</span>
									<span className={styles.dragHandleText}>
										<strong>Drag into Studio</strong>
									</span>
								</div>
							) : null}
							{installStatus.type !== 'idle' &&
							(installStatus.type !== 'installing' || isInstallHintVisible) ? (
								<p
									aria-live="polite"
									className={
										installStatus.type === 'installing'
											? styles.installingStatus
											: installStatus.type === 'success'
												? styles.successStatus
												: styles.errorStatus
									}
								>
									{installStatus.type === 'installing'
										? 'If your browser prompts you, allow local network access so this page can find Remotion Studio.'
										: installStatus.message}
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
								<dd>{(durationInFrames / fps).toFixed(2)}s</dd>
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
