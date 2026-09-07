import {formatBytes} from '@remotion/studio-shared';
import {
	canUseWhisperWebGpu,
	getAvailableModels,
	type WhisperWebGpuModel,
	type WhisperWebGpuTask,
} from '@remotion/whisper-webgpu';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {BLUE_DISABLED, LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {Checkmark} from '../../icons/Checkmark';
import {CubeIcon} from '../../icons/cube';
import {TranscriptionIcon} from '../../icons/transcription';
import type {TranscriptionModalState} from '../../state/modals';
import {SetSelectedModalContext} from '../../state/modals';
import {SidebarContext} from '../../state/sidebar';
import {Button} from '../Button';
import {Checkbox} from '../Checkbox';
import {Spacing} from '../layout';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalHeader} from '../ModalHeader';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {optionsSidebarTabs} from '../options-sidebar-tabs';
import {persistSelectedOptionsSidebarPanel} from '../OptionsPanel';
import {InfoBubble} from '../RenderModal/InfoBubble';
import {input, label, optionRow, rightRow} from '../RenderModal/layout';
import {NumberSetting} from '../RenderModal/NumberSetting';
import {
	buttonStyle,
	container,
	flexer,
	horizontalLayout,
	horizontalTab,
	icon,
	iconContainer,
	leftSidebar,
	optionsPanel,
	outerModalStyle,
} from '../RenderModal/render-modals';
import {RenderModalHr} from '../RenderModal/RenderModalHr';
import {RenderQueueContext} from '../RenderQueue/context';
import {VerticalTab} from '../Tabs/vertical';
import {useStaticFiles} from '../use-static-files';
import {
	getDefaultCaptionOutputName,
	validateCaptionOutputName,
} from './caption-output-name';
import {WHISPER_LANGUAGES, type WhisperLanguage} from './whisper-languages';

const TRANSCRIPTION_OUTPUT_MESSAGE_ID = 'remotion-transcription-output-message';
const TRANSCRIPTION_CHUNK_MESSAGE_ID = 'remotion-transcription-chunk-message';
const TRANSCRIPTION_DECODING_MESSAGE_ID =
	'remotion-transcription-decoding-message';
const TRANSCRIPTION_TASK_MESSAGE_ID = 'remotion-transcription-task-message';
const DEFAULT_CHUNK_LENGTH_IN_SECONDS = 30;
const DEFAULT_STRIDE_LENGTH_IN_SECONDS = 5;
const DEFAULT_TEMPERATURE = 1;
const DEFAULT_TOP_K = 50;
const DEFAULT_REPETITION_PENALTY = 1;
const DEFAULT_NO_REPEAT_NGRAM_SIZE = 0;
const MAX_CHUNK_LENGTH_IN_SECONDS = 30;

type Tab = 'transcribe' | 'models';

type SupportState =
	| {type: 'checking'}
	| {type: 'supported'}
	| {type: 'unsupported'; message: string};

const AVAILABLE_MODELS = getAvailableModels();

const settingsPanel: React.CSSProperties = {
	...optionsPanel,
	flexDirection: 'column',
	paddingTop: 16,
};

const controlStyle: React.CSSProperties = {
	width: 330,
	maxWidth: '100%',
};

const nestedLabelStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const taskMessageRow: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-end',
	padding: '0 16px 8px',
};

const outputRow: React.CSSProperties = {
	...optionRow,
	paddingBottom: 12,
};

const tooltipContent: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	maxWidth: 360,
	padding: 12,
};

const tooltipInlineCode: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const modelsExplanation: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
	padding: '0 16px 12px',
};

const modelName: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const modelDescription: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: 1.5,
};

const modelAction: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 12,
};

const modelSize: React.CSSProperties = {
	...modelDescription,
	fontVariantNumeric: 'tabular-nums',
};

const TranscriptionSettingLabel: React.FC<{
	readonly children: React.ReactNode;
	readonly inputId: string | null;
	readonly name: string;
}> = ({children, inputId, name}) => {
	return (
		<div style={label}>
			{inputId === null ? (
				name
			) : (
				<label htmlFor={inputId} style={nestedLabelStyle}>
					{name}
				</label>
			)}
			<Spacing x={0.5} />
			<InfoBubble title={`Learn more about ${name}`}>
				<div style={tooltipContent}>{children}</div>
			</InfoBubble>
		</div>
	);
};

