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
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	CURRENT_COLOR,
	CURRENT_COLOR_LOWERCASE,
	INPUT_BACKGROUND,
	BLACK_ALPHA_60,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {CaretDown} from '../icons/caret';
import {ThinRenderIcon} from '../icons/render';
import {useTimelineInOutFramePosition} from '../state/in-out';
import {ModalsContext} from '../state/modals';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {COMPACT_CONTROL_ROW_HEIGHT, Row, Spacing} from './layout';
import {MENU_INITIATOR_CLASSNAME, isMenuItem} from './Menu/is-menu-item';
import {getPortal} from './Menu/portals';
import {
	fullScreenOverlay,
	menuContainerTowardsBottom,
	menuContainerTowardsTop,
	outerPortal,
} from './Menu/styles';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {MenuContent} from './NewComposition/MenuContent';

const splitButtonContainer: React.CSSProperties = {
	display: 'inline-flex',
	flexDirection: 'row',
	alignItems: 'stretch',
	borderRadius: 4,
	border: `1px solid ${BLACK_ALPHA_60}`,
	backgroundColor: INPUT_BACKGROUND,
	overflow: 'hidden',
};

const mainButtonStyle: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
	background: TRANSPARENT,
	border: 'none',
	color: WHITE,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	fontSize: 14,
	fontFamily: 'inherit',
};

const dividerStyle: React.CSSProperties = {
	width: 1,
	backgroundColor: BLACK_ALPHA_60,
	alignSelf: 'stretch',
};

const dropdownTriggerStyle: React.CSSProperties = {
	paddingLeft: 6,
	paddingRight: 6,
	paddingTop: 7,
	paddingBottom: 7,
	background: TRANSPARENT,
	border: 'none',
	color: WHITE,
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
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
	whiteSpace: 'nowrap',
};

const compactSplitButtonSegmentHeight = COMPACT_CONTROL_ROW_HEIGHT;

const compactMainButtonStyle: React.CSSProperties = {
	...mainButtonStyle,
	boxSizing: 'border-box',
	height: compactSplitButtonSegmentHeight,
	paddingLeft: 6,
	paddingRight: 6,
	paddingTop: 6,
	paddingBottom: 6,
	fontSize: 12,
};

const compactDropdownTriggerStyle: React.CSSProperties = {
	...dropdownTriggerStyle,
	boxSizing: 'border-box',
	height: compactSplitButtonSegmentHeight,
	paddingLeft: 5,
	paddingRight: 5,
	paddingTop: 6,
	paddingBottom: 6,
};

