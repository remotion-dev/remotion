import type {Caption} from '@remotion/captions';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {BACKGROUND, LIGHT_TEXT, LINE_COLOR, WHITE} from '../helpers/colors';
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
	borderBottom: `1px solid ${LINE_COLOR}`,
	display: 'grid',
	gap: 12,
	gridTemplateColumns: '100px minmax(0, 1fr)',
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
}> = ({captions, onChange, onSave, onCancel, readOnly}) => {
	const listRef = useRef<HTMLDivElement>(null);
	const cancelledBlurIndexes = useRef(new Set<number>());
	const dirtyRef = useRef(false);
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

	const updateText = useCallback(
		(index: number, text: string) => {
			if (latestRef.current.captions[index]?.text === text) {
				return;
			}

			const nextCaptions = latestRef.current.captions.map(
				(caption, captionIndex) => {
					return captionIndex === index ? {...caption, text} : caption;
				},
			);
			latestRef.current.captions = nextCaptions;
			dirtyRef.current = true;
			onChange(nextCaptions);
		},
		[onChange],
	);

	const focusSibling = useCallback((index: number) => {
		const input = listRef.current?.querySelector<HTMLInputElement>(
			`[data-caption-index="${index}"]`,
		);
		input?.focus();
		input?.scrollIntoView({block: 'nearest'});
	}, []);

	return (
		<div style={container}>
			<div ref={listRef} style={list}>
				{captions.length === 0 ? <div style={empty}>No captions</div> : null}
				{captionRows.map(({caption, key}, index) => {
					return (
						<div key={key} style={row}>
							<div style={timing}>
								{formatMilliseconds(caption.startMs)} →{' '}
								{formatMilliseconds(caption.endMs)} ms
							</div>
							<RemotionInput
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
						</div>
					);
				})}
			</div>
		</div>
	);
};
