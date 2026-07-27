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

const assetFieldRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	minWidth: 0,
};

const sourceDisplayContainer: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const penIcon: React.CSSProperties = {
	display: 'block',
	height: 14,
	width: 14,
};

type AssetSelectionContextValue = {
	readonly initialQuery: string;
	readonly sourceDisplay: React.ReactNode;
};

export const AssetSelectionContext = createContext<AssetSelectionContextValue>({
	initialQuery: '',
	sourceDisplay: null,
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
	const {initialQuery, sourceDisplay} = useContext(AssetSelectionContext);
	const inlineSourceDisplay = field.key === 'src' ? sourceDisplay : null;

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

	if (inlineSourceDisplay === null) {
		return action;
	}

	return (
		<div style={assetFieldRow}>
			<div style={sourceDisplayContainer}>{inlineSourceDisplay}</div>
			{action}
		</div>
	);
};
