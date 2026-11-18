import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {Internals} from 'remotion';
import {LIGHT_TEXT, LINE_COLOR, RED, WHITE} from '../helpers/colors';
import {formatFileLocation} from '../helpers/format-file-location';
import {
	useRevealBufferingHandle,
	type BufferingEvent,
} from './buffering-diagnostics';
import {Button} from './Button';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {useResolvedStack} from './Timeline/use-resolved-stack';

const textStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '18px',
	color: LIGHT_TEXT,
};

const BufferingHandle: React.FC<{
	readonly handle: BufferingEvent['handles'][number];
	readonly event: BufferingEvent;
	readonly onReveal: (eventId: number, handleId: number) => void;
	readonly busy: boolean;
}> = ({handle, event, onReveal, busy}) => {
	const owner = handle.owners[0] ?? null;
	const location = useResolvedStack(owner?.stack ?? null);
	const file = formatFileLocation({location, root: window.remotion_cwd ?? ''});
	const source =
		handle.owners.find((item) => item.source !== null)?.source ?? null;
	const duration =
		(handle.releasedAt ?? event.endedAt ?? performance.now()) -
		handle.createdAt;
	return (
		<div style={{padding: '8px 0', borderTop: `1px solid ${LINE_COLOR}`}}>
			<div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
				<span
					style={{
						...textStyle,
						color: WHITE,
						flex: 1,
						overflowWrap: 'anywhere',
					}}
				>
					{owner?.name ?? 'Unknown layer'}
				</span>
				<Button
					size="condensed"
					disabled={busy || handle.owners.length === 0}
					onClick={() => onReveal(event.id, handle.id)}
					aria-label={`Reveal buffering handle ${handle.id}`}
				>
					Reveal
				</Button>
			</div>
			<div style={textStyle}>
				Handle #{handle.id} ·{' '}
				{handle.createdAt <= event.startedAt ? 'At start' : 'Joined later'} ·{' '}
				{duration.toFixed(1)} ms
				{handle.releasedAt === null && event.endedAt === null
					? ' · Active'
					: ''}
			</div>
			{file === null ? null : (
				<div style={{...textStyle, overflowWrap: 'anywhere'}}>{file}</div>
			)}
			{source === null ? null : (
				<div style={{...textStyle, overflowWrap: 'anywhere'}}>{source}</div>
			)}
			{handle.owners.length > 1 ? (
				<div style={{...textStyle, overflowWrap: 'anywhere'}}>
					{handle.owners
						.slice(1)
						.map((item) => item.name)
						.join(' › ')}
				</div>
			) : null}
			{handle.stack ? (
				<details>
					<summary style={{...textStyle, cursor: 'default'}}>
						Creation stack
					</summary>
					<pre
						style={{
							...textStyle,
							fontFamily: 'monospace',
							whiteSpace: 'pre-wrap',
							overflowWrap: 'anywhere',
							margin: '4px 0',
						}}
					>
						{handle.stack}
					</pre>
				</details>
			) : null}
		</div>
	);
};

export const BufferingEvents: React.FC = () => {
	const [snapshot, setSnapshot] = useState(() =>
		Internals.bufferingDiagnostics.getSnapshot(),
	);
	const [busy, setBusy] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const reveal = useRevealBufferingHandle();

	useLayoutEffect(() => {
		Internals.bufferingDiagnostics.setEnabled('panel', true);
		setSnapshot(Internals.bufferingDiagnostics.getSnapshot());
		return () => Internals.bufferingDiagnostics.setEnabled('panel', false);
	}, []);

	useEffect(() => {
		const timer = window.setInterval(() => {
			const next = Internals.bufferingDiagnostics.getSnapshot();
			setSnapshot((current) =>
				current.revision !== next.revision ||
				next.events.some((event) => event.endedAt === null)
					? next
					: current,
			);
		}, 250);
		return () => window.clearInterval(timer);
	}, []);

	const onReveal = useCallback(
		(eventId: number, handleId: number) => {
			setBusy(handleId);
			setError(null);
			reveal(eventId, handleId)
				.catch((err) => setError((err as Error).message))
				.finally(() => setBusy(null));
		},
		[reveal],
	);

	return (
		<div
			style={{
				borderTop: `1px solid ${LINE_COLOR}`,
				padding: '10px 14px',
				display: 'flex',
				flexDirection: 'column',
				minHeight: 0,
			}}
		>
			<div
				style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}
			>
				<span style={{...textStyle, color: WHITE, flex: 1}}>
					Buffering events
				</span>
				<Button
					size="condensed"
					onClick={() => {
						Internals.bufferingDiagnostics.clear();
						setSnapshot(Internals.bufferingDiagnostics.getSnapshot());
					}}
					aria-label="Clear completed buffering events"
				>
					Clear
				</Button>
			</div>
			{error === null ? null : (
				<div role="alert" style={{...textStyle, color: RED}}>
					{error}
				</div>
			)}
			<div
				className={VERTICAL_SCROLLBAR_CLASSNAME}
				style={{maxHeight: 320, minHeight: 0, overflowY: 'auto'}}
			>
				{snapshot.events.length === 0 ? (
					<div style={textStyle}>Play or scrub to trace buffering handles.</div>
				) : null}
				{snapshot.events
					.slice(-20)
					.reverse()
					.map((event, index) => (
						<details key={event.id} open={index === 0}>
							<summary
								style={{
									...textStyle,
									color: WHITE,
									cursor: 'default',
									padding: '6px 0',
								}}
							>
								#{event.id} · {event.compositionId ?? 'Unknown composition'} ·
								Frame {event.frame} ·{' '}
								{event.endedAt === null
									? 'Buffering'
									: `${(event.endedAt - event.startedAt).toFixed(1)} ms`}{' '}
								· {event.handles.length} handles
							</summary>
							{event.handles.map((handle) => (
								<BufferingHandle
									key={handle.id}
									handle={handle}
									event={event}
									onReveal={onReveal}
									busy={busy !== null}
								/>
							))}
							{event.omittedHandles > 0 ? (
								<div style={textStyle}>
									{event.omittedHandles} handles were not captured.
								</div>
							) : null}
						</details>
					))}
			</div>
			{snapshot.droppedEvents > 0 ? (
				<div style={textStyle}>
					{snapshot.droppedEvents} older events discarded.
				</div>
			) : null}
		</div>
	);
};
