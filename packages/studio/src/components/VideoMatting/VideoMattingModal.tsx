import {formatBytes} from '@remotion/studio-shared';
import {
	canUseVideoMatting,
	getAvailableModels,
	isVideoMattingModelCached,
	type VideoLayerAudio,
	type VideoMattingBitrate,
	type VideoMattingModel,
} from '@remotion/video-matting';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {BLUE_DISABLED} from '../../helpers/colors';
import {Checkmark} from '../../icons/Checkmark';
import {ModelsIcon} from '../../icons/models';
import {SeparationIcon} from '../../icons/separation';
import type {VideoMattingModalState} from '../../state/modals';
import {SetSelectedModalContext} from '../../state/modals';
import {SidebarContext} from '../../state/sidebar';
import {Button} from '../Button';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalHeader} from '../ModalHeader';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {optionsSidebarTabs} from '../options-sidebar-tabs';
import {persistSelectedOptionsSidebarPanel} from '../OptionsPanel';
import {
	getDefaultOutputBaseName,
	validatePublicOutputName,
} from '../public-output-name';
import {input, label, optionRow, rightRow} from '../RenderModal/layout';
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
import {RenderModalOutputName} from '../RenderModal/RenderModalOutputName';
import {RenderQueueContext} from '../RenderQueue/context';
import {VerticalTab} from '../Tabs/vertical';
import {useModelCacheStatus} from '../use-model-cache-status';
import {useStaticFiles} from '../use-static-files';
import {Models} from './Models';

const MODELS = getAvailableModels();
const controlStyle: React.CSSProperties = {width: 330, maxWidth: '100%'};
const panelStyle: React.CSSProperties = {
	...optionsPanel,
	flexDirection: 'column',
	paddingTop: 16,
};
const modalStyle: React.CSSProperties = {
	...outerModalStyle,
	height: 'auto',
	maxHeight: 'calc(100vh - 40px)',
	minHeight: outerModalStyle.height,
	outline: 'none',
};
const modalLayout: React.CSSProperties = {
	...horizontalLayout,
	flex: '1 1 auto',
};
const hiddenPanel: React.CSSProperties = {display: 'none'};
const validationStyle: React.CSSProperties = {padding: '0 16px 8px'};
const outputInputContainerStyle: React.CSSProperties = {maxWidth: 330};

type SupportState =
	| {type: 'checking'}
	| {type: 'supported'}
	| {type: 'unsupported'; message: string};

type Tab = 'separate' | 'models';

const makeOptions = <Value extends string>({
	items,
	selected,
	setSelected,
}: {
	items: readonly {id: Value; label: React.ReactNode}[];
	selected: Value;
	setSelected: (value: Value) => void;
}): ComboboxValue[] =>
	items.map(({id, label: optionLabel}) => ({
		type: 'item',
		id,
		value: id,
		label: optionLabel,
		leftItem: id === selected ? <Checkmark /> : null,
		keyHint: null,
		quickSwitcherLabel: null,
		subMenu: null,
		disabled: false,
		onClick: () => setSelected(id),
	}));