const compactMainButtonContent: React.CSSProperties = {
	...mainButtonContent,
	paddingLeft: 2,
	paddingRight: 4,
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

export const RenderButton: React.FC<{
	readonly readOnlyStudio: boolean;
	readonly size?: 'default' | 'compact';
}> = ({readOnlyStudio, size: controlSize = 'default'}) => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setSelectedModal} = useContext(ModalsContext);
	const [preferredRenderType, setPreferredRenderType] = useState<RenderType>(
		() => getInitialRenderType(readOnlyStudio),
	);
	const [dropdownOpened, setDropdownOpened] = useState(false);
	const dropdownRef = useRef<HTMLButtonElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const {currentZIndex} = useZIndex();

	const size = PlayerInternals.useElementSize(dropdownRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const refresh = size?.refresh;

	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			// Prevent deselection of currently selected items
			e.stopPropagation();
			setDropdownOpened((o) => {
				if (!o) {
					refresh?.();
				}

				return !o;
			});
		},
		[refresh],
	);

	const onMenuPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// Prevent deselection of currently selected items
			e.stopPropagation();
		},
		[],
	);

	const onClickDropdown = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			const isKeyboardInitiated = e.detail === 0;
			if (!isKeyboardInitiated) {
				return;
			}

			setDropdownOpened((o) => {
				if (!o) {
					refresh?.();

					window.addEventListener(
						'pointerup',
						(evt) => {
							if (!isMenuItem(evt.target as HTMLElement)) {
								setDropdownOpened(false);
							}
						},
						{
							once: true,
						},
					);
				}

				return !o;
			});
		},
		[refresh],
	);

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const canServerRender = connectionStatus === 'connected';

	const renderType: RenderType = useMemo(() => {
		if (readOnlyStudio) {
			return preferredRenderType === 'render-command'
				? 'render-command'
				: 'client-render';
		}

		if (connectionStatus === 'disconnected') {
			return 'client-render';
		}

		return preferredRenderType;
	}, [connectionStatus, preferredRenderType, readOnlyStudio]);

	const shortcut = areKeyboardShortcutsDisabled() ? '' : '(R)';
	const tooltip =
		renderType === 'render-command'
			? 'Copy a CLI command to render this composition ' + shortcut
			: 'Export the current composition ' + shortcut;

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: controlSize === 'compact' ? 14 : 16,
				color: CURRENT_COLOR,
				flexShrink: 0,
			},
		};
	}, [controlSize]);

	const video = Internals.useVideo();
	const {getCurrentFrame} = PlayerInternals.usePlayer();

	const {props} = useContext(Internals.EditorPropsContext);

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
		[video, setSelectedModal, getCurrentFrame, props, inFrame, outFrame],
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
			initialLicenseKey: defaults.publicLicenseKey,
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
			initialPageResponsiveness: 'medium',
		});
	}, [video, setSelectedModal, getCurrentFrame, props, inFrame, outFrame]);

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

	const onHideDropdown = useCallback(() => {
		setDropdownOpened(false);
	}, []);

	const handleRenderTypeChange = useCallback(
		(newType: RenderType) => {
			setPreferredRenderType(newType);
			try {
				localStorage.setItem(RENDER_TYPE_STORAGE_KEY, newType);
			} catch {
				// localStorage might not be available
			}

			setDropdownOpened(false);

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
					label: 'Render on web',
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
	}, [handleRenderTypeChange, readOnlyStudio]);

	const spaceToBottom = useMemo(() => {
		const margin = 10;
		if (size && dropdownOpened) {
			return size.windowSize.height - (size.top + size.height) - margin;
		}

		return 0;
	}, [dropdownOpened, size]);

	const spaceToTop = useMemo(() => {
		const margin = 10;
		if (size && dropdownOpened) {
			return size.top - margin;
		}

		return 0;
	}, [dropdownOpened, size]);

	const derivedMaxHeight = useMemo(() => {
		return spaceToTop > spaceToBottom ? spaceToTop : spaceToBottom;
	}, [spaceToBottom, spaceToTop]);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!dropdownOpened || !size) {
			return null;
		}

		const verticalLayout = spaceToTop > spaceToBottom ? 'bottom' : 'top';
		return {
			...(verticalLayout === 'top'
				? {
						...menuContainerTowardsBottom,
						top: size.top + size.height,
					}
				: {
						...menuContainerTowardsTop,
						bottom: size.windowSize.height - size.top,
					}),
			right: size.windowSize.width - size.left - size.width,
		};
	}, [dropdownOpened, size, spaceToBottom, spaceToTop]);

	const containerStyle = useMemo((): React.CSSProperties => {
		return {
			...splitButtonContainer,
			borderColor: BLACK_ALPHA_60,
			borderRadius: controlSize === 'compact' ? 0 : 4,
			opacity: 1,
			cursor: 'pointer',
		};
	}, [controlSize]);

	const renderLabel =
		renderType === 'server-render'
			? 'Render'
			: renderType === 'render-command'
				? 'Render via CLI'
				: 'Render on web';

	if (!video) {
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
			<div ref={containerRef} style={containerStyle} title={tooltip}>
				<button
					type="button"
					style={
						controlSize === 'compact' ? compactMainButtonStyle : mainButtonStyle
					}
					onClick={onClick}
					id="render-modal-button"
				>
					<Row
						align="center"
						style={
							controlSize === 'compact'
								? compactMainButtonContent
								: mainButtonContent
						}
					>
						<ThinRenderIcon
							fill={CURRENT_COLOR_LOWERCASE}
							svgProps={iconStyle}
						/>
						<Spacing x={controlSize === 'compact' ? 0.75 : 1} />
						<span style={controlSize === 'compact' ? compactLabel : label}>
							{renderLabel}
						</span>
					</Row>
				</button>
				<div style={dividerStyle} />
				<button
					ref={dropdownRef}
					type="button"
					style={
						controlSize === 'compact'
							? compactDropdownTriggerStyle
							: dropdownTriggerStyle
					}
					className={MENU_INITIATOR_CLASSNAME}
					onPointerDown={onPointerDown}
					onClick={onClickDropdown}
				>
					<CaretDown />
				</button>
			</div>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay}>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex
									onOutsideClick={onHideDropdown}
									onEscape={onHideDropdown}
								>
									<div style={portalStyle} onPointerDown={onMenuPointerDown}>
										<MenuContent
											onNextMenu={() => {}}
											onPreviousMenu={() => {}}
											values={dropdownValues}
											onHide={onHideDropdown}
											leaveLeftSpace={false}
											preselectIndex={dropdownValues.findIndex(
												(v) => v.id === renderType,
											)}
											topItemCanBeUnselected={false}
											fixedHeight={derivedMaxHeight}
										/>
									</div>
								</HigherZIndex>
							</div>
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
