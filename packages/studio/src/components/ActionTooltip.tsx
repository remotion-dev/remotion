import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {createPortal} from 'react-dom';
import {
	TIMELINE_BACKGROUND_COLOR,
	WHITE_ALPHA_10,
	WHITE_ALPHA_90,
} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import {getPortal} from './Menu/portals';
import {SHADOW_TOWARDS_TOP} from './Menu/styles';

const triggerStyle: React.CSSProperties = {display: 'inline-flex'};

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
	backgroundColor: WHITE_ALPHA_10,
	borderRadius: 3,
	padding: '0 4px',
	minWidth: 16,
	textAlign: 'center',
	whiteSpace: 'nowrap',
	flexShrink: 0,
};

let visibleTooltipCount = 0;
let lastTooltipHiddenAt: number | null = null;
const TOOLTIP_SKIP_DELAY_WINDOW = 300;

export const ActionTooltip: React.FC<{
	readonly label: string;
	readonly shortcut: string | null;
	/** Hover delay in milliseconds. Pass null to show immediately. */
	readonly delay: number | null;
	readonly dismissOnClick: boolean;
	readonly children: React.ReactNode;
}> = ({label, shortcut, delay, dismissOnClick, children}) => {
	const triggerRef = useRef<HTMLSpanElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState<{left: number; top: number} | null>(
		null,
	);
	const {currentZIndex} = useZIndex();

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
		if (timer.current !== null) {
			clearTimeout(timer.current);
			timer.current = null;
		}

		setVisible(false);
		setPosition(null);
	}, []);

	const show = useCallback(() => {
		if (timer.current !== null) {
			clearTimeout(timer.current);
			timer.current = null;
		}

		setVisible(true);
	}, []);

	const onPointerEnter = useCallback(
		(event: React.PointerEvent<HTMLSpanElement>) => {
			if (
				event.pointerType === 'touch' ||
				timer.current !== null ||
				!event.currentTarget.contains(event.target as Node)
			) {
				return;
			}

			// Keep adjacent controls instant, including crossing the gap between them.
			if (
				!delay ||
				visibleTooltipCount > 0 ||
				(lastTooltipHiddenAt !== null &&
					Date.now() - lastTooltipHiddenAt < TOOLTIP_SKIP_DELAY_WINDOW)
			) {
				show();
				return;
			}

			timer.current = setTimeout(show, delay);
		},
		[delay, show],
	);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				hide();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('blur', hide);
		window.addEventListener('resize', hide);
		window.addEventListener('scroll', hide, true);
		return () => {
			if (timer.current !== null) {
				clearTimeout(timer.current);
			}

			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('blur', hide);
			window.removeEventListener('resize', hide);
			window.removeEventListener('scroll', hide, true);
		};
	}, [hide]);

	useLayoutEffect(() => {
		if (!visible || !triggerRef.current || !tooltipRef.current) {
			return;
		}

		const trigger = triggerRef.current.getBoundingClientRect();
		const tooltip = tooltipRef.current.getBoundingClientRect();
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
	}, [label, shortcut, visible]);

	return (
		<>
			<span
				ref={triggerRef}
				style={triggerStyle}
				onPointerEnter={onPointerEnter}
				onPointerLeave={hide}
				onPointerDownCapture={dismissOnClick ? hide : undefined}
				onClickCapture={dismissOnClick ? hide : undefined}
				onFocus={(event) => {
					if (event.currentTarget.contains(event.target)) {
						show();
					}
				}}
				onBlur={hide}
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
							{shortcut ? <kbd style={shortcutStyle}>{shortcut}</kbd> : null}
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
