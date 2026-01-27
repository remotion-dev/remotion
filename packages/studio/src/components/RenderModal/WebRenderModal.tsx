import type {LogLevel} from '@remotion/renderer';
import type {HardwareAccelerationOption} from '@remotion/renderer/client';
import {getDefaultOutLocation} from '@remotion/studio-shared';
import type {
	RenderStillOnWebImageFormat,
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
	WebRendererVideoCodec,
} from '@remotion/web-renderer';
import {getDefaultAudioCodecForContainer} from '@remotion/web-renderer';
import {useCallback, useContext, useMemo, useState} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {AudioIcon} from '../../icons/audio';
import {CertificateIcon} from '../../icons/certificate';
import {DataIcon} from '../../icons/data';
import {FileIcon} from '../../icons/file';
import {PicIcon} from '../../icons/frame';
import {GearIcon} from '../../icons/gear';
import type {WebRenderModalState} from '../../state/modals';
import {ModalsContext} from '../../state/modals';
import {SidebarContext} from '../../state/sidebar';
import {Button} from '../Button';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {
	optionsSidebarTabs,
	persistSelectedOptionsSidebarPanel,
} from '../OptionsPanel';
import {RenderQueueContext} from '../RenderQueue/context';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {VerticalTab} from '../Tabs/vertical';
import {DataEditor} from './DataEditor';
import {getStringBeforeSuffix} from './get-string-before-suffix';
import {
	buttonStyle,
	container as containerStyle,
	flexer,
	horizontalLayout,
	horizontalTab,
	icon,
	iconContainer,
	leftSidebar,
	optionsPanel,
	outerModalStyle,
} from './render-modals';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from './ResolveCompositionBeforeModal';
import {useEncodableAudioCodecs} from './use-encodable-audio-codecs';
import {useEncodableVideoCodecs} from './use-encodable-video-codecs';
import {WebRendererExperimentalBadge} from './WebRendererExperimentalBadge';
import {WebRenderModalAdvanced} from './WebRenderModalAdvanced';
import {WebRenderModalAudio} from './WebRenderModalAudio';
import {WebRenderModalBasic} from './WebRenderModalBasic';
import {WebRenderModalLicense} from './WebRenderModalLicense';
import {WebRenderModalPicture} from './WebRenderModalPicture';

type WebRenderModalProps = {
	readonly compositionId: string;
	readonly initialFrame: number;
	readonly initialLogLevel: LogLevel;
	readonly initialLicenseKey: string | null;
	readonly defaultProps: Record<string, unknown>;
	readonly inFrameMark: number | null;
	readonly outFrameMark: number | null;
	readonly initialStillImageFormat: RenderStillOnWebImageFormat;
	readonly initialScale: number;
	readonly initialDelayRenderTimeout: number;
	readonly initialDefaultOutName: string | null;
	readonly initialContainer: WebRendererContainer | null;
	readonly initialVideoCodec: WebRendererVideoCodec | null;
	readonly initialAudioCodec: WebRendererAudioCodec | null;
	readonly initialAudioBitrate: WebRendererQuality | null;
	readonly initialVideoBitrate: WebRendererQuality | null;
	readonly initialHardwareAcceleration: HardwareAccelerationOption | null;
	readonly initialKeyframeIntervalInSeconds: number | null;
	readonly initialTransparent: boolean | null;
	readonly initialMuted: boolean | null;
	readonly initialMediaCacheSizeInBytes: number | null;
};

export type RenderType = 'still' | 'video';

type TabType =
	| 'general'
	| 'data'
	| 'picture'
	| 'audio'
	| 'advanced'
	| 'license';

const invalidCharacters = ['?', '*', '+', ':', '%'];

const isValidStillExtension = (
	extension: string,
	stillImageFormat: RenderStillOnWebImageFormat,
): boolean => {
	if (stillImageFormat === 'jpeg' && extension === 'jpg') {
		return true;
	}

	return extension === stillImageFormat;
};

