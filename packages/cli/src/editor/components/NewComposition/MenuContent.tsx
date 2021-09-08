import React, {useCallback, useEffect} from 'react';
import {useKeybinding} from '../../helpers/use-keybinding';
import {MenuDivider} from '../Menu/MenuDivider';
import {MenuSubItem} from '../Menu/MenuSubItem';
import {ComboboxValue} from './ComboBox';

export const MenuContent: React.FC<{
	values: ComboboxValue[];
	onHide: () => void;
	onArrowLeft: () => void;
	onArrowRight: () => void;
}> = ({onHide, values, onArrowLeft, onArrowRight}) => {
	const keybindings = useKeybinding();
	const onEscape = useCallback(() => {
		onHide();
	}, [onHide]);

	useEffect(() => {
		keybindings.stashOther();
	}, [keybindings]);

	useEffect(() => {
		const escapeBinding = keybindings.registerKeybinding(
			'keydown',
			'Escape',
			onEscape
		);
		const leftBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowLeft',
			onArrowLeft
		);
		const rightBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowRight',
			onArrowRight
		);
		return () => {
			escapeBinding.unregister();
			leftBinding.unregister();
			rightBinding.unregister();
		};
	}, [keybindings, onEscape, onArrowLeft, onArrowRight]);

	return (
		<div>
			{values.map((item) => {
				if (item.type === 'divider') {
					return <MenuDivider key={item.id} />;
				}

				const onClick = () => {
					onHide();
					item.onClick(item.id);
				};

				return (
					<MenuSubItem
						key={item.id}
						onActionSelected={onClick}
						label={item.label}
						id={item.id}
					/>
				);
			})}
		</div>
	);
};
