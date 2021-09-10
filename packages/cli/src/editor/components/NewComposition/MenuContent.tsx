import React, {useCallback, useEffect, useState} from 'react';
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

	const [selectedItem, setSelectedItem] = useState<string | null>(null);

	const onEscape = useCallback(() => {
		onHide();
	}, [onHide]);

	const onItemSelected = useCallback((id: string) => {
		setSelectedItem(id);
	}, []);

	const onArrowUp = useCallback(() => {
		setSelectedItem((prevItem) => {
			const index = values.findIndex((val) => val.id === prevItem);
			const previousItems = values.filter(
				(v, i) => i < index && v.type !== 'divider'
			);
			if (previousItems.length > 0) {
				return previousItems[previousItems.length - 1].id;
			}

			const firstNonDivider = values.find((v) => v.type !== 'divider');
			if (firstNonDivider) {
				return firstNonDivider.id;
			}

			throw new Error('could not find previous item');
		});
	}, [values]);

	const onArrowDown = useCallback(() => {
		setSelectedItem((prevItem) => {
			const index = values.findIndex((val) => val.id === prevItem);
			const nextItem = values.find((v, i) => i > index && v.type !== 'divider');
			if (nextItem) {
				return nextItem.id;
			}

			const lastNonDivider = values
				.slice()
				.reverse()
				.find((v) => v.type !== 'divider');

			if (lastNonDivider) {
				return lastNonDivider.id;
			}

			throw new Error('could not find next item');
		});
	}, [values]);

	const onEnter = useCallback(() => {
		if (selectedItem === null) {
			return onHide();
		}

		const item = values.find((i) => i.id === selectedItem);
		if (!item) {
			throw new Error('cannot find item');
		}

		if (item.type === 'divider') {
			throw new Error('cannot find divider');
		}

		item.onClick(item.id);
	}, [onHide, selectedItem, values]);

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
		const downBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowDown',
			onArrowDown
		);
		const upBinding = keybindings.registerKeybinding(
			'keydown',
			'ArrowUp',
			onArrowUp
		);
		const enterBinding = keybindings.registerKeybinding(
			'keydown',
			'Enter',
			onEnter
		);
		const spaceBinding = keybindings.registerKeybinding('keyup', ' ', onEnter);
		return () => {
			escapeBinding.unregister();
			leftBinding.unregister();
			rightBinding.unregister();
			downBinding.unregister();
			upBinding.unregister();
			enterBinding.unregister();
			spaceBinding.unregister();
		};
	}, [
		keybindings,
		onEscape,
		onArrowLeft,
		onArrowRight,
		onArrowDown,
		onArrowUp,
		onEnter,
	]);

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
						selected={item.id === selectedItem}
						onActionChosen={onClick}
						onItemSelected={onItemSelected}
						label={item.label}
						id={item.id}
						keyHint={item.keyHint}
					/>
				);
			})}
		</div>
	);
};
