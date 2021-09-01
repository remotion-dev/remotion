import React, {useCallback, useMemo, useState} from 'react';
import {CLEAR_HOVER} from '../../helpers/colors';

const container: React.CSSProperties = {
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 12,
	paddingRight: 8,
	fontSize: 13,
	cursor: 'default',
};
export const MENU_SUBMENU_BUTTON_CLASS_NAME = 'remotion-submenu-button';

export const MenuSubItem: React.FC<{
	label: React.ReactNode;
	id: string;
	onActionSelected: (id: string) => void;
}> = ({label, onActionSelected, id}) => {
	const [hovered, setHovered] = useState(false);

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			backgroundColor: hovered ? CLEAR_HOVER : 'transparent',
		};
	}, [hovered]);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onClick = useCallback(() => {
		onActionSelected(id);
	}, [id, onActionSelected]);

	return (
		<div
			className={MENU_SUBMENU_BUTTON_CLASS_NAME}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={style}
			onClick={onClick}
		>
			{label}
		</div>
	);
};
