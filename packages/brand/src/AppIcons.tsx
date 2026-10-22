import {StudioInternals} from '@remotion/studio';
import type {ReactNode} from 'react';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const editors = [
	{id: 'vscode', label: 'VS Code'},
	{id: 'cursor', label: 'Cursor'},
	{id: 'windsurf', label: 'Windsurf'},
	{id: 'zed', label: 'Zed'},
	{id: 'vscodium', label: 'VSCodium'},
	{id: 'webstorm', label: 'WebStorm'},
	{id: 'sublime-text', label: 'Sublime Text'},
] as const;

const codingAgents = [
	{id: 'codex', label: 'Codex'},
	{id: 'cursor', label: 'Cursor Agent'},
	{id: 'copilot', label: 'GitHub Copilot'},
	{id: 'claude-code', label: 'Claude Code'},
] as const;

const terminals = [
	{id: 'terminal', label: 'Terminal'},
	{id: 'iterm2', label: 'iTerm2'},
	{id: 'ghostty', label: 'Ghostty'},
	{id: 'warp', label: 'Warp'},
	{id: 'wezterm', label: 'WezTerm'},
	{id: 'alacritty', label: 'Alacritty'},
	{id: 'windows-terminal', label: 'Windows Terminal'},
	{id: 'gnome-terminal', label: 'GNOME Terminal'},
] as const;

const AppIconCell: React.FC<{
	readonly children: ReactNode;
	readonly label: string;
}> = ({children, label}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				color: '#ffffff',
				display: 'flex',
				flex: 1,
				flexDirection: 'column',
				gap: 20,
				justifyContent: 'center',
				minWidth: 0,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 72,
					justifyContent: 'center',
					width: 72,
				}}
			>
				{children}
			</div>
			<div
				style={{
					color: '#a6a6a6',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 18,
					lineHeight: 1.2,
					textAlign: 'center',
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</div>
		</div>
	);
};

const AppIconRow: React.FC<{
	readonly children: ReactNode;
	readonly label: string;
}> = ({children, label}) => {
	return (
		<div
			style={{
				alignItems: 'stretch',
				display: 'flex',
				flex: 1,
				minHeight: 0,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					color: '#666666',
					display: 'flex',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 16,
					fontWeight: 600,
					justifyContent: 'flex-start',
					letterSpacing: 0.8,
					textTransform: 'uppercase',
					width: 170,
				}}
			>
				{label}
			</div>
			<div
				style={{
					alignItems: 'stretch',
					display: 'flex',
					flex: 1,
				}}
			>
				{children}
			</div>
		</div>
	);
};

export const AppIcons: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#181818',
				padding: '24px 48px',
			}}
		>
			<AppIconRow label="Editors">
				{editors.map((editor) => (
					<AppIconCell key={editor.id} label={editor.label}>
						<StudioInternals.EditorIcon editorId={editor.id} size={64} />
					</AppIconCell>
				))}
			</AppIconRow>
			<div style={{height: 1, backgroundColor: '#303030'}} />
			<AppIconRow label="Coding agents">
				{codingAgents.map((codingAgent) => (
					<AppIconCell key={codingAgent.label} label={codingAgent.label}>
						<StudioInternals.CodingAgentIcon
							codingAgentId={codingAgent.id}
							size={64}
						/>
					</AppIconCell>
				))}
			</AppIconRow>
			<div style={{height: 1, backgroundColor: '#303030'}} />
			<AppIconRow label="Terminals">
				{terminals.map((terminal) => (
					<AppIconCell key={terminal.id} label={terminal.label}>
						<StudioInternals.TerminalIcon terminalId={terminal.id} size={64} />
					</AppIconCell>
				))}
			</AppIconRow>
			<div style={{height: 1, backgroundColor: '#303030'}} />
			<AppIconRow label="File managers">
				<AppIconCell label="Finder">
					<StudioInternals.FinderIcon size={64} />
				</AppIconCell>
			</AppIconRow>
		</AbsoluteFill>
	);
};
