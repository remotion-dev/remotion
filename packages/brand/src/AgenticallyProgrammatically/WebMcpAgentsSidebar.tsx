import type {ReactNode} from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {AgentAppRow} from './AvailableAgentsSidebar';

export const WebMcpAgentsLayout = ({
	children,
	captions,
}: {
	readonly children: ReactNode;
	readonly captions: boolean;
}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name={
				captions
					? 'Captions beside WebMCP agents'
					: 'Presenter beside WebMCP agents'
			}
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: captions ? 2 : 0,
				transformOrigin: '960px 1000px',
				scale: captions
					? interpolate(frame, [76, 94], [1, 0.82], {
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						})
					: 1,
				translate: interpolate(
					frame,
					[76, 94],
					['0px 0px', captions ? '-420px 0px' : '-410px 0px'],
					{
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
		>
			{children}
		</Interactive.Div>
	);
};

const WebMcpAgentsSidebarContent = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Div
			name="Agents supporting WebMCP"
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
			<div
				style={{
					position: 'absolute',
					left: 64,
					top: 144,
					width: 712,
					fontSize: 54,
					lineHeight: 1.1,
					whiteSpace: 'nowrap',
				}}
			>
				Agents supporting WebMCP
			</div>
			<AgentAppRow
				name="Codex supports WebMCP"
				label="Codex"
				logoScale={1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/codex-63534da7294b.png"
				style={{position: 'absolute', left: 64, top: 264}}
			/>
			<AgentAppRow
				name="GitHub Copilot"
				label="GitHub Copilot"
				logoScale={1}
				logo="https://remotion.media/agentically-programmatically/agent-icons/copilot-a38205450baa.png"
				style={{position: 'absolute', left: 64, top: 396}}
			/>
			<Interactive.Div
				name="Fade Claude Code and Cursor"
				style={{
					position: 'absolute',
					inset: 0,
					opacity: interpolate(frame, [24, 48], [1, 0.2], {
						easing: Easing.bezier(0.42, 0, 0.58, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<AgentAppRow
					name="Claude Code"
					label="Claude Code"
					logoScale={1}
					logo="https://remotion.media/agentically-programmatically/agent-icons/claude-code-ef290ea7e8bf.png"
					style={{position: 'absolute', left: 64, top: 528}}
				/>
				<AgentAppRow
					name="Cursor"
					label="Cursor"
					logoScale={1}
					logo="https://remotion.media/agentically-programmatically/agent-icons/cursor-9e3c719d3e40.png"
					style={{position: 'absolute', left: 64, top: 660}}
				/>
			</Interactive.Div>
		</Interactive.Div>
	);
};

export const WebMcpAgentsSidebar = Interactive.create({
	Component: WebMcpAgentsSidebarContent,
	layout: 'absolute-fill',
	schema: {},
});
