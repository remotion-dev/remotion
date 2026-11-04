import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, screen} from '@testing-library/react';
import type {Menu} from '../components/Menu/MenuItem';
import {MenuItem} from '../components/Menu/MenuItem';

afterEach(() => {
	cleanup();
});

const noop = () => undefined;

const renderMenu = (menu: Menu) => {
	return render(
		<MenuItem
			label={menu.label}
			id={menu.id}
			selected={false}
			onItemSelected={noop}
			onItemHovered={noop}
			onItemQuit={noop}
			onPreviousMenu={noop}
			onNextMenu={noop}
			menu={menu}
			leaveLeftPadding={menu.leaveLeftPadding}
		/>,
	);
};

test('gives an icon-only menu trigger a discernible name', () => {
	renderMenu({
		id: 'remotion',
		ariaLabel: 'Remotion',
		label: <svg data-testid="remotion-icon" />,
		items: [],
		leaveLeftPadding: false,
	});

	const button = screen.getByRole('button', {name: 'Remotion'});
	expect(button.getAttribute('aria-label')).toBe('Remotion');
	expect(button.getAttribute('tabindex')).toBe('0');
});

test('keeps a text menu trigger named by its visible label', () => {
	renderMenu({
		id: 'file',
		label: 'File',
		ariaLabel: null,
		items: [],
		leaveLeftPadding: false,
	});

	const button = screen.getByRole('button', {name: 'File'});
	expect(button.getAttribute('aria-label')).toBeNull();
});
