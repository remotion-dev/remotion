import {PlayerInternals} from '@remotion/player';
import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	X264Preset,
} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import ReactDOM from 'react-dom';
import type {_InternalTypes} from 'remotion';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
	SELECTED_BACKGROUND,
} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {CaretDown} from '../icons/caret';
import {ThinRenderIcon} from '../icons/render';
import {useTimelineInOutFramePosition} from '../state/in-out';
import {ModalsContext} from '../state/modals';
import {HigherZIndex, useZIndex} from '../state/z-index';
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
import {Row, Spacing} from './layout';

const splitButtonContainer: React.CSSProperties = {
	display: 'inline-flex',
	flexDirection: 'row',
	alignItems: 'stretch',
	borderRadius: 4,
	border: `1px solid ${INPUT_BORDER_COLOR_UNHOVERED}`,
	backgroundColor: INPUT_BACKGROUND,
	overflow: 'hidden',
};

const mainButtonStyle: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
	background: 'transparent',
	border: 'none',
	color: 'white',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	fontSize: 14,
	fontFamily: 'inherit',
};

const dividerStyle: React.CSSProperties = {
	width: 1,
	backgroundColor: INPUT_BORDER_COLOR_UNHOVERED,
	alignSelf: 'stretch',
};

const dropdownTriggerStyle: React.CSSProperties = {
	paddingLeft: 4,
	paddingRight: 4,
	paddingTop: 7,
	paddingBottom: 7,
	background: 'transparent',
	border: 'none',
	color: 'white',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
};

const label: React.CSSProperties = {
	fontSize: 14,
};

export type RenderType = 'server-render' | 'client-render';

const RENDER_TYPE_STORAGE_KEY = 'remotion.renderType';

const getInitialRenderType = (): RenderType => {
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

export const RenderButton: React.FC = () => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setSelectedModal} = useContext(ModalsContext);
	const [renderType, setRenderType] =
		useState<RenderType>(getInitialRenderType);
	const [dropdownOpened, setDropdownOpened] = useState(false);
	const dropdownRef = useRef<HTMLButtonElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const {currentZIndex} = useZIndex();

	const size = PlayerInternals.useElementSize(dropdownRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const refresh = size?.refresh;

	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const shortcut = areKeyboardShortcutsDisabled() ? '' : '(R)';
	const tooltip =
		connectionStatus === 'connected'
			? 'Export the current composition ' + shortcut
			: 'Connect to the Studio server to render';

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 16,
				color: 'currentColor',
			},
		};
	}, []);

	const video = Internals.useVideo();
	const getCurrentFrame = PlayerInternals.useFrameImperative();

	const {props} = useContext(Internals.EditorPropsContext);

	const openServerRenderModal = useCallback(() => {
		if (!video) {
			return null;
		}

		const defaults = window.remotion_renderDefaults;

		if (!defaults) {
			throw new TypeError('Expected defaults');
		}

		setSelectedModal({
			type: 'server-render',
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
			initialPixelFormat: null,
			initialAudioBitrate: defaults.audioBitrate,
			initialVideoBitrate: defaults.videoBitrate,
			initialEveryNthFrame: defaults.everyNthFrame,
			initialNumberOfGifLoops: defaults.numberOfGifLoops,
			initialDelayRenderTimeout: defaults.delayRenderTimeout,
			defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec | null,
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
			initialForSeamlessAacConcatenation: defaults.forSeamlessAacConcatenation,
			renderTypeOfLastRender: null,
			defaulMetadata: defaults.metadata,
			initialHardwareAcceleration: defaults.hardwareAcceleration,
			initialChromeMode: defaults.chromeMode,
			initialMediaCacheSizeInBytes: defaults.mediaCacheSizeInBytes,
			renderDefaults: defaults,
		});
	}, [video, setSelectedModal, getCurrentFrame, props, inFrame, outFrame]);

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
		});
	}, [video, setSelectedModal, getCurrentFrame, props, inFrame, outFrame]);

	const onClick = useCallback(() => {
		if (renderType === 'server-render') {
			openServerRenderModal();
		} else {
			openClientRenderModal();
		}
	}, [renderType, openServerRenderModal, openClientRenderModal]);

	const onHideDropdown = useCallback(() => {
		setDropdownOpened(false);
	}, []);

	const handleRenderTypeChange = useCallback((newType: RenderType) => {
		setRenderType(newType);
		try {
			localStorage.setItem(RENDER_TYPE_STORAGE_KEY, newType);
		} catch {
			// localStorage might not be available
		}

		setDropdownOpened(false);
	}, []);

	const dropdownValues: ComboboxValue[] = useMemo(() => {
		return [
			{
				type: 'item' as const,
				id: 'server-render',
				label: 'Render',
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
				label: 'Client side render',
				value: 'client-render',
				onClick: () => handleRenderTypeChange('client-render'),
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
			},
		];
	}, [handleRenderTypeChange]);

	useEffect(() => {
		const {current} = dropdownRef;
		if (!current) {
			return;
		}

		const onPointerDown = () => {
			return setDropdownOpened((o) => {
				if (!o) {
					refresh?.();
				}

				return !o;
			});
		};

		const onClickDropdown = (e: MouseEvent | PointerEvent) => {
			e.stopPropagation();
			const isKeyboardInitiated = e.detail === 0;
			if (!isKeyboardInitiated) {
				return;
			}

			return setDropdownOpened((o) => {
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
		};

		current.addEventListener('pointerdown', onPointerDown);
		current.addEventListener('click', onClickDropdown);

		return () => {
			current.removeEventListener('pointerdown', onPointerDown);
			current.removeEventListener('click', onClickDropdown);
		};
	}, [refresh]);

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
			borderColor: dropdownOpened
				? SELECTED_BACKGROUND
				: INPUT_BORDER_COLOR_UNHOVERED,
			opacity: connectionStatus !== 'connected' ? 0.7 : 1,
			cursor: connectionStatus !== 'connected' ? 'inherit' : 'pointer',
		};
	}, [connectionStatus, dropdownOpened]);

	const renderLabel =
		renderType === 'server-render' ? 'Render' : 'Client render';

	if (!video) {
		return null;
	}

	return (
		<>
			<div
				ref={containerRef}
				style={containerStyle}
				id="render-modal-button"
				title={tooltip}
			>
				<button
					type="button"
					style={mainButtonStyle}
					onClick={onClick}
					disabled={connectionStatus !== 'connected'}
				>
					<Row align="center">
						<ThinRenderIcon fill="currentcolor" svgProps={iconStyle} />
						<Spacing x={1} />
						<span style={label}>{renderLabel}</span>
					</Row>
				</button>
				<div style={dividerStyle} />
				<button
					ref={dropdownRef}
					type="button"
					style={dropdownTriggerStyle}
					disabled={connectionStatus !== 'connected'}
					className={MENU_INITIATOR_CLASSNAME}
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
									<div style={portalStyle}>
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
