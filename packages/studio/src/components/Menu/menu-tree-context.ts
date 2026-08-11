import {createContext} from 'react';

let nextMenuTreeId = 0;

export const getNextMenuTreeId = () => nextMenuTreeId++;

export const MenuTreeContext = createContext<number | null>(null);

export const isNodeInMenuTree = (node: Node, menuTreeId: number) => {
	const element = node instanceof Element ? node : node.parentElement;
	return (
		element?.closest(`[data-remotion-menu-tree-id="${menuTreeId}"]`) !== null
	);
};
