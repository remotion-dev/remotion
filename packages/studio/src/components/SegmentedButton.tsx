import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {
	CURRENT_COLOR,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {useMobileLayout} from '../helpers/mobile-layout';
import {noop} from '../helpers/noop';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {MENU_INITIATOR_CLASSNAME} from './Menu/is-menu-item';
import {getPortal} from './Menu/portals';
import {
	MAX_MENU_WIDTH,
	MAX_MOBILE_MENU_WIDTH,
	fullScreenOverlay,
	menuContainerTowardsBottom,
	menuContainerTowardsTop,
	outerPortal,
} from './Menu/styles';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {MenuContent} from './NewComposition/MenuContent';

type SegmentedButtonSegmentCommon = {
	readonly ariaLabel: string;
	readonly buttonId: string | null;
	readonly disabled: boolean;
	readonly idleColor: string;
	readonly renderContent: (color: string) => React.ReactNode;
	readonly segmentId: string;
	readonly style: React.CSSProperties | null;
	readonly title: string | null;
};

export type SegmentedButtonSegment = SegmentedButtonSegmentCommon &
	(
		| {
				readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
				readonly onPointerDown: React.PointerEventHandler<HTMLButtonElement> | null;
				readonly type: 'action';
		  }
		| {
				readonly leaveLeftSpace: boolean;
				readonly onOpenChange: ((open: boolean) => void) | null;
				readonly selectedId: string | number | null;
				readonly type: 'menu';
				readonly values: ComboboxValue[];
		  }
	);

const SEGMENTED_BUTTON_BORDER_RADIUS = 6;

const containerStyle: React.CSSProperties = {
	alignItems: 'center',
	borderRadius: SEGMENTED_BUTTON_BORDER_RADIUS,
	boxSizing: 'border-box',
	display: 'inline-flex',
	flexDirection: 'row',
	flexShrink: 0,
	gap: 1,
	height: 24,
	overflow: 'hidden',
};

const segmentStyle: React.CSSProperties = {
	alignItems: 'center',
	appearance: 'none',
	border: 'none',
	boxSizing: 'border-box',
	cursor: 'default',
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	height: '100%',
	justifyContent: 'center',
	lineHeight: '16px',
	margin: 0,
	minWidth: 0,
	padding: '0 6px',
	whiteSpace: 'nowrap',
};

const getSegmentBorderRadius = ({
	index,
	segmentCount,
}: {
	readonly index: number;
	readonly segmentCount: number;
}) => {
	if (segmentCount === 1) {
		return SEGMENTED_BUTTON_BORDER_RADIUS;
	}

	if (index === 0) {
		return `${SEGMENTED_BUTTON_BORDER_RADIUS}px 0 0 ${SEGMENTED_BUTTON_BORDER_RADIUS}px`;
	}

	if (index === segmentCount - 1) {
		return `0 ${SEGMENTED_BUTTON_BORDER_RADIUS}px ${SEGMENTED_BUTTON_BORDER_RADIUS}px 0`;
	}

	return 0;
};

const preventPointerFocus = (event: React.PointerEvent<HTMLButtonElement>) => {
	if (event.button !== 0) {
		return;
	}

	if (document.activeElement instanceof HTMLElement) {
		document.activeElement.blur();
	}

	event.preventDefault();
};

const preventMouseFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
	event.stopPropagation();
	if (event.button !== 0) {
		return;
	}

	if (document.activeElement instanceof HTMLElement) {
		document.activeElement.blur();
	}

	event.preventDefault();
};

const SegmentedButtonAction: React.FC<{
	readonly index: number;
	readonly segment: Extract<SegmentedButtonSegment, {type: 'action'}>;
	readonly segmentCount: number;
}> = ({index, segment, segmentCount}) => {
	const {tabIndex} = useZIndex();
	const style = useMemo((): React.CSSProperties => {
		return {
			...segmentStyle,
			borderRadius: getSegmentBorderRadius({index, segmentCount}),
			opacity: segment.disabled ? 0.5 : 1,
			...hoverableStyle({
				idleBackground: TRANSPARENT,
				hoverBackground: segment.disabled
					? TRANSPARENT
					: getBackgroundFromHoverState({hovered: true, selected: false}),
				idleColor: segment.idleColor,
				hoverColor: segment.disabled ? segment.idleColor : WHITE,
			}),
			...segment.style,
		};
	}, [index, segment, segmentCount]);

	const onClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			segment.onClick(event);
		},
		[segment],
	);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			segment.onPointerDown?.(event);
			preventPointerFocus(event);
		},
		[segment],
	);

	return (
		<button
			aria-label={segment.ariaLabel}
			className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
			disabled={segment.disabled}
			id={segment.buttonId ?? undefined}
			onClick={onClick}
			onMouseDown={preventMouseFocus}
			onPointerDown={onPointerDown}
			style={style}
			tabIndex={tabIndex}
			title={segment.title ?? undefined}
			type="button"
		>
			{segment.renderContent(CURRENT_COLOR)}
		</button>
	);
};