const ModelSettings: React.FC<{
	readonly selectedLanguage: WhisperLanguage;
	readonly selectedModel: WhisperWebGpuModel;
	readonly selectedTask: WhisperWebGpuTask;
	readonly setSelectedLanguage: (language: WhisperLanguage) => void;
	readonly setSelectedModel: (model: WhisperWebGpuModel) => void;
	readonly setSelectedTask: (task: WhisperWebGpuTask) => void;
	readonly supportState: SupportState;
}> = ({
	selectedLanguage,
	selectedModel,
	selectedTask,
	setSelectedLanguage,
	setSelectedModel,
	setSelectedTask,
	supportState,
}) => {
	const selectedModelInfo = AVAILABLE_MODELS.find(
		({name}) => name === selectedModel,
	);
	if (!selectedModelInfo) {
		throw new Error(`Unknown Whisper model: ${selectedModel}`);
	}

	const modelOptions = useMemo((): ComboboxValue[] => {
		return AVAILABLE_MODELS.map((model): ComboboxValue => {
			return {
				type: 'item',
				id: model.name,
				value: model.name,
				label: `${model.name} · ${formatBytes(model.webGpuDownloadSize)}`,
				leftItem: model.name === selectedModel ? <Checkmark /> : null,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				disabled: false,
				onClick: () => setSelectedModel(model.name),
			};
		});
	}, [selectedModel, setSelectedModel]);

	const languageOptions = useMemo((): ComboboxValue[] => {
		return WHISPER_LANGUAGES.map(([languageCode, languageName]) => ({
			type: 'item',
			id: languageCode,
			value: languageCode,
			label: languageName,
			leftItem: languageCode === selectedLanguage ? <Checkmark /> : null,
			keyHint: null,
			quickSwitcherLabel: null,
			subMenu: null,
			disabled: false,
			onClick: () => setSelectedLanguage(languageCode),
		}));
	}, [selectedLanguage, setSelectedLanguage]);
	const effectiveTask = selectedModelInfo.supportsTranslation
		? selectedTask
		: 'transcribe';
	const taskOptions = useMemo((): ComboboxValue[] => {
		return [
			{
				type: 'item',
				id: 'transcribe',
				value: 'transcribe',
				label: (
					<>
						<span aria-hidden="true" style={nestedLabelStyle}>
							Transcribe
						</span>
						<span style={{position: 'absolute', clip: 'rect(0 0 0 0)'}}>
							Task: Transcribe
						</span>
					</>
				),
				leftItem: effectiveTask === 'transcribe' ? <Checkmark /> : null,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				disabled: false,
				onClick: () => setSelectedTask('transcribe'),
			},
			{
				type: 'item',
				id: 'translate',
				value: 'translate',
				label: (
					<>
						<span aria-hidden="true" style={nestedLabelStyle}>
							Translate to English
						</span>
						<span style={{position: 'absolute', clip: 'rect(0 0 0 0)'}}>
							Task: Translate to English
						</span>
					</>
				),
				leftItem: effectiveTask === 'translate' ? <Checkmark /> : null,
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
				disabled: false,
				onClick: () => setSelectedTask('translate'),
			},
		];
	}, [effectiveTask, setSelectedTask]);

	useEffect(() => {
		if (!selectedModelInfo.supportsTranslation) {
			setSelectedTask('transcribe');
		}
	}, [selectedModelInfo.supportsTranslation, setSelectedTask]);

	return (
		<>
			<div style={optionRow}>
				<div style={label}>Whisper model</div>
				<div style={rightRow}>
					<Combobox
						values={modelOptions}
						selectedId={selectedModel}
						title="Whisper model"
						disabled={false}
						style={controlStyle}
					/>
				</div>
			</div>
			{selectedModelInfo.multilingual ? (
				<div style={optionRow}>
					<div style={label}>Spoken language</div>
					<div style={rightRow}>
						<Combobox
							values={languageOptions}
							selectedId={selectedLanguage}
							title="Spoken language"
							disabled={false}
							style={controlStyle}
						/>
					</div>
				</div>
			) : null}
			{selectedModelInfo.supportsTranslation ? (
				<div style={optionRow}>
					<div style={label}>Task</div>
					<div style={rightRow}>
						<Combobox
							values={taskOptions}
							selectedId={effectiveTask}
							title="Task"
							disabled={false}
							style={controlStyle}
						/>
					</div>
				</div>
			) : null}
			{effectiveTask === 'translate' ? (
				<div
					id={TRANSCRIPTION_TASK_MESSAGE_ID}
					aria-live="polite"
					style={taskMessageRow}
				>
					<ValidationMessage
						align="flex-end"
						message="Word timings may be less accurate when translating to English."
						type="warning"
					/>
				</div>
			) : null}
			{supportState.type === 'unsupported' ? (
				<div style={{padding: '0 16px'}}>
					<ValidationMessage
						align="flex-end"
						message={supportState.message}
						type="error"
					/>
				</div>
			) : null}
		</>
	);
};

