import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {staticFile, type CanUpdateSequencePropStatusStatic} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {writeStaticFile} from '../../api/write-static-file';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../../helpers/hoverable';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {PenIcon} from '../../icons/pen';
import {SetSelectedModalContext} from '../../state/modals';
import {pickFilesToImport} from '../import-assets';
import {InlineAction} from '../InlineAction';
import {
	InspectorQuickAction,
	type InspectorQuickActionProps,
} from '../InspectorPanel/common';
import {showNotification} from '../Notifications/NotificationCenter';
import {useStaticFiles} from '../use-static-files';
import {getTimelineAssetLinkInfo} from './timeline-asset-link';

const penIcon: React.CSSProperties = {
	display: 'block',
	height: 14,
	width: 14,
};

const sourceActions: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	gap: 4,
	margin: '0 4px',
	minWidth: 0,
};

const standaloneSourceActionStyle: React.CSSProperties = {
	flex: 1,
	margin: 0,
	minWidth: 0,
	width: 'auto',
};

const assetTypeToAccept = {
	audio: 'audio/*',
	video: 'video/*',
	image: 'image/*',
} as const;

const imageAssetField: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	gap: 8,
	minWidth: 0,
	padding: '4px 12px',
};

const thumbnailButton: React.CSSProperties = {
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	appearance: 'none',
	border: 'none',
	cursor: 'default',
	flexShrink: 0,
	height: 40,
	margin: 0,
	padding: 0,
	width: 40,
};

const thumbnail: React.CSSProperties = {
	display: 'block',
	height: '100%',
	objectFit: 'contain',
	width: '100%',
};

const imageAssetInfo: React.CSSProperties = {
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	appearance: 'none',
	border: 'none',
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	gap: 2,
	margin: 0,
	minWidth: 0,
	padding: 0,
	textAlign: 'left',
};

const imageAssetName: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '16px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const imageAssetSource: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 11,
	lineHeight: '14px',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export type InspectorSourceAction = InspectorQuickActionProps;

type AssetSelectionContextValue = {
	readonly getSourceAction: (src: string) => InspectorSourceAction | null;
	readonly sourceAction: InspectorSourceAction | null;
};

export const AssetSelectionContext = createContext<AssetSelectionContextValue>({
	getSourceAction: () => null,
	sourceAction: null,
});

export const toFileToken = (name: string) => {
	return `${NoReactInternals.FILE_TOKEN}${name
		.split('/')
		.map(encodeURIComponent)
		.join('/')}`;
};

type TimelineAssetFieldProps = {
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
};

