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
import {Flex, Spacing} from '../layout';
import {getPortal} from '../Menu/portals';
import {
	menuContainerTowardsBottom,
	menuContainerTowardsTop,
	outerPortal,
} from '../Menu/styles';
import {MenuContent} from './MenuContent';

const container: React.CSSProperties = {
	padding: '8px 10px',
	display: 'inline-block',
	backgroundColor: INPUT_BACKGROUND,
	fontSize: 14,
	borderWidth: 1,
	borderStyle: 'solid',
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

type SelectionItem = {
	type: 'item';
	id: string;
	label: React.ReactNode;
	value: string | number;
	onClick: (id: string) => void;
	keyHint: string | null;
	leftItem: React.ReactNode;
	subMenu: SubMenu | null;
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
		const onClick = (e: MouseEvent) => {
			e.stopPropagation();
			return setOpened((o) => !o);
		};

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
		current.addEventListener('click', onClick);

		return () => {
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
			current.removeEventListener('click', onClick);
		};
	}, []);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!opened || !size) {
			return null;
		}

		const spaceToBottom = size.windowSize.height - (size.top + size.height);
		const spaceToTop = size.top;

		const layout = spaceToTop > spaceToBottom ? 'bottom' : 'top';

		return {
			...(layout === 'top'
				? {
						...menuContainerTowardsBottom,
						top: size.top + size.height,
				  }
				: {
						...menuContainerTowardsTop,

						bottom: size.windowSize.height - size.top,
				  }),
			left: size.left,
		};
	}, [opened, size]);

	const selected = values.find((v) => v.id === selectedId) as SelectionItem;

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
			>
				{selected.label} <Flex /> <Spacing x={1} /> <CaretDown />
			</button>
			{portalStyle
				? ReactDOM.createPortal(
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
											(v) => v.id === selected.id
										)}
										topItemCanBeUnselected={false}
									/>
								</div>
							</HigherZIndex>
						</div>,
						getPortal(currentZIndex)
				  )
				: null}
		</>
	);
};
