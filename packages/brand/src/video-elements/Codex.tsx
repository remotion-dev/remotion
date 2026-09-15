import React from 'react';
import {AbsoluteFill, Img, Interactive, staticFile} from 'remotion';
import {z} from 'zod';
import {
	AlertCircleIcon,
	AtIcon,
	BackIcon,
	BellIcon,
	BoltIcon,
	BottomPanelIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	ClockIcon,
	CopyIcon,
	FeedbackIcon,
	FolderIcon,
	ForwardIcon,
	HandoffIcon,
	HelpIcon,
	HistoryIcon,
	MicrophoneIcon,
	MoreIcon,
	NewChatIcon,
	PanelIcon,
	PlusIcon,
	ProjectsIcon,
	PullRequestIcon,
	RightPanelIcon,
	SearchIcon,
	ShareIcon,
	SlidersIcon,
	SpinnerIcon,
	StatusDotIcon,
	VoiceIcon,
} from './codex-icons';

export const codexSchema = z.object({
	height: z.number().int().positive(),
	width: z.number().int().positive(),
});

export type CodexProps = z.infer<typeof codexSchema>;

const SidebarNavigation: React.FC = () => {
	return (
		<>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					left: 14,
					position: 'absolute',
					top: 76,
					width: 268,
				}}
			>
				<NewChatIcon size={15} />
				<span style={{marginLeft: 7}}>New chat</span>
				<HistoryIcon size={14} style={{marginLeft: 'auto'}} />
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					left: 14,
					position: 'absolute',
					top: 104,
					width: 268,
				}}
			>
				<ProjectsIcon size={15} />
				<span style={{marginLeft: 7}}>Projects</span>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					left: 14,
					position: 'absolute',
					top: 132,
					width: 268,
				}}
			>
				<PullRequestIcon size={15} />
				<span style={{marginLeft: 7}}>Pull requests</span>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					left: 14,
					position: 'absolute',
					top: 160,
					width: 268,
				}}
			>
				<ClockIcon size={15} />
				<span style={{marginLeft: 7}}>Scheduled</span>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					left: 14,
					position: 'absolute',
					top: 188,
					width: 268,
				}}
			>
				<AtIcon size={15} />
				<span style={{marginLeft: 7}}>Plugins</span>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					left: 14,
					position: 'absolute',
					top: 216,
					width: 268,
				}}
			>
				<MoreIcon size={15} />
				<span style={{marginLeft: 7}}>Explore</span>
			</div>
		</>
	);
};

const RecentRow: React.FC<{
	readonly active: boolean | null;
	readonly dot: boolean | null;
	readonly handoff: boolean | null;
	readonly label: string;
	readonly spinner: boolean | null;
	readonly top: number;
}> = ({active, dot, handoff, label, spinner, top}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				backgroundColor: active ? '#e7e6e8' : 'transparent',
				borderRadius: 9,
				display: 'flex',
				height: 27,
				left: 7,
				overflow: 'hidden',
				position: 'absolute',
				top,
				width: 281,
			}}
		>
			<div
				style={{
					marginLeft: 7,
					overflow: 'hidden',
					paddingRight: handoff || dot || spinner ? 48 : 8,
					textOverflow: 'clip',
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</div>
			{handoff ? (
				<HandoffIcon
					size={14}
					style={{color: '#98999a', left: 232, position: 'absolute'}}
				/>
			) : null}
			{spinner ? (
				<SpinnerIcon
					size={15}
					style={{color: '#6c6d6f', left: 257, position: 'absolute'}}
				/>
			) : null}
			{dot ? (
				<StatusDotIcon
					size={13}
					style={{
						color: '#4a76f1',
						left: 257,
						position: 'absolute',
						translate: '0 -1px',
					}}
				/>
			) : null}
		</div>
	);
};

