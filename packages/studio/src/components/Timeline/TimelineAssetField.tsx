import React, {createContext, useCallback, useContext} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';

const buttonStyle: React.CSSProperties = {
	marginLeft: 8,
};

export const AssetSelectionInitialQueryContext = createContext('');

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
	const initialQuery = useContext(AssetSelectionInitialQueryContext);

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

	return (
		<Button
			onClick={openAssetSelection}
			disabled={window.remotion_isReadOnlyStudio}
			size="condensed"
			style={buttonStyle}
			title="Change source"
		>
			Change
		</Button>
	);
};
