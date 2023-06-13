import type {
	AudioCodec,
	Codec,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
	VideoImageFormat,
} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from 'react';
import type {AnyComposition, TCompMetadata} from 'remotion';
import {Internals} from 'remotion';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {ShortcutHint} from '../../../preview-server/error-overlay/remotion-overlay/ShortcutHint';
import type {
	RequiredChromiumOptions,
	UiOpenGlOptions,
} from '../../../required-chromium-options';
import {
	envVariablesArrayToObject,
	envVariablesObjectToArray,
} from '../../helpers/convert-env-variables';
import {useRenderModalSections} from '../../helpers/render-modal-sections';
import {useKeybinding} from '../../helpers/use-keybinding';
import {AudioIcon} from '../../icons/audio';
import {DataIcon} from '../../icons/data';
import {FileIcon} from '../../icons/file';
import {PicIcon} from '../../icons/frame';
import {GearIcon} from '../../icons/gear';
import {GifIcon} from '../../icons/gif';

import type {AnyZodObject} from 'zod';
import {BLUE, BLUE_DISABLED, LIGHT_TEXT} from '../../helpers/colors';
import {ModalsContext} from '../../state/modals';
import {SidebarContext} from '../../state/sidebar';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {inlineCodeSnippet} from '../Menu/styles';
import {
	getMaxModalHeight,
	getMaxModalWidth,
	ModalContainer,
} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {addStillRenderJob, addVideoRenderJob} from '../RenderQueue/actions';
import {persistSelectedPanel, rightSidebarTabs} from '../RightPanel';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {Spinner} from '../Spinner';
import {VerticalTab} from '../Tabs/vertical';
import {useCrfState} from './CrfSetting';
import {DataEditor} from './DataEditor';
import {validateOutnameGui} from './out-name-checker';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalAdvanced} from './RenderModalAdvanced';
import {RenderModalAudio} from './RenderModalAudio';
import {RenderModalBasic} from './RenderModalBasic';
import {RenderModalGif} from './RenderModalGif';
import type {QualityControl} from './RenderModalPicture';
import {RenderModalPicture} from './RenderModalPicture';

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'success';
	  }
	| {
			type: 'load';
	  }
	| {
			type: 'error';
	  };

const initialState: State = {type: 'idle'};

type Action =
	| {
			type: 'start';
	  }
	| {
			type: 'succeed';
	  }
	| {
			type: 'fail';
	  };

const reducer = (state: State, action: Action): State => {
	if (action.type === 'start') {
		return {
			type: 'load',
		};
	}

	if (action.type === 'fail') {
		return {
			type: 'error',
		};
	}

	if (action.type === 'succeed') {
		return {
			type: 'success',
		};
	}

	return state;
};

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	borderBottom: '1px solid black',
};

const rightPanel: React.CSSProperties = {
	display: 'flex',
	width: '100%',
};

const horizontalLayout: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	overflowY: 'auto',
	flex: 1,
};

const leftSidebar: React.CSSProperties = {
	padding: 12,
};

const horizontalTab: React.CSSProperties = {
	width: 250,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	textAlign: 'left',
	fontSize: 16,
	fontWeight: 'bold',
	paddingLeft: 15,
	paddingTop: 12,
	paddingBottom: 12,
};

