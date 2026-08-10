import type {DefaultTerminal} from '@remotion/renderer';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';
import {AppsIcon} from './apps';

// Brand shapes adapted from Simple Icons (CC0 1.0):
// https://github.com/simple-icons/simple-icons/tree/34c22501f9ac9f22b12f825677ccbab1fb22e14b/icons

const iconStyle = (size: number): React.CSSProperties => ({
	flexShrink: 0,
	height: size,
	width: size,
});

const simpleTerminalIcons: Partial<
	Record<DefaultTerminal, {readonly color: string; readonly path: string}>
> = {
	warp: {
		color: '#01A4FF',
		path: 'M12.035 2.723h9.253A2.712 2.712 0 0 1 24 5.435v10.529a2.712 2.712 0 0 1-2.712 2.713H8.047Zm-1.681 2.6L6.766 19.677h5.598l-.399 1.6H2.712A2.712 2.712 0 0 1 0 18.565V8.036a2.712 2.712 0 0 1 2.712-2.712Z',
	},
	wezterm: {
		color: '#4E49EE',
		path: 'M3.27 8.524c0-.623.62-1.007 2.123-1.007l-.5 2.757c-.931-.623-1.624-1.199-1.624-1.75zm4.008 6.807c0 .647-.644 1.079-2.123 1.15l.524-2.924c.931.624 1.6 1.175 1.6 1.774zm-2.625 5.992.454-2.708c3.603-.336 5.01-1.798 5.01-3.404 0-1.653-2.004-2.948-3.841-4.074l.668-3.548c.764.072 1.67.216 2.744.432l.31-2.469c-.81-.12-1.575-.168-2.29-.216L8.257 2.7l-2.363-.024-.453 2.684C1.838 5.648.43 7.158.43 8.764c0 1.63 2.004 2.876 3.841 3.954l-.668 3.716c-.859-.048-1.908-.192-3.125-.408L0 18.495c1.026.12 1.98.192 2.84.216l-.525 2.588zm15.553-1.894h2.673c.334-2.804.81-8.46 1.121-14.86h-2.553c-.071 1.51-.334 10.498-.43 11.241h-.071c-.644-2.42-1.169-4.386-1.813-6.782h-1.456c-.62 2.396-1.05 4.194-1.694 6.782h-.096c-.071-.743-.477-9.73-.525-11.24h-2.648c.31 6.399.763 12.055 1.097 14.86h2.625l1.838-7.12z',
	},
	alacritty: {
		color: '#F46D01',
		path: 'm10.065 0-8.57 21.269h3.595l6.91-16.244 6.91 16.244h3.594l-8.57-21.269zm1.935 9.935c-.76666 1.8547-1.5334 3.7094-2.298 5.565 1.475 4.54 1.475 4.54 2.298 8.5.823-3.96.823-3.96 2.297-8.5-.76637-1.8547-1.5315-3.7099-2.297-5.565z',
	},
	'gnome-terminal': {
		color: CURRENT_COLOR,
		path: 'M1.846 0A1.841 1.841 0 000 1.846v18.463c0 1.022.823 1.845 1.846 1.845h20.308A1.841 1.841 0 0024 20.31V1.846A1.841 1.841 0 0022.154 0H1.846zm0 .924h20.308c.512 0 .922.41.922.922v18.463c0 .511-.41.921-.922.921H1.846a.919.919 0 01-.922-.921V1.846c0-.512.41-.922.922-.922zm0 .922v18.463h20.308V1.846H1.846zm1.845 2.14l3.235 1.758v.836L3.69 8.477V7.385l2.243-1.207v-.033L3.69 5.076v-1.09zM7.846 9.23h3.693v.924H7.846V9.23zM0 21.736v.418C0 23.177.823 24 1.846 24h20.308A1.841 1.841 0 0024 22.154v-.418a2.334 2.334 0 01-1.846.918H1.846A2.334 2.334 0 010 21.736Z',
	},
};

export const TerminalIcon: React.FC<{
	readonly terminalId: DefaultTerminal;
	readonly size: number;
}> = ({terminalId, size}) => {
	const hasArtwork =
		terminalId === 'terminal' ||
		terminalId === 'iterm2' ||
		terminalId === 'ghostty' ||
		terminalId === 'windows-terminal';
	if (hasArtwork) {
		return (
			<img
				alt=""
				aria-hidden
				data-terminal-icon={terminalId}
				draggable={false}
				src={`/api/app-icon/terminal/${terminalId}.png`}
				style={iconStyle(size)}
			/>
		);
	}

	const icon = simpleTerminalIcons[terminalId];
	if (!icon) {
		return (
			<AppsIcon
				aria-hidden
				data-terminal-icon={terminalId}
				height={size}
				width={size}
			/>
		);
	}

	return (
		<svg
			aria-hidden
			data-terminal-icon={terminalId}
			style={iconStyle(size)}
			viewBox="0 0 24 24"
		>
			<path d={icon.path} fill={icon.color} />
		</svg>
	);
};
