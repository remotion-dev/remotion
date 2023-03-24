import type {
	AudioCodec,
	Codec,
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
import type {AnyComposition} from 'remotion';
import {Internals} from 'remotion';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import type {
	RequiredChromiumOptions,
	UiOpenGlOptions,
} from '../../../required-chromium-options';
import {useRenderModalSections} from '../../helpers/render-modal-sections';
import {AudioIcon} from '../../icons/audio';
import {DataIcon} from '../../icons/data';
import {FileIcon} from '../../icons/file';
import {PicIcon} from '../../icons/frame';
import {GearIcon} from '../../icons/gear';
import {GifIcon} from '../../icons/gif';

import {ModalsContext} from '../../state/modals';
import {Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {addStillRenderJob, addVideoRenderJob} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {leftSidebarTabs} from '../SidebarContent';
import {Tab} from '../Tabs';
import {useCrfState} from './CrfSetting';
import {validateOutnameGui} from './out-name-checker';
import type {RenderType} from './RenderModalAdvanced';
import {RenderModalAdvanced} from './RenderModalAdvanced';
import {RenderModalAudio} from './RenderModalAudio';
import {RenderModalBasic} from './RenderModalBasic';
import {RenderModalData} from './RenderModalData';
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
	width: '100%',
	borderBottom: '1px solid black',
};

const scrollPanel: React.CSSProperties = {
	height: 600,
	overflow: 'auto',
	minWidth: 650,
};

const horizontalLayout: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
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
	backgroundColor: 'var(--blue)',
	color: 'white',
};

const flexer: React.CSSProperties = {
	flex: 1,
};

