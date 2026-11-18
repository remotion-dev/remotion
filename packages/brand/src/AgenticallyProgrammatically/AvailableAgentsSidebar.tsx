import {loadFont} from '@remotion/fonts';
import type {CSSProperties, ReactNode} from 'react';
import {Easing, Img, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont({
	family: 'Here GT Planar',
	url: 'https://remotion.media/agentically-programmatically/gt-planar-medium-99485baca015.woff2',
	weight: '500',
});

export const AvailableAgentsPresenter = ({
	children,
}: {
	readonly children: ReactNode;
}) => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			name="Presenter beside plugin setup"
			style={{
				position: 'absolute',
				inset: 0,
				translate: interpolate(frame, [132, 150], ['0px 0px', '-470px 0px'], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

export const AvailableAgentsCaptions = ({
	children,
}: {
	readonly children: ReactNode;
}) => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			name="Captions beside plugin setup"
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 2,
				transformOrigin: '960px 1000px',
				scale: interpolate(frame, [132, 150], [1, 0.82], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					output: 'perceptual-scale',
				}),
				translate: interpolate(frame, [132, 150], ['0px 0px', '-420px 0px'], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

const AgentAppRowContent = ({
	label,
	logo,
	logoScale,
	style,
}: {
	readonly label: string;
	readonly logo: string;
	readonly logoScale: number;
	readonly style: CSSProperties;
}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			gap: 28,
			height: 96,
			...style,
		}}
	>
		<Img
			src={logo}
			style={{
				width: 88,
				height: 88,
				objectFit: 'contain',
				flexShrink: 0,
				scale: logoScale,
			}}
		/>
		<div style={{whiteSpace: 'nowrap'}}>{label}</div>
	</div>
);

export const AgentAppRow = Interactive.create({
	Component: AgentAppRowContent,
	layout: 'none',
	schema: {
		label: {type: 'string', default: '', description: 'App name'},
		logo: {type: 'string', default: '', description: 'App logo URL'},
		logoScale: {
			type: 'number',
			default: 1,
			description: 'App logo scale',
			hiddenFromList: false,
		},
	},
});

const AvailableAgentsSidebarContent = () => {
	const frame = useCurrentFrame();
	return (
		<Interactive.Div
			name="Available coding agents panel"
			style={{
				position: 'absolute',
				right: 0,
				top: 0,
				width: 840,
				height: '100%',
				backgroundColor: '#f8fafc',
				color: '#18191a',
				zIndex: 1,
				fontFamily: 'Here GT Planar',
				fontWeight: 500,
				fontSize: 64,
				lineHeight: 1.05,
				letterSpacing: '-0.025em',
				fontFeatureSettings: '"ss03" 1',
				translate: interpolate(frame, [0, 18], ['840px 0px', '0px 0px'], {
					easing: Easing.bezier(0.42, 0, 0.58, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			<AgentAppRow
				name="Codex"
				label="Codex"
				logoScale={1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/codex-63534da7294b.png"
				style={{position: 'absolute', left: 64, top: 234}}
			/>
			<AgentAppRow
				name="Claude Code"
				label="Claude Code"
				logoScale={1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/claude-code-ef290ea7e8bf.png"
				style={{position: 'absolute', left: 64, top: 366}}
			/>
			<AgentAppRow
				name="Cursor"
				label="Cursor"
				logoScale={1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/cursor-9e3c719d3e40.png"
				style={{position: 'absolute', left: 64, top: 498}}
			/>
			<AgentAppRow
				name="GitHub Copilot"
				label="GitHub Copilot"
				logoScale={1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/copilot-a38205450baa.png"
				style={{position: 'absolute', left: 64, top: 630}}
			/>
			<AgentAppRow
				name="Agent Plugin"
				label="Agent Plugin"
				logoScale={0.58}
				logo="https://remotion.media/agentically-programmatically/remotion-single-triangle-a67dbd2e9855.svg"
				style={{position: 'absolute', left: 64, top: 762}}
			/>
		</Interactive.Div>
	);
};

export const AvailableAgentsSidebar = Interactive.create({
	Component: AvailableAgentsSidebarContent,
	layout: 'absolute-fill',
	schema: {},
});
