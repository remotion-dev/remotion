import type {LogLevel} from '@remotion/renderer';
import {getDefaultOutLocation} from '@remotion/studio-shared';
import type {RenderStillImageFormat} from '@remotion/web-renderer';
import {renderStillOnWeb} from '@remotion/web-renderer';
import {useCallback, useContext, useMemo, useState} from 'react';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {BLUE} from '../../helpers/colors';
import {useFileExistence} from '../../helpers/use-file-existence';
import {DataIcon} from '../../icons/data';
import {FileIcon} from '../../icons/file';
import type {WebRenderModalState} from '../../state/modals';
import {Button} from '../Button';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {InputDragger} from '../NewComposition/InputDragger';
import {RightAlignInput} from '../NewComposition/RemInput';
import type {SegmentedControlItem} from '../SegmentedControl';
import {SegmentedControl} from '../SegmentedControl';
import {VerticalTab} from '../Tabs/vertical';
import {DataEditor} from './DataEditor';
import {getStringBeforeSuffix} from './get-string-before-suffix';
import {input, label, optionRow, rightRow} from './layout';
import {NumberSetting} from './NumberSetting';
import {OptionExplainerBubble} from './OptionExplainerBubble';
import {outerModalStyle} from './render-modals';
import {RenderModalOutputName} from './RenderModalOutputName';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from './ResolveCompositionBeforeModal';

type WebRenderModalProps = {
	readonly compositionId: string;
	readonly initialFrame: number;
	readonly defaultProps: Record<string, unknown>;
};

type RenderType = 'still';

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

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	padding: '12px 16px',
	borderBottom: '1px solid black',
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

const optionsPanel: React.CSSProperties = {
	display: 'flex',
	width: '100%',
};