const Sidebar: React.FC<{readonly height: number}> = ({height}) => {
	return (
		<Interactive.Div
			name="Sidebar"
			style={{
				backgroundColor: '#f3f2f3',
				backgroundImage:
					'linear-gradient(90deg, #f3f2f3 0 19px, #f3f3f3 19px 20px, #f3f3f4 20px 21px, #f4f3f4 21px 30px, #f3f3f4 30px 32px, #f3f3f3 32px 34px, #f3f2f3 34px 62px, #f3f3f3 62px 64px, #f3f3f4 64px 66px, #f4f3f4 66px 78px, #f3f3f4 78px 80px, #f3f3f3 80px 82px, #f3f2f3 82px)',
				borderRight: '1px solid #e2e1e2',
				boxSizing: 'border-box',
				color: '#393a3c',
				fontSize: 12.5,
				height,
				left: 0,
				position: 'absolute',
				top: 0,
				width: 296,
			}}
		>
			<div
				style={{
					backgroundColor: '#ff5f57',
					borderRadius: '50%',
					height: 12,
					left: 17,
					position: 'absolute',
					top: 16,
					width: 12,
				}}
			/>
			<div
				style={{
					backgroundColor: '#febc2e',
					borderRadius: '50%',
					height: 12,
					left: 37,
					position: 'absolute',
					top: 16,
					width: 12,
				}}
			/>
			<div
				style={{
					backgroundColor: '#28c840',
					borderRadius: '50%',
					height: 12,
					left: 57,
					position: 'absolute',
					top: 16,
					width: 12,
				}}
			/>

			<PanelIcon
				size={14}
				style={{
					color: '#858688',
					left: 93,
					position: 'absolute',
					scale: '1 1.1',
					top: 13,
				}}
			/>
			<BackIcon
				size={17}
				style={{color: '#b8b9ba', left: 120, position: 'absolute', top: 13}}
			/>
			<ForwardIcon
				size={17}
				style={{color: '#d0d0d1', left: 149, position: 'absolute', top: 12}}
			/>

			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					fontSize: 15,
					fontWeight: 600,
					height: 22,
					left: 15,
					position: 'absolute',
					top: 45,
				}}
			>
				Codex
				<ChevronDownIcon
					size={13}
					style={{
						color: '#77787a',
						marginLeft: 2,
						scale: '1.4 1.7',
						translate: '0 -1px',
					}}
				/>
			</div>
			<SearchIcon
				size={16}
				style={{
					color: '#6f7072',
					left: 240,
					position: 'absolute',
					scale: '1.08',
					top: 47,
					transformOrigin: 'top left',
				}}
			/>
			<div
				style={{
					height: 18,
					left: 263,
					position: 'absolute',
					top: 46,
					width: 18,
				}}
			>
				<BellIcon
					size={16}
					style={{
						color: '#6f7072',
						scale: '0.85 1',
						transformOrigin: 'left',
						translate: '3px 0',
					}}
				/>
				<div
					style={{
						backgroundColor: '#4a76f1',
						border: '2px solid #f3f2f3',
						borderRadius: '50%',
						height: 7,
						left: 10,
						position: 'absolute',
						top: -1,
						width: 7,
					}}
				/>
			</div>

			<SidebarNavigation />
			<div
				style={{
					color: '#a1a2a3',
					fontSize: 12.5,
					left: 15,
					lineHeight: '18px',
					position: 'absolute',
					top: 260,
				}}
			>
				Recents
			</div>

			<RecentRow
				active={null}
				dot={null}
				handoff={null}
				label="Fix Studio percentage translate values"
				spinner
				top={284}
			/>
			<RecentRow
				active={null}
				dot={null}
				handoff={null}
				label="Build text editor mockup"
				spinner
				top={312}
			/>
			<RecentRow
				active={null}
				dot={null}
				handoff
				label="Investigate issue #11294"
				spinner
				top={340}
			/>
			<RecentRow
				active
				dot={null}
				handoff
				label="Capture Remotion outro screenshot"
				spinner={null}
				top={368}
			/>
			<RecentRow
				active={null}
				dot
				handoff={null}
				label="Fix issue 11235 in Studio"
				spinner={null}
				top={396}
			/>
			<RecentRow
				active={null}
				dot
				handoff
				label="Open PR for issue #11260"
				spinner={null}
				top={424}
			/>
			<RecentRow
				active={null}
				dot={null}
				handoff
				label="Fix PR #11201 merge conflicts"
				spinner
				top={452}
			/>
			<RecentRow
				active={null}
				dot
				handoff
				label="Find timeline layer double-click"
				spinner={null}
				top={480}
			/>
			<RecentRow
				active={null}
				dot={null}
				handoff
				label="@remotion/studio: Add skill installation to"
				spinner={null}
				top={508}
			/>

			<div
				style={{
					alignItems: 'center',
					borderTop: '1px solid #e2e1e2',
					bottom: 0,
					boxSizing: 'border-box',
					display: 'flex',
					height: 42,
					left: 0,
					paddingLeft: 14,
					position: 'absolute',
					width: 295,
				}}
			>
				<div
					style={{
						alignItems: 'center',
						backgroundColor: '#3c72ad',
						borderRadius: '50%',
						color: 'white',
						display: 'flex',
						fontSize: 5.5,
						height: 16,
						justifyContent: 'center',
						letterSpacing: -0.4,
						translate: '0 -1px',
						width: 17,
					}}
				>
					JB
				</div>
				<div style={{fontSize: 12.5, marginLeft: 7, translate: '0 -1px'}}>
					Jonny Burger
				</div>
				<HelpIcon
					size={15}
					strokeWidth={1.2}
					style={{
						color: '#77787a',
						marginLeft: 'auto',
						marginRight: 14,
						scale: '1.08',
						translate: '-0.5px -0.5px',
					}}
				/>
			</div>
		</Interactive.Div>
	);
};

