import {
	makeElementDragData,
	type ComponentDimensions,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useMemo,
	useState,
	type ComponentType,
	type ReactNode,
} from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {setElementDragData, setElementDragImage} from './element-drag-data';
import {ElementPreview} from './ElementPreview';

type ElementPageProps = {
	readonly children?: ReactNode;
	readonly component: ComponentType<Record<string, never>>;
	readonly displayName?: string;
	readonly durationInFrames?: number;
	readonly elementHeight?: number;
	readonly elementWidth?: number;
	readonly fps?: number;
	readonly height?: number;
	readonly previewPadding?: number;
	readonly slug?: string;
	readonly sourceCode?: string;
	readonly width?: number;
};

const actionButtonStyle: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 10,
	padding: '12px 16px',
	borderRadius: 10,
	border: '1px solid var(--ifm-color-emphasis-300)',
	background: 'var(--ifm-background-surface-color)',
	boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
	fontWeight: 700,
	userSelect: 'none',
};

const dragButtonStyle: React.CSSProperties = {
	...actionButtonStyle,
	cursor: 'grab',
};

const installButtonStyle: React.CSSProperties = {
	...actionButtonStyle,
	cursor: 'pointer',
};

const disabledInstallButtonStyle: React.CSSProperties = {
	...installButtonStyle,
	cursor: 'not-allowed',
	opacity: 0.65,
};

const actionRowStyle: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: 12,
	alignItems: 'center',
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
	component,
	displayName,
	durationInFrames = 120,
	elementHeight,
	elementWidth,
	fps = 30,
	height = 1080,
	previewPadding = 0,
	slug,
	sourceCode,
	width = 1920,
}) => {
	const [installStatus, setInstallStatus] = useState<InstallStatus>({
		type: 'idle',
	});
	const hasElementDimensions =
		elementWidth !== undefined && elementHeight !== undefined;
	const previewWidth =
		hasElementDimensions && previewPadding > 0
			? elementWidth + previewPadding * 2
			: width;
	const previewHeight =
		hasElementDimensions && previewPadding > 0
			? elementHeight + previewPadding * 2
			: height;

	const dragData = useMemo(() => {
		if (!slug || !displayName || !sourceCode) {
			return null;
		}

		const dimensions: ComponentDimensions | null =
			elementWidth !== undefined && elementHeight !== undefined
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
		if (!hasElementDimensions) {
			return component;
		}

		const Component = component;

		return () => {
			if (previewPadding > 0) {
				return (
					<AbsoluteFill
						style={{
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Sequence height={elementHeight} layout="none" width={elementWidth}>
							<div
								style={{
									height: elementHeight,
									position: 'relative',
									width: elementWidth,
								}}
							>
								<Component />
							</div>
						</Sequence>
					</AbsoluteFill>
				);
			}

			return (
				<Sequence height={elementHeight} width={elementWidth}>
					<Component />
				</Sequence>
			);
		};
	}, [
		component,
		elementHeight,
		elementWidth,
		hasElementDimensions,
		previewPadding,
	]);

	return (
		<>
			<h2>Preview</h2>
			<ElementPreview
				component={PreviewComponent}
				durationInFrames={durationInFrames}
				fps={fps}
				height={previewHeight}
				width={previewWidth}
			/>

			<h2>Use it</h2>
			<p>
				Copy the source code into your Remotion project. The file exports the
				Element component. Preview dimensions, frame rate, and duration are
				supplied by the gallery.
			</p>
			{dragData === null ? null : (
				<>
					<p style={actionRowStyle}>
						<button
							disabled={installStatus.type === 'installing'}
							onClick={installElement}
							style={
								installStatus.type === 'installing'
									? disabledInstallButtonStyle
									: installButtonStyle
							}
							title="Install into the most recently focused Remotion Studio"
							type="button"
						>
							<span aria-hidden="true">＋</span>
							{installStatus.type === 'installing'
								? 'Finding Studio…'
								: 'Install Element'}
						</button>
						<button
							draggable
							onDragStart={(event) => {
								setElementDragData({
									dataTransfer: event.dataTransfer,
									dragData,
								});
								setElementDragImage(event.dataTransfer);
							}}
							style={dragButtonStyle}
							title="Drag into Remotion Studio"
							type="button"
						>
							<span aria-hidden="true">↘</span>
							Drag into Remotion Studio
						</button>
					</p>
					{installStatus.type === 'success' ||
					installStatus.type === 'error' ? (
						<p
							style={{
								color:
									installStatus.type === 'success'
										? 'var(--ifm-color-success-dark)'
										: 'var(--ifm-color-danger-dark)',
							}}
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

			<h2>Source</h2>
			{children}
		</>
	);
};
