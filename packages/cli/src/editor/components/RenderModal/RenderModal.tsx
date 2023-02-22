import type {
	AudioCodec,
	Codec,
	PixelFormat,
	ProResProfile,
	StillImageFormat,
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
import {Internals} from 'remotion';
import type {TComposition} from 'remotion/src/internals';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {AudioIcon} from '../../icons/audio';
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
	width: '100%',
	borderBottom: '1px solid black',
};

const scrollPanel: React.CSSProperties = {
	minHeight: '35vh',
	maxHeight: '50vh',
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
	initialVideoImageFormat: StillImageFormat;
	initialStillImageFormat: StillImageFormat;
	initialQuality: number;
	initialScale: number;
	initialVerbose: boolean;
	initialOutName: string;
	initialRenderType: RenderType;
	initialAudioCodec: Codec;
	initialVideoCodec: Codec;
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
	initialAudioCodec,
	initialVideoCodec,
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
	const [videoImageFormat, setVideoImageFormat] = useState<StillImageFormat>(
		() => initialVideoImageFormat
	);
	const [concurrency, setConcurrency] = useState(() => initialConcurrency);
	const [videoCodec, setVideoSpecificalCodec] = useState<Codec>(
		() => initialVideoCodec
	);
	const [audioCodec, setAudioSpecificalCodec] = useState<Codec>(
		() => initialAudioCodec
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
		() => initialAudioBitrate ?? '256K'
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
	// TODO: Allow to modify
	const [delayRenderTimeout] = useState(() => initialDelayRenderTimeout);

	const codec = useMemo(() => {
		if (renderMode === 'audio') {
			return audioCodec;
		}

		return videoCodec;
	}, [audioCodec, renderMode, videoCodec]);

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

	const currentComposition = useMemo((): TComposition | null => {
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
						options.audioCodec
					);
					const newFileName = getStringBeforeSuffix(prev) + '.' + codecSuffix;
					return newFileName;
				});
			}
		},
		[getStringBeforeSuffix]
	);

	const setCodec = useCallback(
		(newCodec: Codec) => {
			if (renderMode === 'audio') {
				setAudioSpecificalCodec(newCodec);
			} else {
				setVideoSpecificalCodec(newCodec);
			}

			// TODO: Audio codec is not implemented and hardcoded
			setDefaultOutName({
				type: 'render',
				codec: newCodec,
				audioCodec: 'pcm-16',
			});
		},
		[renderMode, setDefaultOutName]
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
		})
			.then(() => {
				dispatchIfMounted({type: 'succeed'});
				setSelectedModal(null);
			})
			.catch(() => {
				dispatchIfMounted({type: 'fail'});
			});
	}, [
		compositionId,
		dispatchIfMounted,
		frame,
		stillImageFormat,
		outName,
		quality,
		scale,
		setSelectedModal,
		verbose,
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
		setSelectedModal,
	]);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const imageFormatOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'PNG',
				onClick:
					renderMode === 'still'
						? () => setStillFormat('png')
						: () => setVideoImageFormat('png'),
				key: 'png',
				selected:
					renderMode === 'still'
						? stillImageFormat === 'png'
						: videoImageFormat === 'png',
			},
			{
				label: 'JPEG',
				onClick:
					renderMode === 'still'
						? () => setStillFormat('jpeg')
						: () => setVideoImageFormat('jpeg'),
				key: 'jpeg',
				selected:
					renderMode === 'still'
						? stillImageFormat === 'jpeg'
						: videoImageFormat === 'jpeg',
			},
		];
	}, [stillImageFormat, renderMode, setStillFormat, videoImageFormat]);

	const setRenderMode = useCallback(
		(newRenderMode: RenderType) => {
			setRenderModeState(newRenderMode);
			if (newRenderMode === 'audio') {
				// TODO: Audio codec is not implemented but hardcoded
				setDefaultOutName({
					type: 'render',
					codec: audioCodec,
					audioCodec: 'pcm-16',
				});
			}

			if (newRenderMode === 'video') {
				// TODO: Audio codec is not implemented but hardcoded
				setDefaultOutName({
					type: 'render',
					codec: videoCodec,
					audioCodec: 'pcm-16',
				});
			}

			if (newRenderMode === 'still') {
				setDefaultOutName({type: 'still', imageFormat: stillImageFormat});
			}
		},
		[audioCodec, setDefaultOutName, stillImageFormat, videoCodec]
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

	const [tab, setTab] = useState<
		'general' | 'picture' | 'advanced' | 'gif' | 'audio'
	>('general');

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${compositionId}`} />
			<div style={container}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={renderMode === 'still' ? onClickStill : onClickVideo}
					disabled={state.type === 'load'}
					style={buttonStyle}
				>
					{state.type === 'idle' ? `Render ${renderMode}` : 'Rendering...'}
				</Button>
			</div>
			<div style={horizontalLayout}>
				<div style={leftSidebar}>
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
					{renderMode === 'still' ? null : (
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
					)}
					{codec === 'gif' ? (
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
							setCodec={setCodec}
							setFrame={setFrame}
							setOutName={setOutName}
							setProResProfile={setProResProfile}
							endFrame={endFrame}
							setEndFrame={setEndFrame}
							setStartFrame={setStartFrame}
							startFrame={startFrame}
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
					) : (
						<RenderModalAdvanced
							concurrency={concurrency}
							maxConcurrency={maxConcurrency}
							minConcurrency={minConcurrency}
							renderMode={renderMode}
							setConcurrency={setConcurrency}
							setVerboseLogging={setVerboseLogging}
							verbose={verbose}
						/>
					)}

					<Spacing block y={0.5} />
				</div>
			</div>
		</ModalContainer>
	);
};