const tabContainer: React.CSSProperties = {
	flex: 1,
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

	const [renderMode] = useState<RenderType>('still');
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

	const [initialOutName] = useState(() => {
		return getDefaultOutLocation({
			compositionName: resolvedComposition.id,
			defaultExtension: 'png',
			type: 'asset',
			compositionDefaultOutName: resolvedComposition.defaultOutName,
		});
	});

	const [outName, setOutName] = useState(() => initialOutName);

	const changeMediaCacheSizeInBytes: React.Dispatch<
		React.SetStateAction<number>
	> = useCallback(
		(cb) => {
			setMediaCacheSizeInBytes((prev) => {
				if (prev === null) {
					throw new TypeError('Expected previous value');
				}

				if (typeof cb === 'function') {
					return cb(prev);
				}

				return cb;
			});
		},
		[setMediaCacheSizeInBytes],
	);

	const setStillFormat = useCallback((format: RenderStillImageFormat) => {
		setImageFormat(format);
		setOutName((prev) => {
			const newFileName = getStringBeforeSuffix(prev) + '.' + format;
			return newFileName;
		});
	}, []);

	const imageFormatOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'PNG',
				onClick: () => setStillFormat('png'),
				key: 'png',
				selected: imageFormat === 'png',
			},
			{
				label: 'JPEG',
				onClick: () => setStillFormat('jpeg'),
				key: 'jpeg',
				selected: imageFormat === 'jpeg',
			},
			{
				label: 'WebP',
				onClick: () => setStillFormat('webp'),
				key: 'webp',
				selected: imageFormat === 'webp',
			},
		];
	}, [imageFormat, setStillFormat]);

	const renderTabOptions = useMemo((): SegmentedControlItem[] => {
		return [
			{
				label: 'Still',
				onClick: () => {
					// Only still is supported for now
				},
				key: 'still',
				selected: renderMode === 'still',
			},
		];
	}, [renderMode]);

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

	const onVerboseLoggingChanged = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setLogLevel(e.target.checked ? 'verbose' : 'info');
		},
		[],
	);

	const onOutNameChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback((e) => {
			setOutName(e.target.value);
		}, []);

	const outnameValidation = useMemo(() => {
		return validateOutnameForStill({
			outName,
			stillImageFormat: imageFormat,
		});
	}, [outName, imageFormat]);

	const existence = useFileExistence(outName);

	const onRender = useCallback(async () => {
		const blob = await renderStillOnWeb({
			component: unresolvedComposition.component,
			frame,
			imageFormat,
			logLevel,
			inputProps,
			delayRenderTimeoutInMilliseconds: delayRenderTimeout,
			mediaCacheSizeInBytes,
			durationInFrames: resolvedComposition.durationInFrames,
			width: resolvedComposition.width,
			height: resolvedComposition.height,
			fps: resolvedComposition.fps,
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

	const toggleCustomMediaCacheSizeInBytes = useCallback(() => {
		setMediaCacheSizeInBytes((previous) => {
			if (previous === null) {
				return 1000 * 1000 * 1000;
			}

			return null;
		});
	}, [setMediaCacheSizeInBytes]);

	return (
		<div style={outerModalStyle}>
			<ModalHeader title={`Render ${resolvedComposition.id}`} />
			<div style={container}>
				<SegmentedControl items={renderTabOptions} needsWrapping={false} />
				<div style={flexer} />
				<Button
					autoFocus
					onClick={onRender}
					style={buttonStyle}
					disabled={!outnameValidation.valid}
				>
					Render still
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
						<div style={tabContainer}>
							<div style={optionRow}>
								<div style={label}>Format</div>
								<div style={rightRow}>
									<SegmentedControl items={imageFormatOptions} needsWrapping />
								</div>
							</div>
							{resolvedComposition.durationInFrames > 1 ? (
								<div style={optionRow}>
									<div style={label}>Frame</div>
									<div style={rightRow}>
										<RightAlignInput>
											<InputDragger
												value={frame}
												onTextChange={onFrameChanged}
												placeholder={`0-${resolvedComposition.durationInFrames - 1}`}
												onValueChange={onFrameSetDirectly}
												name="frame"
												step={1}
												min={0}
												status="ok"
												max={resolvedComposition.durationInFrames - 1}
												rightAlign
											/>
										</RightAlignInput>
									</div>
								</div>
							) : null}
							<RenderModalOutputName
								existence={existence}
								inputStyle={input}
								outName={outName}
								onValueChange={onOutNameChange}
								validationMessage={
									outnameValidation.valid
										? null
										: outnameValidation.error.message
								}
								label="Download name"
							/>
							<div style={optionRow}>
								<div style={label}>
									Verbose logging <Spacing x={0.5} />
									<OptionExplainerBubble id="logLevelOption" />
								</div>
								<div style={rightRow}>
									<Checkbox
										checked={logLevel === 'verbose'}
										onChange={onVerboseLoggingChanged}
										name="verbose-logging"
									/>
								</div>
							</div>
						</div>
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
						<div style={tabContainer}>
							<NumberSetting
								name="Delay Render Timeout"
								formatter={(v) => `${v}ms`}
								min={0}
								max={1000000000}
								step={1000}
								value={delayRenderTimeout}
								onValueChanged={setDelayRenderTimeout}
								hint="delayRenderTimeoutInMillisecondsOption"
							/>
							<div style={optionRow}>
								<div style={label}>Custom @remotion/media cache size</div>
								<Spacing x={0.5} />
								<OptionExplainerBubble id="mediaCacheSizeInBytesOption" />
								<div style={rightRow}>
									<Checkbox
										checked={mediaCacheSizeInBytes !== null}
										onChange={toggleCustomMediaCacheSizeInBytes}
										name="media-cache-size"
									/>
								</div>
							</div>

							{mediaCacheSizeInBytes === null ? null : (
								<NumberSetting
									name="@remotion/media cache size"
									formatter={(w) => `${w} bytes`}
									min={0}
									max={10000000000}
									step={10 * 1024 * 1024}
									value={mediaCacheSizeInBytes}
									onValueChanged={changeMediaCacheSizeInBytes}
								/>
							)}
						</div>
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
