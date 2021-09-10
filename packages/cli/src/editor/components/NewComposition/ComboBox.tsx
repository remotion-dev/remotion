import {useElementSize} from '@remotion/player/src/utils/use-element-size';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {noop} from '../../helpers/noop';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {getPortal} from '../Menu/portals';
import {menuContainer, outerPortal} from '../Menu/styles';
import {MenuContent} from './MenuContent';

const container: React.CSSProperties = {
	padding: '6px 8px',
	display: 'inline-block',
	backgroundColor: 'rgba(255, 255, 255, 0.06)',
	fontSize: 15,
	borderWidth: 2,
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
}> = ({values, selectedId}) => {
	const [hovered, setIsHovered] = useState(false);
	const [opened, setOpened] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const {tabIndex, currentZIndex} = useZIndex();
	const size = useElementSize(ref, {
		triggerOnWindowResize: true,
	});

	const onHide = useCallback(() => {
		setOpened(false);
	}, []);

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			userSelect: 'none',
			color: 'white',
			borderColor: getBackgroundFromHoverState({
				hovered,
				selected: false,
			}),
		};
	}, [hovered]);

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

		return {
			...menuContainer,
			left: size.left,
			top: size.top + size.height,
		};
	}, [opened, size]);

	const selected = values.find((v) => v.id === selectedId) as SelectionItem;

	return (
		<>
			<button ref={ref} tabIndex={tabIndex} type="button" style={style}>
				{selected.label}
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={outerPortal}>
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
