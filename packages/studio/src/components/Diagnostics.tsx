import React, {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Internals} from 'remotion';
import {
	BACKGROUND,
	BORDER_BLACK,
	LIGHT_TEXT,
	LINE_COLOR,
	WHITE,
} from '../helpers/colors';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import {startCapturedPointerSession} from '../helpers/pointer-session';
import {useZIndex} from '../state/z-index';
import {BufferingEvents} from './BufferingEvents';
import {Button} from './Button';
import {getPortal} from './Menu/portals';
import {useSettings} from './SettingsContext';

const textStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '20px',
};

const DiagnosticsWindow: React.FC = () => {
	const {currentZIndex, tabIndex} = useZIndex();
	const [position, setPosition] = useState({x: 24, y: 72});
	const [counts, setCounts] = useState(() => ({
		...Internals.playbackDiagnostics,
	}));
	const panel = useRef<HTMLDivElement>(null);
	const endDrag = useRef<(() => void) | null>(null);
	const resetBufferingHandlesCreated = useCallback(() => {
		Internals.playbackDiagnostics.bufferingHandlesCreated = 0;
		setCounts({...Internals.playbackDiagnostics});
	}, []);

	const move = useCallback((x: number, y: number) => {
		setPosition({
			x: Math.max(
				0,
				Math.min(x, window.innerWidth - (panel.current?.offsetWidth ?? 0)),
			),
			y: Math.max(
				0,
				Math.min(y, window.innerHeight - (panel.current?.offsetHeight ?? 0)),
			),
		});
	}, []);

	useEffect(() => {
		const timer = window.setInterval(() => {
			const next = Internals.playbackDiagnostics;
			setCounts((current) =>
				current.audioIteratorsCreated === next.audioIteratorsCreated &&
				current.mediabunnySinksOpen === next.mediabunnySinksOpen &&
				current.bufferingHandlesCreated === next.bufferingHandlesCreated &&
				current.bufferingStatesTriggered === next.bufferingStatesTriggered
					? current
					: {...next},
			);
		}, 250);
		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		const onResize = () => {
			const rect = panel.current?.getBoundingClientRect();
			if (rect) {
				move(rect.x, rect.y);
			}
		};

		onResize();
		window.addEventListener('resize', onResize);
		const observer = new ResizeObserver(onResize);
		if (panel.current) observer.observe(panel.current);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', onResize);
			endDrag.current?.();
		};
	}, [move]);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			if (event.button !== 0) {
				return;
			}

			event.preventDefault();
			event.currentTarget.focus();
			endDrag.current?.();
			const rect = panel.current!.getBoundingClientRect();
			const offsetX = event.clientX - rect.x;
			const offsetY = event.clientY - rect.y;
			endDrag.current = startCapturedPointerSession({
				event,
				captureTarget: event.currentTarget,
				onMove: (pointer) =>
					move(pointer.clientX - offsetX, pointer.clientY - offsetY),
				onEnd: () => {
					endDrag.current = null;
				},
			});
		},
		[move],
	);

	return createPortal(
		<div
			ref={panel}
			className="css-reset"
			role="dialog"
			aria-modal={false}
			aria-label="Diagnostics"
			style={{
				position: 'fixed',
				pointerEvents: 'auto',
				left: position.x,
				top: position.y,
				width: 480,
				maxWidth: '100vw',
				maxHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: BACKGROUND,
				border: `1px solid ${LINE_COLOR}`,
				borderRadius: 6,
				boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
				overflow: 'hidden',
			}}
		>
			<button
				type="button"
				className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
				aria-label="Move diagnostics window"
				tabIndex={tabIndex}
				onPointerDown={onPointerDown}
				onKeyDown={(event) => {
					const directions: Record<string, [number, number]> = {
						ArrowLeft: [-10, 0],
						ArrowRight: [10, 0],
						ArrowUp: [0, -10],
						ArrowDown: [0, 10],
					};
					const direction = directions[event.key];
					if (direction) {
						event.preventDefault();
						event.stopPropagation();
						move(position.x + direction[0], position.y + direction[1]);
					}
				}}
				style={{
					...textStyle,
					flexShrink: 0,
					color: WHITE,
					fontSize: 14,
					textAlign: 'left',
					width: '100%',
					padding: '10px 14px',
					border: 'none',
					borderBottom: BORDER_BLACK,
					backgroundColor: BACKGROUND,
					cursor: 'default',
					touchAction: 'none',
					userSelect: 'none',
				}}
			>
				Diagnostics
			</button>
			<dl style={{margin: 0, padding: '10px 14px', flexShrink: 0}}>
				{[
					['Audio iterators created', counts.audioIteratorsCreated],
					['Mediabunny sinks open', counts.mediabunnySinksOpen],
					['Buffering handles created', counts.bufferingHandlesCreated],
					['Buffering states triggered', counts.bufferingStatesTriggered],
				].map(([label, value]) => (
					<div key={label} style={{display: 'flex', gap: 12, padding: '3px 0'}}>
						<dt
							style={{
								...textStyle,
								flex: 1,
								display: 'flex',
								alignItems: 'center',
								gap: 6,
							}}
						>
							{label}
							{label === 'Buffering handles created' ? (
								<Button
									size="condensed"
									aria-label="Reset buffering handles created"
									onClick={resetBufferingHandlesCreated}
								>
									Reset
								</Button>
							) : null}
						</dt>
						<dd
							style={{
								...textStyle,
								margin: 0,
								color: WHITE,
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{value}
						</dd>
					</div>
				))}
			</dl>
			<BufferingEvents />
		</div>,
		getPortal(currentZIndex),
	);
};

export const Diagnostics = React.memo(() => {
	const {showDiagnostics} = useSettings();
	return showDiagnostics ? <DiagnosticsWindow /> : null;
});
