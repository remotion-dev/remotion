import Head from '@docusaurus/Head';
import {
	isInsideStudio,
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
import {PlainButton} from '../../../components/layout/Button';
import {Seo} from '../Seo';
import type {ElementDefinition} from './element-definitions';
import {
	createElementPayloadFromDefinition,
	installElementInStudio,
} from './element-drag-data';
import {getElementDimensionsLabel} from './element-utils';
import {ElementInstallFallbackModal} from './ElementInstallFallbackModal';
import {ElementPreview} from './ElementPreview';
import {
	ElementPreviewComposition,
	getElementPreviewDimensions,
} from './ElementPreviewComposition';
import {ElementStudioAction} from './ElementStudioAction';
import styles from './ElementPage.module.css';

type ElementPageProps = {
	readonly children?: ReactNode;
	readonly definition: ElementDefinition;
	readonly sourceCode?: string;
};

type InstallStatus = {type: 'idle'} | {type: 'installing'} | {type: 'success'};

export const ElementPage: React.FC<ElementPageProps> = ({
	children,
	definition,
	sourceCode,
}) => {
	const {contributors, description, durationInFrames, fps} = definition;
	const [installStatus, setInstallStatus] = useState<InstallStatus>({
		type: 'idle',
	});
	const [isInstallFallbackOpen, setIsInstallFallbackOpen] = useState(false);
	const [installFailureCount, setInstallFailureCount] = useState(0);
	const [isInstallHintVisible, setIsInstallHintVisible] = useState(false);
	const [isSourceVisible, setIsSourceVisible] = useState(false);
	const [isBrowserStudioActionVisible, setIsBrowserStudioActionVisible] =
		useState(false);
	const [isEmbeddedInStudio, setIsEmbeddedInStudio] = useState<boolean | null>(
		null,
	);
	const posterRef = useRef<HTMLImageElement>(null);
	const sourceId = useId();
	const {height: previewHeight, width: previewWidth} =
		getElementPreviewDimensions(definition);

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
		if (!sourceCode) {
			return;
		}

		setIsInstallHintVisible(false);
		setInstallStatus({type: 'installing'});

		try {
			const result = await installElementInStudio({definition, sourceCode});
			if (!result.success) {
				setInstallStatus({type: 'idle'});
				setInstallFailureCount((count) => count + 1);
				setIsInstallFallbackOpen(true);
				return;
			}

			setIsInstallFallbackOpen(false);
			setInstallFailureCount(0);
			if (isEmbeddedInStudio) {
				setInstallStatus({type: 'idle'});
			} else {
				setInstallStatus({type: 'success'});
			}

			if (window.location.origin === 'https://www.remotion.dev') {
				navigator.sendBeacon(
					`https://www.remotion.pro/api/track/element-install-request?slug=${encodeURIComponent(definition.slug)}`,
				);
			}
		} catch {
			setInstallStatus({type: 'idle'});
			setInstallFailureCount((count) => count + 1);
			setIsInstallFallbackOpen(true);
		}
	}, [definition, isEmbeddedInStudio, sourceCode]);

	const openInBrowserStudio = useCallback(() => {
		if (!sourceCode) {
			return;
		}

		StudioProtocolInternals.openInBrowserStudio({
			endpoint: null,
			payload: createElementPayloadFromDefinition({
				definition,
				sourceCode,
				installAssets: false,
			}),
		});
	}, [definition, sourceCode]);

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
						htmlInCanvasFallbackVideoUrl={
							definition.previewUsesHtmlInCanvas
								? definition.preview.videoUrl
								: null
						}
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
					{sourceCode ? (
						<>
							<div className={styles.actionRow}>
								<ElementStudioAction
									buttonLabel={
										installStatus.type === 'success' ? 'Sent to Studio' : 'Use'
									}
									definition={definition}
									loading={installStatus.type === 'installing'}
									onClick={installElement}
									posterRef={posterRef}
									showDragHandle={isEmbeddedInStudio === false}
									sourceCode={sourceCode}
									title={
										isEmbeddedInStudio
											? 'Use this Element in Studio'
											: 'Install in the most recently focused Remotion Studio'
									}
								/>
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
							{installStatus.type === 'installing' && isInstallHintVisible ? (
								<p aria-live="polite" className={styles.installingStatus}>
									If your browser prompts you, allow local network access so
									this page can find Remotion Studio.
								</p>
							) : null}
						</>
					) : null}

					<div className={styles.details}>
						<p className={styles.description}>{description}</p>
						{definition.category === 'captions' ? (
							<p className={styles.description} style={{marginTop: 8}}>
								<a href="/elements/captions/#importing-captions-into-studio">
									How to use caption elements
								</a>
							</p>
						) : null}
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
			{sourceCode ? (
				<ElementInstallFallbackModal
					definition={definition}
					installFailureCount={installFailureCount}
					isInstalling={installStatus.type === 'installing'}
					isOpen={isInstallFallbackOpen}
					onClose={() => {
						setIsInstallFallbackOpen(false);
						setInstallFailureCount(0);
					}}
					onInstall={installElement}
					posterRef={posterRef}
					sourceCode={sourceCode}
				/>
			) : null}
		</div>
	);
};
