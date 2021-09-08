import React, {useCallback, useMemo} from 'react';
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
	onActionChosen: (id: string) => void;
	selected: boolean;
	onItemSelected: (id: string) => void;
}> = ({label, onActionChosen, id, selected, onItemSelected}) => {
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
	}, [id, onItemSelected]);

	return (
		<div
			className={MENU_SUBMENU_BUTTON_CLASS_NAME}
			onPointerEnter={onPointerEnter}
			style={style}
			onClick={onClick}
		>
			{label}
		</div>
	);
};