const validateOutnameForStill = ({
	outName,
	stillImageFormat,
}: {
	outName: string;
	stillImageFormat: RenderStillOnWebImageFormat;
}): {valid: true} | {valid: false; error: Error} => {
	try {
		const extension = outName.substring(outName.lastIndexOf('.') + 1);
		const prefix = outName.substring(0, outName.lastIndexOf('.'));

		const hasDotAfterSlash = () => {
			const substrings = prefix.split('/');
			for (const str of substrings) {
				if (str[0] === '.') {
					return true;
				}
			}

			return false;
		};

		const hasInvalidChar = () => {
			return prefix.split('').some((char) => invalidCharacters.includes(char));
		};

		if (prefix.length < 1) {
			throw new Error('The prefix must be at least 1 character long');
		}

		if (prefix[0] === '.' || hasDotAfterSlash()) {
			throw new Error('The output name must not start with a dot');
		}

		if (hasInvalidChar()) {
			throw new Error(
				"Filename can't contain the following characters:  ?, *, +, %, :",
			);
		}

		if (!isValidStillExtension(extension, stillImageFormat)) {
			throw new Error(
				`The extension ${extension} is not supported for still image format ${stillImageFormat}`,
			);
		}

		return {valid: true};
	} catch (err) {
		return {valid: false, error: err as Error};
	}
};

