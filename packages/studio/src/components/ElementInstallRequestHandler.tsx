import {
	StudioProtocolInternals,
	type InstallInStudioResult,
} from '@remotion/studio-protocol';
import type {ElementInstallRequest} from '@remotion/studio-shared';
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FC,
} from 'react';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {getMissingPackages} from '../helpers/install-required-package';
import {SetSelectedModalContext} from '../state/modals';
import {callApi} from './call-api';
import {prepareElementInstall} from './element-install-api';
import {
	enqueueElementInstallRequest,
	subscribeToElementInstallRequests,
} from './element-install-request';
import {getElementPositionForDrop, getFromForDrop} from './import-assets';
import {showNotification} from './Notifications/NotificationCenter';
import {getCurrentFrame} from './Timeline/imperative-state';
import {useResolvedStack} from './Timeline/use-resolved-stack';

export const ElementInstallRequestHandler: FC = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const config = Internals.useUnsafeVideoConfig();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const previewServerClientId =
		previewServerState.type === 'connected'
			? previewServerState.clientId
			: null;
	const [pendingRequests, setPendingRequests] = useState<
		ElementInstallRequest[]
	>([]);
	const [activeRequest, setActiveRequest] =
		useState<ElementInstallRequest | null>(null);
	const lastFocusedAtRef = useRef<number | null>(
		typeof document === 'undefined' || document.hasFocus() ? Date.now() : null,
	);

	const currentCompositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const currentComposition = useMemo(() => {
		if (currentCompositionId === null) {
			return null;
		}

		return (
			compositions.find(
				(composition) => composition.id === currentCompositionId,
			) ?? null
		);
	}, [compositions, currentCompositionId]);
	const resolvedCompositionLocation = useResolvedStack(
		currentComposition?.stack ?? null,
	);
	const compositionFile = resolvedCompositionLocation?.source ?? null;
	const canInstallElement =
		previewServerClientId !== null && !window.remotion_isReadOnlyStudio;
	const hasCurrentComposition =
		canInstallElement &&
		currentCompositionId !== null &&
		compositionFile !== null;

	const updateElementInstallTarget = useCallback(
		(requestId: string) => {
			if (previewServerClientId === null) {
				return;
			}

			callApi('/api/update-element-install-target', {
				requestId,
				clientId: previewServerClientId,
				compositionFile: hasCurrentComposition ? compositionFile : null,
				compositionId: hasCurrentComposition ? currentCompositionId : null,
				lastFocusedAt: lastFocusedAtRef.current,
				readOnly: window.remotion_isReadOnlyStudio,
				studioUrl: window.location.href,
			}).catch(() => undefined);
		},
		[
			compositionFile,
			currentCompositionId,
			hasCurrentComposition,
			previewServerClientId,
		],
	);

	useEffect(() => {
		const markFocused = () => {
			lastFocusedAtRef.current = Date.now();
		};

		window.addEventListener('focus', markFocused);
		document.addEventListener('pointerdown', markFocused, {capture: true});

		return () => {
			window.removeEventListener('focus', markFocused);
			document.removeEventListener('pointerdown', markFocused, {capture: true});
		};
	}, []);

	useEffect(() => {
		return subscribeToEvent('request-element-install-target', (event) => {
			if (event.type !== 'request-element-install-target') {
				return;
			}

			updateElementInstallTarget(event.requestId);
		});
	}, [subscribeToEvent, updateElementInstallTarget]);

	useEffect(() => {
		if (previewServerClientId === null) {
			return;
		}

		return subscribeToEvent('element-install-request', (event) => {
			if (
				event.type !== 'element-install-request' ||
				event.request.clientId !== previewServerClientId
			) {
				return;
			}

			enqueueElementInstallRequest(event.request);
		});
	}, [previewServerClientId, subscribeToEvent]);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const elementLibrary = document.querySelector<HTMLIFrameElement>(
				'iframe[data-remotion-element-library]',
			);
			if (
				event.source !== elementLibrary?.contentWindow ||
				!StudioProtocolInternals.isAllowedStudioProtocolPageOrigin(event.origin)
			) {
				return;
			}

			const payload =
				StudioProtocolInternals.parseStudioProtocolIframeInstallRequest(
					event.data,
				);
			const responsePort = event.ports[0];
			if (payload === null || responsePort === undefined) {
				return;
			}

			const request: ElementInstallRequest | null = canInstallElement
				? {
						clientId: previewServerClientId,
						compositionFile,
						compositionId: currentCompositionId,
						createdAt: Date.now(),
						element: {
							...payload.element,
							durationInFrames: payload.element.durationInFrames ?? null,
							initialProps: payload.element.initialProps ?? null,
							installationMode: payload.element.installationMode ?? null,
						},
						from: null,
						id: crypto.randomUUID(),
						position: null,
						source: {origin: event.origin, type: 'studio-protocol'},
					}
				: null;
			const result: InstallInStudioResult = canInstallElement
				? {
						success: true,
						status: 'awaiting-confirmation',
						target: {
							compositionId: currentCompositionId,
							projectName: window.remotion_projectName,
							studioOrigin: window.location.origin,
							studioVersion: window.remotion_version,
						},
					}
				: {
						success: false,
						code: 'no-installable-target',
						message: 'Focus Remotion Studio, then try again.',
					};

			const timeout = window.setTimeout(() => responsePort.close(), 1000);
			responsePort.onmessage = () => {
				window.clearTimeout(timeout);
				responsePort.close();
				if (request !== null) {
					enqueueElementInstallRequest(request);
				}
			};

			responsePort.postMessage(result);
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [
		canInstallElement,
		compositionFile,
		currentCompositionId,
		previewServerClientId,
	]);

	useEffect(() => {
		return subscribeToElementInstallRequests((request) => {
			const shouldAddCompositionDefaults =
				request.source.type !== 'drag-and-drop' &&
				request.compositionFile !== null &&
				request.compositionId !== null;
			const requestWithDefaults = shouldAddCompositionDefaults
				? {
						...request,
						from:
							request.from ??
							getFromForDrop({
								durationInFrames: request.element.durationInFrames,
								from: getCurrentFrame(),
								preferCompositionStart: true,
							}),
						position:
							request.position ??
							getElementPositionForDrop({
								dimensions: request.element.dimensions,
								dropPosition:
									config === null
										? null
										: {
												centerX: config.width / 2,
												centerY: config.height / 2,
											},
							}),
					}
				: request;
			setPendingRequests((requests) => [...requests, requestWithDefaults]);
		});
	}, [config]);

	useEffect(() => {
		if (!canInstallElement) {
			return;
		}

		const initialElement =
			getBrowserStudioOperations()?.consumeInitialElement() ?? null;
		if (initialElement === null) {
			return;
		}

		enqueueElementInstallRequest({
			clientId: 'browser-studio',
			compositionFile,
			compositionId: currentCompositionId,
			createdAt: Date.now(),
			element: initialElement.element,
			from: null,
			id: crypto.randomUUID(),
			position: null,
			source: {
				origin: initialElement.sourceOrigin,
				type: 'browser-studio-link',
			},
		});
	}, [canInstallElement, compositionFile, currentCompositionId]);

	useEffect(() => {
		if (activeRequest !== null || pendingRequests.length === 0) {
			return;
		}

		const [nextRequest, ...remainingRequests] = pendingRequests;
		if (!nextRequest) {
			throw new Error('Expected pending Element install request');
		}

		setActiveRequest(nextRequest);
		setPendingRequests(remainingRequests);
	}, [activeRequest, pendingRequests]);

	const closeElementInstallDialog = useCallback(() => {
		setSelectedModal((modal) =>
			modal?.type === 'element-install' ? null : modal,
		);
		setActiveRequest(null);
	}, [setSelectedModal]);

	const cancelElementInstallDialog = useCallback(() => {
		setSelectedModal((modal) =>
			modal?.type === 'element-install' ? modal.library : modal,
		);
		setActiveRequest(null);
	}, [setSelectedModal]);

	useEffect(() => {
		if (activeRequest === null) {
			return;
		}

		let canceled = false;
		const handleInstallRequest = async () => {
			try {
				const currentDestination =
					activeRequest.compositionFile === null ||
					activeRequest.compositionId === null
						? null
						: {
								compositionFile: activeRequest.compositionFile,
								compositionId: activeRequest.compositionId,
							};
				const [newPreflight, currentPreflight] = await Promise.all([
					prepareElementInstall({
						installationName: null,
						destination: {
							type: 'new-composition',
							compositionFile: null,
						},
						element: activeRequest.element,
					}),
					currentDestination === null
						? null
						: prepareElementInstall({
								installationName: null,
								destination: {
									type: 'current-composition',
									compositionFile: currentDestination.compositionFile,
									compositionId: currentDestination.compositionId,
								},
								element: activeRequest.element,
							}),
				]);
				if (canceled) {
					return;
				}

				if (!newPreflight.success) {
					showNotification(
						`Could not review Element installation: ${newPreflight.reason}`,
						4000,
					);
					setActiveRequest(null);
					return;
				}

				const declaredDependencies = Array.from(
					new Map(
						activeRequest.element.dependencies.map((dependency) => [
							dependency.name,
							dependency,
						]),
					).values(),
				);
				const missingPackages = getMissingPackages(declaredDependencies).map(
					(dependency) =>
						dependency.version === null
							? dependency.name
							: `${dependency.name}@${dependency.version}`,
				);
				const {source} = activeRequest;
				const sourceLabel =
					source.type === 'studio-protocol'
						? source.origin
						: source.type === 'browser-studio-link'
							? (source.origin ?? 'Unverified Browser Studio link')
							: 'Unverified drag-and-drop payload';
				const sourceIsUnverified =
					source.type === 'drag-and-drop' ||
					(source.type === 'browser-studio-link' && source.origin === null);
				const currentPlan =
					currentPreflight?.success === true ? currentPreflight.plan : null;
				setSelectedModal((modal) => ({
					type: 'element-install',
					currentPlan,
					library:
						activeRequest.source.type === 'studio-protocol' &&
						modal?.type === 'element-library'
							? modal
							: null,
					missingPackages,
					newPlan: newPreflight.plan,
					onCancel: cancelElementInstallDialog,
					onClose: closeElementInstallDialog,
					request: activeRequest,
					sourceIsUnverified,
					sourceLabel,
				}));
			} catch (error) {
				if (canceled) {
					return;
				}

				showNotification(
					`Could not review Element installation: ${
						error instanceof Error ? error.message : String(error)
					}`,
					4000,
				);
				setActiveRequest(null);
			}
		};

		handleInstallRequest();
		return () => {
			canceled = true;
		};
	}, [
		activeRequest,
		cancelElementInstallDialog,
		closeElementInstallDialog,
		setSelectedModal,
	]);

	return null;
};
