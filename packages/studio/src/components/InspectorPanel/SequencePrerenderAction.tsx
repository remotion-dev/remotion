import React, {useCallback, useContext, useState} from 'react';
import type {_InternalTypes, TSequence} from 'remotion';
import {Internals, random} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {PrerenderIcon} from '../../icons/prerender';
import {SidebarContext} from '../../state/sidebar';
import {showNotification} from '../Notifications/NotificationCenter';
import {optionsSidebarTabs} from '../options-sidebar-tabs';
import {persistSelectedOptionsSidebarPanel} from '../OptionsPanel';
import {addVideoRenderJob} from '../RenderQueue/actions';
import {InspectorQuickAction} from './common';

const iconStyle: React.CSSProperties = {
	display: 'block',
	height: 16,
	width: 16,
};

// Returns the path of the first prop that cannot be passed as input props.
const findUnserializableProp = (
	value: unknown,
	propPath: string,
): string | null => {
	if (
		typeof value === 'function' ||
		typeof value === 'symbol' ||
		typeof value === 'bigint' ||
		React.isValidElement(value)
	) {
		return propPath;
	}

	if (typeof value !== 'object' || value === null) {
		return null;
	}

	for (const [key, item] of Object.entries(value)) {
		const found = findUnserializableProp(item, `${propPath}.${key}`);
		if (found !== null) {
			return found;
		}
	}

	return null;
};

// Renders the connected composition to a video in the public folder, then
// replaces the scene at the call site with that video, like flattening a track.
// The scene is rendered the way it is embedded: with the call-site props, at
// the size and frame rate of the current composition, for as long as the
// sequence shows it.
export const SequencePrerenderAction: React.FC<{
	readonly nodePathInfo: SequenceNodePathInfo;
	readonly sequence: TSequence;
	readonly connectedComposition: _InternalTypes['AnyComposition'];
	readonly sourceActionsDisabled: boolean;
}> = ({
	nodePathInfo,
	sequence,
	connectedComposition,
	sourceActionsDisabled,
}) => {
	const video = Internals.useVideo();
	const {setSidebarCollapsedState} = useContext(SidebarContext);
	const [busy, setBusy] = useState(false);

	// The scene sees frames from `trimBefore` until the end of the sequence
	const durationInFrames = Math.ceil(
		(sequence.trimBefore ?? 0) +
			sequence.duration * sequence.sequencePlaybackRate,
	);
	const {getSingleChildProps} = sequence;
	const canPrerender =
		video !== null &&
		getSingleChildProps !== null &&
		getSingleChildProps !== undefined &&
		Number.isFinite(durationInFrames) &&
		durationInFrames > 0 &&
		sequence.frozenFrame === null &&
		sequence.loopDisplay === undefined &&
		// calculateMetadata() would not run when the scene is embedded
		connectedComposition.calculateMetadata === null &&
		nodePathInfo.numberOfSequencesWithThisNodePath === 1;

	const onPrerender = useCallback(() => {
		const defaults = window.remotion_renderDefaults;
		if (!canPrerender || video === null || !getSingleChildProps) {
			return;
		}

		if (!defaults) {
			throw new TypeError('Expected defaults');
		}

		const callSiteProps = getSingleChildProps() ?? {};
		const unserializableProp = findUnserializableProp(callSiteProps, 'props');
		if (unserializableProp !== null) {
			showNotification(
				`Cannot render and replace: ${unserializableProp} cannot be serialized`,
				4000,
			);
			return;
		}

		setBusy(true);
		addVideoRenderJob({
			compositionId: connectedComposition.id,
			// Keyed by call site so that two pre-renders don't overwrite each other
			outName: `prerendered/${connectedComposition.id}-${random(
				`${nodePathInfo.sequenceSubscriptionKey.absolutePath}:${nodePathInfo.sequenceSubscriptionKey.nodePath.join('.')}`,
			)
				.toString(36)
				.slice(2, 8)}.webm`,
			// Transparent, because the scene might not cover the whole frame.
			// VP8 is the codec that Chrome can play with alpha.
			imageFormat: 'png',
			jpegQuality: defaults.jpegQuality,
			scale: 1,
			logLevel: defaults.logLevel,
			codec: 'vp8',
			concurrency: defaults.concurrency,
			crf: null,
			gopSize: null,
			startFrame: 0,
			endFrame: durationInFrames - 1,
			muted: false,
			enforceAudioTrack: false,
			proResProfile: null,
			x264Preset: null,
			pixelFormat: 'yuva420p',
			audioBitrate: null,
			videoBitrate: null,
			everyNthFrame: 1,
			numberOfGifLoops: null,
			delayRenderTimeout: defaults.delayRenderTimeout,
			audioCodec: 'opus',
			disallowParallelEncoding: false,
			chromiumOptions: {
				headless: defaults.headless,
				disableWebSecurity: defaults.disableWebSecurity,
				ignoreCertificateErrors: defaults.ignoreCertificateErrors,
				gl: defaults.openGlRenderer,
				userAgent: defaults.userAgent,
				enableMultiProcessOnLinux: defaults.multiProcessOnLinux,
				darkMode: defaults.darkMode,
			},
			envVariables: window.process.env as Record<string, string>,
			inputProps: callSiteProps,
			offthreadVideoCacheSizeInBytes: defaults.offthreadVideoCacheSizeInBytes,
			offthreadVideoThreads: defaults.offthreadVideoThreads,
			colorSpace: 'default',
			multiProcessOnLinux: defaults.multiProcessOnLinux,
			encodingMaxRate: null,
			encodingBufferSize: null,
			beepOnFinish: false,
			repro: false,
			forSeamlessAacConcatenation: false,
			separateAudioTo: null,
			metadata: defaults.metadata,
			hardwareAcceleration: defaults.hardwareAcceleration,
			chromeMode: defaults.chromeMode,
			mediaCacheSizeInBytes: defaults.mediaCacheSizeInBytes,
			preferredEffectBackend: defaults.preferredEffectBackend,
			sampleRate: defaults.sampleRate,
			licenseKey: defaults.publicLicenseKey,
			prerenderTarget: {
				fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
				nodePath: nodePathInfo.sequenceSubscriptionKey.nodePath,
				width: video.width,
				height: video.height,
				fps: video.fps,
				durationInFrames,
			},
		})
			.then(() => {
				setSidebarCollapsedState({left: null, right: 'expanded'});
				persistSelectedOptionsSidebarPanel('renders');
				optionsSidebarTabs.current?.selectRendersPanel();
			})
			.catch((error) => {
				showNotification((error as Error).message, 4000);
			})
			.finally(() => setBusy(false));
	}, [
		canPrerender,
		connectedComposition,
		durationInFrames,
		getSingleChildProps,
		nodePathInfo,
		setSidebarCollapsedState,
		video,
	]);

	// Rendering needs the Node.js render queue.
	if (sourceActionsDisabled || getBrowserStudioOperations() !== null) {
		return null;
	}

	return (
		<InspectorQuickAction
			disabled={busy || !canPrerender}
			onClick={onPrerender}
			renderIcon={(color) => <PrerenderIcon color={color} style={iconStyle} />}
		>
			Render and replace
		</InspectorQuickAction>
	);
};
