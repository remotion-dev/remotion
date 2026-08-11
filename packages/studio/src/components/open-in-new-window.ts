import {getUrlForRoute} from '../helpers/url-state';
import type {SelectionItem} from './NewComposition/ComboBox';

export const getOpenInNewWindowMenuItem = (route: string): SelectionItem => {
	return {
		id: 'open-in-new-window',
		keyHint: null,
		label: 'Open in new window',
		leftItem: null,
		onClick: () => {
			const screen = window.screen as Screen & {
				availLeft?: number;
				availTop?: number;
			};
			const width = Math.min(1200, Math.floor(screen.availWidth * 0.8));
			const height = Math.min(800, Math.floor(screen.availHeight * 0.8));
			const displayLeft = screen.availLeft ?? 0;
			const displayTop = screen.availTop ?? 0;
			const left = Math.round(
				Math.min(
					Math.max(
						window.screenX + (window.outerWidth - width) / 2,
						displayLeft,
					),
					displayLeft + screen.availWidth - width,
				),
			);
			const top = Math.round(
				Math.min(
					Math.max(
						window.screenY + (window.outerHeight - height) / 2,
						displayTop,
					),
					displayTop + screen.availHeight - height,
				),
			);
			window.open(
				getUrlForRoute(route),
				'_blank',
				`popup,width=${width},height=${height},left=${left},top=${top}`,
			);
		},
		quickSwitcherLabel: null,
		subMenu: null,
		type: 'item',
		value: 'open-in-new-window',
	};
};
