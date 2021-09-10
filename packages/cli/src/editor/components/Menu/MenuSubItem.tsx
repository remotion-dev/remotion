import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {CLEAR_HOVER, LIGHT_TEXT} from '../../helpers/colors';
import {Caret} from '../../icons/caret';
import {useZIndex} from '../../state/z-index';
import {Flex, Row, Spacing} from '../layout';
import {SubMenu} from '../NewComposition/ComboBox';
import {getPortal} from './portals';
import {
	menuContainer,
	MENU_VERTICAL_PADDING,
	SUBMENU_LEFT_INSET,
} from './styles';
import {SubMenuComponent} from './SubMenu';

const container: React.CSSProperties = {
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 12,
	paddingRight: 8,
	fontSize: 13,
	cursor: 'default',
};
export const MENU_SUBMENU_BUTTON_CLASS_NAME = 'remotion-submenu-button';

const keyHintCss: React.CSSProperties = {
	flexDirection: 'row',
	color: LIGHT_TEXT,
};

const leftSpace: React.CSSProperties = {
	width: 24,
	marginLeft: -6,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
};

export type SubMenuActivated = false | 'with-mouse' | 'without-mouse';

export const MenuSubItem: React.FC<{
	label: React.ReactNode;
	id: string;
	onActionChosen: (id: string) => void;
	selected: boolean;
	onItemSelected: (id: string) => void;
	keyHint: string | null;
	leaveLeftSpace: boolean;
	leftItem: React.ReactNode;
	subMenu: SubMenu | null;
	onQuitMenu: () => void;
	onNextMenu: () => void;
	subMenuActivated: SubMenuActivated;
	setSubMenuActivated: React.Dispatch<React.SetStateAction<SubMenuActivated>>;
}> = ({
	label,
	leaveLeftSpace,
	leftItem,
	onActionChosen,
	id,
	selected,
	onItemSelected,
	keyHint,
	subMenu,
	onQuitMenu,
	subMenuActivated,
	setSubMenuActivated,
}) => {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
	});
	const {currentZIndex} = useZIndex();

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			backgroundColor: selected ? CLEAR_HOVER : 'transparent',
		};
	}, [selected]);

	const onClick = useCallback(() => {
		onActionChosen(id);
	}, [id, onActionChosen]);

	const onPointerEnter = useCallback(() => {
		onItemSelected(id);
		setHovered(true);
	}, [id, onItemSelected]);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onQuitSubmenu = useCallback(() => {
		setSubMenuActivated(false);
	}, [setSubMenuActivated]);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!selected || !size || !subMenu || !subMenuActivated) {
			return null;
		}

		return {
			...menuContainer,
			left: size.left + size.width + SUBMENU_LEFT_INSET,
			top: size.top - MENU_VERTICAL_PADDING,
		};
	}, [selected, size, subMenu, subMenuActivated]);

	useEffect(() => {
		if (!hovered || !subMenu) {
			return;
		}

		const hi = setTimeout(() => {
			setSubMenuActivated('with-mouse');
		}, 100);
		return () => clearTimeout(hi);
	}, [hovered, selected, setSubMenuActivated, subMenu]);

	return (
		<div
			ref={ref}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={style}
			onClick={onClick}
		>
			<Row>
				{leaveLeftSpace ? (
					<>
						<div style={leftSpace}>{leftItem}</div>
						<Spacing x={1} />
					</>
				) : null}
				<div>{label}</div> <Flex />
				<Spacing x={2} />
				{subMenu ? <Caret /> : null}
				{keyHint ? <div style={keyHintCss}>{keyHint}</div> : null}
				{portalStyle && subMenu
					? ReactDOM.createPortal(
							<SubMenuComponent
								onQuitFullMenu={onQuitMenu}
								subMenu={subMenu}
								onQuitSubMenu={onQuitSubmenu}
								portalStyle={portalStyle}
								subMenuActivated={subMenuActivated}
							/>,
							getPortal(currentZIndex)
					  )
					: null}
			</Row>
		</div>
	);
};