const iconContainer: React.CSSProperties = {
	width: 20,
	height: 20,
	marginRight: 15,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const icon: React.CSSProperties = {
	color: 'currentcolor',
	height: 20,
};

const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

const flexer: React.CSSProperties = {
	flex: 1,
};

const outer: React.CSSProperties = {
	width: getMaxModalWidth(1000),
	height: getMaxModalHeight(640),
	overflow: 'hidden',
	display: 'flex',
	flexDirection: 'column',
};

type RenderModalProps = {
	compositionId: string;
	initialFrame: number;
	initialVideoImageFormat: VideoImageFormat;
	initialStillImageFormat: StillImageFormat;
	initialJpegQuality: number;
	initialScale: number;
	initialVerbose: boolean;
	initialOutName: string;
	initialRenderType: RenderType;
	initialVideoCodecForAudioTab: Codec;
	initialVideoCodecForVideoTab: Codec;
	initialAudioCodec: AudioCodec | null;
	initialConcurrency: number;
	minConcurrency: number;
	maxConcurrency: number;
	initialMuted: boolean;
	initialEnforceAudioTrack: boolean;
	initialProResProfile: ProResProfile;
	initialPixelFormat: PixelFormat;
	initialVideoBitrate: string | null;
	initialAudioBitrate: string | null;
	initialEveryNthFrame: number;
	initialNumberOfGifLoops: number | null;
	initialDelayRenderTimeout: number;
	initialEnvVariables: Record<string, string>;
	initialDisableWebSecurity: boolean;
	initialGl: OpenGlRenderer | null;
	initialIgnoreCertificateErrors: boolean;
	initialHeadless: boolean;
	defaultProps: Record<string, unknown>;
	inFrameMark: number | null;
	outFrameMark: number | null;
};

const RenderModal: React.FC<
	Omit<RenderModalProps, 'compositionId'> & {
		onClose: () => void;
		resolvedComposition: TCompMetadata<
			AnyZodObject,
			Record<string, unknown> | undefined
		>;
		unresolvedComposition: AnyComposition;
	}
> = ({
	initialFrame,
	initialVideoImageFormat,
	initialStillImageFormat,
	initialJpegQuality,
	initialScale,
	initialVerbose,
	initialOutName,
	initialRenderType,
	initialVideoCodecForAudioTab,
	initialVideoCodecForVideoTab,
	initialConcurrency,
	maxConcurrency,
	minConcurrency,
	initialMuted,
	initialEnforceAudioTrack,
	initialProResProfile,
	initialPixelFormat,
	initialVideoBitrate,
	initialAudioBitrate,
	initialEveryNthFrame,
	initialNumberOfGifLoops,
	initialDelayRenderTimeout,
	initialAudioCodec,
	initialEnvVariables,
	initialDisableWebSecurity,
	initialGl,
	initialHeadless,
	initialIgnoreCertificateErrors,
	defaultProps,
	inFrameMark,
	outFrameMark,
	onClose,
	resolvedComposition,
	unresolvedComposition,
}) => {
	const isMounted = useRef(true);

	const [state, dispatch] = useReducer(reducer, initialState);
	const [unclampedFrame, setFrame] = useState(() => initialFrame);

	const [stillImageFormat, setStillImageFormat] = useState<StillImageFormat>(
		() => initialStillImageFormat
	);
	const [videoImageFormat, setVideoImageFormat] = useState<VideoImageFormat>(
		() => initialVideoImageFormat
	);
	const [concurrency, setConcurrency] = useState(() => initialConcurrency);
	const [videoCodecForVideoTab, setVideoCodecForVideoTab] = useState<Codec>(
		() => initialVideoCodecForVideoTab
	);
	const [userSelectedAudioCodec, setUserSelectedAudioCodec] =
		useState<AudioCodec | null>(() => initialAudioCodec);

	const [envVariables, setEnvVariables] = useState<[string, string][]>(() =>
		envVariablesObjectToArray(initialEnvVariables).filter(
			([key]) => key !== 'NODE_ENV'
		)
	);
	const [videoCodecForAudioTab, setVideoCodecForAudioTab] = useState<Codec>(
		() => initialVideoCodecForAudioTab
	);

	const [mutedState, setMuted] = useState(() => initialMuted);
	const [enforceAudioTrackState, setEnforceAudioTrackState] = useState(
		() => initialEnforceAudioTrack
	);

	const [renderMode, setRenderModeState] =
		useState<RenderType>(initialRenderType);
	const [jpegQuality, setJpegQuality] = useState<number>(
		() => initialJpegQuality
	);
	const [scale, setScale] = useState(() => initialScale);
	const [verbose, setVerboseLogging] = useState(() => initialVerbose);
	const [disallowParallelEncoding, setDisallowParallelEncoding] =
		useState(false);
	const [disableWebSecurity, setDisableWebSecurity] = useState<boolean>(
		() => initialDisableWebSecurity
	);
	const [headless, setHeadless] = useState<boolean>(() => initialHeadless);
	const [ignoreCertificateErrors, setIgnoreCertificateErrors] =
		useState<boolean>(() => initialIgnoreCertificateErrors);
	const [openGlOption, setOpenGlOption] = useState<UiOpenGlOptions>(
		() => initialGl ?? 'default'
	);

	const chromiumOptions: RequiredChromiumOptions = useMemo(() => {
		return {
			headless,
			disableWebSecurity,
			ignoreCertificateErrors,
			gl: openGlOption === 'default' ? null : openGlOption,
			// TODO: Make this configurable at some point (not necessary for V4)
			userAgent: null,
		};
	}, [headless, disableWebSecurity, ignoreCertificateErrors, openGlOption]);

	const [outName, setOutName] = useState(() => initialOutName);
	const [endFrameOrNull, setEndFrame] = useState<number | null>(
		() => outFrameMark ?? null
	);
	const [startFrameOrNull, setStartFrame] = useState<number | null>(
		() => inFrameMark ?? null
	);
	const [proResProfileSetting, setProResProfile] = useState<ProResProfile>(
		() => initialProResProfile
	);

	const [pixelFormat, setPixelFormat] = useState<PixelFormat>(
		() => initialPixelFormat
	);
	const [preferredQualityControlType, setQualityControl] =
		useState<QualityControl>(() =>
			initialVideoBitrate === null ? 'crf' : 'bitrate'
		);
	const [
		shouldHaveCustomTargetAudioBitrate,
		setShouldHaveCustomTargetAudioBitrate,
	] = useState(() => initialAudioBitrate !== null);

	const [customTargetAudioBitrate, setCustomTargetAudioBitrateValue] = useState(
		() => initialAudioBitrate ?? '320K'
	);
	const [customTargetVideoBitrate, setCustomTargetVideoBitrateValue] = useState(
		() => initialVideoBitrate ?? '1M'
	);
	const [limitNumberOfGifLoops, setLimitNumberOfGifLoops] = useState(
		() => initialNumberOfGifLoops !== null
	);

	const [numberOfGifLoopsSetting, setNumberOfGifLoopsSetting] = useState(
		() => initialNumberOfGifLoops ?? 1
	);
	const [delayRenderTimeout, setDelayRenderTimeout] = useState(
		() => initialDelayRenderTimeout
	);

	const codec = useMemo(() => {
		if (renderMode === 'audio') {
			return videoCodecForAudioTab;
		}

		return videoCodecForVideoTab;
	}, [videoCodecForAudioTab, renderMode, videoCodecForVideoTab]);

	const numberOfGifLoops = useMemo(() => {
		if (codec === 'gif' && limitNumberOfGifLoops) {
			return numberOfGifLoopsSetting;
		}

		return null;
	}, [codec, limitNumberOfGifLoops, numberOfGifLoopsSetting]);

	const audioBitrate = useMemo(() => {
		if (shouldHaveCustomTargetAudioBitrate) {
			return customTargetAudioBitrate;
		}

		return null;
	}, [customTargetAudioBitrate, shouldHaveCustomTargetAudioBitrate]);
	const supportsCrf = BrowserSafeApis.codecSupportsCrf(codec);
	const supportsVideoBitrate = BrowserSafeApis.codecSupportsVideoBitrate(codec);

	const supportsBothQualityControls = useMemo(() => {
		return supportsCrf && supportsVideoBitrate;
	}, [supportsCrf, supportsVideoBitrate]);

	const qualityControlType = useMemo(() => {
		if (supportsBothQualityControls) {
			return preferredQualityControlType;
		}

		if (supportsCrf) {
			return 'crf';
		}

		if (supportsVideoBitrate) {
			return 'bitrate';
		}

		return null;
	}, [
		preferredQualityControlType,
		supportsBothQualityControls,
		supportsCrf,
		supportsVideoBitrate,
	]);

	const videoBitrate = useMemo(() => {
		if (qualityControlType === 'bitrate') {
			return customTargetVideoBitrate;
		}

		return null;
	}, [customTargetVideoBitrate, qualityControlType]);

	const {crf, maxCrf, minCrf, setCrf} = useCrfState(codec);

	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const muted = useMemo(() => {
		if (renderMode === 'video') {
			return mutedState;
		}

		return false;
	}, [mutedState, renderMode]);

	const enforceAudioTrack = useMemo(() => {
		if (renderMode === 'video') {
			return enforceAudioTrackState;
		}

		if (renderMode === 'audio') {
			return enforceAudioTrackState;
		}

		return false;
	}, [enforceAudioTrackState, renderMode]);

	const proResProfile = useMemo(() => {
		if (renderMode === 'video' && codec === 'prores') {
			return proResProfileSetting;
		}

		return null;
	}, [codec, proResProfileSetting, renderMode]);

	const [inputProps, setInputProps] = useState(() => defaultProps);

	const endFrame = useMemo((): number => {
		if (endFrameOrNull === null) {
			return resolvedComposition.durationInFrames - 1;
		}

		return Math.max(
			0,
			Math.min(resolvedComposition.durationInFrames - 1, endFrameOrNull)
		);
	}, [resolvedComposition.durationInFrames, endFrameOrNull]);

	const startFrame = useMemo((): number => {
		if (startFrameOrNull === null) {
			return 0;
		}

		return Math.max(0, Math.min(endFrame - 1, startFrameOrNull));
	}, [endFrame, startFrameOrNull]);

	const frame = useMemo(() => {
		const parsed = Math.floor(unclampedFrame);

		return Math.max(
			0,
			Math.min(resolvedComposition.durationInFrames - 1, parsed)
		);
	}, [resolvedComposition.durationInFrames, unclampedFrame]);

	const getStringBeforeSuffix = useCallback((fileName: string) => {
		const dotPos = fileName.lastIndexOf('.');
		const bitBeforeDot = fileName.substring(0, dotPos);
		return bitBeforeDot;
	}, []);

	const deriveFinalAudioCodec = useCallback(
		(passedVideoCodec: Codec, passedAudioCodec: AudioCodec | null) => {
			if (
				passedAudioCodec !== null &&
				(
					BrowserSafeApis.supportedAudioCodecs[passedVideoCodec] as AudioCodec[]
				).includes(passedAudioCodec)
			) {
				return passedAudioCodec;
			}

			return BrowserSafeApis.defaultAudioCodecs[passedVideoCodec]
				.compressed as AudioCodec;
		},
		[]
	);

	const setDefaultOutName = useCallback(
		(
			options:
				| {type: 'still'; imageFormat: StillImageFormat}
				| {
						type: 'render';
						codec: Codec;
						audioCodec: AudioCodec;
				  }
		) => {
			if (options.type === 'still') {
				setOutName((prev) => {
					const newFileName =
						getStringBeforeSuffix(prev) + '.' + options.imageFormat;
					return newFileName;
				});
			} else {
				setOutName((prev) => {
					const codecSuffix = BrowserSafeApis.getFileExtensionFromCodec(
						options.codec,
						deriveFinalAudioCodec(options.codec, options.audioCodec)
					);

					const newFileName = getStringBeforeSuffix(prev) + '.' + codecSuffix;
					return newFileName;
				});
			}
		},
		[deriveFinalAudioCodec, getStringBeforeSuffix]
	);

	const setAudioCodec = useCallback(
		(newAudioCodec: AudioCodec) => {
			setUserSelectedAudioCodec(newAudioCodec);
			setDefaultOutName({
				type: 'render',
				codec: videoCodecForVideoTab,
				audioCodec: newAudioCodec,
			});
		},
		[setDefaultOutName, videoCodecForVideoTab]
	);

	const setCodec = useCallback(
		(newCodec: Codec) => {
			if (renderMode === 'audio') {
				setVideoCodecForAudioTab(newCodec);
			} else {
				setVideoCodecForVideoTab(newCodec);
			}

			setDefaultOutName({
				type: 'render',
				codec: newCodec,
				audioCodec: deriveFinalAudioCodec(newCodec, userSelectedAudioCodec),
			});
		},
		[
			userSelectedAudioCodec,
			deriveFinalAudioCodec,
			renderMode,
			setDefaultOutName,
		]
	);

	const setStillFormat = useCallback(
		(format: StillImageFormat) => {
			setStillImageFormat(format);
			setDefaultOutName({type: 'still', imageFormat: format});
		},
		[setDefaultOutName]
	);

	const {setSidebarCollapsedState} = useContext(SidebarContext);

	const onClickStill = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedPanel('renders');
		rightSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addStillRenderJob({
			compositionId: resolvedComposition.id,
			outName,
			imageFormat: stillImageFormat,
			jpegQuality,
			frame,
			scale,
			verbose,
			chromiumOptions,
			delayRenderTimeout,
			envVariables: envVariablesArrayToObject(envVariables),
			inputProps,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				onClose();
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		setSidebarCollapsedState,
		dispatchIfMounted,
		resolvedComposition.id,
		outName,
		stillImageFormat,
		jpegQuality,
		frame,
		scale,
		verbose,
		chromiumOptions,
		delayRenderTimeout,
		envVariables,
		inputProps,
		onClose,
	]);

	const [everyNthFrameSetting, setEveryNthFrameSetting] = useState(
		() => initialEveryNthFrame
	);

	const everyNthFrame = useMemo(() => {
		if (codec === 'gif') {
			return everyNthFrameSetting;
		}

		return 1;
	}, [codec, everyNthFrameSetting]);

	const audioCodec = deriveFinalAudioCodec(codec, userSelectedAudioCodec);

	const onClickVideo = useCallback(() => {
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedPanel('renders');
		rightSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addVideoRenderJob({
			compositionId: resolvedComposition.id,
			outName,
			imageFormat: videoImageFormat,
			jpegQuality: stillImageFormat === 'jpeg' ? jpegQuality : null,
			scale,
			verbose,
			codec,
			concurrency,
			crf: qualityControlType === 'crf' ? crf : null,
			endFrame,
			startFrame,
			muted,
			enforceAudioTrack,
			proResProfile,
			pixelFormat,
			audioBitrate,
			videoBitrate,
			everyNthFrame,
			numberOfGifLoops,
			delayRenderTimeout,
			audioCodec,
			disallowParallelEncoding,
			chromiumOptions,
			envVariables: envVariablesArrayToObject(envVariables),
			inputProps,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				onClose();
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		setSidebarCollapsedState,
		dispatchIfMounted,
		resolvedComposition.id,
		outName,
		videoImageFormat,
		stillImageFormat,
		jpegQuality,
		scale,
		verbose,
		codec,
		concurrency,
		qualityControlType,
		crf,
		endFrame,
		startFrame,
		muted,
		enforceAudioTrack,
		proResProfile,
		pixelFormat,
		audioBitrate,
		videoBitrate,
		everyNthFrame,
		numberOfGifLoops,
		delayRenderTimeout,
		audioCodec,
		disallowParallelEncoding,
		chromiumOptions,
		envVariables,
		inputProps,
		onClose,
	]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const imageFormatOptions = useMemo((): SegmentedControlItem[] => {
		if (renderMode === 'still') {
			return [
				{
					label: 'PNG',
					onClick: () => setStillFormat('png'),
					key: 'png',
					selected: stillImageFormat === 'png',
				},
				{
					label: 'JPEG',
					onClick: () => setStillFormat('jpeg'),
					key: 'jpeg',
					selected: stillImageFormat === 'jpeg',
				},
				{
					label: 'PDF',
					onClick: () => setStillFormat('pdf'),
					key: 'pdf',
					selected: stillImageFormat === 'pdf',
				},
				{
					label: 'WebP',
					onClick: () => setStillFormat('webp'),
					key: 'webp',
					selected: stillImageFormat === 'webp',
				},
			];
		}

		return [
			{
				label: 'PNG',
				onClick: () => setVideoImageFormat('png'),
				key: 'png',
				selected: videoImageFormat === 'png',
			},
			{
				label: 'JPEG',
				onClick: () => setVideoImageFormat('jpeg'),
				key: 'jpeg',
				selected: videoImageFormat === 'jpeg',
			},
		];
	}, [stillImageFormat, renderMode, setStillFormat, videoImageFormat]);

	const setRenderMode = useCallback(
		(newRenderMode: RenderType) => {
			setRenderModeState(newRenderMode);
			if (newRenderMode === 'audio') {
				setDefaultOutName({
					type: 'render',
					codec: videoCodecForAudioTab,
					audioCodec: deriveFinalAudioCodec(
						videoCodecForAudioTab,
						userSelectedAudioCodec
					),
				});
			}

			if (newRenderMode === 'video') {
				setDefaultOutName({
					type: 'render',
					codec: videoCodecForVideoTab,
					audioCodec: deriveFinalAudioCodec(
						videoCodecForVideoTab,
						userSelectedAudioCodec
					),
				});
			}

			if (newRenderMode === 'still') {
				setDefaultOutName({type: 'still', imageFormat: stillImageFormat});
			}
		},
		[
			videoCodecForAudioTab,
			userSelectedAudioCodec,
			deriveFinalAudioCodec,
			setDefaultOutName,
			stillImageFormat,
			videoCodecForVideoTab,
		]
	);

	const renderTabOptions = useMemo((): SegmentedControlItem[] => {
		if (resolvedComposition?.durationInFrames < 2) {
			return [
				{
					label: 'Still',
					onClick: () => {
						setRenderMode('still');
					},
					key: 'still',
					selected: renderMode === 'still',
				},
			];
		}

		return [
			{
				label: 'Still',
				onClick: () => {
					setRenderMode('still');
				},
				key: 'still',
				selected: renderMode === 'still',
			},
			{
				label: 'Video',
				onClick: () => {
					setRenderMode('video');
				},
				key: 'video',
				selected: renderMode === 'video',
			},
			{
				label: 'Audio',
				onClick: () => {
					setRenderMode('audio');
				},
				key: 'audio',
				selected: renderMode === 'audio',
			},
		];
	}, [resolvedComposition?.durationInFrames, renderMode, setRenderMode]);

	const outnameValidation = validateOutnameGui({
		outName,
		codec,
		audioCodec,
		renderMode,
		stillImageFormat,
	});

	const {tab, setTab, shownTabs} = useRenderModalSections(renderMode, codec);

	const {registerKeybinding} = useKeybinding();

	const renderDisabled = state.type === 'load' || !outnameValidation.valid;

	const trigger = useCallback(() => {
		if (renderDisabled) {
			return;
		}

		if (renderMode === 'still') {
			onClickStill();
		} else {
			onClickVideo();
		}
	}, [onClickStill, onClickVideo, renderDisabled, renderMode]);

	useEffect(() => {
		registerKeybinding({
			callback() {
				trigger();
			},
			commandCtrlKey: true,
			key: 'Enter',
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});
	}, [registerKeybinding, trigger]);

	return (
		<div style={outer}>
			<NewCompHeader title={`Render ${resolvedComposition.id}`} />
			<div style={container}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={trigger}
					disabled={renderDisabled}
					style={{
						...buttonStyle,
						backgroundColor: outnameValidation.valid ? BLUE : BLUE_DISABLED,
					}}
				>
					{state.type === 'idle' ? `Render ${renderMode}` : 'Rendering...'}
					<ShortcutHint keyToPress="↵" cmdOrCtrl />
				</Button>
			</div>
			<div style={horizontalLayout}>
				<div style={leftSidebar}>
					{shownTabs.includes('general') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'general'}
							onClick={() => setTab('general')}
						>
							<div style={iconContainer}>
								<FileIcon style={icon} />
							</div>
							General
						</VerticalTab>
					) : null}
					{shownTabs.includes('data') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'data'}
							onClick={() => setTab('data')}
						>
							<div style={iconContainer}>
								<DataIcon style={icon} />
							</div>
							Input Props
						</VerticalTab>
					) : null}
					{shownTabs.includes('picture') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'picture'}
							onClick={() => setTab('picture')}
						>
							<div style={iconContainer}>
								<PicIcon style={icon} />
							</div>
							Picture
						</VerticalTab>
					) : null}
					{shownTabs.includes('audio') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'audio'}
							onClick={() => setTab('audio')}
						>
							<div style={iconContainer}>
								<AudioIcon style={icon} />
							</div>
							Audio
						</VerticalTab>
					) : null}
					{shownTabs.includes('gif') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'gif'}
							onClick={() => setTab('gif')}
						>
							<div style={iconContainer}>
								<GifIcon style={icon} />
							</div>
							GIF
						</VerticalTab>
					) : null}
					{shownTabs.includes('advanced') ? (
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'advanced'}
							onClick={() => setTab('advanced')}
						>
							<div style={iconContainer}>
								<GearIcon style={icon} />
							</div>
							Other
						</VerticalTab>
					) : null}
				</div>
				<div style={rightPanel} className={VERTICAL_SCROLLBAR_CLASSNAME}>
					{tab === 'general' ? (
						<RenderModalBasic
							codec={codec}
							resolvedComposition={resolvedComposition}
							frame={frame}
							imageFormatOptions={imageFormatOptions}
							outName={outName}
							proResProfile={proResProfile}
							renderMode={renderMode}
							setVideoCodec={setCodec}
							setFrame={setFrame}
							setOutName={setOutName}
							setProResProfile={setProResProfile}
							endFrame={endFrame}
							setEndFrame={setEndFrame}
							setStartFrame={setStartFrame}
							startFrame={startFrame}
							validationMessage={
								outnameValidation.valid ? null : outnameValidation.error.message
							}
						/>
					) : tab === 'picture' ? (
						<RenderModalPicture
							renderMode={renderMode}
							scale={scale}
							setScale={setScale}
							pixelFormat={pixelFormat}
							setPixelFormat={setPixelFormat}
							imageFormatOptions={imageFormatOptions}
							crf={crf}
							setCrf={setCrf}
							customTargetVideoBitrate={customTargetVideoBitrate}
							maxCrf={maxCrf}
							minCrf={minCrf}
							jpegQuality={jpegQuality}
							qualityControlType={qualityControlType}
							setJpegQuality={setJpegQuality}
							setCustomTargetVideoBitrateValue={
								setCustomTargetVideoBitrateValue
							}
							setQualityControl={setQualityControl}
							videoImageFormat={videoImageFormat}
							stillImageFormat={stillImageFormat}
							shouldDisplayQualityControlPicker={supportsBothQualityControls}
						/>
					) : tab === 'audio' ? (
						<RenderModalAudio
							muted={muted}
							renderMode={renderMode}
							setMuted={setMuted}
							codec={codec}
							audioCodec={audioCodec}
							setAudioCodec={setAudioCodec}
							enforceAudioTrack={enforceAudioTrack}
							setEnforceAudioTrackState={setEnforceAudioTrackState}
							customTargetAudioBitrate={customTargetAudioBitrate}
							setCustomTargetAudioBitrateValue={
								setCustomTargetAudioBitrateValue
							}
							setShouldHaveCustomTargetAudioBitrate={
								setShouldHaveCustomTargetAudioBitrate
							}
							shouldHaveCustomTargetAudioBitrate={
								shouldHaveCustomTargetAudioBitrate
							}
						/>
					) : tab === 'gif' ? (
						<RenderModalGif
							everyNthFrame={everyNthFrame}
							limitNumberOfGifLoops={limitNumberOfGifLoops}
							numberOfGifLoopsSetting={numberOfGifLoopsSetting}
							setEveryNthFrameSetting={setEveryNthFrameSetting}
							setLimitNumberOfGifLoops={setLimitNumberOfGifLoops}
							setNumberOfGifLoopsSetting={setNumberOfGifLoopsSetting}
						/>
					) : tab === 'data' ? (
						<DataEditor
							inputProps={inputProps}
							setInputProps={setInputProps}
							unresolvedComposition={unresolvedComposition}
							mayShowSaveButton={false}
							propsEditType="input-props"
						/>
					) : (
						<RenderModalAdvanced
							concurrency={concurrency}
							maxConcurrency={maxConcurrency}
							minConcurrency={minConcurrency}
							renderMode={renderMode}
							setConcurrency={setConcurrency}
							setVerboseLogging={setVerboseLogging}
							verbose={verbose}
							delayRenderTimeout={delayRenderTimeout}
							setDelayRenderTimeout={setDelayRenderTimeout}
							disallowParallelEncoding={disallowParallelEncoding}
							setDisallowParallelEncoding={setDisallowParallelEncoding}
							setDisableWebSecurity={setDisableWebSecurity}
							setIgnoreCertificateErrors={setIgnoreCertificateErrors}
							setHeadless={setHeadless}
							headless={headless}
							ignoreCertificateErrors={ignoreCertificateErrors}
							disableWebSecurity={disableWebSecurity}
							openGlOption={openGlOption}
							setOpenGlOption={setOpenGlOption}
							setEnvVariables={setEnvVariables}
							envVariables={envVariables}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export const RenderModalWithLoader: React.FC<RenderModalProps> = (props) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	useEffect(() => {
		const {current} = Internals.resolveCompositionsRef;
		if (!current) {
			throw new Error('resolveCompositionsRef');
		}

		current.setCurrentRenderModalComposition(props.compositionId);
		return () => {
			current.setCurrentRenderModalComposition(null);
		};
	}, [props.compositionId]);

	const resolved = Internals.useResolvedVideoConfig(props.compositionId);
	const unresolvedContext = useContext(Internals.CompositionManager);
	const unresolved = unresolvedContext.compositions.find(
		(c) => props.compositionId === c.id
	);

	if (!unresolved) {
		throw new Error('Composition not found: ' + props.compositionId);
	}

	if (!resolved) {
		return null;
	}

	if (resolved.type === 'loading') {
		return (
			<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
				<div style={loaderContainer}>
					<Spinner duration={1} size={30} />
					<Spacing y={2} />
					<div style={loaderLabel}>
						Running <code style={inlineCodeSnippet}>calculateMetadata()</code>
					</div>
				</div>
			</ModalContainer>
		);
	}

	if (resolved.type === 'error') {
		return (
			<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
				<div style={loaderContainer}>
					<Spacing y={2} />
					<div style={loaderLabel}>
						Running <code style={inlineCodeSnippet}>calculateMetadata()</code>{' '}
						yielded an error:
					</div>
					<Spacing y={1} />
					<div style={loaderLabel}>
						{resolved.error.message || 'Unknown error'}
					</div>
				</div>
			</ModalContainer>
		);
	}

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<RenderModal
				unresolvedComposition={unresolved}
				{...props}
				onClose={onQuit}
				resolvedComposition={resolved.result}
			/>
		</ModalContainer>
	);
};

const loaderContainer: React.CSSProperties = {
	paddingTop: 40,
	paddingBottom: 40,
	paddingLeft: 100,
	paddingRight: 100,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
};

const loaderLabel: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};