const SegmentedButtonMenu: React.FC<{
	readonly index: number;
	readonly segment: Extract<SegmentedButtonSegment, {type: 'menu'}>;
	readonly segmentCount: number;
}> = ({index, segment, segmentCount}) => {
	const [opened, setOpened] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const {currentZIndex, tabIndex} = useZIndex();
	const isMobileLayout = useMobileLayout();
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const refresh = size?.refresh;

	const onHide = useCallback(() => {
		setOpened(false);
		segment.onOpenChange?.(false);
	}, [segment]);
	const onOutsideClick = useCallback(
		(target: Node) => {
			if (ref.current?.contains(target)) {
				return;
			}

			onHide();
		},
		[onHide],
	);

	const onClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.preventDefault();
			event.stopPropagation();
			if (segment.values.length === 0) {
				return;
			}

			refresh?.();
			setOpened((currentlyOpened) => {
				const next = !currentlyOpened;
				segment.onOpenChange?.(next);
				return next;
			});
		},
		[refresh, segment],
	);
	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			preventPointerFocus(event);
		},
		[],
	);

	const spaceToBottom = useMemo(() => {
		if (!size || !opened) {
			return 0;
		}

		return size.windowSize.height - (size.top + size.height) - 10;
	}, [opened, size]);

	const spaceToTop = useMemo(() => {
		if (!size || !opened) {
			return 0;
		}

		return size.top - 10;
	}, [opened, size]);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!opened || !size) {
			return null;
		}

		const minSpaceRequired = isMobileLayout
			? MAX_MOBILE_MENU_WIDTH
			: MAX_MENU_WIDTH;
		const spaceToRight = size.windowSize.width - size.left;
		const spaceToLeft = size.left + size.width;
		const canOpenOnLeft = spaceToLeft >= minSpaceRequired;
		const canOpenOnRight = spaceToRight >= minSpaceRequired;
		const openTowardsTop = spaceToTop > spaceToBottom;

		return {
			...(openTowardsTop
				? {
						...menuContainerTowardsTop,
						bottom: size.windowSize.height - size.top,
					}
				: {
						...menuContainerTowardsBottom,
						top: size.top + size.height,
					}),
			...(canOpenOnRight
				? {left: size.left}
				: canOpenOnLeft
					? {right: size.windowSize.width - size.left - size.width}
					: {left: 0}),
		};
	}, [isMobileLayout, opened, size, spaceToBottom, spaceToTop]);

	const style = useMemo((): React.CSSProperties => {
		return {
			...segmentStyle,
			borderRadius: getSegmentBorderRadius({index, segmentCount}),
			opacity: segment.disabled ? 0.5 : 1,
			...hoverableStyle({
				idleBackground: opened
					? getBackgroundFromHoverState({hovered: false, selected: true})
					: TRANSPARENT,
				hoverBackground: segment.disabled
					? TRANSPARENT
					: getBackgroundFromHoverState({hovered: true, selected: opened}),
				idleColor: opened ? WHITE : segment.idleColor,
				hoverColor: segment.disabled ? segment.idleColor : WHITE,
			}),
			...segment.style,
		};
	}, [index, opened, segment, segmentCount]);

	return (
		<>
			<button
				ref={ref}
				aria-expanded={opened}
				aria-haspopup="menu"
				aria-label={segment.ariaLabel}
				className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME} ${MENU_INITIATOR_CLASSNAME}`}
				disabled={segment.disabled}
				id={segment.buttonId ?? undefined}
				onClick={onClick}
				onMouseDown={preventMouseFocus}
				onPointerDown={onPointerDown}
				style={style}
				tabIndex={tabIndex}
				title={segment.title ?? undefined}
				type="button"
			>
				{segment.renderContent(CURRENT_COLOR)}
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div
							style={fullScreenOverlay}
							onPointerDown={(event) => event.stopPropagation()}
						>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex onOutsideClick={onOutsideClick} onEscape={onHide}>
									<div style={portalStyle}>
										<MenuContent
											fixedHeight={Math.max(spaceToBottom, spaceToTop)}
											leaveLeftSpace={segment.leaveLeftSpace}
											onHide={onHide}
											onNextMenu={noop}
											onPreviousMenu={noop}
											preselectIndex={
												segment.selectedId === null
													? false
													: segment.values.findIndex(
															(value) => value.id === segment.selectedId,
														)
											}
											topItemCanBeUnselected={false}
											values={segment.values}
										/>
									</div>
								</HigherZIndex>
							</div>
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};

export const SegmentedButton: React.FC<{
	readonly segments: SegmentedButtonSegment[];
	readonly style: React.CSSProperties | null;
	readonly title: string | null;
}> = ({segments, style, title}) => {
	return (
		<div style={{...containerStyle, ...style}} title={title ?? undefined}>
			{segments.map((segment, index) => {
				if (segment.type === 'action') {
					return (
						<SegmentedButtonAction
							key={segment.segmentId}
							index={index}
							segment={segment}
							segmentCount={segments.length}
						/>
					);
				}

				return (
					<SegmentedButtonMenu
						key={segment.segmentId}
						index={index}
						segment={segment}
						segmentCount={segments.length}
					/>
				);
			})}
		</div>
	);
};
