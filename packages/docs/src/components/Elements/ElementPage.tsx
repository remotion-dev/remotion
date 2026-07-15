import {
	makeElementDragData,
	type ComponentDimensions,
} from '@remotion/studio-shared';
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

type ElementInstallTarget = {
	type: 'remotion-studio';
	projectName: string | null;
	port: number | null;
	lastFocusedAt: number | null;
	canInstall: boolean;
	activeCompositionId: string | null;
	readOnly: boolean;
};

type InstallStatus =
	| {type: 'idle'}
	| {type: 'installing'}
	| {type: 'success'; message: string; studioUrl: string}
	| {type: 'error'; message: string};

const probePorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];
const focusedStudioMaxAge = 5 * 60 * 1000;

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
	const controller = new AbortController();
	const timeout = window.setTimeout(() => controller.abort(), 700);
	try {
		return await fetch(url, {...options, signal: controller.signal});
	} finally {
		window.clearTimeout(timeout);
	}
};

const findBestInstallTarget = async (): Promise<
	(ElementInstallTarget & {origin: string}) | null
> => {
	const targets = await Promise.all(
		probePorts.map(async (port) => {
			const origin = `http://localhost:${port}`;
			try {
				const response = await fetchWithTimeout(
					`${origin}/api/element-install-target`,
				);
				if (!response.ok) {
					return null;
				}

				const target = (await response.json()) as ElementInstallTarget;
				if (target.type !== 'remotion-studio') {
					return null;
				}

				return {...target, origin};
			} catch {
				return null;
			}
		}),
	);

	const now = Date.now();
	const installableTargets = targets.filter(
		(target): target is ElementInstallTarget & {origin: string} =>
			target !== null &&
			target.canInstall &&
			target.lastFocusedAt !== null &&
			now - target.lastFocusedAt < focusedStudioMaxAge,
	);

	return (
		installableTargets.sort((a, b) => b.lastFocusedAt! - a.lastFocusedAt!)[0] ??
		null
	);
};

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

		return makeElementDragData({
			dimensions,
			displayName,
			slug,
			sourceCode,
		});
	}, [displayName, elementHeight, elementWidth, slug, sourceCode]);

	const installElement = useCallback(async () => {
		if (dragData === null) {
			return;
		}

		setInstallStatus({type: 'installing'});
		try {
			const target = await findBestInstallTarget();
			if (target === null) {
				setInstallStatus({
					type: 'error',
					message:
						'Focus the Remotion Studio you want to install into, then click again.',
				});
				return;
			}

			const response = await fetchWithTimeout(
				`${target.origin}/api/request-element-install`,
				{
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({element: dragData.element}),
				},
			);
			const result = (await response.json()) as
				| {success: true; status: 'sent'}
				| {success: false; reason: string};

			if (!response.ok || !result.success) {
				setInstallStatus({
					type: 'error',
					message:
						'success' in result && result.success === false
							? result.reason
							: 'Could not send Element to Remotion Studio.',
				});
				return;
			}

			setInstallStatus({
				type: 'success',
				message: `Sent to ${target.projectName ?? 'Remotion Studio'}${
					target.activeCompositionId ? ` / ${target.activeCompositionId}` : ''
				}. Confirm the install in Studio.`,
				studioUrl: target.origin,
			});
		} catch (err) {
			setInstallStatus({
				type: 'error',
				message: err instanceof Error ? err.message : String(err),
			});
		}
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
								<dd>
									{elementWidth ?? definition.width} ×{' '}
									{elementHeight ?? definition.height}px
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
