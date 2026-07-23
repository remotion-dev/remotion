import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {
	INPUT_BACKGROUND,
	WHITE_ALPHA_05,
	BLACK_ALPHA_60,
	SELECTED_BACKGROUND,
	WHITE,
} from '../../helpers/colors';
import {useMobileLayout} from '../../helpers/mobile-layout';
import {noop} from '../../helpers/noop';
import {CaretDown} from '../../icons/caret';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {COMPACT_CONTROL_ROW_HEIGHT, Spacing} from '../layout';
import {MENU_INITIATOR_CLASSNAME, isMenuItem} from '../Menu/is-menu-item';
import {getPortal} from '../Menu/portals';
import {
	MAX_MENU_WIDTH,
	MAX_MOBILE_MENU_WIDTH,
	fullScreenOverlay,
	menuContainerTowardsBottom,
	menuContainerTowardsTop,
	outerPortal,
} from '../Menu/styles';
import {MenuContent} from './MenuContent';

const container: React.CSSProperties = {
	padding: '8px 10px',
	display: 'inline-block',
	backgroundColor: INPUT_BACKGROUND,
	borderWidth: 1,
	borderStyle: 'solid',
	borderRadius: 4,
	fontFamily: 'inherit',
	maxWidth: '100%',
};

const compactContainer: React.CSSProperties = {
	...container,
	boxSizing: 'border-box',
	borderRadius: 0,
	height: COMPACT_CONTROL_ROW_HEIGHT + 2,
	padding: '5px 6px',
};

const smallContainer: React.CSSProperties = {
	...container,
	padding: '3px 4px',
};

const label: React.CSSProperties = {
	flex: 1,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 14,
	lineHeight: '21px',
	minWidth: 0,
	textAlign: 'left',
	whiteSpace: 'nowrap',
};

const compactLabel: React.CSSProperties = {
	...label,
	fontSize: 12,
	lineHeight: '16px',
};

const smallLabel: React.CSSProperties = {
	...label,
	fontSize: 11,
	lineHeight: '12px',
};

export type ComboboxSize = 'default' | 'compact' | 'small';

type DividerItem = {
	type: 'divider';
	id: string;
};

export type SubMenu = {
	preselectIndex: number | false;
	leaveLeftSpace: boolean;
	items: ComboboxValue[];
};

export type SelectionItem = {
	type: 'item';
	id: string;
	label: React.ReactNode;
	value: string | number;
	onClick: (id: string, e: React.PointerEvent | null) => void;
	keyHint: string | null;
	leftItem: React.ReactNode;
	subMenu: SubMenu | null;
	quickSwitcherLabel: string | null;
	disabled?: boolean;
};

export type ComboboxValue = DividerItem | SelectionItem;

export const Combobox: React.FC<{
	readonly values: ComboboxValue[];
	readonly selectedId: string | number;
	readonly style?: React.CSSProperties;
	readonly title: string;
	readonly size?: ComboboxSize;
}> = ({
	values,
	selectedId,
	style: customStyle,
	title,
	size: controlSize = 'default',
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
			// Prevent deselection of currently selected items
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
			// Prevent deselection of currently selected items
			e.stopPropagation();

			return setOpened((o) => {
				if (!o) {
					refresh?.();
				}

				return !o;
			});
		};

		const onClick = (e: MouseEvent | PointerEvent) => {
			e.stopPropagation();
			const isKeyboardInitiated = e.detail === 0;
			if (!isKeyboardInitiated) {
				return;
			}

			return setOpened((o) => {
				if (!o) {
					refresh?.();

					window.addEventListener(
						'pointerup',
						(evt) => {
							if (!isMenuItem(evt.target as HTMLElement)) {
								setOpened(false);
							}
						},
						{
							once: true,
						},
					);
				}

				return !o;
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
				? {
						left: size.left,
					}
				: canOpenOnLeft
					? {
							right: size.windowSize.width - size.left - size.width,
						}
					: {left: 0}),
		};
	}, [isMobileLayout, opened, size, spaceToBottom, spaceToTop]);

	const selected = values.find((v) => v.id === selectedId) as
		| SelectionItem
		| undefined;

	const style = useMemo((): React.CSSProperties => {
		return {
			...(controlSize === 'small'
				? smallContainer
				: controlSize === 'compact'
					? compactContainer
					: container),
			...(customStyle ?? {}),
			userSelect: 'none',
			WebkitUserSelect: 'none',
			color: WHITE,
			display: 'inline-flex',
			flexDirection: 'row',
			alignItems: 'center',
			borderColor: opened
				? SELECTED_BACKGROUND
				: hovered
					? WHITE_ALPHA_05
					: BLACK_ALPHA_60,
		};
	}, [controlSize, customStyle, hovered, opened]);

	const selectedLabelStyle =
		controlSize === 'small'
			? smallLabel
			: controlSize === 'compact'
				? compactLabel
				: label;

	return (
		<>
			<button
				ref={ref}
				title={title}
				tabIndex={tabIndex}
				type="button"
				style={style}
				className={MENU_INITIATOR_CLASSNAME}
			>
				{selected ? (
					<div
						title={
							typeof selected.label === 'string' ? selected.label : undefined
						}
						style={selectedLabelStyle}
					>
						{selected?.label}
					</div>
				) : null}
				<Spacing x={controlSize === 'default' ? 1 : 0.5} />{' '}
				<CaretDown small={controlSize === 'small'} />
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
												(v) => selected && v.id === selected.id,
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
