import React, {createContext, useCallback, useContext, useMemo} from 'react';
import {staticFile, type CanUpdateSequencePropStatusStatic} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {writeStaticFile} from '../../api/write-static-file';
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
	InspectorInlineAction,
	type InspectorInlineActionProps,
} from '../InspectorPanel/common';
import {showNotification} from '../Notifications/NotificationCenter';
import {useStaticFiles} from '../use-static-files';

const penIcon: React.CSSProperties = {
	display: 'block',
	height: 14,
	width: 14,
};

export type InspectorSourceAction = Omit<InspectorInlineActionProps, 'variant'>;

type AssetSelectionContextValue = {
	readonly initialQuery: string;
	readonly getSourceAction: (src: string) => InspectorSourceAction | null;
	readonly sourceAction: InspectorSourceAction | null;
};

export const AssetSelectionContext = createContext<AssetSelectionContextValue>({
	getSourceAction: () => null,
	initialQuery: '',
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
	const {getSourceAction, initialQuery, sourceAction} = useContext(
		AssetSelectionContext,
	);
	const inlineSourceAction = useMemo(() => {
		if (field.key !== 'src') {
			return null;
		}

		return typeof effectiveValue === 'string'
			? getSourceAction(effectiveValue)
			: sourceAction;
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

	const selectFile = useCallback(async () => {
		const [file] = await pickFilesToImport({multiple: false});
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
	}, [onSelect, staticFiles]);

	const openAssetSelection = useCallback(() => {
		setSelectedModal({
			type: 'quick-switcher',
			mode: 'assets',
			invocationTimestamp: Date.now(),
			assetSelection: {
				initialQuery,
				onSelectFile: () => {
					selectFile().catch(() => undefined);
				},
				onSelected: (asset) => onSelect(asset.name, asset.src),
			},
			compositionSelection: null,
		});
	}, [initialQuery, onSelect, selectFile, setSelectedModal]);

	const action = (
		<InlineAction
			variant={null}
			onClick={openAssetSelection}
			disabled={window.remotion_isReadOnlyStudio}
			title="Change source"
			renderAction={(color) => <PenIcon color={color} style={penIcon} />}
		/>
	);

	if (inlineSourceAction === null) {
		return action;
	}

	return (
		<InspectorInlineAction
			{...inlineSourceAction}
			size="compact"
			variant={{
				type: 'segmented',
				trailing: {
					disabled: window.remotion_isReadOnlyStudio,
					onClick: openAssetSelection,
					renderIcon: (color) => <PenIcon color={color} style={penIcon} />,
					title: 'Change source',
				},
			}}
		/>
	);
};