export const TimelineAssetField: React.FC<TimelineAssetFieldProps> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	if (field.fieldSchema.type !== 'asset') {
		throw new Error('TimelineAssetField rendered for non-asset field');
	}

	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const staticFiles = useStaticFiles();
	const {getSourceAction, sourceAction} = useContext(AssetSelectionContext);
	const {assetType} = field.fieldSchema;
	const initialQuery = assetType ? `type:${assetType} ` : '';
	const inlineSourceAction = useMemo(() => {
		if (typeof effectiveValue === 'string') {
			return getSourceAction(effectiveValue);
		}

		return field.key === 'src' ? sourceAction : null;
	}, [effectiveValue, field.key, getSourceAction, sourceAction]);

	const onSelect = useCallback(
		(assetName: string, previewValue: string) => {
			const sourceValue = toFileToken(assetName);
			if (sourceValue === propStatus.codeValue) {
				return;
			}

			onDragValueChange(previewValue);
			onSave(sourceValue).finally(() => {
				onDragEnd();
			});
		},
		[propStatus.codeValue, onDragValueChange, onSave, onDragEnd],
	);

	const onSelectUrl = useCallback(
		(url: string) => {
			if (url === propStatus.codeValue) {
				return;
			}

			onDragValueChange(url);
			onSave(url).finally(() => {
				onDragEnd();
			});
		},
		[propStatus.codeValue, onDragValueChange, onDragEnd, onSave],
	);

	const selectFile = useCallback(async () => {
		const [file] = await pickFilesToImport({
			multiple: false,
			accept: assetType ? assetTypeToAccept[assetType] : null,
		});
		if (!file) {
			return;
		}

		const existing = staticFiles.find(
			(candidate) => candidate.name === file.name,
		);
		if (existing && existing.sizeInBytes !== file.size) {
			showNotification(
				`File with name ${file.name} already exists and is different`,
				4000,
			);
			return;
		}

		try {
			if (!existing) {
				await writeStaticFile({
					contents: await file.arrayBuffer(),
					filePath: file.name,
				});
			}

			onSelect(file.name, staticFile(file.name));
			if (!existing) {
				showNotification(`Created ${file.name} in public folder`, 3000);
			}
		} catch (error) {
			showNotification(
				`Could not upload asset: ${
					error instanceof Error ? error.message : String(error)
				}`,
				4000,
			);
		}
	}, [assetType, onSelect, staticFiles]);

	const openAssetSelection = useCallback(() => {
		const assetSelection = {
			initialQuery,
			onSelectFile: () => {
				selectFile().catch(() => undefined);
			},
			onSelected: (asset: {name: string; src: string}) =>
				onSelect(asset.name, asset.src),
		};

		if (assetType !== undefined) {
			const linkInfo =
				typeof effectiveValue === 'string'
					? getTimelineAssetLinkInfo(effectiveValue)
					: null;
			setSelectedModal({
				type: 'asset-selection',
				assetType,
				initialUrl: linkInfo?.kind === 'remote' ? linkInfo.href : null,
				invocationTimestamp: Date.now(),
				assetSelection,
				onSelectedUrl: onSelectUrl,
			});
			return;
		}

		setSelectedModal({
			type: 'quick-switcher',
			mode: 'assets',
			invocationTimestamp: Date.now(),
			assetSelection,
			compositionSelection: null,
		});
	}, [
		assetType,
		effectiveValue,
		initialQuery,
		onSelect,
		onSelectUrl,
		selectFile,
		setSelectedModal,
	]);

	const action = (
		<InlineAction
			variant={null}
			onClick={openAssetSelection}
			disabled={window.remotion_isReadOnlyStudio}
			title="Change source"
			renderAction={(color) => <PenIcon color={color} style={penIcon} />}
		/>
	);

	if (assetType === 'image' && typeof effectiveValue === 'string') {
		const linkInfo = getTimelineAssetLinkInfo(effectiveValue);
		if (linkInfo !== null) {
			let name: string;
			let source: string | null;
			let previewSrc: string;
			if (linkInfo.kind === 'local') {
				name = linkInfo.assetPath.split('/').pop() ?? linkInfo.assetPath;
				source = null;
				previewSrc = staticFile(linkInfo.assetPath);
			} else {
				previewSrc = linkInfo.href.startsWith('//')
					? `https:${linkInfo.href}`
					: linkInfo.href;
				try {
					const url = new URL(previewSrc);
					const encodedName = url.pathname.split('/').filter(Boolean).pop();
					name = encodedName ? decodeURIComponent(encodedName) : url.hostname;
					source = url.hostname;
				} catch {
					name = 'Remote image';
					source = linkInfo.href;
				}
			}

			const title = inlineSourceAction?.title ?? linkInfo.title;

			return (
				<div style={imageAssetField}>
					<button
						aria-label={`Replace ${name}`}
						className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
						disabled={window.remotion_isReadOnlyStudio}
						onClick={openAssetSelection}
						style={thumbnailButton}
						title={title}
						type="button"
					>
						<img alt="" draggable={false} src={previewSrc} style={thumbnail} />
					</button>
					<button
						aria-label={`Replace ${name}`}
						className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
						disabled={window.remotion_isReadOnlyStudio}
						onClick={openAssetSelection}
						style={imageAssetInfo}
						title={title}
						type="button"
					>
						<span style={imageAssetName}>{name}</span>
						{source === null ? null : (
							<span style={imageAssetSource}>{source}</span>
						)}
					</button>
					{action}
				</div>
			);
		}
	}

	if (inlineSourceAction === null) {
		return action;
	}

	return (
		<div style={sourceActions}>
			<InspectorQuickAction
				{...inlineSourceAction}
				disabled={
					assetType === undefined
						? inlineSourceAction.disabled
						: window.remotion_isReadOnlyStudio
				}
				onClick={
					assetType === undefined
						? inlineSourceAction.onClick
						: openAssetSelection
				}
				size="compact"
				style={standaloneSourceActionStyle}
			/>
			{action}
		</div>
	);
};
