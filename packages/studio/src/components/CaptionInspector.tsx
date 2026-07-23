import React, {useCallback, useContext, useEffect, useId} from 'react';
import {Internals} from 'remotion';
import {FAIL_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {CaptionTimingEditContext} from '../state/caption-timing-edit';
import {Button} from './Button';
import type {CaptionJson} from './caption-json';
import {CaptionJsonEditor} from './CaptionJsonEditor';
import {
	InspectorSectionDivider,
	InspectorSectionHeader,
} from './InspectorPanel/common';
import {
	sectionHeaderEnd,
	sectionHeaderRow,
	sectionHeaderTitle,
} from './InspectorPanel/styles';

export type CaptionSaveStatus =
	| {readonly type: 'read-only'}
	| {readonly type: 'saved'}
	| {readonly type: 'saving'}
	| {readonly type: 'error'; readonly message: string};

const status: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 'normal',
	lineHeight: '16px',
	marginLeft: 12,
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const CaptionInspector: React.FC<{
	readonly captions: CaptionJson[];
	readonly onTextChange: (captions: CaptionJson[]) => void;
	readonly onTextChangeEnd: ((captions: CaptionJson[]) => void) | null;
	readonly onTimingChange: (captions: CaptionJson[]) => void;
	readonly readOnlyTitle: string | null;
	readonly saveStatus: CaptionSaveStatus;
}> = ({
	captions,
	onTextChange,
	onTextChangeEnd,
	onTimingChange,
	readOnlyTitle,
	saveStatus,
}) => {
	const ownerId = useId();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {selectedCaptionIndex, selectionRevision, session, start, stop, sync} =
		useContext(CaptionTimingEditContext);
	const isEditingTimings = session?.ownerId === ownerId;
	const isReadOnly = saveStatus.type === 'read-only';
	const canEditTimings = !isReadOnly && videoConfig !== null;

	useEffect(() => {
		if (!isEditingTimings) {
			return;
		}

		sync({ownerId, captions, onChange: onTimingChange});
	}, [captions, isEditingTimings, onTimingChange, ownerId, sync]);

	useEffect(() => {
		return () => stop(ownerId);
	}, [ownerId, stop]);

	const toggleTimingEdit = useCallback(() => {
		if (isEditingTimings) {
			stop(ownerId);
			return;
		}

		if (!canEditTimings) {
			return;
		}

		start({ownerId, captions, onChange: onTimingChange});
	}, [
		canEditTimings,
		captions,
		isEditingTimings,
		onTimingChange,
		ownerId,
		start,
		stop,
	]);

	const statusLabel =
		saveStatus.type === 'saving'
			? 'Saving…'
			: saveStatus.type === 'error'
				? 'Could not save'
				: saveStatus.type === 'read-only'
					? 'Read only'
					: null;
	const statusStyle: React.CSSProperties = {
		...status,
		color: saveStatus.type === 'error' ? FAIL_COLOR : LIGHT_TEXT,
	};

	return (
		<>
			<InspectorSectionDivider />
			<InspectorSectionHeader>
				<div style={sectionHeaderRow}>
					<div style={sectionHeaderTitle}>Captions</div>
					<div style={sectionHeaderEnd}>
						{statusLabel ? (
							<div
								style={statusStyle}
								title={
									saveStatus.type === 'error' ? saveStatus.message : undefined
								}
							>
								{statusLabel}
							</div>
						) : null}
						<Button
							disabled={!canEditTimings && !isEditingTimings}
							onClick={toggleTimingEdit}
							size="condensed"
							title={
								isReadOnly
									? (readOnlyTitle ?? undefined)
									: videoConfig === null
										? 'Select a caption sequence in a composition to edit timings'
										: undefined
							}
						>
							{isEditingTimings ? 'Done' : 'Edit timings'}
						</Button>
					</div>
				</div>
			</InspectorSectionHeader>
			<CaptionJsonEditor
				captions={captions}
				onChange={onTextChange}
				onChangeEnd={onTextChangeEnd}
				readOnly={isReadOnly}
				selectedCaptionIndex={isEditingTimings ? selectedCaptionIndex : null}
				selectionRevision={selectionRevision}
			/>
		</>
	);
};
