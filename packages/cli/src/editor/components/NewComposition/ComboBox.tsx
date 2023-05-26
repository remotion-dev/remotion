import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_HOVERED,
	INPUT_BORDER_COLOR_UNHOVERED,
	SELECTED_BACKGROUND,
} from '../../helpers/colors';
import {noop} from '../../helpers/noop';
import {CaretDown} from '../../icons/caret';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {Spacing} from '../layout';
import {isMenuItem, MENU_INITIATOR_CLASSNAME} from '../Menu/is-menu-item';
import {getPortal} from '../Menu/portals';
import {
	fullScreenOverlay,
	MAX_MENU_WIDTH,
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
	maxWidth: '100%',
};

const label: React.CSSProperties = {
	flex: 1,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	fontSize: 14,
	textAlign: 'left',
};

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
	onClick: (id: string) => void;
	keyHint: string | null;
	leftItem: React.ReactNode;
	subMenu: SubMenu | null;
	quickSwitcherLabel: string | null;
};

export type ComboboxValue = DividerItem | SelectionItem;

export const Combobox: React.FC<{
	values: ComboboxValue[];
	selectedId: string | number;
	style?: React.CSSProperties;
	title: string;
}> = ({values, selectedId, style: customStyle, title}) => {
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

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onMouseEnter = () => setIsHovered(true);
		const onMouseLeave = () => setIsHovered(false);
		const onPointerDown = () => {
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
						}
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

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!opened || !size) {
			return null;
		}

		const spaceToRight = size.windowSize.width - (size.left + size.width);

		const minSpaceToRightRequired = MAX_MENU_WIDTH;

		const verticalLayout = spaceToTop > spaceToBottom ? 'bottom' : 'top';
		const horizontalLayout =
			spaceToRight >= minSpaceToRightRequired ? 'left' : 'right';

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
				: {
						right: size.windowSize.width - size.left - size.width,
				  }),
		};
	}, [opened, size, spaceToBottom, spaceToTop]);

	const selected = values.find((v) => v.id === selectedId) as
		| SelectionItem
		| undefined;

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			...(customStyle ?? {}),
			userSelect: 'none',
			color: 'white',
			display: 'inline-flex',
			flexDirection: 'row',
			alignItems: 'center',
			borderColor: opened
				? SELECTED_BACKGROUND
				: hovered
				? INPUT_BORDER_COLOR_HOVERED
				: INPUT_BORDER_COLOR_UNHOVERED,
		};
	}, [customStyle, hovered, opened]);

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
						style={label}
					>
						{selected?.label}
					</div>
				) : null}
				<Spacing x={1} /> <CaretDown />
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay}>
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
												(v) => selected && v.id === selected.id
											)}
											topItemCanBeUnselected={false}
											fixedHeight={derivedMaxHeight}
										/>
									</div>
								</HigherZIndex>
							</div>
						</div>,
						getPortal(currentZIndex)
				  )
				: null}
		</>
	);
};
