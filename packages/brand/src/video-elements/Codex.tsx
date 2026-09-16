import React from 'react';
import {AbsoluteFill, Img, Interactive, staticFile} from 'remotion';
import {z} from 'zod';
import {
	AlertCircleIcon,
	BoltIcon,
	BottomPanelIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	CopyIcon,
	FeedbackIcon,
	FolderIcon,
	HandoffIcon,
	MicrophoneIcon,
	MoreIcon,
	PlusIcon,
	RightPanelIcon,
	ShareIcon,
	SlidersIcon,
	SpinnerIcon,
	VoiceIcon,
} from './codex-icons';

export const codexSchema = z.object({
	borderRadius: z.number().nonnegative(),
	height: z.number().int().positive(),
	width: z.number().int().positive(),
});

export type CodexProps = z.infer<typeof codexSchema>;

const MINIMUM_WIDTH = 785;
const MINIMUM_HEIGHT = 928;

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

export const Codex: React.FC<CodexProps> = ({borderRadius, height, width}) => {
	const scale = Math.min(width / MINIMUM_WIDTH, height / MINIMUM_HEIGHT);
	const scaledWidth = MINIMUM_WIDTH * scale;
	const scaledHeight = MINIMUM_HEIGHT * scale;

	return (
		<AbsoluteFill
			style={{
				WebkitFontSmoothing: 'antialiased',
				backgroundColor: '#ffffff',
				borderRadius,
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
					borderRadius: borderRadius / scale,
					height: MINIMUM_HEIGHT,
					left: (width - scaledWidth) / 2,
					overflow: 'hidden',
					position: 'absolute',
					scale,
					top: (height - scaledHeight) / 2,
					transformOrigin: '0 0',
					width: MINIMUM_WIDTH,
				}}
			>
				<div
					style={{
						height: MINIMUM_HEIGHT,
						left: 0,
						position: 'absolute',
						top: 0,
						width: 785,
					}}
				>
					<Header />
					<Conversation />
					<Composer top={MINIMUM_HEIGHT - 104} />
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