export const VideoMattingModal: React.FC<VideoMattingModalState> = ({
	displayName,
	src,
}) => {
	const [tab, setTab] = useState<Tab>('separate');
	const isModelCached = useCallback(
		(selectedModel: VideoMattingModel) =>
			isVideoMattingModelCached({model: selectedModel}),
		[],
	);
	const cachedModels = useModelCacheStatus({
		isModelCached,
		models: MODELS,
		refreshKey: tab,
	});
	const baseName = useMemo(
		() => getDefaultOutputBaseName(src, displayName, 'video'),
		[displayName, src],
	);
	const [baseOutName, setBaseOutName] = useState(`${baseName}-base.webm`);
	const [foregroundOutName, setForegroundOutName] = useState(
		`${baseName}-foreground.webm`,
	);
	const [model, setModel] = useState<VideoMattingModel>('ben2-base');
	const [audio, setAudio] = useState<VideoLayerAudio>('base');
	const [videoBitrate, setVideoBitrate] =
		useState<VideoMattingBitrate>('very-high');
	const [support, setSupport] = useState<SupportState>({type: 'checking'});
	const staticFiles = useStaticFiles();
	const {addVideoMattingJob, videoMattingJobs} = useContext(RenderQueueContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {setSidebarCollapsedState} = useContext(SidebarContext);

	useEffect(() => {
		let cancelled = false;
		setSupport({type: 'checking'});
		canUseVideoMatting({model}).then((result) => {
			if (!cancelled) {
				setSupport(
					result.supported
						? {type: 'supported'}
						: {type: 'unsupported', message: result.detailedReason},
				);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [model]);

	const normalizedBase = baseOutName.normalize('NFC').toLowerCase();
	const normalizedForeground = foregroundOutName.normalize('NFC').toLowerCase();
	const duplicateOutput = normalizedBase === normalizedForeground;
	const queuedOutputs = new Set(
		videoMattingJobs
			.filter((job) => job.status === 'idle' || job.status === 'running')
			.flatMap((job) => [job.baseOutName, job.foregroundOutName])
			.map((name) => name.normalize('NFC').toLowerCase()),
	);
	const baseError =
		validatePublicOutputName({extension: '.webm', outName: baseOutName}) ??
		(duplicateOutput
			? 'Base and foreground outputs must be different'
			: queuedOutputs.has(normalizedBase)
				? 'Another video matting job is using this output file'
				: null);
	const foregroundError =
		validatePublicOutputName({
			extension: '.webm',
			outName: foregroundOutName,
		}) ??
		(duplicateOutput
			? 'Base and foreground outputs must be different'
			: queuedOutputs.has(normalizedForeground)
				? 'Another video matting job is using this output file'
				: null);
	const baseExists = staticFiles.some(
		(file) => file.name.normalize('NFC').toLowerCase() === normalizedBase,
	);
	const foregroundExists = staticFiles.some(
		(file) => file.name.normalize('NFC').toLowerCase() === normalizedForeground,
	);
	const canSubmit =
		support.type === 'supported' &&
		baseError === null &&
		foregroundError === null;

	const modelOptions = useMemo(
		() =>
			makeOptions({
				items: MODELS.map((item) => ({
					id: item.name,
					label: `${item.name} · ${formatBytes(item.webGpuDownloadSize)}${cachedModels.has(item.name) ? ' · Downloaded' : ''}`,
				})),
				selected: model,
				setSelected: setModel,
			}),
		[cachedModels, model],
	);
	const audioOptions = useMemo(
		() =>
			makeOptions({
				items: [
					{id: 'base' as const, label: 'Background layer'},
					{id: 'foreground' as const, label: 'Foreground layer'},
					{id: 'both' as const, label: 'Both layers'},
					{id: 'none' as const, label: 'No audio'},
				],
				selected: audio,
				setSelected: setAudio,
			}),
		[audio],
	);
	const qualityOptions = useMemo(
		() =>
			makeOptions({
				items: ['very-low', 'low', 'medium', 'high', 'very-high'].map((id) => ({
					id: id as VideoMattingBitrate & string,
					label: id
						.split('-')
						.map((part) => part[0]!.toUpperCase() + part.slice(1))
						.join(' '),
				})),
				selected: videoBitrate as VideoMattingBitrate & string,
				setSelected: setVideoBitrate,
			}),
		[videoBitrate],
	);

	const submit = useCallback(() => {
		if (!canSubmit) return;
		addVideoMattingJob({
			src,
			displayName,
			baseOutName,
			foregroundOutName,
			model,
			audio,
			videoBitrate,
		});
		setSidebarCollapsedState({left: null, right: 'expanded'});
		persistSelectedOptionsSidebarPanel('renders');
		optionsSidebarTabs.current?.selectRendersPanel();
		setSelectedModal(null);
	}, [
		addVideoMattingJob,
		audio,
		baseOutName,
		canSubmit,
		displayName,
		foregroundOutName,
		model,
		setSelectedModal,
		setSidebarCollapsedState,
		src,
		videoBitrate,
	]);

	return (
		<DismissableModal ariaLabel={`Track matting ${displayName}`}>
			<div style={modalStyle}>
				<ModalHeader title={`Track matting ${displayName}`} />
				<div style={container}>
					<div style={flexer} />
					<Button
						disabled={!canSubmit}
						onClick={submit}
						title={support.type === 'unsupported' ? support.message : undefined}
						style={{
							...buttonStyle,
							backgroundColor: canSubmit
								? buttonStyle.backgroundColor
								: BLUE_DISABLED,
						}}
					>
						Separate
					</Button>
				</div>
				<div style={modalLayout}>
					<div style={leftSidebar}>
						<VerticalTab
							autoFocus
							onClick={() => setTab('separate')}
							renderIcon={(color) => (
								<div style={iconContainer}>
									<SeparationIcon color={color} style={icon} />
								</div>
							)}
							selected={tab === 'separate'}
							style={horizontalTab}
						>
							Separate
						</VerticalTab>
						<VerticalTab
							onClick={() => setTab('models')}
							renderIcon={(color) => (
								<div style={iconContainer}>
									<ModelsIcon color={color} style={icon} />
								</div>
							)}
							selected={tab === 'models'}
							style={horizontalTab}
						>
							Models
						</VerticalTab>
					</div>
					<div
						style={tab === 'separate' ? panelStyle : hiddenPanel}
						className={VERTICAL_SCROLLBAR_CLASSNAME}
					>
						<RenderModalOutputName
							ariaLabel="Base video output file"
							existingOutputPath={
								window.remotion_publicFolderExists
									? `${window.remotion_publicFolderExists}/${baseOutName}`
									: null
							}
							existence={baseExists}
							inputContainerStyle={outputInputContainerStyle}
							inputStyle={{...input, ...controlStyle}}
							label="Base output in public/"
							onValueChange={(event) => setBaseOutName(event.target.value)}
							outName={baseOutName}
							validationMessage={baseError}
						/>
						<RenderModalOutputName
							ariaLabel="Foreground video output file"
							existingOutputPath={
								window.remotion_publicFolderExists
									? `${window.remotion_publicFolderExists}/${foregroundOutName}`
									: null
							}
							existence={foregroundExists}
							inputContainerStyle={outputInputContainerStyle}
							inputStyle={{...input, ...controlStyle}}
							label="Foreground output in public/"
							onValueChange={(event) =>
								setForegroundOutName(event.target.value)
							}
							outName={foregroundOutName}
							validationMessage={foregroundError}
						/>
						<RenderModalHr />
						<div style={optionRow}>
							<div style={label}>Model</div>
							<div style={rightRow}>
								<Combobox
									values={modelOptions}
									selectedId={model}
									title="Model"
									disabled={false}
									style={controlStyle}
								/>
							</div>
						</div>
						{support.type === 'unsupported' ? (
							<div style={validationStyle}>
								<ValidationMessage
									align="flex-end"
									message={support.message}
									type="error"
								/>
							</div>
						) : null}
						<div style={optionRow}>
							<div style={label}>Audio</div>
							<div style={rightRow}>
								<Combobox
									values={audioOptions}
									selectedId={audio}
									title="Audio"
									disabled={false}
									style={controlStyle}
								/>
							</div>
						</div>
						<div style={optionRow}>
							<div style={label}>Video quality</div>
							<div style={rightRow}>
								<Combobox
									values={qualityOptions}
									selectedId={String(videoBitrate)}
									title="Video quality"
									disabled={false}
									style={controlStyle}
								/>
							</div>
						</div>
					</div>
					<Models
						description={
							'Models are downloaded automatically when needed.\nYou can also manage the browser cache here.'
						}
						indent
						visible={tab === 'models'}
					/>
				</div>
			</div>
		</DismissableModal>
	);
};
