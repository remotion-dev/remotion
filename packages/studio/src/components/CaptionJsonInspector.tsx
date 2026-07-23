import React, {useCallback, useEffect, useRef, useState} from 'react';
import {writeStaticFile} from '../api/write-static-file';
import {FAIL_COLOR, LIGHT_TEXT} from '../helpers/colors';
import type {CaptionJson} from './caption-json';
import {isCaptionJson} from './caption-json';
import {CaptionJsonEditor} from './CaptionJsonEditor';
import {
	InspectorSectionDivider,
	InspectorSectionHeader,
} from './InspectorPanel/common';
import {sectionHeaderRow, sectionHeaderTitle} from './InspectorPanel/styles';

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
		(captions: CaptionJson[]) => {
			setJson({type: 'loaded', value: captions});
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
						contents: JSON.stringify(captions, null, '\t') + '\n',
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

	if (json.type === 'loading' || !isCaptionJson(json.value)) {
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
				</div>
			</InspectorSectionHeader>
			<CaptionJsonEditor
				captions={json.value}
				onChange={onChangeCaptions}
				readOnly={saveStatus.type === 'read-only'}
			/>
		</>
	);
};