// TODO: Switch to server-side rendering
// TODO: Filter out codecs that are not supported for the container
// TODO: Add more containers
// TODO: Shortcut: Shift + R
// TODO: Apply defaultCodec
// TODO: Apply defaultOutName
const WebRenderModal: React.FC<WebRenderModalProps> = ({
	initialFrame,
	defaultProps,
	inFrameMark,
	outFrameMark,
	initialLogLevel,
	initialLicenseKey,
	initialStillImageFormat,
	initialDefaultOutName,
	initialScale,
	initialDelayRenderTimeout,
	initialMediaCacheSizeInBytes,
	initialContainer,
	initialVideoCodec,
	initialAudioCodec,
	initialAudioBitrate,
	initialVideoBitrate,
	initialHardwareAcceleration,
	initialKeyframeIntervalInSeconds,
	initialTransparent,
	initialMuted,
}) => {
	const context = useContext(ResolvedCompositionContext);
	const {setSelectedModal} = useContext(ModalsContext);
	const {setSidebarCollapsedState} = useContext(SidebarContext);
	const {addClientStillJob, addClientVideoJob} = useContext(RenderQueueContext);
	if (!context) {
		throw new Error(
			'Should not be able to render without resolving comp first',
		);
	}

	const {
		resolved: {result: resolvedComposition},
		unresolved: unresolvedComposition,
	} = context;

	const [isVideo] = useState(() => {
		return typeof resolvedComposition.durationInFrames === 'undefined'
			? true
			: resolvedComposition.durationInFrames > 1;
	});

	const [renderMode, setRenderMode] = useState<RenderType>(
		isVideo ? 'video' : 'still',
	);
	const [tab, setTab] = useState<TabType>('general');
	const [imageFormat, setImageFormat] = useState<RenderStillOnWebImageFormat>(
		() => initialStillImageFormat ?? 'png',
	);
	const [frame, setFrame] = useState(() => initialFrame);
	const [logLevel, setLogLevel] = useState(() => initialLogLevel);
	const [inputProps, setInputProps] = useState(() => defaultProps);
	const [delayRenderTimeout, setDelayRenderTimeout] = useState(
		initialDelayRenderTimeout ?? 30000,
	);
	const [mediaCacheSizeInBytes, setMediaCacheSizeInBytes] = useState<
		number | null
	>(initialMediaCacheSizeInBytes);
	const [saving, setSaving] = useState(false);

	// Video-specific state
	const [codec, setCodec] = useState<WebRendererVideoCodec>(
		initialVideoCodec ?? 'h264',
	);
	const [container, setContainer] = useState<WebRendererContainer>(
		initialContainer ?? 'mp4',
	);
	const [audioCodec, setAudioCodec] = useState<WebRendererAudioCodec>(
		initialAudioCodec ?? 'aac',
	);
	const [audioBitrate, setAudioBitrate] = useState<WebRendererQuality>(
		initialAudioBitrate ?? 'medium',
	);
	const [videoBitrate, setVideoBitrate] = useState<WebRendererQuality>(
		initialVideoBitrate ?? 'high',
	);
	const [hardwareAcceleration, setHardwareAcceleration] = useState<
		'no-preference' | 'prefer-hardware' | 'prefer-software'
	>(
		(initialHardwareAcceleration as
			| 'no-preference'
			| 'prefer-hardware'
			| 'prefer-software') ?? 'no-preference',
	);
	const [keyframeIntervalInSeconds, setKeyframeIntervalInSeconds] = useState(
		initialKeyframeIntervalInSeconds ?? 5,
	);
	const [startFrame, setStartFrame] = useState<number | null>(
		() => inFrameMark,
	);
	const [endFrame, setEndFrame] = useState<number | null>(() => outFrameMark);
	const [transparent, setTransparent] = useState(initialTransparent ?? false);
	const [muted, setMuted] = useState(initialMuted ?? false);
	const [scale, setScale] = useState(initialScale ?? 1);

	const [licenseKey, setLicenseKey] = useState(initialLicenseKey);

	const encodableAudioCodecs = useEncodableAudioCodecs(container);
	const encodableVideoCodecs = useEncodableVideoCodecs(container);

	const effectiveAudioCodec = useMemo((): WebRendererAudioCodec => {
		if (encodableAudioCodecs.includes(audioCodec)) {
			return audioCodec;
		}

		return encodableAudioCodecs[0] ?? audioCodec;
	}, [audioCodec, encodableAudioCodecs]);

	const effectiveVideoCodec = useMemo((): WebRendererVideoCodec => {
		if (encodableVideoCodecs.includes(codec)) {
			return codec;
		}

		return encodableVideoCodecs[0] ?? codec;
	}, [codec, encodableVideoCodecs]);

	const finalEndFrame = useMemo(() => {
		if (endFrame === null) {
			return resolvedComposition.durationInFrames - 1;
		}

		return Math.max(
			0,
			Math.min(resolvedComposition.durationInFrames - 1, endFrame),
		);
	}, [endFrame, resolvedComposition.durationInFrames]);

	const finalStartFrame = useMemo(() => {
		if (startFrame === null) {
			return 0;
		}

		return Math.max(0, Math.min(finalEndFrame, startFrame));
	}, [finalEndFrame, startFrame]);

	const [initialOutNameState] = useState(() => {
		if (initialDefaultOutName) {
			return initialDefaultOutName;
		}

		return getDefaultOutLocation({
			compositionName: resolvedComposition.id,
			defaultExtension:
				renderMode === 'still'
					? imageFormat
					: isVideo
						? container
						: imageFormat,
			type: 'asset',
			compositionDefaultOutName: resolvedComposition.defaultOutName,
			clientSideRender: true,
		});
	});

	const [outName, setOutName] = useState(() => initialOutNameState);

	const setStillFormat = useCallback((format: RenderStillOnWebImageFormat) => {
		setImageFormat(format);
		setOutName((prev) => {
			const newFileName = getStringBeforeSuffix(prev) + '.' + format;
			return newFileName;
		});
	}, []);

	const setContainerFormat = useCallback(
		(newContainer: WebRendererContainer) => {
			setContainer(newContainer);
			setAudioCodec(getDefaultAudioCodecForContainer(newContainer));
			setOutName((prev) => {
				const newFileName = getStringBeforeSuffix(prev) + '.' + newContainer;
				return newFileName;
			});
		},
		[],
	);

	const onRenderModeChange = useCallback(
		(newMode: RenderType) => {
			setRenderMode(newMode);
			if (newMode === 'video') {
				setOutName((prev) => {
					const newFileName = getStringBeforeSuffix(prev) + '.' + container;
					return newFileName;
				});
			} else if (newMode === 'still') {
				setOutName((prev) => {
					const newFileName = getStringBeforeSuffix(prev) + '.' + imageFormat;
					return newFileName;
				});
			}
		},
		[container, imageFormat],
	);

	const renderTabOptions = useMemo((): SegmentedControlItem[] => {
		const options: SegmentedControlItem[] = [
			{
				label: 'Still',
				onClick: () => {
					onRenderModeChange('still');
				},
				key: 'still',
				selected: renderMode === 'still',
			},
		];

		// Only show video option if composition has more than 1 frame
		if (resolvedComposition.durationInFrames > 1) {
			options.push({
				label: 'Video',
				onClick: () => {
					onRenderModeChange('video');
				},
				key: 'video',
				selected: renderMode === 'video',
			});
		}

		return options;
	}, [renderMode, resolvedComposition.durationInFrames, onRenderModeChange]);

	const onFrameSetDirectly = useCallback(
		(newFrame: number) => {
			setFrame(newFrame);
		},
		[setFrame],
	);

	const onFrameChanged = useCallback(
		(e: string) => {
			setFrame((q) => {
				const newFrame = parseFloat(e);
				if (Number.isNaN(newFrame)) {
					return q;
				}

				return newFrame;
			});
		},
		[setFrame],
	);

	const onOutNameChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback((e) => {
			setOutName(e.target.value);
		}, []);

	const outnameValidation = useMemo(() => {
		if (renderMode === 'still') {
			return validateOutnameForStill({
				outName,
				stillImageFormat: imageFormat,
			});
		}

		// Validate for video
		try {
			const extension = outName.substring(outName.lastIndexOf('.') + 1);
			const prefix = outName.substring(0, outName.lastIndexOf('.'));

			const hasDotAfterSlash = () => {
				const substrings = prefix.split('/');
				for (const str of substrings) {
					if (str[0] === '.') {
						return true;
					}
				}

				return false;
			};

			const hasInvalidChar = () => {
				return prefix
					.split('')
					.some((char) => invalidCharacters.includes(char));
			};

			if (prefix.length < 1) {
				throw new Error('The prefix must be at least 1 character long');
			}

			if (prefix[0] === '.' || hasDotAfterSlash()) {
				throw new Error('The output name must not start with a dot');
			}

			if (hasInvalidChar()) {
				throw new Error(
					"Filename can't contain the following characters:  ?, *, +, %, :",
				);
			}

			if (extension !== container) {
				throw new Error(
					`The extension ${extension} is not supported for container format ${container}`,
				);
			}

			return {valid: true as const};
		} catch (err) {
			return {valid: false as const, error: err as Error};
		}
	}, [outName, imageFormat, renderMode, container]);

	const onAddToQueue = useCallback(() => {
		const compositionRef = {
			component: unresolvedComposition.component,
			calculateMetadata: unresolvedComposition.calculateMetadata ?? null,
			width: resolvedComposition.width,
			height: resolvedComposition.height,
			fps: resolvedComposition.fps,
			durationInFrames: resolvedComposition.durationInFrames,
			defaultProps: resolvedComposition.defaultProps,
		};

		if (renderMode === 'still') {
			addClientStillJob(
				{
					type: 'client-still',
					compositionId: resolvedComposition.id,
					outName,
					imageFormat,
					frame,
					inputProps,
					delayRenderTimeout,
					mediaCacheSizeInBytes,
					logLevel,
					licenseKey,
					scale,
				},
				compositionRef,
			);
		} else {
			addClientVideoJob(
				{
					type: 'client-video',
					compositionId: resolvedComposition.id,
					outName,
					container,
					videoCodec: effectiveVideoCodec,
					audioCodec: effectiveAudioCodec,
					startFrame: finalStartFrame,
					endFrame: finalEndFrame,
					audioBitrate,
					videoBitrate,
					hardwareAcceleration,
					keyframeIntervalInSeconds,
					transparent,
					muted,
					inputProps,
					delayRenderTimeout,
					mediaCacheSizeInBytes,
					logLevel,
					licenseKey,
					scale,
				},
				compositionRef,
			);
		}

		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedOptionsSidebarPanel('renders');
		optionsSidebarTabs.current?.selectRendersPanel();
		setSelectedModal(null);
	}, [
		renderMode,
		unresolvedComposition.component,
		unresolvedComposition.calculateMetadata,
		resolvedComposition.width,
		resolvedComposition.height,
		resolvedComposition.fps,
		resolvedComposition.durationInFrames,
		resolvedComposition.defaultProps,
		resolvedComposition.id,
		setSidebarCollapsedState,
		outName,
		imageFormat,
		frame,
		inputProps,
		delayRenderTimeout,
		mediaCacheSizeInBytes,
		logLevel,
		licenseKey,
		container,
		effectiveVideoCodec,
		effectiveAudioCodec,
		finalStartFrame,
		finalEndFrame,
		audioBitrate,
		videoBitrate,
		hardwareAcceleration,
		keyframeIntervalInSeconds,
		transparent,
		muted,
		setSelectedModal,
		addClientStillJob,
		addClientVideoJob,
		scale,
	]);

	return (
		<div style={outerModalStyle}>
			<ModalHeader title={`Render ${resolvedComposition.id}`} />
			<div style={containerStyle}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={onAddToQueue}
					style={buttonStyle}
					disabled={!outnameValidation.valid}
				>
					Render {renderMode}
					<ShortcutHint keyToPress="↵" cmdOrCtrl />
				</Button>
			</div>
			<div style={containerStyle}>
				<WebRendererExperimentalBadge />
			</div>
			<div style={horizontalLayout}>
				<div style={leftSidebar}>
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
					{renderMode === 'video' ? (
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
					<VerticalTab
						style={horizontalTab}
						selected={tab === 'license'}
						onClick={() => setTab('license')}
					>
						<div style={iconContainer}>
							<CertificateIcon style={icon} />
						</div>
						License
					</VerticalTab>
				</div>
				<div style={optionsPanel} className={VERTICAL_SCROLLBAR_CLASSNAME}>
					{tab === 'general' ? (
						<WebRenderModalBasic
							renderMode={renderMode}
							resolvedComposition={resolvedComposition}
							imageFormat={imageFormat}
							setStillFormat={setStillFormat}
							frame={frame}
							onFrameChanged={onFrameChanged}
							onFrameSetDirectly={onFrameSetDirectly}
							container={container}
							setContainerFormat={setContainerFormat}
							setCodec={setCodec}
							encodableVideoCodecs={encodableVideoCodecs}
							effectiveVideoCodec={effectiveVideoCodec}
							startFrame={finalStartFrame}
							setStartFrame={setStartFrame}
							endFrame={finalEndFrame}
							setEndFrame={setEndFrame}
							outName={outName}
							onOutNameChange={onOutNameChange}
							validationMessage={
								outnameValidation.valid ? null : outnameValidation.error.message
							}
							logLevel={logLevel}
							setLogLevel={setLogLevel}
						/>
					) : tab === 'data' ? (
						<DataEditor
							defaultProps={inputProps}
							setDefaultProps={setInputProps}
							unresolvedComposition={unresolvedComposition}
							mayShowSaveButton={false}
							propsEditType="input-props"
							saving={saving}
							setSaving={setSaving}
							readOnlyStudio={false}
						/>
					) : tab === 'picture' ? (
						<WebRenderModalPicture
							renderMode={renderMode}
							videoBitrate={videoBitrate}
							setVideoBitrate={setVideoBitrate}
							keyframeIntervalInSeconds={keyframeIntervalInSeconds}
							setKeyframeIntervalInSeconds={setKeyframeIntervalInSeconds}
							transparent={transparent}
							setTransparent={setTransparent}
							scale={scale}
							setScale={setScale}
							compositionWidth={resolvedComposition.width}
							compositionHeight={resolvedComposition.height}
						/>
					) : tab === 'audio' ? (
						<WebRenderModalAudio
							muted={muted}
							setMuted={setMuted}
							audioCodec={audioCodec}
							setAudioCodec={setAudioCodec}
							audioBitrate={audioBitrate}
							setAudioBitrate={setAudioBitrate}
							container={container}
							encodableCodecs={encodableAudioCodecs}
							effectiveAudioCodec={effectiveAudioCodec}
						/>
					) : tab === 'advanced' ? (
						<WebRenderModalAdvanced
							renderMode={renderMode}
							delayRenderTimeout={delayRenderTimeout}
							setDelayRenderTimeout={setDelayRenderTimeout}
							mediaCacheSizeInBytes={mediaCacheSizeInBytes}
							setMediaCacheSizeInBytes={setMediaCacheSizeInBytes}
							hardwareAcceleration={hardwareAcceleration}
							setHardwareAcceleration={setHardwareAcceleration}
						/>
					) : (
						<WebRenderModalLicense
							licenseKey={licenseKey}
							setLicenseKey={setLicenseKey}
							initialPublicLicenseKey={initialLicenseKey}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export const WebRenderModalWithLoader: React.FC<WebRenderModalState> = (
	props,
) => {
	return (
		<DismissableModal>
			<ResolveCompositionBeforeModal compositionId={props.compositionId}>
				<WebRenderModal {...props} />
			</ResolveCompositionBeforeModal>
		</DismissableModal>
	);
};
