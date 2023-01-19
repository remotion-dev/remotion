import type {Codec, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {ChangeEvent} from 'react';
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
import {useFileExistence} from '../../helpers/use-file-existence';
import {ModalsContext} from '../../state/modals';
import {CollapsableOptions} from '../CollapsableOptions';
import {Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {InputDragger} from '../NewComposition/InputDragger';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {addStillRenderJob, addVideoRenderJob} from '../RenderQueue/actions';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {leftSidebarTabs} from '../SidebarContent';
import {CrfSetting, useCrfState} from './CrfSetting';
import {label, optionRow, rightRow} from './layout';
import {QualitySetting} from './QualitySetting';
import {ScaleSetting} from './ScaleSetting';

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

export type RenderType = 'still' | 'video';

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

const buttonRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	borderTop: '1px solid black',
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 16,
	paddingRight: 16,
};

const input: React.CSSProperties = {
	minWidth: 250,
	textAlign: 'right',
};

export const RenderModal: React.FC<{
	compositionId: string;
	initialFrame: number;
	initialVideoImageFormat: StillImageFormat;
	initialStillImageFormat: StillImageFormat;
	initialQuality: number | null;
	initialScale: number;
	initialVerbose: boolean;
	initialOutName: string;
	initialRenderType: RenderType;
	initialCodec: Codec;
	initialConcurrency: number;
	minConcurrency: number;
	maxConcurrency: number;
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
	initialCodec,
	initialConcurrency,
	maxConcurrency,
	minConcurrency,
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
	const [videoCodec, setVideoCodec] = useState<Codec>(initialCodec);
	const {crf, maxCrf, minCrf, setCrf, shouldDisplayOption} =
		useCrfState(videoCodec);
	const [renderMode, setRenderMode] = useState<RenderType>(initialRenderType);
	const [quality, setQuality] = useState<number>(() => initialQuality ?? 80);
	const [scale, setScale] = useState(() => initialScale);
	const [verbose, setVerboseLogging] = useState(() => initialVerbose);
	const [outName, setOutName] = useState(() => initialOutName);

	const dispatchIfMounted: typeof dispatch = useCallback((payload) => {
		if (isMounted.current === false) return;
		dispatch(payload);
	}, []);

	const onValueChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setOutName(e.target.value);
		},
		[]
	);

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

	const setCodec = useCallback(
		(codec: Codec) => {
			setVideoCodec(codec);
			setOutName((prev) => {
				const codecSuffix = BrowserSafeApis.getFileExtensionFromCodec(codec);
				const newFileName = getStringBeforeSuffix(prev) + '.' + codecSuffix;
				return newFileName;
			});
		},
		[getStringBeforeSuffix]
	);

	const setStillFormat = useCallback(
		(format: StillImageFormat) => {
			setStillImageFormat(format);
			setOutName((prev) => {
				const newFileName = getStringBeforeSuffix(prev) + '.' + format;
				return newFileName;
			});
		},
		[getStringBeforeSuffix]
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
			codec: videoCodec,
			concurrency,
			crf,
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
		videoCodec,
		concurrency,
		crf,
		setSelectedModal,
	]);

	const onConcurrencyChangedDirectly = useCallback((newConcurrency: number) => {
		setConcurrency(newConcurrency);
	}, []);

	const onConcurrencyChanged = useCallback(
		(e: string) => {
			setConcurrency((q) => {
				const newConcurrency = parseInt(e, 10);
				if (Number.isNaN(newConcurrency)) {
					return q;
				}

				const newConcurrencyClamped = Math.min(
					maxConcurrency,
					Math.max(newConcurrency, minConcurrency)
				);
				return newConcurrencyClamped;
			});
		},
		[maxConcurrency, minConcurrency]
	);

	const onFrameSetDirectly = useCallback(
		(newFrame: number) => {
			setFrame(newFrame);
		},
		[setFrame]
	);

	const onFrameChanged = useCallback((e: string) => {
		setFrame((q) => {
			const newFrame = parseFloat(e);
			if (Number.isNaN(newFrame)) {
				return q;
			}

			return newFrame;
		});
	}, []);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const existence = useFileExistence(outName);

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

	const videoCodecOptions = useMemo((): SegmentedControlItem[] => {
		return BrowserSafeApis.validCodecs.map((codec) => {
			return {
				label: codec,
				onClick: () => setCodec(codec),
				key: codec,
				selected: videoCodec === codec,
			};
		});
	}, [setCodec, videoCodec]);

	const renderTabOptions = useMemo((): SegmentedControlItem[] => {
		if (currentComposition?.durationInFrames < 2) {
			return [
				{
					label: 'Still',
					onClick: () => {
						setRenderMode('still');
						setStillFormat(stillImageFormat);
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
					setStillFormat(stillImageFormat);
				},
				key: 'still',
				selected: renderMode === 'still',
			},
			{
				label: 'Video',
				onClick: () => {
					setRenderMode('video');
					setCodec(videoCodec);
				},
				key: 'video',
				selected: renderMode === 'video',
			},
		];
	}, [
		currentComposition?.durationInFrames,
		stillImageFormat,
		renderMode,
		setCodec,
		setStillFormat,
		videoCodec,
	]);

	const onVerboseLoggingChanged = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setVerboseLogging(e.target.checked);
		},
		[]
	);

	if (renderMode === 'still') {
		return (
			<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
				<NewCompHeader title={`Render ${compositionId}`} />
				<div style={container}>
					<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				</div>
				<div>
					<Spacing block y={0.5} />
					<div style={optionRow}>
						<div style={label}>Format</div>
						<div style={rightRow}>
							<SegmentedControl items={imageFormatOptions} needsWrapping />
						</div>
					</div>
					<div style={optionRow}>
						<div style={label}>Output name</div>
						<div style={rightRow}>
							<div>
								<RemotionInput
									// TODO: Validate and reject folders or weird file names
									warning={existence}
									style={input}
									type="text"
									value={outName}
									onChange={onValueChange}
								/>
								{existence ? (
									<ValidationMessage
										align="flex-end"
										message="Will be overwritten"
									/>
								) : null}
							</div>
						</div>
					</div>
					{currentComposition.durationInFrames > 1 ? (
						<div
							style={optionRow}
							// TODO: Add framerange for video
						>
							<div style={label}>Frame</div>
							<div style={rightRow}>
								<InputDragger
									value={frame}
									onTextChange={onFrameChanged}
									placeholder={`0-${currentComposition.durationInFrames - 1}`}
									onValueChange={onFrameSetDirectly}
									name="frame"
									step={1}
									min={0}
									max={currentComposition.durationInFrames - 1}
								/>
							</div>
						</div>
					) : null}

					<CollapsableOptions
						showLabel="Show advanced settings"
						hideLabel="Hide advanced settings"
					>
						<ScaleSetting scale={scale} setScale={setScale} />
						<div style={optionRow}>
							<div style={label}>Verbose logging</div>
							<div style={rightRow}>
								<input
									type={'checkbox'}
									checked={verbose}
									onChange={onVerboseLoggingChanged}
								/>
							</div>
						</div>
						{stillImageFormat === 'jpeg' && (
							<QualitySetting setQuality={setQuality} quality={quality} />
						)}
					</CollapsableOptions>
					<Spacing block y={0.5} />
					<div style={buttonRow}>
						<Button
							autoFocus
							onClick={onClickStill}
							disabled={state.type === 'load'}
						>
							{state.type === 'idle' ? 'Render still' : 'Rendering...'}
						</Button>
					</div>
				</div>
			</ModalContainer>
		);
	}

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${compositionId}`} />
			<div style={container}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
			</div>
			<div>
				<Spacing block y={0.5} />
				<div style={optionRow}>
					<div style={label}>Codec</div>
					<div style={rightRow}>
						<SegmentedControl items={videoCodecOptions} needsWrapping />
					</div>
				</div>
				<div style={optionRow}>
					<div style={label}>Output name</div>
					<div style={rightRow}>
						<div>
							<RemotionInput
								// TODO: Validate and reject folders or weird file names
								warning={existence}
								style={input}
								type="text"
								value={outName}
								onChange={onValueChange}
							/>
							{existence ? (
								<ValidationMessage
									align="flex-end"
									message="Will be overwritten"
								/>
							) : null}
						</div>
					</div>
				</div>
				<CollapsableOptions
					showLabel="Show advanced settings"
					hideLabel="Hide advanced settings"
				>
					<div style={optionRow}>
						<div style={label}>Concurrency</div>
						<div style={rightRow}>
							<InputDragger
								value={concurrency}
								onTextChange={onConcurrencyChanged}
								placeholder={`${minConcurrency}-${maxConcurrency}`}
								onValueChange={onConcurrencyChangedDirectly}
								name="concurrency"
								step={1}
								min={minConcurrency}
								max={maxConcurrency}
							/>
						</div>
					</div>
					<ScaleSetting scale={scale} setScale={setScale} />
					<div style={optionRow}>
						<div style={label}>Image Format</div>
						<div style={rightRow}>
							<SegmentedControl
								items={imageFormatOptions}
								needsWrapping={false}
							/>
						</div>
					</div>
					{videoImageFormat === 'jpeg' && (
						<QualitySetting setQuality={setQuality} quality={quality} />
					)}
					{shouldDisplayOption ? (
						<CrfSetting crf={crf} max={maxCrf} min={minCrf} setCrf={setCrf} />
					) : null}
					<div style={optionRow}>
						<div style={label}>Verbose logging</div>
						<div style={rightRow}>
							<input
								type={'checkbox'}
								checked={verbose}
								onChange={onVerboseLoggingChanged}
							/>
						</div>
					</div>
				</CollapsableOptions>
				<Spacing block y={0.5} />
				<div style={buttonRow}>
					<Button
						autoFocus
						onClick={onClickVideo}
						disabled={state.type === 'load'}
					>
						{state.type === 'idle' ? 'Render video' : 'Rendering...'}
					</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