export const RenderModal: React.FC<{
	compositionId: string;
	initialFrame: number;
	initialVideoImageFormat: VideoImageFormat;
	initialStillImageFormat: StillImageFormat;
	initialQuality: number;
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
}> = ({
	compositionId,
	initialFrame,
	initialVideoImageFormat,
	initialStillImageFormat,
	initialQuality,
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
}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

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

	const [videoCodecForAudioTab, setVideoCodecForAudioTab] = useState<Codec>(
		() => initialVideoCodecForAudioTab
	);

	const [mutedState, setMuted] = useState(() => initialMuted);
	const [enforceAudioTrackState, setEnforceAudioTrackState] = useState(
		() => initialEnforceAudioTrack
	);

	const [renderMode, setRenderModeState] =
		useState<RenderType>(initialRenderType);
	const [quality, setQuality] = useState<number>(() => initialQuality);
	const [scale, setScale] = useState(() => initialScale);
	const [verbose, setVerboseLogging] = useState(() => initialVerbose);
	const [disallowParallelEncoding, setDisallowParallelEncoding] =
		useState(false);
	const [disableWebSecurity, setDisableWebSecurity] = useState<boolean>(false);
	const [headless, setHeadless] = useState<boolean>(true);
	const [ignoreCertificateErrors, setIgnoreCertificateErrors] =
		useState<boolean>(false);
	const [openGlOption, setOpenGlOption] = useState<UiOpenGlOptions>('default');

	const chromiumOptions: RequiredChromiumOptions = useMemo(() => {
		return {
			headless,
			disableWebSecurity,
			ignoreCertificateErrors,
			gl: openGlOption === 'default' ? null : openGlOption,
		};
	}, [headless, disableWebSecurity, ignoreCertificateErrors, openGlOption]);

	const [outName, setOutName] = useState(() => initialOutName);
	const [endFrameOrNull, setEndFrame] = useState<number | null>(() => null);
	const [startFrameOrNull, setStartFrame] = useState<number | null>(() => null);
	const [proResProfileSetting, setProResProfile] = useState<ProResProfile>(
		() => initialProResProfile
	);

	const [pixelFormat, setPixelFormat] = useState<PixelFormat>(
		() => initialPixelFormat
	);
	const [qualityControlType, setQualityControl] = useState<QualityControl>(() =>
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

	const videoBitrate = useMemo(() => {
		if (qualityControlType === 'bitrate') {
			return customTargetVideoBitrate;
		}

		return null;
	}, [customTargetVideoBitrate, qualityControlType]);

	const {
		crf,
		maxCrf,
		minCrf,
		setCrf,
		shouldDisplayOption: shouldDisplayCrfOption,
	} = useCrfState(codec);

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

		return false;
	}, [enforceAudioTrackState, renderMode]);

	const proResProfile = useMemo(() => {
		if (renderMode === 'video' && codec === 'prores') {
			return proResProfileSetting;
		}

		return null;
	}, [codec, proResProfileSetting, renderMode]);

	const {compositions} = useContext(Internals.CompositionManager);

	const currentComposition = useMemo((): AnyComposition | null => {
		for (const composition of compositions) {
			if (composition.id === compositionId) {
				return composition;
			}
		}

		return null;
	}, [compositionId, compositions]);

	if (currentComposition === null) {
		throw new Error('This composition does not exist');
	}

	const endFrame = useMemo((): number => {
		if (endFrameOrNull === null) {
			return currentComposition.durationInFrames - 1;
		}

		return Math.max(
			0,
			Math.min(currentComposition.durationInFrames - 1, endFrameOrNull)
		);
	}, [currentComposition.durationInFrames, endFrameOrNull]);

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
			Math.min(currentComposition.durationInFrames - 1, parsed)
		);
	}, [currentComposition.durationInFrames, unclampedFrame]);

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

	const onClickStill = useCallback(() => {
		leftSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addStillRenderJob({
			compositionId,
			outName,
			imageFormat: stillImageFormat,
			quality: stillImageFormat === 'jpeg' ? quality : null,
			frame,
			scale,
			verbose,
			chromiumOptions,
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		dispatchIfMounted,
		compositionId,
		outName,
		stillImageFormat,
		quality,
		frame,
		scale,
		verbose,
		chromiumOptions,
		setSelectedModal,
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
		leftSidebarTabs.current?.selectRendersPanel();
		dispatchIfMounted({type: 'start'});
		addVideoRenderJob({
			compositionId,
			outName,
			imageFormat: videoImageFormat,
			quality: stillImageFormat === 'jpeg' ? quality : null,
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
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		dispatchIfMounted,
		compositionId,
		outName,
		videoImageFormat,
		stillImageFormat,
		quality,
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
		setSelectedModal,
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
		if (currentComposition?.durationInFrames < 2) {
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
	}, [currentComposition?.durationInFrames, renderMode, setRenderMode]);

	const outnameValidation = validateOutnameGui({
		outName,
		codec,
		audioCodec,
		renderMode,
		stillImageFormat,
	});

	const {tab, setTab, shownTabs} = useRenderModalSections(renderMode, codec);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${compositionId}`} />
			<div style={container}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={renderMode === 'still' ? onClickStill : onClickVideo}
					disabled={state.type === 'load' || !outnameValidation.valid}
					style={{
						...buttonStyle,
						backgroundColor: outnameValidation.valid
							? 'var(--blue)'
							: 'var(--blue-disabled)',
						opacity: outnameValidation.valid ? 1 : 0.7,
					}}
				>
					{state.type === 'idle' ? `Render ${renderMode}` : 'Rendering...'}
				</Button>
			</div>
			<div style={horizontalLayout}>
				<div style={leftSidebar}>
					{shownTabs.includes('general') ? (
						<Tab
							style={horizontalTab}
							selected={tab === 'general'}
							onClick={() => setTab('general')}
						>
							<div style={iconContainer}>
								<FileIcon style={icon} />
							</div>
							General
						</Tab>
					) : null}
					{shownTabs.includes('data') ? (
						<Tab
							style={horizontalTab}
							selected={tab === 'data'}
							onClick={() => setTab('data')}
						>
							<div style={iconContainer}>
								<DataIcon style={icon} />
							</div>
							Data
						</Tab>
					) : null}
					{shownTabs.includes('picture') ? (
						<Tab
							style={horizontalTab}
							selected={tab === 'picture'}
							onClick={() => setTab('picture')}
						>
							<div style={iconContainer}>
								<PicIcon style={icon} />
							</div>
							Picture
						</Tab>
					) : null}
					{shownTabs.includes('audio') ? (
						<Tab
							style={horizontalTab}
							selected={tab === 'audio'}
							onClick={() => setTab('audio')}
						>
							<div style={iconContainer}>
								<AudioIcon style={icon} />
							</div>
							Audio
						</Tab>
					) : null}
					{shownTabs.includes('gif') ? (
						<Tab
							style={horizontalTab}
							selected={tab === 'gif'}
							onClick={() => setTab('gif')}
						>
							<div style={iconContainer}>
								<GifIcon style={icon} />
							</div>
							GIF
						</Tab>
					) : null}
					{shownTabs.includes('advanced') ? (
						<Tab
							style={horizontalTab}
							selected={tab === 'advanced'}
							onClick={() => setTab('advanced')}
						>
							<div style={iconContainer}>
								<GearIcon style={icon} />
							</div>
							Other
						</Tab>
					) : null}
				</div>
				<div style={scrollPanel}>
					<Spacing block y={0.5} />
					{tab === 'general' ? (
						<RenderModalBasic
							codec={codec}
							currentComposition={currentComposition}
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
							quality={quality}
							qualityControlType={qualityControlType}
							setQuality={setQuality}
							setCustomTargetVideoBitrateValue={
								setCustomTargetVideoBitrateValue
							}
							setQualityControl={setQualityControl}
							shouldDisplayCrfOption={shouldDisplayCrfOption}
							videoImageFormat={videoImageFormat}
							stillImageFormat={stillImageFormat}
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
						<RenderModalData composition={currentComposition} />
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
						/>
					)}

					<Spacing block y={0.5} />
				</div>
			</div>
		</ModalContainer>
	);
};
