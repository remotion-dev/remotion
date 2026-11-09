import type {LogLevel} from '@remotion/renderer';
import {REACT_REFRESH_FINISHED_EVENT} from '@remotion/studio-shared';
import type {RenderStillOnWebImageFormat} from '@remotion/web-renderer';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {
	subscribeToPreviewServerConnectionState,
	type PreviewServerConnectionState,
} from '../../helpers/preview-server-events';
import type {
	SetSelectedModalContextType,
	WebRenderModalState,
} from '../../state/modals';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';

export const canRenderOnServer = (
	readOnlyStudio: boolean,
	connectionStatus: PreviewServerConnectionState['type'],
) =>
	!readOnlyStudio &&
	connectionStatus === 'connected' &&
	getBrowserStudioOperations() === null;

export const openClientRenderModalForComposition = async ({
	compositionId,
	defaultProps,
	getInitialFrame,
	inFrameMark,
	outFrameMark,
	prepareServerBundle,
	setSelectedModal,
}: Pick<
	WebRenderModalState,
	'compositionId' | 'defaultProps' | 'inFrameMark' | 'outFrameMark'
> & {
	getInitialFrame: () => number;
	prepareServerBundle: boolean;
	setSelectedModal: SetSelectedModalContextType['setSelectedModal'];
}) => {
	const defaults = window.remotion_renderDefaults;
	if (!defaults) {
		throw new TypeError('Expected defaults');
	}

	if (prepareServerBundle) {
		const controller = new AbortController();
		const nextReconciliation = new Promise<void>((resolve) => {
			const finish = () => resolve();
			window.addEventListener(REACT_REFRESH_FINISHED_EVENT, finish, {
				once: true,
				signal: controller.signal,
			});
			controller.signal.addEventListener('abort', finish, {once: true});
		});
		const unsubscribe = subscribeToPreviewServerConnectionState((state) => {
			if (state.type !== 'connected') {
				controller.abort();
			}
		});

		try {
			const {didInvalidate} = await callApi(
				'/api/invalidate-bundle',
				{},
				controller.signal,
			);
			if (didInvalidate) {
				await nextReconciliation;
			}
		} catch (error) {
			if (!controller.signal.aborted) {
				showNotification(
					`Could not prepare client-side render: ${(error as Error).message}`,
					4000,
				);
				return;
			}
		} finally {
			unsubscribe();
			controller.abort();
		}
	}

	setSelectedModal({
		type: 'web-render',
		retryJobId: null,
		initialRenderType: null,
		compositionId,
		initialFrame: getInitialFrame(),
		defaultProps,
		inFrameMark,
		outFrameMark,
		initialLogLevel: defaults.logLevel as LogLevel,
		initialStillImageFormat:
			defaults.stillImageFormat as RenderStillOnWebImageFormat,
		initialScale: defaults.scale,
		initialDelayRenderTimeout: defaults.delayRenderTimeout,
		initialDefaultOutName: null,
		initialContainer: null,
		initialVideoCodec: null,
		initialAudioCodec: null,
		initialAudioBitrate: null,
		initialVideoBitrate: null,
		initialHardwareAcceleration: null,
		initialKeyframeIntervalInSeconds: null,
		initialTransparent: null,
		initialMuted: null,
		initialMediaCacheSizeInBytes: defaults.mediaCacheSizeInBytes,
		initialPreferredEffectBackend: defaults.preferredEffectBackend,
		initialAllowHtmlInCanvas: defaults.allowHtmlInCanvas,
		initialPageResponsiveness: 'medium',
	});
};
