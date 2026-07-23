import React, {useCallback, useEffect, useRef, useState} from 'react';
import {writeStaticFile} from '../api/write-static-file';
import type {CaptionJson} from './caption-json';
import {isCaptionJson} from './caption-json';
import {CaptionInspector, type CaptionSaveStatus} from './CaptionInspector';

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

	if (captions === null) {
		return null;
	}

	return (
		<CaptionInspector
			captions={captions}
			onTextChange={onChangeCaptions}
			onTextChangeEnd={null}
			onTimingChange={onChangeCaptions}
			readOnlyTitle={
				editableFilePath === undefined
					? 'Timing editing requires a local caption file'
					: null
			}
			saveStatus={saveStatus}
		/>
	);
};
