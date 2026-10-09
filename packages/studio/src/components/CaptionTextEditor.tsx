import type {Caption} from '@remotion/captions';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
	BACKGROUND,
	BLUE,
	LIGHT_TEXT,
	LINE_COLOR,
	WHITE,
} from '../helpers/colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import {EnterIcon} from '../icons/enter';
import {ActionTooltip} from './ActionTooltip';
import {InlineAction} from './InlineAction';
import {RemotionInput} from './NewComposition/RemInput';

const container: React.CSSProperties = {
	alignSelf: 'stretch',
	backgroundColor: BACKGROUND,
	display: 'flex',
	flexDirection: 'column',
	fontFamily: 'sans-serif',
	width: '100%',
};

const list: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

const row: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'var(--remotion-active-caption-background, transparent)',
	borderBottom: `1px solid ${LINE_COLOR}`,
	display: 'grid',
	gap: 8,
	gridTemplateColumns: '100px minmax(0, 1fr) 24px',
	padding: '5px 12px',
};

const timing: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	fontSize: 11,
	fontVariantNumeric: 'tabular-nums',
	lineHeight: '16px',
	textAlign: 'right',
	whiteSpace: 'nowrap',
};

const empty: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
	padding: 12,
	textAlign: 'center',
};

const formatMilliseconds = (milliseconds: number): number => {
	return Math.round(milliseconds);
};

