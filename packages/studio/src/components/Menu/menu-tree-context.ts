import {createContext, useContext, useEffect} from 'react';
import {
	getActiveStudioDialog,
	StudioDialogContext,
} from '../../state/studio-dialog';

let nextMenuTreeId = 0;

export const getNextMenuTreeId = () => nextMenuTreeId++;

export const MenuTreeContext = createContext<number | null>(null);

export const isNodeInMenuTree = (node: Node, menuTreeId: number) => {
	const element = node instanceof Element ? node : node.parentElement;
	return (
		element?.closest(`[data-remotion-menu-tree-id="${menuTreeId}"]`) !== null
	);
};

export const useDismissMenuOnOutsidePointerDown = ({
	enabled,
	menuTreeId,
	onHide,
}: {
	readonly enabled: boolean;
	readonly menuTreeId: number;
	readonly onHide: () => void;
}) => {
	const dialog = useContext(StudioDialogContext);
	useEffect(() => {
		if (!enabled) {
			return;
		}

		const dismissWithoutClickThrough = (event: PointerEvent) => {
			if (event.button !== 0 || getActiveStudioDialog() !== dialog) {
				return;
			}

			const target = event.target as Node;
			if (isNodeInMenuTree(target, menuTreeId)) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			onHide();
		};

		window.addEventListener('pointerdown', dismissWithoutClickThrough, true);

		return () => {
			window.removeEventListener(
				'pointerdown',
				dismissWithoutClickThrough,
				true,
			);
		};
	}, [dialog, enabled, menuTreeId, onHide]);
};
