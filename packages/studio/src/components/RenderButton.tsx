import {PlayerInternals} from '@remotion/player';
import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	X264Preset,
} from '@remotion/renderer';
import type {RenderStillOnWebImageFormat} from '@remotion/web-renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {WHITE_ALPHA_80} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {CaretDown} from '../icons/caret';
import {ThinRenderIcon} from '../icons/render';
import {useTimelineInOutFramePosition} from '../state/in-out';
import {SetSelectedModalContext} from '../state/modals';
import {Row, Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';

const segmentedButtonStyle: React.CSSProperties = {
	height: 28,
};

const mainButtonContent: React.CSSProperties = {
	paddingLeft: 4,
	paddingRight: 6,
	minWidth: 0,
};

const label: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 14,
	lineHeight: '21px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

const compactMainSegmentStyle: React.CSSProperties = {
	padding: '0 6px',
};

const defaultMainSegmentStyle: React.CSSProperties = {
	fontFamily: 'inherit',
	fontSize: 14,
	padding: '0 7px',
};

const compactDropdownSegmentStyle: React.CSSProperties = {
	padding: 0,
	width: 20,
};

const defaultDropdownSegmentStyle: React.CSSProperties = {
	padding: '0 6px',
};

const compactMainButtonContent: React.CSSProperties = {
	...mainButtonContent,
	paddingLeft: 0,
	paddingRight: 0,
};

const compactLabel: React.CSSProperties = {
	...label,
	fontSize: 12,
	lineHeight: '16px',
};

export type RenderType = 'server-render' | 'client-render' | 'render-command';

const RENDER_TYPE_STORAGE_KEY = 'remotion.renderType';

const getInitialRenderType = (readOnlyStudio: boolean): RenderType => {
	if (readOnlyStudio) {
		return 'client-render';
	}

	try {
		const stored = localStorage.getItem(RENDER_TYPE_STORAGE_KEY);
		if (stored === 'server-render' || stored === 'client-render') {
			return stored;
		}
	} catch {
		// localStorage might not be available
	}

	return 'server-render';
};

const RenderButtonInner: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly size?: 'default' | 'compact';
	readonly narrow?: boolean;
}> = ({readOnlyStudio, size: controlSize = 'default', narrow = false}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [preferredRenderType, setPreferredRenderType] = useState<RenderType>(
		() => getInitialRenderType(readOnlyStudio),
	);

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const canServerRender = connectionStatus === 'connected' && !isBrowserStudio;

	const renderType: RenderType = useMemo(() => {
		if (readOnlyStudio) {
			return preferredRenderType === 'render-command'
				? 'render-command'
				: 'client-render';
		}

		if (connectionStatus === 'disconnected' || isBrowserStudio) {
			return 'client-render';
		}

		return preferredRenderType;
	}, [connectionStatus, isBrowserStudio, preferredRenderType, readOnlyStudio]);

	const shortcut = areKeyboardShortcutsDisabled() ? '' : '(R)';
	const tooltip =
		renderType === 'render-command'
			? 'Copy a CLI command to render this composition ' + shortcut
			: 'Export the current composition ' + shortcut;

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: controlSize === 'compact' ? 18 : 16,
				width: controlSize === 'compact' ? 18 : 16,
				flexShrink: 0,
			},
		};
	}, [controlSize]);

	const video = Internals.useVideo();
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {getCurrentFrame} = PlayerInternals.usePlayerMethods();

	const {props} = useContext(Internals.EditorPropsContext);

	// Read the frame when the modal opens instead of subscribing this button to
	// every timeline position update.
	const openServerRenderModal = useCallback(
		(copyCommandOnly: boolean) => {
			if (!video) {
				return null;
			}

			const defaults = window.remotion_renderDefaults;

			if (!defaults) {
				throw new TypeError('Expected defaults');
			}

			setSelectedModal({
				type: 'server-render',
				readOnlyStudio: copyCommandOnly,
				compositionId: video.id,
				initialFrame: getCurrentFrame(),
				initialStillImageFormat: defaults.stillImageFormat,
				initialVideoImageFormat: null,
				initialJpegQuality: defaults.jpegQuality,
				initialScale: window.remotion_renderDefaults?.scale ?? 1,
				initialLogLevel: defaults.logLevel as LogLevel,
				initialConcurrency: defaults.concurrency,
				maxConcurrency: defaults.maxConcurrency,
				minConcurrency: defaults.minConcurrency,
				initialMuted: defaults.muted,
				initialEnforceAudioTrack: defaults.enforceAudioTrack,
				initialProResProfile:
					defaults.proResProfile as _InternalTypes['ProResProfile'],
				initialx264Preset: defaults.x264Preset as X264Preset,
				initialGopSize: defaults.gopSize,
				initialPixelFormat: null,
				initialAudioBitrate: defaults.audioBitrate,
				initialVideoBitrate: defaults.videoBitrate,
				initialEveryNthFrame: defaults.everyNthFrame,
				initialNumberOfGifLoops: defaults.numberOfGifLoops,
				initialDelayRenderTimeout: defaults.delayRenderTimeout,
				defaultConfigurationAudioCodec:
					defaults.audioCodec as AudioCodec | null,
				initialEnvVariables: window.process.env as Record<string, string>,
				initialDisableWebSecurity: defaults.disableWebSecurity,
				initialDarkMode: defaults.darkMode,
				initialOpenGlRenderer: defaults.openGlRenderer as OpenGlRenderer | null,
				initialHeadless: defaults.headless,
				initialIgnoreCertificateErrors: defaults.ignoreCertificateErrors,
				initialOffthreadVideoCacheSizeInBytes:
					defaults.offthreadVideoCacheSizeInBytes,
				initialOffthreadVideoThreads: defaults.offthreadVideoThreads,
				defaultProps: props[video.id] ?? video.defaultProps,
				inFrameMark: inFrame,
				outFrameMark: outFrame,
				initialColorSpace: defaults.colorSpace as ColorSpace,
				initialMultiProcessOnLinux: defaults.multiProcessOnLinux,
				defaultConfigurationVideoCodec: defaults.codec as Codec,
				initialEncodingBufferSize: defaults.encodingBufferSize,
				initialEncodingMaxRate: defaults.encodingMaxRate,
				initialUserAgent: defaults.userAgent,
				initialBeep: defaults.beepOnFinish,
				initialRepro: defaults.repro,
				initialForSeamlessAacConcatenation:
					defaults.forSeamlessAacConcatenation,
				renderTypeOfLastRender: null,
				defaulMetadata: defaults.metadata,
				initialHardwareAcceleration: defaults.hardwareAcceleration,
				initialSampleRate: defaults.sampleRate,
				initialChromeMode: defaults.chromeMode,
				initialMediaCacheSizeInBytes: defaults.mediaCacheSizeInBytes,
				renderDefaults: defaults,
			});
		},
		[video, setSelectedModal, props, inFrame, outFrame, getCurrentFrame],
	);

	const openClientRenderModal = useCallback(() => {
		if (!video) {
			return null;
		}

		const defaults = window.remotion_renderDefaults;

		if (!defaults) {
			throw new TypeError('Expected defaults');
		}

		setSelectedModal({
			type: 'web-render',
			compositionId: video.id,
			initialFrame: getCurrentFrame(),
			defaultProps: props[video.id] ?? video.defaultProps,
			inFrameMark: inFrame,
			outFrameMark: outFrame,
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
			initialAllowHtmlInCanvas: defaults.allowHtmlInCanvas,
			initialPageResponsiveness: 'medium',
		});
	}, [video, setSelectedModal, props, inFrame, outFrame, getCurrentFrame]);

	const onClick = useCallback(() => {
		if (renderType === 'render-command') {
			openServerRenderModal(true);
			return;
		}

		if (renderType === 'server-render') {
			openServerRenderModal(false);
		} else {
			openClientRenderModal();
		}
	}, [renderType, openServerRenderModal, openClientRenderModal]);

	const handleRenderTypeChange = useCallback(
		(newType: RenderType) => {
			setPreferredRenderType(newType);
			try {
				localStorage.setItem(RENDER_TYPE_STORAGE_KEY, newType);
			} catch {
				// localStorage might not be available
			}

			if (newType === 'server-render') {
				openServerRenderModal(false);
			} else if (newType === 'render-command') {
				openServerRenderModal(true);
			} else {
				openClientRenderModal();
			}
		},
		[openClientRenderModal, openServerRenderModal],
	);
	const dropdownValues: ComboboxValue[] = useMemo(() => {
		if (readOnlyStudio) {
			return [
				{
					type: 'item' as const,
					id: 'client-render',
					label: 'Render in browser',
					value: 'client-render',
					onClick: () => handleRenderTypeChange('client-render'),
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: null,
				},
				{
					type: 'item' as const,
					id: 'render-command',
					label: 'Render via CLI',
					value: 'render-command',
					onClick: () => handleRenderTypeChange('render-command'),
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: null,
				},
			];
		}

		return [
			...(canServerRender
				? [
						{
							type: 'item' as const,
							id: 'server-render',
							label: 'Server-side render',
							value: 'server-render',
							onClick: () => handleRenderTypeChange('server-render'),
							keyHint: null,
							leftItem: null,
							subMenu: null,
							quickSwitcherLabel: null,
						},
					]
				: []),
			{
				type: 'item' as const,
				id: 'client-render',
				label: 'Client-side render',
				value: 'client-render',
				onClick: () => handleRenderTypeChange('client-render'),
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
			},
		];
	}, [canServerRender, handleRenderTypeChange, readOnlyStudio]);

	const renderLabel =
		renderType === 'server-render'
			? 'Render'
			: renderType === 'render-command'
				? 'Render via CLI'
				: 'Render in browser';
	const showRenderLabel = !narrow || renderType !== 'server-render';
	const segments = useMemo((): SegmentedButtonSegment[] => {
		return [
			{
				ariaLabel: renderLabel,
				buttonId: 'render-modal-button',
				disabled: false,
				idleColor: WHITE_ALPHA_80,
				onClick,
				onPointerDown: null,
				renderContent: (color) => (
					<Row
						align="center"
						style={
							controlSize === 'compact'
								? compactMainButtonContent
								: mainButtonContent
						}
					>
						<ThinRenderIcon fill={color} svgProps={iconStyle} />
						{showRenderLabel ? (
							<>
								<Spacing x={controlSize === 'compact' ? 0.75 : 1} />
								<span style={controlSize === 'compact' ? compactLabel : label}>
									{renderLabel}
								</span>
							</>
						) : null}
					</Row>
				),
				segmentId: 'render',
				style:
					controlSize === 'compact'
						? compactMainSegmentStyle
						: defaultMainSegmentStyle,
				title: tooltip,
				type: 'action',
			},
			{
				ariaLabel: 'Select render type',
				buttonId: null,
				disabled: false,
				idleColor: WHITE_ALPHA_80,
				leaveLeftSpace: false,
				onOpenChange: null,
				renderContent: (color) => <CaretDown color={color} />,
				segmentId: 'render-type',
				selectedId: renderType,
				style:
					controlSize === 'compact'
						? compactDropdownSegmentStyle
						: defaultDropdownSegmentStyle,
				title: 'Select render type',
				type: 'menu',
				values: dropdownValues,
			},
		];
	}, [
		controlSize,
		dropdownValues,
		iconStyle,
		onClick,
		renderLabel,
		renderType,
		showRenderLabel,
		tooltip,
	]);

	if (!video || canvasContent?.type !== 'composition') {
		return null;
	}

	return (
		<>
			<button
				style={{display: 'none'}}
				id="render-modal-button-server"
				disabled={!canServerRender}
				onClick={() => openServerRenderModal(false)}
				type="button"
			/>{' '}
			<button
				style={{display: 'none'}}
				id="render-modal-button-client"
				onClick={openClientRenderModal}
				type="button"
			/>
			<button
				style={{display: 'none'}}
				id="render-modal-button-command"
				onClick={() => openServerRenderModal(true)}
				type="button"
			/>
			<SegmentedButton
				segments={segments}
				style={segmentedButtonStyle}
				title={tooltip}
			/>
		</>
	);
};

export const RenderButton = React.memo(RenderButtonInner);
