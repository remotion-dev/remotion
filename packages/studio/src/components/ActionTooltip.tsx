import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';
import {TIMELINE_BACKGROUND_COLOR, WHITE_ALPHA_90} from '../helpers/colors';
import {observeHover} from '../helpers/observe-hover';
import {useZIndex} from '../state/z-index';
import {KeyboardShortcutLabel} from './KeyboardShortcutLabel';
import {getPortal} from './Menu/portals';
import {SHADOW_TOWARDS_TOP} from './Menu/styles';

const defaultTriggerStyle: React.CSSProperties = {display: 'inline-flex'};

const tooltipStyle: React.CSSProperties = {
	position: 'fixed',
	display: 'flex',
	alignItems: 'center',
	gap: 6,
	backgroundColor: TIMELINE_BACKGROUND_COLOR,
	color: WHITE_ALPHA_90,
	borderRadius: 6,
	padding: '6px 8px',
	fontSize: 12,
	lineHeight: '16px',
	whiteSpace: 'pre-wrap',
	overflowWrap: 'anywhere',
	maxWidth: 'calc(100vw - 16px)',
	boxShadow: SHADOW_TOWARDS_TOP,
	pointerEvents: 'none',
};

const labelStyle: React.CSSProperties = {
	font: 'inherit',
	color: 'inherit',
	minWidth: 0,
};

const shortcutStyle: React.CSSProperties = {
	...labelStyle,
	backgroundColor: 'transparent',
	opacity: 0.6,
	whiteSpace: 'nowrap',
	flexShrink: 0,
};

let visibleTooltipCount = 0;
let lastTooltipHiddenAt: number | null = null;
const TOOLTIP_SKIP_DELAY_WINDOW = 300;

export const ActionTooltip: React.FC<{
	readonly label: React.ReactNode;
	readonly shortcut: string | null;
	/** Hover delay in milliseconds. Pass null to show immediately. */
	readonly delay: number | null;
	readonly dismissOnClick: boolean;
	readonly side?: 'top' | 'right';
	readonly triggerStyle?: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({
	label,
	shortcut,
	delay,
	dismissOnClick,
	side = 'top',
	triggerStyle,
	children,
}) => {
	const triggerRef = useRef<HTMLSpanElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const activation = useRef<'hover' | 'focus' | null>(null);
	const delayRef = useRef(delay);
	// Dismissal must also cancel a tooltip that is waiting for its hover delay.
	const [active, setActive] = useState(false);
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState<{left: number; top: number} | null>(
		null,
	);
	const {currentZIndex} = useZIndex();

	useLayoutEffect(() => {
		delayRef.current = delay;
	}, [delay]);

	useLayoutEffect(() => {
		if (!visible) {
			return;
		}

		visibleTooltipCount++;
		return () => {
			visibleTooltipCount--;
			lastTooltipHiddenAt = Date.now();
		};
	}, [visible]);

	const hide = useCallback(() => {
		activation.current = null;
		if (timer.current !== null) {
			clearTimeout(timer.current);
			timer.current = null;
		}

		setActive(false);
		setVisible(false);
		setPosition(null);
	}, []);

	const show = useCallback(() => {
		if (timer.current !== null) {
			clearTimeout(timer.current);
			timer.current = null;
		}

		setActive(true);
		setVisible(true);
	}, []);

	useLayoutEffect(() => {
		const trigger = triggerRef.current;
		if (!trigger) {
			return;
		}

		const unobserve = observeHover({
			element: trigger,
			onHoverChange: (hovered) => {
				// Keyboard focus is independent of the pointer's location.
				if (activation.current === 'focus') {
					return;
				}

				if (!hovered) {
					hide();
					return;
				}

				activation.current = 'hover';
				const hoverDelay = delayRef.current;
				// Keep adjacent controls instant, including crossing the gap between them.
				if (
					!hoverDelay ||
					visibleTooltipCount > 0 ||
					(lastTooltipHiddenAt !== null &&
						Date.now() - lastTooltipHiddenAt < TOOLTIP_SKIP_DELAY_WINDOW)
				) {
					show();
					return;
				}

				setActive(true);
				timer.current = setTimeout(() => {
					// Recheck before opening, even if the browser missed a leave event.
					if (trigger.isConnected && trigger.matches(':hover')) {
						show();
					} else {
						hide();
					}
				}, hoverDelay);
			},
		});
		return () => {
			unobserve();
			activation.current = null;
			if (timer.current !== null) {
				clearTimeout(timer.current);
				timer.current = null;
			}
		};
	}, [hide, show]);

	useEffect(() => {
		if (!active) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				hide();
			}
		};

		const doc = triggerRef.current?.ownerDocument;
		const win = doc?.defaultView;

		if (!doc || !win) {
			return;
		}

		const onVisibilityChange = () => {
			if (doc.hidden) {
				hide();
			}
		};

		win.addEventListener('keydown', onKeyDown);
		win.addEventListener('blur', hide);
		win.addEventListener('resize', hide);
		win.addEventListener('scroll', hide, true);
		doc.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			if (timer.current !== null) {
				clearTimeout(timer.current);
				timer.current = null;
			}

			win.removeEventListener('keydown', onKeyDown);
			win.removeEventListener('blur', hide);
			win.removeEventListener('resize', hide);
			win.removeEventListener('scroll', hide, true);
			doc.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, [active, hide]);

	useLayoutEffect(() => {
		if (!visible || !triggerRef.current || !tooltipRef.current) {
			return;
		}

		const trigger = triggerRef.current.getBoundingClientRect();
		const tooltip = tooltipRef.current.getBoundingClientRect();
		if (side === 'right') {
			const right = trigger.right + 4;
			setPosition({
				left:
					right + tooltip.width <= window.innerWidth - 8
						? right
						: Math.max(8, trigger.left - tooltip.width - 4),
				top: Math.max(
					8,
					Math.min(
						trigger.top + (trigger.height - tooltip.height) / 2,
						window.innerHeight - tooltip.height - 8,
					),
				),
			});
			return;
		}

		const above = trigger.top - tooltip.height - 4;
		setPosition({
			left: Math.max(
				8,
				Math.min(
					trigger.left + (trigger.width - tooltip.width) / 2,
					window.innerWidth - tooltip.width - 8,
				),
			),
			top: Math.max(
				8,
				Math.min(
					above >= 8 ? above : trigger.bottom + 4,
					window.innerHeight - tooltip.height - 8,
				),
			),
		});
	}, [label, shortcut, side, visible]);

	return (
		<>
			<span
				ref={triggerRef}
				style={{...defaultTriggerStyle, ...triggerStyle}}
				onPointerDownCapture={dismissOnClick ? hide : undefined}
				onClickCapture={dismissOnClick ? hide : undefined}
				onFocus={(event) => {
					if (
						event.currentTarget.contains(event.target) &&
						event.target.matches(':focus-visible')
					) {
						activation.current = 'focus';
						show();
					}
				}}
				onBlur={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) {
						hide();
					}
				}}
			>
				{children}
			</span>
			{visible
				? createPortal(
						<div
							ref={tooltipRef}
							role="tooltip"
							className="css-reset"
							style={{
								...tooltipStyle,
								left: position?.left ?? 0,
								top: position?.top ?? 0,
								visibility: position ? 'visible' : 'hidden',
							}}
						>
							<span style={labelStyle}>{label}</span>
							{shortcut ? (
								<kbd style={shortcutStyle}>
									<KeyboardShortcutLabel shortcut={shortcut} style={null} />
								</kbd>
							) : null}
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
