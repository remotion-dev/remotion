import {PlayerInternals} from '@remotion/player';
import type {PointerEvent} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {CLEAR_HOVER, LIGHT_TEXT} from '../../helpers/colors';
import {useMobileLayout} from '../../helpers/mobile-layout';
import {areKeyboardShortcutsDisabled} from '../../helpers/use-keybinding';
import {CaretRight} from '../../icons/caret';
import {useZIndex} from '../../state/z-index';
import type {SubMenu} from '../NewComposition/ComboBox';
import {Row, Spacing} from '../layout';
import {SubMenuComponent} from './SubMenu';
import {MENU_ITEM_CLASSNAME} from './is-menu-item';
import {getPortal} from './portals';
import {
	MENU_VERTICAL_PADDING,
	SUBMENU_LEFT_INSET,
	menuContainerTowardsBottom,
} from './styles';

const container: React.CSSProperties = {
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 12,
	paddingRight: 8,
	cursor: 'default',
};

const labelStyle: React.CSSProperties = {
	fontSize: 13,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	flex: 1,
};

const keyHintCss: React.CSSProperties = {
	flexDirection: 'row',
	color: LIGHT_TEXT,
	fontSize: 13,
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
	readonly label: React.ReactNode;
	readonly id: string;
	readonly onActionChosen: (
		id: string,
		e: PointerEvent<HTMLDivElement>,
	) => void;
	readonly selected: boolean;
	readonly onItemSelected: (id: string) => void;
	readonly keyHint: string | null;
	readonly leaveLeftSpace: boolean;
	readonly leftItem: React.ReactNode;
	readonly subMenu: SubMenu | null;
	readonly onQuitMenu: () => void;
	readonly onNextMenu: () => void;
	readonly subMenuActivated: SubMenuActivated;
	readonly setSubMenuActivated: React.Dispatch<
		React.SetStateAction<SubMenuActivated>
	>;
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
		shouldApplyCssTransforms: true,
	});
	const mobileLayout = useMobileLayout();
	const {currentZIndex} = useZIndex();

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			backgroundColor: selected ? CLEAR_HOVER : 'transparent',
		};
	}, [selected]);

	const onPointerUp = useCallback(
		(e: PointerEvent<HTMLDivElement>) => {
			if (subMenu) {
				setSubMenuActivated('with-mouse');
				setHovered(true);
				return;
			}

			onActionChosen(id, e);
		},
		[id, onActionChosen, setSubMenuActivated, subMenu],
	);

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

		const left = size.left + size.width + SUBMENU_LEFT_INSET;

		return {
			...menuContainerTowardsBottom,
			left: mobileLayout ? left * 0.7 : left,
			top: size.top - MENU_VERTICAL_PADDING,
		};
	}, [mobileLayout, selected, size, subMenu, subMenuActivated]);

	useEffect(() => {
		if (!hovered || !subMenu) {
			return;
		}

		const hi = setTimeout(() => {
			setSubMenuActivated('with-mouse');
		}, 100);
		return () => clearTimeout(hi);
	}, [hovered, selected, setSubMenuActivated, subMenu]);

	useEffect(() => {
		if (selected) {
			ref.current?.scrollIntoView({
				// block is vertical alignment, inline is horizontal alignment. So we use "block"
				block: 'nearest',
			});
		}
	}, [selected]);

	return (
		<div
			ref={ref}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={style}
			onPointerUp={onPointerUp}
			role="button"
			className={MENU_ITEM_CLASSNAME}
		>
			<Row align="center">
				{leaveLeftSpace ? (
					<>
						<div style={leftSpace}>{leftItem}</div>
						<Spacing x={1} />
					</>
				) : null}
				<div
					style={labelStyle}
					{...{title: typeof label === 'string' ? label : undefined}}
				>
					{label}
				</div>{' '}
				<Spacing x={2} />
				{subMenu ? <CaretRight /> : null}
				{keyHint && !areKeyboardShortcutsDisabled() ? (
					<span style={keyHintCss}>{keyHint}</span>
				) : null}
				{portalStyle && subMenu
					? ReactDOM.createPortal(
							<SubMenuComponent
								onQuitFullMenu={onQuitMenu}
								subMenu={subMenu}
								onQuitSubMenu={onQuitSubmenu}
								portalStyle={portalStyle}
								subMenuActivated={subMenuActivated}
							/>,
							getPortal(currentZIndex),
						)
					: null}
			</Row>
		</div>
	);
};