const Header: React.FC = () => {
	return (
		<Interactive.Div
			name="Title bar"
			style={{
				alignItems: 'center',
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e4e4e4',
				boxSizing: 'border-box',
				color: '#191a1c',
				display: 'flex',
				fontWeight: 450,
				height: 42,
				left: 0,
				position: 'absolute',
				top: 0,
				width: 785,
			}}
		>
			<FolderIcon
				size={14}
				style={{
					marginLeft: 12,
					scale: '1 1.22',
					transformOrigin: 'bottom',
					translate: '0 1px',
				}}
			/>
			<div
				style={{
					fontSize: 12.7,
					marginLeft: 10,
				}}
			>
				Capture Remotion outro screenshot
			</div>
			<MoreIcon
				size={15}
				style={{
					color: '#8f9092',
					left: 593,
					position: 'absolute',
					scale: '1.15 1.2',
					top: 13,
					transformOrigin: 'left',
				}}
			/>
			<ShareIcon
				size={14}
				style={{
					color: '#8f9092',
					left: 626,
					position: 'absolute',
					scale: '1.35 1.1',
					top: 13,
					transformOrigin: 'top left',
				}}
			/>
			<div
				style={{
					color: '#8f9092',
					fontSize: 12,
					left: 646,
					position: 'absolute',
					top: 12,
				}}
			>
				Share
			</div>
			<SlidersIcon
				size={14}
				style={{
					color: '#8f9092',
					left: 695,
					position: 'absolute',
					scale: '1.3 1',
					top: 13,
					transformOrigin: 'left',
				}}
			/>
			<BottomPanelIcon
				size={14}
				style={{
					color: '#8f9092',
					left: 727,
					position: 'absolute',
					scale: '1 1.1',
					top: 13,
				}}
			/>
			<RightPanelIcon
				size={14}
				style={{
					color: '#8f9092',
					left: 758,
					position: 'absolute',
					scale: '1 1.1',
					top: 13,
				}}
			/>
		</Interactive.Div>
	);
};

const CodePill: React.FC<{
	readonly children: React.ReactNode;
	readonly height: number;
	readonly horizontalAlign: number;
	readonly textTranslateY: number;
	readonly verticalAlign: number;
	readonly width: number;
}> = ({
	children,
	height,
	horizontalAlign,
	textTranslateY,
	verticalAlign,
	width,
}) => {
	return (
		<code
			style={{
				alignItems: 'center',
				backgroundColor: '#eaeaea',
				borderRadius: 4,
				boxSizing: 'border-box',
				color: '#252628',
				display: 'inline-flex',
				fontFamily: 'Menlo, Monaco, monospace',
				fontSize: 11.5,
				height,
				justifyContent: 'center',
				lineHeight: '16px',
				translate: `${horizontalAlign}px 0`,
				verticalAlign,
				width,
			}}
		>
			<span style={{translate: `0 ${textTranslateY}px`}}>{children}</span>
		</code>
	);
};

const StatusDivider: React.FC<{
	readonly children: React.ReactNode;
	readonly top: number;
}> = ({children, top}) => {
	return (
		<div style={{height: 26, left: 61, position: 'absolute', top, width: 663}}>
			<div
				style={{
					alignItems: 'center',
					color: '#757677',
					display: 'flex',
					fontSize: 12.5,
					fontWeight: 450,
					height: 25,
				}}
			>
				{children}
				<ChevronRightIcon size={12} style={{color: '#b9babb', marginLeft: 5}} />
			</div>
			<div
				style={{
					backgroundColor: '#ededed',
					bottom: 0,
					height: 1,
					left: 0,
					position: 'absolute',
					width: 663,
				}}
			/>
		</div>
	);
};

