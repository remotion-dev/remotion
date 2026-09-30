import Head from '@docusaurus/Head';
import {
	isInsideStudio,
	StudioProtocolInternals,
	type InstallInStudioErrorCode,
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
import {InlineStep} from '../../../components/InlineStep';
import {PlainButton} from '../../../components/layout/Button';
import {Seo} from '../Seo';
import type {ElementDefinition} from './element-definitions';
import {
	createElementPayloadFromDefinition,
	installElementInStudio,
} from './element-drag-data';
import {getElementDimensionsLabel} from './element-utils';
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

type InstallStatus =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'success'; message: string}
	| {type: 'error'; code: InstallInStudioErrorCode | null; message: string};

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
				setInstallStatus({
					type: 'error',
					code: result.code,
					message: result.message,
				});
				return;
			}

			if (isEmbeddedInStudio) {
				setInstallStatus({type: 'idle'});
			} else {
				const {target} = result;
				setInstallStatus({
					type: 'success',
					message: `Sent to Remotion Studio${target.projectName === null ? '' : ` (${target.projectName})`}. Confirm the installation destination in Studio.`,
				});
			}

			if (window.location.origin === 'https://www.remotion.dev') {
				navigator.sendBeacon(
					`https://www.remotion.pro/api/track/element-install-request?slug=${encodeURIComponent(definition.slug)}`,
				);
			}
		} catch {
			setInstallStatus({
				type: 'error',
				code: null,
				message: 'Could not connect to Remotion Studio. Please try again.',
			});
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
						backgroundColor={definition.preview.backgroundColor ?? null}
						checkerboardTheme={definition.preview.checkerboardTheme}
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
									showDragHandle={
										isEmbeddedInStudio === false ||
										(installStatus.type === 'error' &&
											installStatus.code === 'no-installable-target')
									}
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
							{installStatus.type === 'error' &&
							(installStatus.code === 'no-compatible-studio' ||
								installStatus.code === 'no-installable-target') ? (
								<div aria-live="polite" className={styles.studioGuidance}>
									{installStatus.code === 'no-installable-target' ? (
										<>
											<p className={styles.studioGuidanceTitle}>
												No installation destination found
											</p>
											<p className={styles.studioGuidanceText}>
												Drag the <strong>Use</strong> button above into your
												open <a href="/docs/studio">Remotion Studio</a> instead.
											</p>
											<p className={styles.studioGuidanceText}>
												Or focus a destination in Studio, then click{' '}
												<strong>Use</strong> again.
											</p>
										</>
									) : (
										<>
											<p className={styles.studioGuidanceTitle}>
												Connect to Remotion Studio
											</p>
											<ol className={styles.studioGuidanceSteps} role="list">
												<li>
													<InlineStep>1</InlineStep>
													<span>
														Open your Remotion project, or{' '}
														<a href="/docs/">create a new one</a>, and{' '}
														<a href="/docs/studio">start Studio</a>.
													</span>
												</li>
												<li>
													<InlineStep>2</InlineStep>
													<span>
														Return here and click <strong>Use</strong> again.
													</span>
												</li>
											</ol>
										</>
									)}
								</div>
							) : installStatus.type !== 'idle' &&
							  (installStatus.type !== 'installing' ||
									isInstallHintVisible) ? (
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
		</div>
	);
};
