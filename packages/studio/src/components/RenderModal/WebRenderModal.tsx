import type {LogLevel} from '@remotion/renderer';
import {getDefaultOutLocation} from '@remotion/studio-shared';
import type {
	RenderMediaOnWebProgress,
	RenderStillImageFormat,
	WebRendererCodec,
	WebRendererContainer,
	WebRendererQuality,
} from '@remotion/web-renderer';
import {renderMediaOnWeb, renderStillOnWeb} from '@remotion/web-renderer';
import {useCallback, useContext, useMemo, useState} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {useFileExistence} from '../../helpers/use-file-existence';
import {DataIcon} from '../../icons/data';
import {FileIcon} from '../../icons/file';
import type {WebRenderModalState} from '../../state/modals';
import {Button} from '../Button';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
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
import {WebRenderModalAdvanced} from './WebRenderModalAdvanced';
import {WebRenderModalBasic} from './WebRenderModalBasic';

type WebRenderModalProps = {
	readonly compositionId: string;
	readonly initialFrame: number;
	readonly defaultProps: Record<string, unknown>;
};

export type RenderType = 'still' | 'video';

type TabType = 'general' | 'data' | 'advanced';

const invalidCharacters = ['?', '*', '+', ':', '%'];

const isValidStillExtension = (
	extension: string,
	stillImageFormat: RenderStillImageFormat,
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
	stillImageFormat: RenderStillImageFormat;
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

const WebRenderModal: React.FC<WebRenderModalProps> = ({
	initialFrame,
	defaultProps,
}) => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error(
			'Should not be able to render without resolving comp first',
		);
	}

	const {
		resolved: {result: resolvedComposition},
		unresolved: unresolvedComposition,
	} = context;

	const [renderMode, setRenderMode] = useState<RenderType>('still');
	const [tab, setTab] = useState<TabType>('general');
	const [imageFormat, setImageFormat] = useState<RenderStillImageFormat>('png');
	const [frame, setFrame] = useState(() => initialFrame);
	const [logLevel, setLogLevel] = useState<LogLevel>('info');
	const [inputProps, setInputProps] = useState(() => defaultProps);
	const [delayRenderTimeout, setDelayRenderTimeout] = useState(30000);
	const [mediaCacheSizeInBytes, setMediaCacheSizeInBytes] = useState<
		number | null
	>(null);
	const [saving, setSaving] = useState(false);

	// Video-specific state
	const [codec, setCodec] = useState<WebRendererCodec>('h264');
	const [container, setContainer] = useState<WebRendererContainer>('mp4');
	const [videoBitrate, setVideoBitrate] =
		useState<WebRendererQuality>('medium');
	const [hardwareAcceleration, setHardwareAcceleration] = useState<
		'no-preference' | 'prefer-hardware' | 'prefer-software'
	>('no-preference');
	const [keyFrameInterval, setKeyFrameInterval] = useState(5);
	const [startFrame, setStartFrame] = useState<number | null>(null);
	const [endFrame, setEndFrame] = useState<number | null>(null);
	const [renderProgress, setRenderProgress] =
		useState<RenderMediaOnWebProgress | null>(null);

	const [initialOutName] = useState(() => {
		return getDefaultOutLocation({
			compositionName: resolvedComposition.id,
			defaultExtension: 'png',
			type: 'asset',
			compositionDefaultOutName: resolvedComposition.defaultOutName,
		});
	});

	const [outName, setOutName] = useState(() => initialOutName);

	const setStillFormat = useCallback((format: RenderStillImageFormat) => {
		setImageFormat(format);
		setOutName((prev) => {
			const newFileName = getStringBeforeSuffix(prev) + '.' + format;
			return newFileName;
		});
	}, []);

	const setContainerFormat = useCallback(
		(newContainer: WebRendererContainer) => {
			setContainer(newContainer);
			setOutName((prev) => {
				const newFileName = getStringBeforeSuffix(prev) + '.' + newContainer;
				return newFileName;
			});
			// Update codec if needed for container compatibility
			if (newContainer === 'webm' && codec === 'h264') {
				setCodec('vp8');
			} else if (
				newContainer === 'mp4' &&
				(codec === 'vp8' || codec === 'vp9')
			) {
				setCodec('h264');
			}
		},
		[codec],
	);

	const onRenderModeChange = useCallback(
		(newMode: RenderType) => {
			setRenderMode(newMode);
			if (newMode === 'video') {
				setOutName((prev) => {
					const newFileName = getStringBeforeSuffix(prev) + '.' + container;
					return newFileName;
				});
			} else {
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

	const existence = useFileExistence(outName);

	const onRenderStill = useCallback(async () => {
		const blob = await renderStillOnWeb({
			composition: {
				component: unresolvedComposition.component,
				width: resolvedComposition.width,
				height: resolvedComposition.height,
				fps: resolvedComposition.fps,
				durationInFrames: resolvedComposition.durationInFrames,
			},
			frame,
			imageFormat,
			inputProps,
			delayRenderTimeoutInMilliseconds: delayRenderTimeout,
			mediaCacheSizeInBytes,
			logLevel,
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// Extract just the filename from the path
		const filename = outName.includes('/')
			? outName.substring(outName.lastIndexOf('/') + 1)
			: outName;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}, [
		unresolvedComposition.component,
		frame,
		imageFormat,
		logLevel,
		inputProps,
		delayRenderTimeout,
		mediaCacheSizeInBytes,
		resolvedComposition.durationInFrames,
		resolvedComposition.width,
		resolvedComposition.height,
		resolvedComposition.fps,
		outName,
	]);

	const onRenderVideo = useCallback(async () => {
		setRenderProgress({renderedFrames: 0, encodedFrames: 0});

		const buffer = await renderMediaOnWeb({
			composition: {
				component: unresolvedComposition.component,
				width: resolvedComposition.width,
				height: resolvedComposition.height,
				fps: resolvedComposition.fps,
				durationInFrames: resolvedComposition.durationInFrames,
			},
			inputProps,
			delayRenderTimeoutInMilliseconds: delayRenderTimeout,
			mediaCacheSizeInBytes,
			logLevel,
			codec,
			container,
			videoBitrate,
			hardwareAcceleration,
			keyFrameInterval,
			frameRange:
				startFrame !== null || endFrame !== null
					? ([
							startFrame ?? 0,
							endFrame ?? resolvedComposition.durationInFrames - 1,
						] as [number, number])
					: null,
			onProgress: (progress) => {
				setRenderProgress(progress);
			},
		});

		setRenderProgress(null);

		const blob = new Blob([buffer], {
			type: container === 'mp4' ? 'video/mp4' : 'video/webm',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		// Extract just the filename from the path
		const filename = outName.includes('/')
			? outName.substring(outName.lastIndexOf('/') + 1)
			: outName;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}, [
		unresolvedComposition.component,
		inputProps,
		delayRenderTimeout,
		mediaCacheSizeInBytes,
		logLevel,
		codec,
		container,
		videoBitrate,
		hardwareAcceleration,
		keyFrameInterval,
		startFrame,
		endFrame,
		resolvedComposition.durationInFrames,
		resolvedComposition.width,
		resolvedComposition.height,
		resolvedComposition.fps,
		outName,
	]);

	const onRender = useCallback(async () => {
		if (renderMode === 'still') {
			await onRenderStill();
		} else {
			await onRenderVideo();
		}
	}, [renderMode, onRenderStill, onRenderVideo]);

	return (
		<div style={outerModalStyle}>
			<ModalHeader title={`Render ${resolvedComposition.id}`} />
			<div style={containerStyle}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={onRender}
					style={buttonStyle}
					disabled={!outnameValidation.valid}
				>
					{renderProgress
						? `Rendering... ${renderProgress.renderedFrames}/${
								endFrame ?? resolvedComposition.durationInFrames - 1
							}`
						: `Render ${renderMode}`}
					<ShortcutHint keyToPress="↵" cmdOrCtrl />
				</Button>
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
						selected={tab === 'advanced'}
						onClick={() => setTab('advanced')}
					>
						<div style={iconContainer}>
							<FileIcon style={icon} />
						</div>
						Advanced
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
							codec={codec}
							setCodec={setCodec}
							videoBitrate={videoBitrate}
							setVideoBitrate={setVideoBitrate}
							startFrame={startFrame}
							setStartFrame={setStartFrame}
							endFrame={endFrame}
							setEndFrame={setEndFrame}
							outName={outName}
							onOutNameChange={onOutNameChange}
							validationMessage={
								outnameValidation.valid ? null : outnameValidation.error.message
							}
							existence={existence}
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
					) : (
						<WebRenderModalAdvanced
							renderMode={renderMode}
							delayRenderTimeout={delayRenderTimeout}
							setDelayRenderTimeout={setDelayRenderTimeout}
							mediaCacheSizeInBytes={mediaCacheSizeInBytes}
							setMediaCacheSizeInBytes={setMediaCacheSizeInBytes}
							hardwareAcceleration={hardwareAcceleration}
							setHardwareAcceleration={setHardwareAcceleration}
							keyFrameInterval={keyFrameInterval}
							setKeyFrameInterval={setKeyFrameInterval}
							logLevel={logLevel}
							setLogLevel={setLogLevel}
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
