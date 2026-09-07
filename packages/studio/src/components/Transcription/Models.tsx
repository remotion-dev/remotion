import {formatBytes} from '@remotion/studio-shared';
import {
	clearStaleModels,
	getAvailableModels,
	isWhisperModelCached,
	loadWhisperModel,
	removeWhisperModel,
	type WhisperWebGpuModel,
	type WhisperWebGpuModelLoadProgress,
} from '@remotion/whisper-webgpu';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
	BLUE,
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	WHITE,
} from '../../helpers/colors';
import {CheckCircleFilled} from '../../icons/check-circle-filled';
import {CloudDownloadIcon} from '../../icons/cloud-download';
import {Minus} from '../../icons/minus';
import {TrashIcon} from '../../icons/trash';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {optionsPanel} from '../RenderModal/render-modals';
import {Spinner} from '../Spinner';

const AVAILABLE_MODELS = getAvailableModels();

const modelPanel: React.CSSProperties = {
	...optionsPanel,
	flexDirection: 'column',
};

const hiddenPanel: React.CSSProperties = {
	display: 'none',
};

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	fontFamily: 'sans-serif',
	minWidth: 0,
	padding: '16px 16px 0',
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
};

const list: React.CSSProperties = {
	marginTop: 14,
};

const modelRow: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: BORDER_WHITE_ALPHA_12,
	display: 'flex',
	gap: 10,
	minHeight: 38,
	padding: '0 10px',
};

const lastModelRow: React.CSSProperties = {
	...modelRow,
	borderBottom: 'none',
};

const statusIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 14,
	width: 14,
};

const modelName: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.4,
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const status: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1.4,
	whiteSpace: 'nowrap',
};

const actionIcon: React.CSSProperties = {
	height: 14,
	width: 14,
};

type ModelActionState =
	| {type: 'idle'}
	| {
			type: 'downloading';
			model: WhisperWebGpuModel;
			progress: WhisperWebGpuModelLoadProgress;
	  }
	| {type: 'removing'; model: WhisperWebGpuModel}
	| {type: 'error'; model: WhisperWebGpuModel; message: string};

export const Models: React.FC<{readonly visible: boolean}> = ({visible}) => {
	const mounted = useRef(true);
	const initialized = useRef(false);
	const [cachedModels, setCachedModels] =
		useState<ReadonlySet<WhisperWebGpuModel> | null>(null);
	const [actionState, setActionState] = useState<ModelActionState>({
		type: 'idle',
	});
	const [cacheCheckError, setCacheCheckError] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (!visible || initialized.current) {
			return;
		}

		initialized.current = true;
		clearStaleModels()
			.then(() => {
				return Promise.all(
					AVAILABLE_MODELS.map(async ({name}) => {
						return (await isWhisperModelCached({model: name})) ? name : null;
					}),
				);
			})
			.then((models) => {
				if (mounted.current) {
					setCachedModels(
						new Set(
							models.filter(
								(model): model is WhisperWebGpuModel => model !== null,
							),
						),
					);
				}
			})
			.catch((error) => {
				if (mounted.current) {
					setCachedModels(new Set());
					setCacheCheckError(
						error instanceof Error ? error.message : String(error),
					);
				}
			});
	}, [visible]);

	const downloadModel = useCallback((model: WhisperWebGpuModel) => {
		setActionState({
			type: 'downloading',
			model,
			progress: {
				file: null,
				loadedBytes: 0,
				progress: 0,
				status: 'loading',
				totalBytes:
					AVAILABLE_MODELS.find(({name}) => name === model)
						?.webGpuDownloadSize ?? null,
			},
		});
		loadWhisperModel({
			model,
			onProgress: (progress) => {
				if (mounted.current) {
					setActionState({type: 'downloading', model, progress});
				}
			},
		})
			.then(() => {
				if (mounted.current) {
					setCachedModels((current) => new Set([...(current ?? []), model]));
					setActionState({type: 'idle'});
				}
			})
			.catch((error) => {
				if (mounted.current) {
					setActionState({
						type: 'error',
						model,
						message: error instanceof Error ? error.message : String(error),
					});
				}
			});
	}, []);

	const removeModel = useCallback((model: WhisperWebGpuModel) => {
		setActionState({type: 'removing', model});
		removeWhisperModel({model})
			.then(() => {
				if (mounted.current) {
					setCachedModels((current) => {
						const next = new Set(current ?? []);
						next.delete(model);
						return next;
					});
					setActionState({type: 'idle'});
				}
			})
			.catch((error) => {
				if (mounted.current) {
					setActionState({
						type: 'error',
						model,
						message: error instanceof Error ? error.message : String(error),
					});
				}
			});
	}, []);

	const renderDownloadIcon: RenderInlineAction = useCallback((color) => {
		return <CloudDownloadIcon color={color} style={actionIcon} />;
	}, []);
	const renderRemoveIcon: RenderInlineAction = useCallback((color) => {
		return <TrashIcon color={color} style={actionIcon} />;
	}, []);
	const actionInProgress =
		actionState.type === 'downloading' || actionState.type === 'removing';

	return (
		<div
			style={visible ? modelPanel : hiddenPanel}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
		>
			<div style={container}>
				<p style={description}>
					Models are downloaded automatically when a transcription starts. You
					can also manage the browser cache here.
				</p>
				{cacheCheckError ? (
					<ValidationMessage
						align="flex-start"
						message={cacheCheckError}
						type="error"
					/>
				) : null}
				<div style={list} role="list" aria-label="Whisper models">
					{AVAILABLE_MODELS.map((model, index) => {
						const cached = cachedModels?.has(model.name) ?? false;
						const processingThisModel =
							actionState.type !== 'idle' &&
							actionState.type !== 'error' &&
							actionState.model === model.name;
						const progress =
							actionState.type === 'downloading' &&
							actionState.model === model.name
								? actionState.progress.progress
								: null;
						const modelStatus = processingThisModel
							? actionState.type === 'removing'
								? 'Removing…'
								: `Downloading${progress === null ? '…' : ` ${Math.round(progress * 100)}%`}`
							: actionState.type === 'error' && actionState.model === model.name
								? actionState.message
								: cached
									? `${formatBytes(model.webGpuDownloadSize)} · Downloaded`
									: formatBytes(model.webGpuDownloadSize);

						return (
							<div
								key={model.name}
								role="listitem"
								style={
									index === AVAILABLE_MODELS.length - 1
										? lastModelRow
										: modelRow
								}
							>
								{cached ? (
									<CheckCircleFilled
										aria-hidden
										style={{...statusIcon, fill: BLUE}}
									/>
								) : (
									<Minus aria-hidden color={LIGHT_TEXT} style={statusIcon} />
								)}
								<span style={modelName}>{model.name}</span>
								<span style={status} title={modelStatus}>
									{modelStatus}
								</span>
								{processingThisModel ? (
									<Spinner duration={0.5} size={14} />
								) : cached ? (
									<InlineAction
										disabled={actionInProgress}
										onClick={() => removeModel(model.name)}
										renderAction={renderRemoveIcon}
										title={`Remove ${model.name}`}
										variant={null}
									/>
								) : (
									<InlineAction
										disabled={cachedModels === null || actionInProgress}
										onClick={() => downloadModel(model.name)}
										renderAction={renderDownloadIcon}
										title={`Download ${model.name}`}
										variant={null}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