export const CaptionTextEditor: React.FC<{
	readonly captions: Caption[];
	readonly onChange: (captions: Caption[]) => void;
	readonly onSave: ((captions: Caption[]) => void) | null;
	readonly onCancel: (() => void) | null;
	readonly readOnly: boolean;
}> = React.memo(({captions, onChange, onSave, onCancel, readOnly}) => {
	const listRef = useRef<HTMLDivElement>(null);
	const cancelledBlurIndexes = useRef(new Set<number>());
	const dirtyRef = useRef(false);
	const pendingFocusIndex = useRef<number | null>(null);
	const latestRef = useRef({captions, onSave});
	latestRef.current = {captions, onSave};
	const captionRows = useMemo(() => {
		const occurrences = new Map<string, number>();
		return captions.map((caption) => {
			const signature = [
				caption.startMs,
				caption.endMs,
				caption.timestampMs,
				caption.confidence,
			].join('-');
			const occurrence = occurrences.get(signature) ?? 0;
			occurrences.set(signature, occurrence + 1);
			return {caption, key: `${signature}-${occurrence}`};
		});
	}, [captions]);

	const commitPending = useCallback(() => {
		if (!dirtyRef.current) {
			return;
		}

		dirtyRef.current = false;
		latestRef.current.onSave?.(latestRef.current.captions);
	}, []);

	useEffect(() => {
		return commitPending;
	}, [commitPending]);

	const updateCaption = useCallback(
		(
			index: number,
			changes: Partial<Pick<Caption, 'text' | 'pageBreakAfter'>>,
		) => {
			const currentCaption = latestRef.current.captions[index];
			if (!currentCaption) {
				return;
			}

			const nextCaptions = latestRef.current.captions.map(
				(caption, captionIndex) => {
					return captionIndex === index ? {...caption, ...changes} : caption;
				},
			);
			latestRef.current.captions = nextCaptions;
			dirtyRef.current = true;
			onChange(nextCaptions);
		},
		[onChange],
	);

	const updateText = useCallback(
		(index: number, text: string) => {
			if (latestRef.current.captions[index]?.text === text) {
				return;
			}

			updateCaption(index, {text});
		},
		[updateCaption],
	);

	const updatePageBreakAfter = useCallback(
		(index: number, pageBreakAfter: boolean) => {
			if (
				Boolean(latestRef.current.captions[index]?.pageBreakAfter) ===
				pageBreakAfter
			) {
				return;
			}

			updateCaption(index, {pageBreakAfter});
		},
		[updateCaption],
	);

	const focusSibling = useCallback((index: number) => {
		const input = listRef.current?.querySelector<HTMLInputElement>(
			`[data-caption-index="${index}"]`,
		);
		input?.focus();
		input?.scrollIntoView({block: 'nearest'});
	}, []);

	useEffect(() => {
		const index = pendingFocusIndex.current;
		if (index === null) {
			return;
		}

		pendingFocusIndex.current = null;
		const input = listRef.current?.querySelector<HTMLInputElement>(
			`[data-caption-index="${index}"]`,
		);
		input?.focus();
		input?.setSelectionRange(1, 1);
		input?.scrollIntoView({block: 'nearest'});
	}, [captions]);

	const splitCaption = useCallback(
		(index: number, characterIndex: number) => {
			const currentCaptions = latestRef.current.captions;
			const caption = currentCaptions[index];
			if (!caption || caption.text.length === 0) {
				return;
			}

			const splitIndex = Math.min(
				Math.max(characterIndex, 0),
				caption.text.length,
			);
			const splitTimestamp = Math.round(
				caption.startMs +
					((caption.endMs - caption.startMs) * splitIndex) /
						caption.text.length,
			);
			const afterText = caption.text.slice(splitIndex).trimStart();
			const {pageBreakAfter, ...captionWithoutPageBreak} = caption;
			const nextCaptions = [
				...currentCaptions.slice(0, index),
				{
					...captionWithoutPageBreak,
					text: caption.text.slice(0, splitIndex).trimEnd(),
					endMs: splitTimestamp,
					timestampMs:
						caption.timestampMs === null
							? null
							: Math.round((caption.startMs + splitTimestamp) / 2),
					...(pageBreakAfter === undefined ? {} : {pageBreakAfter: false}),
				},
				{
					...captionWithoutPageBreak,
					text: ` ${afterText}`,
					startMs: splitTimestamp,
					timestampMs:
						caption.timestampMs === null
							? null
							: Math.round((splitTimestamp + caption.endMs) / 2),
					...(pageBreakAfter === undefined ? {} : {pageBreakAfter}),
				},
				...currentCaptions.slice(index + 1),
			];

			latestRef.current.captions = nextCaptions;
			dirtyRef.current = true;
			pendingFocusIndex.current = index + 1;
			onChange(nextCaptions);
			commitPending();
		},
		[commitPending, onChange],
	);

	return (
		<div style={container}>
			<div ref={listRef} style={list}>
				{captions.length === 0 ? <div style={empty}>No captions</div> : null}
				{captionRows.map(({caption, key}, index) => {
					const hasPageBreakAfter = Boolean(caption.pageBreakAfter);
					const pageBreakTitle = hasPageBreakAfter
						? `Remove page break after caption ${index + 1}`
						: `Add page break after caption ${index + 1}`;

					return (
						<div key={key} data-caption-row-index={index} style={row}>
							<div style={timing}>
								{formatMilliseconds(caption.startMs)} →{' '}
								{formatMilliseconds(caption.endMs)} ms
							</div>
							<RemotionInput
								aria-label={`Caption ${index + 1}`}
								data-caption-index={index}
								disabled={readOnly}
								onBlur={(event) => {
									if (cancelledBlurIndexes.current.delete(index)) {
										return;
									}

									updateText(index, event.currentTarget.value);
									commitPending();
								}}
								onChange={(event) => updateText(index, event.target.value)}
								onKeyDown={(event) => {
									if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
										event.preventDefault();
										splitCaption(
											index,
											event.currentTarget.selectionStart ??
												event.currentTarget.value.length,
										);
									}

									if (
										event.key === 'ArrowDown' &&
										index < captions.length - 1
									) {
										event.preventDefault();
										focusSibling(index + 1);
									}

									if (event.key === 'ArrowUp' && index > 0) {
										event.preventDefault();
										focusSibling(index - 1);
									}

									if (event.key === 'Escape') {
										event.preventDefault();
										cancelledBlurIndexes.current.add(index);
										dirtyRef.current = false;
										onCancel?.();
										event.currentTarget.blur();
									}
								}}
								rightAlign={false}
								small
								status="ok"
								style={{
									color: WHITE,
									fontFamily: 'sans-serif',
									fontSize: 12,
									lineHeight: '16px',
								}}
								value={caption.text}
							/>
							<ActionTooltip
								label={
									hasPageBreakAfter
										? 'Remove break after this'
										: 'Break after this'
								}
								shortcut={null}
								delay={800}
								dismissOnClick
							>
								<InlineAction
									aria-pressed={hasPageBreakAfter}
									className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
									disabled={readOnly}
									onClick={() => {
										updatePageBreakAfter(index, !hasPageBreakAfter);
										commitPending();
									}}
									renderAction={(color) => (
										<EnterIcon
											aria-hidden="true"
											color={hasPageBreakAfter ? BLUE : color}
											focusable="false"
											style={{height: 16, width: 16}}
										/>
									)}
									aria-label={pageBreakTitle}
									variant={null}
								/>
							</ActionTooltip>
						</div>
					);
				})}
			</div>
		</div>
	);
});

CaptionTextEditor.displayName = 'CaptionTextEditor';
