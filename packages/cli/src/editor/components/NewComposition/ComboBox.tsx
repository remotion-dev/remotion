import {useElementSize} from '@remotion/player/src/utils/use-element-size';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {BACKGROUND, getBackgroundFromHoverState} from '../../helpers/colors';
import {FONT_FAMILY} from '../../helpers/font';
import {noop} from '../../helpers/noop';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {SUBMENU_CONTAINER_CLASS_NAME} from '../Menu/is-menu-click';
import {MenuContent} from './MenuContent';

const container: React.CSSProperties = {
	padding: '10px 16px',
	display: 'inline-block',
	backgroundColor: 'rgba(255, 255, 255, 0.06)',
	borderRadius: 5,
	fontSize: 15,
	borderWidth: 2,
	borderStyle: 'solid',
};

const menuContainer: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	position: 'fixed',
	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
	color: 'white',
	fontFamily: FONT_FAMILY,
	paddingTop: 4,
	paddingBottom: 4,
	userSelect: 'none',
	minWidth: 200,
};

const outerPortal: React.CSSProperties = {
	position: 'fixed',
	height: '100%',
	width: '100%',
};

type DividerItem = {
	type: 'divider';
	id: string;
};

type SelectionItem = {
	type: 'item';
	id: string;
	label: React.ReactNode;
	value: string | number;
	onClick: (id: string) => void;
};

export type ComboboxValue = DividerItem | SelectionItem;

const portal = document.getElementById('menuportal') as Element;

export const Combobox: React.FC<{
	values: ComboboxValue[];
	selectedId: string | number;
}> = ({values, selectedId}) => {
	const [hovered, setIsHovered] = useState(false);
	const [opened, setOpened] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const {tabIndex} = useZIndex();
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
		const onClick = () => setOpened((o) => !o);

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
		current.addEventListener('click', onClick);

		return () => {
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
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

	const outerStyle = useMemo(() => {
		return {
			...outerPortal,
			top: (size?.top ?? 0) + (size?.height ?? 0),
		};
	}, [size]);

	const selected = values.find((v) => v.id === selectedId) as SelectionItem;

	return (
		<>
			<button ref={ref} tabIndex={tabIndex} type="button" style={style}>
				{selected.label}
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<HigherZIndex onEscape={onHide}>
							<div style={outerStyle}>
								<div
									className={SUBMENU_CONTAINER_CLASS_NAME}
									style={portalStyle}
								>
									<MenuContent
										onArrowLeft={noop}
										onArrowRight={noop}
										values={values}
										onHide={onHide}
									/>
								</div>
							</div>
						</HigherZIndex>,
						portal
				  )
				: null}
		</>
	);
};