const OutputSettings: React.FC<{
	readonly exists: boolean;
	readonly onOutNameChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly outName: string;
	readonly validationMessage: string | null;
}> = ({exists, onOutNameChange, outName, validationMessage}) => {
	return (
		<div style={outputRow}>
			<TranscriptionSettingLabel inputId={null} name="Output in public/">
				Studio writes a JSON array compatible with{' '}
				<code style={tooltipInlineCode}>Caption[]</code>. Load it from your
				composition with <code style={tooltipInlineCode}>staticFile()</code>.
			</TranscriptionSettingLabel>
			<div style={rightRow}>
				<div style={controlStyle}>
					<RemotionInput
						aria-label="Caption output file"
						aria-describedby={
							validationMessage || exists
								? TRANSCRIPTION_OUTPUT_MESSAGE_ID
								: undefined
						}
						aria-invalid={validationMessage ? true : undefined}
						status={validationMessage ? 'error' : exists ? 'warning' : 'ok'}
						style={input}
						type="text"
						value={outName}
						onChange={onOutNameChange}
						rightAlign
					/>
					{validationMessage || exists ? (
						<div id={TRANSCRIPTION_OUTPUT_MESSAGE_ID} aria-live="polite">
							<Spacing y={1} block />
							<ValidationMessage
								align="flex-end"
								message={validationMessage ?? 'Exists, will be overwritten'}
								type={validationMessage ? 'error' : 'warning'}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

const AdvancedSettings: React.FC<{
	readonly chunkLengthInSeconds: number;
	readonly doSample: boolean;
	readonly forceFullSequences: boolean;
	readonly noRepeatNgramSize: number;
	readonly repetitionPenalty: number;
	readonly setChunkLengthInSeconds: React.Dispatch<
		React.SetStateAction<number>
	>;
	readonly setDoSample: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setForceFullSequences: React.Dispatch<React.SetStateAction<boolean>>;
	readonly setNoRepeatNgramSize: React.Dispatch<React.SetStateAction<number>>;
	readonly setRepetitionPenalty: React.Dispatch<React.SetStateAction<number>>;
	readonly setStrideLengthInSeconds: React.Dispatch<
		React.SetStateAction<number>
	>;
	readonly setTemperature: React.Dispatch<React.SetStateAction<number>>;
	readonly setTopK: React.Dispatch<React.SetStateAction<number>>;
	readonly strideLengthInSeconds: number;
	readonly temperature: number;
	readonly topK: number;
	readonly decodingValidationMessage: string | null;
	readonly validationMessage: string | null;
}> = ({
	chunkLengthInSeconds,
	doSample,
	forceFullSequences,
	noRepeatNgramSize,
	repetitionPenalty,
	setChunkLengthInSeconds,
	setDoSample,
	setForceFullSequences,
	setNoRepeatNgramSize,
	setRepetitionPenalty,
	setStrideLengthInSeconds,
	setTemperature,
	setTopK,
	strideLengthInSeconds,
	temperature,
	topK,
	decodingValidationMessage,
	validationMessage,
}) => {
	const onForceFullSequencesChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback(
			(event) => setForceFullSequences(event.target.checked),
			[setForceFullSequences],
		);
	const onDoSampleChange: React.ChangeEventHandler<HTMLInputElement> =
		useCallback((event) => setDoSample(event.target.checked), [setDoSample]);

	return (
		<>
			<div
				aria-describedby={
					validationMessage ? TRANSCRIPTION_CHUNK_MESSAGE_ID : undefined
				}
				aria-invalid={validationMessage ? true : undefined}
				aria-label="Chunk settings"
				role="group"
			>
				<NumberSetting
					formatter={(value) => `${value}s`}
					hint={{
						content: (
							<div style={tooltipContent}>
								Studio splits long audio into chunks of up to 30 seconds. Longer
								chunks need fewer transcription passes.
							</div>
						),
						title: 'Learn more about Chunk length',
					}}
					max={MAX_CHUNK_LENGTH_IN_SECONDS}
					min={1}
					name="Chunk length"
					onValueChanged={setChunkLengthInSeconds}
					step={1}
					value={chunkLengthInSeconds}
				/>
				<NumberSetting
					formatter={(value) => `${value}s`}
					hint={{
						content: (
							<div style={tooltipContent}>
								Overlaps both sides of each chunk to help preserve words at the
								boundaries.
							</div>
						),
						title: 'Learn more about Stride length',
					}}
					min={0}
					name="Stride length"
					onValueChanged={setStrideLengthInSeconds}
					step={1}
					value={strideLengthInSeconds}
				/>
			</div>
			{validationMessage ? (
				<div
					id={TRANSCRIPTION_CHUNK_MESSAGE_ID}
					aria-live="polite"
					style={{padding: '0 16px'}}
				>
					<ValidationMessage
						align="flex-end"
						message={validationMessage}
						type="error"
					/>
				</div>
			) : null}
			<div
				aria-describedby={
					decodingValidationMessage
						? TRANSCRIPTION_DECODING_MESSAGE_ID
						: undefined
				}
				aria-invalid={decodingValidationMessage ? true : undefined}
				aria-label="Decoding settings"
				role="group"
			>
				<RenderModalHr />
				<div style={optionRow}>
					<TranscriptionSettingLabel
						inputId="force-full-sequences"
						name="Force full sequences"
					>
						Makes the job fail if Whisper leaves an incomplete timestamp
						sequence.
					</TranscriptionSettingLabel>
					<div style={rightRow}>
						<Checkbox
							checked={forceFullSequences}
							inputId="force-full-sequences"
							name="force-full-sequences"
							onChange={onForceFullSequencesChange}
						/>
					</div>
				</div>
				<RenderModalHr />
				<div style={optionRow}>
					<TranscriptionSettingLabel inputId="use-sampling" name="Use sampling">
						Makes decoding nondeterministic.
					</TranscriptionSettingLabel>
					<div style={rightRow}>
						<Checkbox
							checked={doSample}
							inputId="use-sampling"
							name="use-sampling"
							onChange={onDoSampleChange}
						/>
					</div>
				</div>
				{doSample ? (
					<>
						<NumberSetting
							hint={{
								content: (
									<div style={tooltipContent}>
										Controls randomness when sampling.
									</div>
								),
								title: 'Learn more about Temperature',
							}}
							min={0.1}
							name="Temperature"
							onValueChanged={setTemperature}
							step={0.1}
							value={temperature}
						/>
						<NumberSetting
							hint={{
								content: (
									<div style={tooltipContent}>
										Limits the candidate tokens when sampling.
									</div>
								),
								title: 'Learn more about Top K',
							}}
							min={0}
							name="Top K"
							onValueChanged={setTopK}
							step={1}
							value={topK}
						/>
					</>
				) : null}
				<NumberSetting
					hint={{
						content: (
							<div style={tooltipContent}>
								Discourages repeated tokens. A value of 1 disables the penalty.
							</div>
						),
						title: 'Learn more about Repetition penalty',
					}}
					min={0.1}
					name="Repetition penalty"
					onValueChanged={setRepetitionPenalty}
					step={0.1}
					value={repetitionPenalty}
				/>
				<NumberSetting
					hint={{
						content: (
							<div style={tooltipContent}>
								Prevents repeated phrases of this many tokens. A value of 0
								disables the filter.
							</div>
						),
						title: 'Learn more about No-repeat n-gram size',
					}}
					min={0}
					name="No-repeat n-gram size"
					onValueChanged={setNoRepeatNgramSize}
					step={1}
					value={noRepeatNgramSize}
				/>
			</div>
			{decodingValidationMessage ? (
				<div
					id={TRANSCRIPTION_DECODING_MESSAGE_ID}
					aria-live="polite"
					style={{padding: '0 16px'}}
				>
					<ValidationMessage
						align="flex-end"
						message={decodingValidationMessage}
						type="error"
					/>
				</div>
			) : null}
		</>
	);
};

const Models: React.FC<{
	readonly selectedModel: WhisperWebGpuModel;
	readonly setSelectedModel: (model: WhisperWebGpuModel) => void;
}> = ({selectedModel, setSelectedModel}) => {
	return (
		<div style={settingsPanel} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<p style={modelsExplanation}>
				Models are downloaded in the background when a transcription job starts.
				Follow the download progress in Jobs.
			</p>
			{AVAILABLE_MODELS.map((model) => {
				const selected = model.name === selectedModel;
				return (
					<div key={model.name} style={optionRow}>
						<div>
							<div style={modelName}>{model.name}</div>
							<div style={modelDescription}>
								{model.multilingual ? 'Multilingual' : 'English only'}
								{model.supportsTranslation ? ' · Supports translation' : null}
							</div>
						</div>
						<div style={modelAction}>
							<div style={modelSize}>
								{formatBytes(model.webGpuDownloadSize)}
							</div>
							<Button
								onClick={() => setSelectedModel(model.name)}
								disabled={selected}
								size="compact"
								style={selected ? undefined : buttonStyle}
							>
								{selected ? 'Selected' : 'Select'}
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export const TranscriptionModal: React.FC<TranscriptionModalState> = ({
	audioStreamIndex,
	displayName,
	requestInit,
	src,
}) => {
	const [tab, setTab] = useState<Tab>('transcribe');
	const [selectedModel, setSelectedModel] =
		useState<WhisperWebGpuModel>('small.en');
	const [selectedLanguage, setSelectedLanguage] =
		useState<WhisperLanguage>('en');
	const [selectedTask, setSelectedTask] =
		useState<WhisperWebGpuTask>('transcribe');
	const [chunkLengthInSeconds, setChunkLengthInSeconds] = useState(
		DEFAULT_CHUNK_LENGTH_IN_SECONDS,
	);
	const [strideLengthInSeconds, setStrideLengthInSeconds] = useState(
		DEFAULT_STRIDE_LENGTH_IN_SECONDS,
	);
	const [forceFullSequences, setForceFullSequences] = useState(false);
	const [doSample, setDoSample] = useState(false);
	const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
	const [topK, setTopK] = useState(DEFAULT_TOP_K);
	const [repetitionPenalty, setRepetitionPenalty] = useState(
		DEFAULT_REPETITION_PENALTY,
	);
	const [noRepeatNgramSize, setNoRepeatNgramSize] = useState(
		DEFAULT_NO_REPEAT_NGRAM_SIZE,
	);
	const [supportState, setSupportState] = useState<SupportState>({
		type: 'checking',
	});
	const [outName, setOutName] = useState(() =>
		getDefaultCaptionOutputName(src, displayName),
	);
	const {addCaptionJob, captionJobs} = useContext(RenderQueueContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {setSidebarCollapsedState} = useContext(SidebarContext);
	const staticFiles = useStaticFiles();

	useEffect(() => {
		let cancelled = false;
		canUseWhisperWebGpu().then((result) => {
			if (cancelled) {
				return;
			}

			setSupportState(
				result.supported
					? {type: 'supported'}
					: {type: 'unsupported', message: result.detailedReason},
			);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const normalizedOutName = outName.normalize('NFC').toLowerCase();
	const queuedOutputExists = captionJobs.some(
		(job) =>
			(job.status === 'idle' || job.status === 'running') &&
			job.outName.normalize('NFC').toLowerCase() === normalizedOutName,
	);
	const outputValidationMessage =
		validateCaptionOutputName(outName) ??
		(queuedOutputExists
			? 'Another caption job is already using this output file'
			: null);
	const exists = staticFiles.some(
		(file) => file.name.normalize('NFC').toLowerCase() === normalizedOutName,
	);
	const chunkValidationMessage =
		strideLengthInSeconds * 2 >= chunkLengthInSeconds
			? 'Stride length must be less than half of chunk length'
			: null;
	const decodingValidationMessage = !Number.isFinite(temperature)
		? 'Temperature must be a finite number greater than 0'
		: temperature <= 0
			? 'Temperature must be greater than 0'
			: !Number.isInteger(topK) || topK < 0
				? 'Top K must be a non-negative integer'
				: !Number.isFinite(repetitionPenalty)
					? 'Repetition penalty must be a finite number greater than 0'
					: repetitionPenalty <= 0
						? 'Repetition penalty must be greater than 0'
						: !Number.isInteger(noRepeatNgramSize) || noRepeatNgramSize < 0
							? 'No-repeat n-gram size must be a non-negative integer'
							: null;
	const canTranscribe =
		supportState.type === 'supported' &&
		outputValidationMessage === null &&
		chunkValidationMessage === null &&
		decodingValidationMessage === null;
	const transcribeDisabledReason =
		supportState.type === 'checking'
			? 'Checking WebGPU support'
			: supportState.type === 'unsupported'
				? supportState.message
				: (outputValidationMessage ??
					chunkValidationMessage ??
					decodingValidationMessage ??
					undefined);

	const onOutNameChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setOutName(event.target.value);
		},
		[],
	);

	const onAddToQueue = useCallback(() => {
		if (!canTranscribe) {
			return;
		}

		const modelInfo = AVAILABLE_MODELS.find(({name}) => name === selectedModel);
		if (!modelInfo) {
			throw new Error(`Unknown Whisper model: ${selectedModel}`);
		}

		addCaptionJob({
			src,
			displayName,
			audioStreamIndex,
			requestInit,
			outName,
			model: selectedModel,
			language: modelInfo.multilingual ? selectedLanguage : null,
			task: modelInfo.supportsTranslation ? selectedTask : 'transcribe',
			chunkLengthInSeconds,
			strideLengthInSeconds,
			forceFullSequences,
			doSample,
			temperature,
			topK,
			repetitionPenalty,
			noRepeatNgramSize,
		});
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedOptionsSidebarPanel('renders');
		optionsSidebarTabs.current?.selectRendersPanel();
		setSelectedModal(null);
	}, [
		addCaptionJob,
		audioStreamIndex,
		canTranscribe,
		chunkLengthInSeconds,
		displayName,
		doSample,
		forceFullSequences,
		noRepeatNgramSize,
		outName,
		repetitionPenalty,
		requestInit,
		src,
		selectedLanguage,
		selectedModel,
		selectedTask,
		setSelectedModal,
		setSidebarCollapsedState,
		strideLengthInSeconds,
		temperature,
		topK,
	]);

	return (
		<DismissableModal ariaLabel={`Transcribe ${displayName}`}>
			<div style={{...outerModalStyle, outline: 'none'}}>
				<ModalHeader title={`Transcribe ${displayName}`} />
				<div style={container}>
					<div style={flexer} />
					<Button
						onClick={onAddToQueue}
						disabled={!canTranscribe}
						title={transcribeDisabledReason}
						style={{
							...buttonStyle,
							backgroundColor: canTranscribe
								? buttonStyle.backgroundColor
								: BLUE_DISABLED,
						}}
					>
						Transcribe
					</Button>
				</div>
				<div style={horizontalLayout}>
					<div style={leftSidebar}>
						<VerticalTab
							autoFocus
							style={horizontalTab}
							selected={tab === 'transcribe'}
							onClick={() => setTab('transcribe')}
							renderIcon={(color) => (
								<div style={iconContainer}>
									<TranscriptionIcon color={color} style={icon} />
								</div>
							)}
						>
							Transcribe
						</VerticalTab>
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'models'}
							onClick={() => setTab('models')}
							renderIcon={(color) => (
								<div style={iconContainer}>
									<CubeIcon color={color} style={icon} />
								</div>
							)}
						>
							Models
						</VerticalTab>
					</div>
					{tab === 'transcribe' ? (
						<div style={settingsPanel} className={VERTICAL_SCROLLBAR_CLASSNAME}>
							<OutputSettings
								exists={exists}
								onOutNameChange={onOutNameChange}
								outName={outName}
								validationMessage={outputValidationMessage}
							/>
							<RenderModalHr />
							<ModelSettings
								selectedLanguage={selectedLanguage}
								selectedModel={selectedModel}
								selectedTask={selectedTask}
								setSelectedLanguage={setSelectedLanguage}
								setSelectedModel={setSelectedModel}
								setSelectedTask={setSelectedTask}
								supportState={supportState}
							/>
							<RenderModalHr />
							<AdvancedSettings
								chunkLengthInSeconds={chunkLengthInSeconds}
								decodingValidationMessage={decodingValidationMessage}
								doSample={doSample}
								forceFullSequences={forceFullSequences}
								noRepeatNgramSize={noRepeatNgramSize}
								repetitionPenalty={repetitionPenalty}
								setChunkLengthInSeconds={setChunkLengthInSeconds}
								setDoSample={setDoSample}
								setForceFullSequences={setForceFullSequences}
								setNoRepeatNgramSize={setNoRepeatNgramSize}
								setRepetitionPenalty={setRepetitionPenalty}
								setStrideLengthInSeconds={setStrideLengthInSeconds}
								setTemperature={setTemperature}
								setTopK={setTopK}
								strideLengthInSeconds={strideLengthInSeconds}
								temperature={temperature}
								topK={topK}
								validationMessage={chunkValidationMessage}
							/>
						</div>
					) : (
						<Models
							selectedModel={selectedModel}
							setSelectedModel={setSelectedModel}
						/>
					)}
				</div>
			</div>
		</DismissableModal>
	);
};
