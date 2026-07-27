import React, {createContext, useCallback, useContext} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {PenIcon} from '../../icons/pen';
import {ModalsContext} from '../../state/modals';
import {InlineAction} from '../InlineAction';
import {
	InspectorInlineAction,
	type InspectorInlineActionProps,
} from '../InspectorPanel/common';

const penIcon: React.CSSProperties = {
	display: 'block',
	height: 14,
	width: 14,
};

type AssetSelectionContextValue = {
	readonly initialQuery: string;
	readonly sourceAction: Omit<InspectorInlineActionProps, 'variant'> | null;
};

export const AssetSelectionContext = createContext<AssetSelectionContextValue>({
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
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	if (field.fieldSchema.type !== 'asset') {
		throw new Error('TimelineAssetField rendered for non-asset field');
	}

	const {setSelectedModal} = useContext(ModalsContext);
	const {initialQuery, sourceAction} = useContext(AssetSelectionContext);
	const inlineSourceAction = field.key === 'src' ? sourceAction : null;

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

	const openAssetSelection = useCallback(() => {
		setSelectedModal({
			type: 'quick-switcher',
			mode: 'assets',
			invocationTimestamp: Date.now(),
			assetSelection: {
				initialQuery,
				onSelected: (asset) => onSelect(asset.name, asset.src),
			},
		});
	}, [initialQuery, onSelect, setSelectedModal]);

	const action = (
		<InlineAction
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