const Conversation: React.FC = () => {
	return (
		<Interactive.Div
			name="Conversation"
			style={{height: 782, left: 0, position: 'absolute', top: 42, width: 785}}
		>
			<Interactive.Div
				name="First user message"
				style={{
					backgroundColor: '#e7f1fd',
					borderRadius: 16,
					boxSizing: 'border-box',
					color: '#152240',
					fontSize: 12.5,
					height: 120,
					left: 260,
					lineHeight: '20.5px',
					paddingLeft: 14,
					paddingTop: 8.5,
					position: 'absolute',
					top: 29,
					width: 464,
				}}
			>
				<div style={{translate: '1px 0'}}>
					I want to make a screenshot of the ChatGPT UI.
				</div>
				<div>
					on my next prompt, I am going to ask you to &quot;Create an endcard
					showing
				</div>
				<div style={{translate: '1px 0'}}>Remotion socials.&quot;</div>
				<div>
					then you reply as you normally would, and you render and show a
				</div>
				<div>screenshot of 11-Outro composition</div>
			</Interactive.Div>

			<StatusDivider top={188}>Worked for 6s</StatusDivider>

			<Interactive.Div
				name="First assistant message"
				style={{
					color: '#191a1c',
					fontSize: 12.5,
					left: 61,
					lineHeight: '21px',
					position: 'absolute',
					top: 228,
					width: 663,
				}}
			>
				<div>
					Got it. On your next prompt, I’ll create the Remotion socials endcard,
					render a screenshot of the{' '}
					<CodePill
						height={15}
						horizontalAlign={-1}
						textTranslateY={1}
						verticalAlign={1}
						width={67}
					>
						11-Outro
					</CodePill>
				</div>
				<div style={{translate: '0 -1px'}}>
					composition, and show it inline.
				</div>
			</Interactive.Div>

			<Interactive.Div
				name="Second user message"
				style={{
					alignItems: 'center',
					backgroundColor: '#e7f1fd',
					borderRadius: 16,
					color: '#152240',
					display: 'flex',
					fontSize: 12.5,
					height: 38,
					paddingLeft: 14,
					position: 'absolute',
					right: 61,
					top: 304,
					width: 295,
				}}
			>
				Create an endcard showing Remotion socials.
			</Interactive.Div>

			<StatusDivider top={381}>Worked for 1m 31s</StatusDivider>

			<Interactive.Div
				name="Second assistant message"
				style={{
					color: '#191a1c',
					fontSize: 12.5,
					left: 61,
					lineHeight: '21px',
					position: 'absolute',
					top: 421,
					width: 663,
				}}
			>
				Rendered the{' '}
				<CodePill
					height={16}
					horizontalAlign={0}
					textTranslateY={0}
					verticalAlign={0}
					width={116}
				>
					Chapter11-Outro
				</CodePill>
				<span> composition at frame 655.</span>
			</Interactive.Div>

			<Interactive.Div
				name="Rendered end card"
				style={{
					backgroundColor: '#ffffff',
					border: '1px solid #ededed',
					borderRadius: 7,
					boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
					boxSizing: 'border-box',
					height: 144,
					left: 61,
					overflow: 'hidden',
					position: 'absolute',
					top: 465,
					width: 255,
				}}
			>
				<Img
					height={142}
					src={staticFile('codex-ui/chapter11-outro-655.png')}
					style={{left: 0, position: 'absolute', top: 0}}
					width={253}
				/>
			</Interactive.Div>

			<div
				style={{
					alignItems: 'center',
					color: '#959698',
					display: 'flex',
					height: 18,
					left: 61,
					position: 'absolute',
					top: 625,
				}}
			>
				<CopyIcon size={16} style={{translate: '1px 0'}} />
				<FeedbackIcon size={14} style={{marginLeft: 9, translate: '1px 0'}} />
				<HandoffIcon
					size={16}
					strokeWidth={1.2}
					style={{
						marginLeft: 12,
						scale: '1.2 1.25',
						translate: '1.5px 0.5px',
					}}
				/>
			</div>
		</Interactive.Div>
	);
};

