import React from 'react';
import {AbsoluteFill, Img, Interactive} from 'remotion';
import {z} from 'zod';
import {
	AlertCircleIcon,
	BoltIcon,
	BottomPanelIcon,
	ChevronDownIcon,
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

const MINIMUM_WIDTH = 640;
const MINIMUM_HEIGHT = 748;

const Header: React.FC = () => {
	return (
		<Interactive.Div
			name="Title bar"
			style={{
				alignItems: 'center',
				backgroundColor: '#171717',
				borderBottom: '1px solid #3b3b3b',
				boxSizing: 'border-box',
				color: '#e4e4e4',
				display: 'flex',
				fontWeight: 450,
				height: 42,
				left: 0,
				position: 'absolute',
				top: 0,
				width: MINIMUM_WIDTH,
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
					fontSize: 15.5,
					marginLeft: 10,
				}}
			>
				Make announcement video
			</div>
			<MoreIcon
				size={15}
				style={{
					color: '#8b8b8b',
					left: 448,
					position: 'absolute',
					scale: '1.15 1.2',
					top: 13,
					transformOrigin: 'left',
				}}
			/>
			<ShareIcon
				size={14}
				style={{
					color: '#8b8b8b',
					left: 481,
					position: 'absolute',
					scale: '1.35 1.1',
					top: 13,
					transformOrigin: 'top left',
				}}
			/>
			<div
				style={{
					color: '#8b8b8b',
					fontSize: 12,
					left: 501,
					position: 'absolute',
					top: 12,
				}}
			>
				Share
			</div>
			<SlidersIcon
				size={14}
				style={{
					color: '#8b8b8b',
					left: 550,
					position: 'absolute',
					scale: '1.3 1',
					top: 13,
					transformOrigin: 'left',
				}}
			/>
			<BottomPanelIcon
				size={14}
				style={{
					color: '#8b8b8b',
					left: 582,
					position: 'absolute',
					scale: '1 1.1',
					top: 13,
				}}
			/>
			<RightPanelIcon
				size={14}
				style={{
					color: '#8b8b8b',
					left: 613,
					position: 'absolute',
					scale: '1 1.1',
					top: 13,
				}}
			/>
		</Interactive.Div>
	);
};

const Conversation: React.FC = () => {
	return (
		<Interactive.Div
			name="Conversation"
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 18,
				left: 24,
				position: 'absolute',
				top: 50,
				width: MINIMUM_WIDTH - 48,
			}}
		>
			<Interactive.Div
				name="First user message"
				style={{
					alignSelf: 'flex-end',
					backgroundColor: '#213569',
					borderRadius: 16,
					boxSizing: 'border-box',
					color: '#f5f9fe',
					fontSize: 16,
					lineHeight: '24px',
					padding: '12px 16px',
					width: 500,
				}}
			>
				Please import the videos I just recorded from ~/Downloads and put them
				on a timeline. caption it.
			</Interactive.Div>

			<Interactive.Div
				name="First assistant message"
				style={{color: '#e4e4e4', fontSize: 16, lineHeight: '24px'}}
			>
				Imported your videos and added captions.
			</Interactive.Div>

			<Interactive.Div
				name="Second user message"
				style={{
					alignSelf: 'flex-end',
					backgroundColor: '#213569',
					borderRadius: 16,
					color: '#f5f9fe',
					fontSize: 16,
					lineHeight: '24px',
					padding: '12px 16px',
				}}
			>
				add our endcard to it
			</Interactive.Div>

			<Interactive.Div
				name="Second assistant message"
				style={{
					color: '#e4e4e4',
					display: 'flex',
					flexDirection: 'column',
					fontSize: 16,
					gap: 12,
					lineHeight: '24px',
				}}
			>
				<div>Added your endcard.</div>
				<Interactive.Div
					name="Endcard preview"
					style={{
						backgroundColor: '#1f1f1f',
						border: '1px solid #3b3b3b',
						borderRadius: 7,
						boxSizing: 'border-box',
						overflow: 'hidden',
						width: 320,
					}}
				>
					<Img
						src="https://remotion.media/homepage/studio-endcard-25914e3e08ad.jpg"
						style={{display: 'block', width: '100%'}}
					/>
				</Interactive.Div>
				<div
					style={{
						alignItems: 'center',
						color: '#8b8b8b',
						display: 'flex',
						gap: 12,
						height: 18,
					}}
				>
					<CopyIcon size={18} />
					<FeedbackIcon size={16} />
					<HandoffIcon size={18} strokeWidth={1.2} />
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};

const Composer: React.FC<{readonly top: number}> = ({top}) => {
	return (
		<Interactive.Div
			name="Composer"
			style={{
				backgroundColor: '#252525',
				border: '1px solid #3b3b3b',
				borderBottomColor: '#3b3b3b',
				borderRadius: 19,
				boxShadow: '0 2px 8px 0 #00000040, 0 4px 80px 8px #00000020',
				boxSizing: 'border-box',
				color: '#e4e4e4',
				height: 90,
				left: 24,
				position: 'absolute',
				top,
				width: MINIMUM_WIDTH - 48,
			}}
		>
			<div
				style={{
					color: '#8b8b8b',
					fontSize: 16,
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
					color: '#e98047',
					display: 'flex',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 14,
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
					fontSize: 14,
					height: 18,
					position: 'absolute',
					right: 46,
				}}
			>
				<SpinnerIcon
					size={14}
					style={{
						color: '#8b8b8b',
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
						fontSize: 14,
						translate: '-3px 0',
					}}
				>
					GPT-5.6 Sol
				</span>
				<span
					style={{
						color: '#8b8b8b',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 14,
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
						color: '#8b8b8b',
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
					backgroundColor: '#395ab9',
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
				backgroundColor: '#171717',
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
					backgroundColor: '#171717',
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
						width: MINIMUM_WIDTH,
					}}
				>
					<Header />
					<Conversation />
					<Composer top={MINIMUM_HEIGHT - 152} />
				</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
