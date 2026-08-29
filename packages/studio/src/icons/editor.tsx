import type {EditorPickerId} from '@remotion/studio-shared';
import React from 'react';
import {CURRENT_COLOR} from '../helpers/colors';
import {CustomEditorIcon} from './custom-editor';

// Brand shapes adapted from:
// - OpenCode app icons (MIT): https://github.com/anomalyco/opencode/tree/dev/packages/ui/src/assets/icons/app
// - Simple Icons (CC0 1.0): https://github.com/simple-icons/simple-icons/tree/develop/icons

const iconStyle = (size: number): React.CSSProperties => ({
	flexShrink: 0,
	height: size,
	width: size,
});

const VsCodeIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 40 40" style={iconStyle(size)} aria-hidden>
		<path
			fill="#23A9F2"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M26.02 34.13c.23.09.48.13.72.12.25-.01.49-.07.71-.18l5.93-2.85c.31-.15.56-.38.74-.66.18-.29.28-.62.28-.96V10.25c0-.34-.1-.67-.28-.96-.18-.28-.43-.51-.74-.66l-5.93-2.85c-.34-.16-.71-.22-1.08-.15-.36.06-.7.23-.96.5L14.05 16.48 9.11 12.73a1.2 1.2 0 0 0-1.53.07L5.99 14.24a1.2 1.2 0 0 0 0 1.77l4.29 3.92-4.29 3.91a1.2 1.2 0 0 0 0 1.77l1.59 1.44a1.2 1.2 0 0 0 1.53.07l4.94-3.75 11.36 10.36c.17.17.38.31.61.4Zm1.18-20.74-8.61 6.54 8.61 6.53V13.39Z"
		/>
	</svg>
);

const CursorIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 40 40" style={iconStyle(size)} aria-hidden>
		<rect x="4" y="4" width="32" height="32" rx="7.625" fill="#050505" />
		<path
			fill="#fff"
			d="m29.62 14.21-8.67-5.09a.89.89 0 0 0-.9 0l-8.67 5.09a.77.77 0 0 0-.38.66v10.26c0 .27.14.52.38.66l8.67 5.09c.28.16.62.16.9 0l8.67-5.09c.24-.14.38-.39.38-.66V14.87a.77.77 0 0 0-.38-.66Zm-.54 1.07L20.7 30.01a.11.11 0 0 1-.2-.06v-9.64c0-.19-.1-.37-.27-.47l-8.22-4.82a.11.11 0 0 1 .06-.21h16.74c.24 0 .39.27.27.47Z"
		/>
	</svg>
);

const WindsurfIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 24 24" style={iconStyle(size)} aria-hidden>
		<path
			fill={CURRENT_COLOR}
			d="M23.55 5.07a2.18 2.18 0 0 0-2.18 2.17v4.87c0 .97-.8 1.76-1.76 1.76-.57 0-1.14-.29-1.47-.77l-4.97-7.1a2.21 2.21 0 0 0-3.96 1.22v4.89c0 .97-.8 1.76-1.77 1.76-.57 0-1.13-.29-1.47-.77L.41 5.16A.22.22 0 0 0 0 5.29v4.24c0 .22.07.43.19.6l5.47 7.82c.33.46.8.81 1.35.93a2.15 2.15 0 0 0 2.65-2.1v-4.89c0-.97.79-1.76 1.76-1.76.57 0 1.14.29 1.47.77l4.98 7.1c.41.59 1.05.94 1.81.94a2.15 2.15 0 0 0 2.15-2.16v-4.89c0-.97.79-1.76 1.76-1.76h.19a.22.22 0 0 0 .22-.22V5.29a.22.22 0 0 0-.22-.22h-.23Z"
		/>
	</svg>
);

const ZedIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 40 40" style={iconStyle(size)} aria-hidden>
		<path
			fill={CURRENT_COLOR}
			fillRule="evenodd"
			clipRule="evenodd"
			d="M8.3 7.4a.9.9 0 0 0-.9.9v19.8H5.6V8.3a2.7 2.7 0 0 1 2.7-2.7h24.11c1.2 0 1.81 1.45.96 2.3L18.52 22.76h4.18V20.9h1.8v2.31c0 .75-.6 1.35-1.35 1.35h-6.43l-3.1 3.09h14.03V16.4h1.8v11.25c0 1-.8 1.8-1.8 1.8H11.82L8.67 32.6H31.7a.9.9 0 0 0 .9-.9V11.9h1.8v19.8a2.7 2.7 0 0 1-2.7 2.7H7.59c-1.2 0-1.81-1.45-.96-2.31L21.43 17.3H17.3v1.8h-1.8v-2.25c0-.75.6-1.35 1.35-1.35h6.38l3.15-3.15H12.35V23.6h-1.8V12.35c0-1 .8-1.8 1.8-1.8h15.83l3.15-3.15H8.3Z"
		/>
	</svg>
);

const VscodiumIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 24 24" style={iconStyle(size)} aria-hidden>
		<path
			fill="#2F80ED"
			d="M11.58.54a1.47 1.47 0 0 0-.44 2.03c2.43 3.76 3 6.6 2.75 9.08-1 4.75-3.18 5.72-5.09 5.72-1.86 0-1.36-3.07.03-3.96a5.3 5.3 0 0 1 2.73-.87 1.47 1.47 0 1 0 0-2.94c-.96 0-1.9.21-2.78.55.18-.85.25-1.76.02-2.74-.36-1.47-1.37-2.88-3.13-4.25a1.47 1.47 0 0 0-1.81 2.32c1.43 1.11 1.9 1.94 2.07 2.62.16.68.03 1.4-.3 2.4-.41 1.35-.9 2.56-1.1 3.71-.11.57-.12 1.19-.15 1.68-1.03-1-1.43-2.34-1.43-4.28a1.47 1.47 0 1 0-2.95 0c0 2.66.78 5.18 2.86 6.87 1.88 1.79 6.67 1.13 6.67 4.01 0 .81 1.19 1.21 2 1.21.84 0 1.89-.56 1.89-1.21 0-3.27 3.44-5.25 9.11-5.24A1.47 1.47 0 1 0 22.53 14.3c-.39 0-.77.01-1.14.03.64-1.49.92-3.13.86-4.9a1.47 1.47 0 1 0-2.95.1c.08 2.32-.01 4.39-1.74 5.48-.49.31-1.06.58-1.6.58.42-1.14.74-2.35.87-3.65.08-.83.09-1.82 0-2.59-.15-1.18-.33-2.53.12-3.55.4-.87 1.31-1.24 2.65-1.24a1.47 1.47 0 1 0 0-2.94c-1.98 0-3.48 1.04-4.34 2.3-.44-.95-.98-1.93-1.64-2.94a1.47 1.47 0 0 0-2.04-.44Z"
		/>
	</svg>
);

const WebStormIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 24 24" style={iconStyle(size)} aria-hidden>
		<rect width="24" height="24" rx="3" fill="#07C3F2" />
		<path fill="#050505" d="M3 3h18v18H3z" />
		<path
			fill="#fff"
			d="M4.8 5.4h2.1l1.3 4.9 1.4-4.9h1.6l1.4 4.9 1.3-4.9h2.1l-2.5 8.7h-1.8l-1.3-4.8-1.4 4.8H7.3L4.8 5.4Zm10.8 7.3 1.1-1.4c.8.6 1.6 1 2.5 1 .7 0 1.2-.3 1.2-.8 0-.5-.3-.7-1.7-1.1-1.7-.4-2.8-.9-2.8-2.6 0-1.6 1.3-2.6 3-2.6 1.2 0 2.3.4 3.2 1.1l-1 1.5c-.8-.5-1.5-.8-2.2-.8-.7 0-1.1.3-1.1.7 0 .6.4.7 1.8 1.1 1.7.5 2.7 1.1 2.7 2.6 0 1.7-1.3 2.7-3.2 2.7-1.3 0-2.6-.5-3.5-1.4ZM4.7 18h8v1.3h-8V18Z"
		/>
	</svg>
);

const SublimeTextIcon: React.FC<{readonly size: number}> = ({size}) => (
	<svg viewBox="0 0 40 40" style={iconStyle(size)} aria-hidden>
		<path
			fill="#FF9800"
			d="M35.91 4.51c0-.37-.36-.59-.8-.48L4.8 11.44c-.44.11-.8.5-.8.87v7.58c0 .37.36.59.8.48l30.31-7.41c.44-.11.8-.5.8-.87V4.51Zm0 15.57c0-.38-.36-.59-.8-.49L4.8 27.01c-.44.1-.8.5-.8.87v7.57c0 .38.36.6.8.49l30.31-7.41c.44-.11.8-.5.8-.88v-7.57Z"
		/>
		<path
			fill="#F28C00"
			d="M4 19.84c0 .37.36.76.8.87l30.32 7.41c.44.11.8-.11.8-.48v-7.58c0-.37-.36-.76-.8-.87L4.8 11.78c-.44-.11-.8.11-.8.48v7.58Z"
		/>
	</svg>
);

export const EditorIcon: React.FC<{
	readonly editorId: EditorPickerId | null;
	readonly size: number | null;
}> = ({editorId, size: sizeProp}) => {
	const size = sizeProp ?? 14;

	switch (editorId) {
		case 'vscode':
			return <VsCodeIcon size={size} />;
		case 'cursor':
			return <CursorIcon size={size} />;
		case 'windsurf':
			return <WindsurfIcon size={size} />;
		case 'zed':
			return <ZedIcon size={size} />;
		case 'vscodium':
			return <VscodiumIcon size={size} />;
		case 'webstorm':
			return <WebStormIcon size={size} />;
		case 'sublime-text':
			return <SublimeTextIcon size={size} />;
		case 'custom':
		case null:
			return <CustomEditorIcon size={size} />;
		default:
			return null;
	}
};
