import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {
	LIGHT_TEXT,
	WHITE,
	WHITE_ALPHA_80,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {noop} from '../helpers/noop';
import {CaretDown} from '../icons/caret';
import {HigherZIndex, useZIndex} from '../state/z-index';
import type {RenderInlineAction} from './InlineAction';
import {Spacing} from './layout';
import {MENU_INITIATOR_CLASSNAME, isMenuItem} from './Menu/is-menu-item';
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

const container: React.CSSProperties = {
	boxSizing: 'border-box',
	border: 'none',
	borderRadius: 3,
	height: 24,
	padding: '0 4px',
	fontFamily: 'inherit',
	maxWidth: '100%',
};

const label: React.CSSProperties = {
	flex: 'none',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	fontFamily: 'inherit',
	fontSize: 12,
	lineHeight: '16px',
	color: WHITE_ALPHA_80,
	minWidth: 0,
	textAlign: 'left',
	whiteSpace: 'nowrap',
};

type SelectionItem = Extract<ComboboxValue, {type: 'item'}>;

export const TimelineCombobox: React.FC<{
	readonly values: ComboboxValue[];
	readonly selectedId: string | number;
	readonly title: string;
	readonly labelWidth?: number;
	readonly renderLeftItem?: RenderInlineAction;
	readonly unhoveredIconColor?: string;
}> = ({
	values,
	selectedId,
	title,
	labelWidth = 32,
	renderLeftItem,
	unhoveredIconColor = LIGHT_TEXT,
}) => {
	const [hovered, setIsHovered] = useState(false);
	const [opened, setOpened] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const {tabIndex, currentZIndex} = useZIndex();
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const refresh = size?.refresh;

	const onHide = useCallback(() => {
		setOpened(false);
	}, []);

	const onOverlayPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
		},
		[],
	);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onMouseEnter = () => setIsHovered(true);
		const onMouseLeave = () => setIsHovered(false);
		const onPointerDown = (e: PointerEvent) => {
			e.stopPropagation();

			return setOpened((isOpened) => {
				if (!isOpened) {
					refresh?.();
				}

				return !isOpened;
			});
		};

		const onClick = (e: MouseEvent | PointerEvent) => {
			e.stopPropagation();
			const isKeyboardInitiated = e.detail === 0;
			if (!isKeyboardInitiated) {
				return;
			}

			return setOpened((isOpened) => {
				if (!isOpened) {
					refresh?.();

					window.addEventListener(
						'pointerup',
						(evt) => {
							if (!isMenuItem(evt.target as HTMLElement)) {
								setOpened(false);
							}
						},
						{once: true},
					);
				}

				return !isOpened;
			});
		};

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
		current.addEventListener('pointerdown', onPointerDown);
		current.addEventListener('click', onClick);

		return () => {
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
			current.removeEventListener('pointerdown', onPointerDown);
			current.removeEventListener('click', onClick);
		};
	}, [refresh]);

	const spaceToBottom = useMemo(() => {
		const margin = 10;
		if (size && opened) {
			return size.windowSize.height - (size.top + size.height) - margin;
		}

		return 0;
	}, [opened, size]);

	const spaceToTop = useMemo(() => {
		const margin = 10;
		if (size && opened) {
			return size.top - margin;
		}

		return 0;
	}, [opened, size]);

	const derivedMaxHeight = useMemo(() => {
		return spaceToTop > spaceToBottom ? spaceToTop : spaceToBottom;
	}, [spaceToBottom, spaceToTop]);

	const isMobileLayout = useMobileLayout();

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!opened || !size) {
			return null;
		}

		const spaceToRight = size.windowSize.width - size.left;
		const spaceToLeft = size.left + size.width;
		const minSpaceRequired = isMobileLayout
			? MAX_MOBILE_MENU_WIDTH
			: MAX_MENU_WIDTH;
		const verticalLayout = spaceToTop > spaceToBottom ? 'bottom' : 'top';
		const canOpenOnLeft = spaceToLeft >= minSpaceRequired;
		const canOpenOnRight = spaceToRight >= minSpaceRequired;
		const horizontalLayout = canOpenOnRight ? 'left' : 'right';

		return {
			...(verticalLayout === 'top'
				? {
						...menuContainerTowardsBottom,
						top: size.top + size.height,
					}
				: {
						...menuContainerTowardsTop,
						bottom: size.windowSize.height - size.top,
					}),
			...(horizontalLayout === 'left'
				? {left: size.left}
				: canOpenOnLeft
					? {right: size.windowSize.width - size.left - size.width}
					: {left: 0}),
		};
	}, [isMobileLayout, opened, size, spaceToBottom, spaceToTop]);

	const selected = values.find((value) => value.id === selectedId) as
		| SelectionItem
		| undefined;

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			userSelect: 'none',
			WebkitUserSelect: 'none',
			display: 'inline-flex',
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: getBackgroundFromHoverState({
				hovered,
				selected: opened,
			}),
		};
	}, [hovered, opened]);
	const foregroundColor = hovered || opened ? WHITE : WHITE_ALPHA_80;
	const labelStyle = useMemo((): React.CSSProperties => {
		return {
			...label,
			width: labelWidth,
			color: foregroundColor,
		};
	}, [foregroundColor, labelWidth]);

	return (
		<>
			<button
				ref={ref}
				title={title}
				aria-label={title}
				tabIndex={tabIndex}
				type="button"
				style={style}
				className={MENU_INITIATOR_CLASSNAME}
			>
				{renderLeftItem ? (
					<>
						{renderLeftItem(foregroundColor)}
						<Spacing x={0.5} />
					</>
				) : null}
				{selected ? (
					<div
						title={
							typeof selected.label === 'string' ? selected.label : undefined
						}
						style={labelStyle}
					>
						{selected.label}
					</div>
				) : null}
				<Spacing x={0.5} />
				<CaretDown color={hovered || opened ? WHITE : unhoveredIconColor} />
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay} onPointerDown={onOverlayPointerDown}>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex onOutsideClick={onHide} onEscape={onHide}>
									<div style={portalStyle}>
										<MenuContent
											onNextMenu={noop}
											onPreviousMenu={noop}
											values={values}
											onHide={onHide}
											leaveLeftSpace
											preselectIndex={values.findIndex(
												(value) => selected && value.id === selected.id,
											)}
											topItemCanBeUnselected={false}
											fixedHeight={derivedMaxHeight}
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