const Composer: React.FC<{readonly top: number}> = ({top}) => {
	return (
		<Interactive.Div
			name="Composer"
			style={{
				backgroundColor: '#ffffff',
				border: '1px solid #efefef',
				borderBottomColor: '#ebebeb',
				borderRadius: 19,
				boxShadow: '0 2px 8px 0 #0000000a, 0 4px 80px 8px #00000006',
				boxSizing: 'border-box',
				color: '#191a1c',
				height: 90,
				left: 60,
				position: 'absolute',
				top,
				width: 665,
			}}
		>
			<div
				style={{
					color: '#c6c6c7',
					fontSize: 12.6,
					left: 11,
					lineHeight: '18px',
					position: 'absolute',
					top: 13,
				}}
			>
				Do anything
			</div>
			<PlusIcon
				size={19}
				strokeWidth={1.45}
				style={{bottom: 10, left: 11, position: 'absolute'}}
			/>
			<div
				style={{
					alignItems: 'center',
					bottom: 11,
					color: '#ce5a21',
					display: 'flex',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 12.2,
					left: 44,
					position: 'absolute',
				}}
			>
				<AlertCircleIcon
					size={15}
					style={{
						scale: '1 1.05',
						transformOrigin: 'bottom center',
						translate: '0 1px',
					}}
				/>
				<span
					style={{
						marginLeft: 2,
						scale: '0.985 1',
						transformOrigin: 'left',
						translate: '1px 0',
					}}
				>
					Full access
				</span>
			</div>
			<div
				style={{
					alignItems: 'center',
					bottom: 11,
					display: 'flex',
					fontSize: 12.5,
					height: 18,
					position: 'absolute',
					right: 46,
				}}
			>
				<SpinnerIcon
					size={14}
					style={{
						color: '#858688',
						marginRight: 8,
						scale: '1.1',
						translate: '-5px 2px',
					}}
				/>
				<BoltIcon
					size={15}
					style={{marginRight: 4, scale: '1.2 1', translate: '-2px 0'}}
				/>
				<span
					style={{
						display: 'inline-block',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 12.2,
						translate: '-3px 0',
					}}
				>
					GPT-5.6 Sol
				</span>
				<span
					style={{
						color: '#898a8c',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 12.65,
						marginLeft: 4,
						scale: '1 0.9',
						transformOrigin: 'center',
						translate: '-4px 0',
					}}
				>
					High
				</span>
				<ChevronDownIcon
					size={13}
					style={{
						color: '#898a8c',
						marginLeft: 1,
						marginRight: 11,
						scale: '1.4 1.25',
						translate: '-3px 1px',
					}}
				/>
				<MicrophoneIcon
					size={16}
					style={{
						scale: '1',
						transformOrigin: 'top center',
						translate: '1px 0',
					}}
				/>
			</div>
			<div
				style={{
					alignItems: 'center',
					backgroundColor: '#4a76f1',
					borderRadius: '50%',
					bottom: 7,
					color: '#ffffff',
					display: 'flex',
					height: 25,
					justifyContent: 'center',
					position: 'absolute',
					right: 7,
					width: 26,
				}}
			>
				<VoiceIcon size={16} />
			</div>
		</Interactive.Div>
	);
};

export const Codex: React.FC<CodexProps> = ({height, width}) => {
	const scale = width / 1081;
	const referenceHeight = height / scale;

	return (
		<AbsoluteFill
			style={{
				WebkitFontSmoothing: 'antialiased',
				backgroundColor: '#ffffff',
				borderRadius: 10 * scale,
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
				fontWeight: 400,
				overflow: 'hidden',
			}}
		>
			<Interactive.Div
				name="Codex window"
				style={{
					backgroundColor: '#ffffff',
					borderRadius: 10,
					height: referenceHeight,
					left: 0,
					overflow: 'hidden',
					position: 'absolute',
					scale,
					top: 0,
					transformOrigin: '0 0',
					width: 1081,
				}}
			>
				<Sidebar height={referenceHeight} />
				<div
					style={{
						height: referenceHeight,
						left: 296,
						position: 'absolute',
						top: 0,
						width: 785,
					}}
				>
					<Header />
					<Conversation />
					<Composer top={referenceHeight - 104} />
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
