import React, {useCallback, useMemo} from 'react';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {writeStaticFile} from '../../api/write-static-file';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {Checkmark} from '../../icons/Checkmark';
import {pickFilesToImport} from '../import-assets';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {Combobox} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {useStaticFiles} from '../use-static-files';

const comboboxStyle: React.CSSProperties = {
	marginLeft: 8,
	maxWidth: 180,
};

const toFileToken = (name: string) => {
	return `${NoReactInternals.FILE_TOKEN}${name
		.split('/')
		.map(encodeURIComponent)
		.join('/')}`;
};

const toStaticFileUrl = (fileToken: string) => {
	return `${window.remotion_staticBase}/${fileToken.slice(
		NoReactInternals.FILE_TOKEN.length,
	)}`;
};

export const TimelineAssetField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	if (field.fieldSchema.type !== 'asset') {
		throw new Error('TimelineAssetField rendered for non-asset field');
	}

	const staticFiles = useStaticFiles();
	const current = String(effectiveValue ?? '');
	const isCurrentStaticFile = current.startsWith(NoReactInternals.FILE_TOKEN);

	const onSelect = useCallback(
		(sourceValue: string, previewValue: string) => {
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

	const upload = useCallback(async () => {
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

			const fileToken = toFileToken(file.name);
			onSelect(fileToken, toStaticFileUrl(fileToken));
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

	const items = useMemo<ComboboxValue[]>(() => {
		const publicFileItems = staticFiles.map((file): ComboboxValue => {
			const fileToken = toFileToken(file.name);
			return {
				type: 'item',
				id: fileToken,
				value: fileToken,
				label: file.name,
				onClick: () => onSelect(fileToken, file.src),
				keyHint: null,
				leftItem: fileToken === current ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			};
		});
		const currentRemoteItem: ComboboxValue[] = isCurrentStaticFile
			? []
			: [
					{
						type: 'item',
						id: current,
						value: current,
						label: current,
						onClick: () => undefined,
						keyHint: null,
						leftItem: <Checkmark />,
						subMenu: null,
						quickSwitcherLabel: null,
					},
				];

		return [
			...currentRemoteItem,
			...publicFileItems,
			{type: 'divider', id: 'upload-asset-divider'},
			{
				type: 'item',
				id: 'upload-asset',
				value: 'upload-asset',
				label: 'Upload…',
				onClick: () => {
					upload().catch(() => undefined);
				},
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
				disabled: window.remotion_isReadOnlyStudio,
			},
		];
	}, [current, isCurrentStaticFile, onSelect, staticFiles, upload]);

	return (
		<Combobox
			small
			title={current}
			selectedId={current}
			values={items}
			style={comboboxStyle}
		/>
	);
};
