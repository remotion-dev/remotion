import type {Caption} from '@remotion/captions';
import React, {useCallback, useRef, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import {UploadIcon} from '../icons/upload';
import {CaptionTextEditor} from './CaptionTextEditor';
import {useConfirmationDialog} from './ConfirmationDialog';
import {InlineAction} from './InlineAction';
import {CollapsibleInspectorSectionHeader} from './InspectorPanel/CollapsibleInspectorSectionHeader';
import {InspectorSectionHeader} from './InspectorPanel/common';
import {sectionHeaderEnd} from './InspectorPanel/styles';
import {showNotification} from './Notifications/NotificationCenter';
import {parseCaptionFile, type ParsedCaptionFile} from './parse-caption-file';

const importTooltip = `Import captions

Supports Remotion Caption[] JSON, ElevenLabs Speech-to-Text JSON, ElevenLabs segmented export JSON, OpenAI Whisper verbose JSON, and SRT subtitles. JSON transcripts need word-level timestamps. Files are processed locally.`;

const formatLabels: Record<ParsedCaptionFile['format'], string> = {
	remotion: 'Remotion JSON',
	elevenlabs: 'ElevenLabs JSON',
	'elevenlabs-segments': 'ElevenLabs segmented JSON',
	'openai-whisper': 'OpenAI Whisper JSON',
	srt: 'SRT',
};

const readOnlyStatus: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 'normal',
	lineHeight: '16px',
	marginLeft: 12,
};

export const CaptionInspector: React.FC<{
	readonly captions: Caption[];
	readonly expanded: boolean;
	readonly onTextChange: (captions: Caption[]) => void;
	readonly onTextSave: ((captions: Caption[]) => void) | null;
	readonly onTextCancel: (() => void) | null;
	readonly onReplaceCaptions: ((captions: Caption[]) => Promise<void>) | null;
	readonly onToggle: () => void;
	readonly readOnly: boolean;
	readonly readOnlyTitle: string | null;
}> = ({
	captions,
	expanded,
	onTextChange,
	onTextSave,
	onTextCancel,
	onReplaceCaptions,
	onToggle,
	readOnly,
	readOnlyTitle,
}) => {
	const fileInput = useRef<HTMLInputElement>(null);
	const [isImporting, setIsImporting] = useState(false);
	const confirm = useConfirmationDialog();

	const importCaptions = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.currentTarget.files?.[0];
			event.currentTarget.value = '';
			if (!file || onReplaceCaptions === null) {
				return;
			}

			setIsImporting(true);
			try {
				const parsed = parseCaptionFile({
					fileName: file.name,
					contents: await file.text(),
				});
				if (
					captions.length > 0 &&
					!(await confirm({
						title: 'Replace captions?',
						message: `This will replace ${captions.length} existing ${captions.length === 1 ? 'caption' : 'captions'} with ${parsed.captions.length} imported ${parsed.captions.length === 1 ? 'caption' : 'captions'}. You can undo this action.`,
						confirmLabel: 'Replace captions',
						cancelLabel: 'Cancel',
					}))
				) {
					return;
				}

				await onReplaceCaptions(parsed.captions);
				const captionLabel =
					parsed.captions.length === 1 ? 'caption' : 'captions';
				showNotification(
					`Imported ${parsed.captions.length} ${captionLabel} from ${formatLabels[parsed.format]}. Undo is available.`,
					4000,
				);
			} catch (error) {
				showNotification(
					`Could not import ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
					5000,
				);
			} finally {
				setIsImporting(false);
			}
		},
		[captions.length, confirm, onReplaceCaptions],
	);

	return (
		<>
			<InspectorSectionHeader>
				<CollapsibleInspectorSectionHeader
					action={
						<div style={sectionHeaderEnd}>
							{onReplaceCaptions === null ? null : (
								<>
									<input
										ref={fileInput}
										accept=".json,.srt"
										aria-label="Import captions file"
										hidden
										onChange={importCaptions}
										type="file"
									/>
									<InlineAction
										aria-label="Import captions"
										className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
										disabled={isImporting}
										onClick={() => fileInput.current?.click()}
										renderAction={(color) => (
											<UploadIcon
												aria-hidden="true"
												color={color}
												focusable="false"
												style={{height: 16, width: 16}}
											/>
										)}
										title={importTooltip}
										variant={null}
									/>
								</>
							)}
							{readOnly ? (
								<div style={readOnlyStatus} title={readOnlyTitle ?? undefined}>
									Read only
								</div>
							) : null}
						</div>
					}
					expanded={expanded}
					label="Captions"
					onToggle={onToggle}
				/>
			</InspectorSectionHeader>
			{expanded ? (
				<CaptionTextEditor
					captions={captions}
					onChange={onTextChange}
					onSave={onTextSave}
					onCancel={onTextCancel}
					readOnly={readOnly}
				/>
			) : null}
		</>
	);
};
