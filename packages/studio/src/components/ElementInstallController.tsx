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

export const ElementInstallController: React.FC = () => {
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
	const currentCompositionId =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
	const currentComposition = useMemo(
		() =>
			compositions.find(
				(composition) => composition.id === currentCompositionId,
			) ?? null,
		[compositions, currentCompositionId],
	);
	const resolvedCompositionLocation = useResolvedStack(
		currentComposition?.stack ?? null,
	);
	const compositionFile =
		currentCompositionId === null
			? null
			: (resolvedCompositionLocation?.source ?? null);
	const canReceiveElementInstallRequest =
		previewServerClientId !== null && !window.remotion_isReadOnlyStudio;
	const contentDimensions = useMemo(
		() =>
			config && canvasContent?.type === 'composition'
				? {width: config.width, height: config.height}
				: null,
		[config, canvasContent],
	);
	const [pendingElementInstallRequests, setPendingElementInstallRequests] =
		useState<ElementInstallRequest[]>([]);
	const [activeElementInstallRequest, setActiveElementInstallRequest] =
		useState<ElementInstallRequest | null>(null);
	const lastFocusedAtRef = useRef<number | null>(
		typeof document === 'undefined' || document.hasFocus() ? Date.now() : null,
	);

	const updateElementInstallTarget = useCallback(
		(requestId: string) => {
			if (previewServerClientId === null) {
				return;
			}

			callApi('/api/update-element-install-target', {
				requestId,
				clientId: previewServerClientId,
				compositionFile: canReceiveElementInstallRequest
					? compositionFile
					: null,
				compositionId: canReceiveElementInstallRequest
					? currentCompositionId
					: null,
				lastFocusedAt: lastFocusedAtRef.current,
				readOnly: window.remotion_isReadOnlyStudio,
				studioUrl: window.location.href,
			}).catch(() => undefined);
		},
		[
			canReceiveElementInstallRequest,
			compositionFile,
			currentCompositionId,
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

			const canInstall =
				canReceiveElementInstallRequest && previewServerClientId !== null;
			const request: ElementInstallRequest | null = canInstall
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
			const result: InstallInStudioResult = canInstall
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
						message:
							'Focus a Remotion Studio that is not read-only, then try again.',
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
		canReceiveElementInstallRequest,
		compositionFile,
		currentCompositionId,
		previewServerClientId,
	]);

	useEffect(() => {
		return subscribeToElementInstallRequests((request) => {
			const isDragAndDrop = request.source.type === 'drag-and-drop';
			const requestWithDefaults = isDragAndDrop
				? request
				: {
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
									contentDimensions === null
										? null
										: {
												centerX: contentDimensions.width / 2,
												centerY: contentDimensions.height / 2,
											},
							}),
					};
			setPendingElementInstallRequests((requests) => [
				...requests,
				requestWithDefaults,
			]);
		});
	}, [contentDimensions]);

	useEffect(() => {
		if (
			!canReceiveElementInstallRequest ||
			compositionFile === null ||
			currentCompositionId === null
		) {
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
	}, [canReceiveElementInstallRequest, compositionFile, currentCompositionId]);

	useEffect(() => {
		if (
			activeElementInstallRequest !== null ||
			pendingElementInstallRequests.length === 0
		) {
			return;
		}

		const [nextRequest, ...remainingRequests] = pendingElementInstallRequests;
		if (!nextRequest) {
			throw new Error('Expected pending Element install request');
		}

		setActiveElementInstallRequest(nextRequest);
		setPendingElementInstallRequests(remainingRequests);
	}, [activeElementInstallRequest, pendingElementInstallRequests]);

	const closeElementInstallDialog = useCallback(() => {
		setSelectedModal(null);
		setActiveElementInstallRequest(null);
	}, [setSelectedModal]);

	useEffect(() => {
		if (activeElementInstallRequest === null) {
			return;
		}

		let canceled = false;
		const handleInstallRequest = async () => {
			try {
				const [newPreflight, currentPreflight] = await Promise.all([
					prepareElementInstall({
						installationName: null,
						destination: {
							type: 'new-composition',
							compositionFile: null,
						},
						element: activeElementInstallRequest.element,
					}),
					activeElementInstallRequest.compositionFile !== null &&
					activeElementInstallRequest.compositionId !== null
						? prepareElementInstall({
								installationName: null,
								destination: {
									type: 'current-composition',
									compositionFile: activeElementInstallRequest.compositionFile,
									compositionId: activeElementInstallRequest.compositionId,
								},
								element: activeElementInstallRequest.element,
							})
						: Promise.resolve(null),
				]);
				if (canceled) {
					return;
				}

				if (!newPreflight.success) {
					showNotification(
						`Could not review Element installation: ${newPreflight.reason}`,
						4000,
					);
					setActiveElementInstallRequest(null);
					return;
				}

				const declaredDependencies = Array.from(
					new Map(
						activeElementInstallRequest.element.dependencies.map(
							(dependency) => [dependency.name, dependency],
						),
					).values(),
				);
				const missingPackages = getMissingPackages(declaredDependencies).map(
					(dependency) =>
						dependency.version === null
							? dependency.name
							: `${dependency.name}@${dependency.version}`,
				);
				const {source} = activeElementInstallRequest;
				const sourceLabel =
					source.type === 'studio-protocol'
						? source.origin
						: source.type === 'browser-studio-link'
							? (source.origin ?? 'Unverified Browser Studio link')
							: 'Unverified drag-and-drop payload';
				const sourceIsUnverified =
					source.type === 'drag-and-drop' ||
					(source.type === 'browser-studio-link' && source.origin === null);
				const currentPlan = currentPreflight?.success
					? currentPreflight.plan
					: null;
				setSelectedModal({
					type: 'element-install',
					currentPlan,
					missingPackages,
					newPlan: newPreflight.plan,
					onClose: closeElementInstallDialog,
					request: activeElementInstallRequest,
					sourceIsUnverified,
					sourceLabel,
				});
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
				setActiveElementInstallRequest(null);
			}
		};

		handleInstallRequest();
		return () => {
			canceled = true;
		};
	}, [
		activeElementInstallRequest,
		closeElementInstallDialog,
		setSelectedModal,
	]);

	return null;
};
