import {formatBytes} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
	BLUE,
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	WHITE,
} from '../helpers/colors';
import {CheckCircleFilled} from '../icons/check-circle-filled';
import {CloudDownloadIcon} from '../icons/cloud-download';
import {TrashIcon} from '../icons/trash';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {optionsPanel} from './RenderModal/render-modals';
import {Spinner} from './Spinner';

const modelPanel: React.CSSProperties = {
	...optionsPanel,
	flexDirection: 'column',
};
const hiddenPanel: React.CSSProperties = {display: 'none'};
const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	fontFamily: 'sans-serif',
	minWidth: 0,
	padding: '16px 16px 0',
};
const flushContainer: React.CSSProperties = {
	...container,
	padding: '16px 0 0',
};
const descriptionStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
};
const list: React.CSSProperties = {marginTop: 14};
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
const actionIcon: React.CSSProperties = {height: 14, width: 14};

type ModelInfo<Model extends string> = {
	readonly name: Model;
	readonly webGpuDownloadSize: number;
};

type ModelActionState<Model extends string> =
	| {type: 'idle'}
	| {type: 'downloading'; model: Model; progress: number | null}
	| {type: 'removing'; model: Model}
	| {type: 'error'; model: Model; message: string};

export const ModelManager = <Model extends string>({
	ariaLabel,
	availableModels,
	description,
	indent,
	isModelCached,
	loadModel,
	prepare,
	removeModel,
	visible,
}: {
	readonly ariaLabel: string;
	readonly availableModels: readonly ModelInfo<Model>[];
	readonly description: string;
	readonly indent: boolean;
	readonly isModelCached: (model: Model) => Promise<boolean>;
	readonly loadModel: (
		model: Model,
		onProgress: (progress: number | null) => void,
	) => Promise<unknown>;
	readonly prepare: (() => Promise<void>) | null;
	readonly removeModel: (model: Model) => Promise<void>;
	readonly visible: boolean;
}) => {
	const mounted = useRef(true);
	const initialized = useRef(false);
	const [cachedModels, setCachedModels] = useState<ReadonlySet<Model> | null>(
		null,
	);
	const [actionState, setActionState] = useState<ModelActionState<Model>>({
		type: 'idle',
	});
	const [cacheCheckError, setCacheCheckError] = useState<string | null>(null);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (!visible || initialized.current) {
			return;
		}

		initialized.current = true;
		Promise.resolve()
			.then(() => prepare?.())
			.then(() =>
				Promise.all(
					availableModels.map(async ({name}) =>
						(await isModelCached(name)) ? name : null,
					),
				),
			)
			.then((models) => {
				if (mounted.current) {
					const cached = new Set<Model>();
					for (const model of models) {
						if (model !== null) {
							cached.add(model as Model);
						}
					}

					setCachedModels(cached);
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
	}, [availableModels, isModelCached, prepare, visible]);

	const downloadModel = useCallback(
		(model: Model) => {
			setActionState({type: 'downloading', model, progress: 0});
			loadModel(model, (progress) => {
				if (mounted.current) {
					setActionState({type: 'downloading', model, progress});
				}
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
		},
		[loadModel],
	);

	const remove = useCallback(
		(model: Model) => {
			setActionState({type: 'removing', model});
			removeModel(model)
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
		},
		[removeModel],
	);

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
			<div style={indent ? container : flushContainer}>
				<p style={descriptionStyle}>{description}</p>
				{cacheCheckError ? (
					<ValidationMessage
						align="flex-start"
						message={cacheCheckError}
						type="error"
					/>
				) : null}
				<div style={list} role="list" aria-label={ariaLabel}>
					{availableModels.map((model, index) => {
						const cached = cachedModels?.has(model.name) ?? false;
						const processingThisModel =
							actionState.type !== 'idle' &&
							actionState.type !== 'error' &&
							actionState.model === model.name;
						const progress =
							actionState.type === 'downloading' &&
							actionState.model === model.name
								? actionState.progress
								: null;
						const modelStatus = processingThisModel
							? actionState.type === 'removing'
								? 'Removing…'
								: `Downloading${progress === null ? '…' : ` ${Math.round(progress * 100)}%`}`
							: actionState.type === 'error' && actionState.model === model.name
								? actionState.message
								: formatBytes(model.webGpuDownloadSize);

						return (
							<div
								key={model.name}
								role="listitem"
								style={
									index === availableModels.length - 1 ? lastModelRow : modelRow
								}
							>
								<span style={modelName}>{model.name}</span>
								<span style={status} title={modelStatus}>
									{modelStatus}
								</span>
								{cached ? (
									<CheckCircleFilled
										aria-hidden
										style={{...statusIcon, fill: BLUE}}
									/>
								) : null}
								{processingThisModel ? (
									<Spinner duration={0.5} size={14} />
								) : cached ? (
									<InlineAction
										disabled={actionInProgress}
										onClick={() => remove(model.name)}
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
