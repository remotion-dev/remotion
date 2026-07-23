import React, {
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {writeStaticFile} from '../api/write-static-file';
import {FAIL_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {CaptionTimingEditContext} from '../state/caption-timing-edit';
import {Button} from './Button';
import type {CaptionJson} from './caption-json';
import {isCaptionJson} from './caption-json';
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

type CaptionSaveStatus =
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

type JsonState =
	| {readonly type: 'loading'}
	| {readonly type: 'loaded'; readonly value: unknown};

export const CaptionJsonInspector: React.FC<{
	readonly src: string;
	readonly editableFilePath?: string;
}> = ({src, editableFilePath}) => {
	const [json, setJson] = useState<JsonState>({type: 'loading'});
	const ownerId = useId();
	const videoConfig = Internals.useUnsafeVideoConfig();
	const {selectedCaptionIndex, selectionRevision, session, start, stop, sync} =
		useContext(CaptionTimingEditContext);
	const [saveStatus, setSaveStatus] = useState<CaptionSaveStatus>(
		editableFilePath ? {type: 'saved'} : {type: 'read-only'},
	);
	const saveQueue = useRef<Promise<void>>(Promise.resolve());
	const latestSave = useRef(0);

	useEffect(() => {
		let cancelled = false;
		setJson({type: 'loading'});
		fetch(src)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP ${res.status}`);
				}

				return res.json();
			})
			.then((jsonRes) => {
				if (!cancelled) {
					setJson({type: 'loaded', value: jsonRes});
				}
			})
			.catch(() => {
				if (!cancelled) {
					setJson({type: 'loaded', value: null});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [src]);

	useEffect(() => {
		latestSave.current += 1;
		setSaveStatus(editableFilePath ? {type: 'saved'} : {type: 'read-only'});
	}, [editableFilePath]);

	const onChangeCaptions = useCallback(
		(nextCaptions: CaptionJson[]) => {
			setJson({type: 'loaded', value: nextCaptions});
			if (!editableFilePath) {
				return;
			}

			setSaveStatus({type: 'saving'});
			const saveId = latestSave.current + 1;
			latestSave.current = saveId;
			const write = saveQueue.current
				.catch(() => undefined)
				.then(() =>
					writeStaticFile({
						filePath: editableFilePath,
						contents: JSON.stringify(nextCaptions, null, '\t') + '\n',
					}),
				);
			saveQueue.current = write;
			write
				.then(() => {
					if (latestSave.current === saveId) {
						setSaveStatus({type: 'saved'});
					}
				})
				.catch((error) => {
					if (latestSave.current === saveId) {
						setSaveStatus({
							type: 'error',
							message: error instanceof Error ? error.message : String(error),
						});
					}
				});
		},
		[editableFilePath],
	);

	const captions =
		json.type === 'loaded' && isCaptionJson(json.value) ? json.value : null;
	const isEditingTimings = session?.ownerId === ownerId;
	const canEditTimings =
		captions !== null && editableFilePath !== undefined && videoConfig !== null;

	useEffect(() => {
		if (!isEditingTimings || captions === null) {
			return;
		}

		sync({ownerId, src, captions, onChange: onChangeCaptions});
	}, [captions, isEditingTimings, onChangeCaptions, ownerId, src, sync]);

	useEffect(() => {
		return () => stop(ownerId);
	}, [ownerId, src, stop]);

	const toggleTimingEdit = useCallback(() => {
		if (isEditingTimings) {
			stop(ownerId);
			return;
		}

		if (captions === null || !canEditTimings) {
			return;
		}

		start({ownerId, src, captions, onChange: onChangeCaptions});
	}, [
		canEditTimings,
		captions,
		isEditingTimings,
		onChangeCaptions,
		ownerId,
		src,
		start,
		stop,
	]);

	if (captions === null) {
		return null;
	}

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
								editableFilePath === undefined
									? 'Timing editing requires a local caption file'
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
				onChange={onChangeCaptions}
				readOnly={saveStatus.type === 'read-only'}
				selectedCaptionIndex={isEditingTimings ? selectedCaptionIndex : null}
				selectionRevision={selectionRevision}
			/>
		</>
	);
};
