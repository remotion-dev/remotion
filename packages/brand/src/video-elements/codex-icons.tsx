import type {ReactNode, SVGProps} from 'react';
import React from 'react';

export type CodexIconProps = Omit<
	SVGProps<SVGSVGElement>,
	'height' | 'width'
> & {
	readonly size: number;
};

type CodexSvgIconProps = CodexIconProps & {
	readonly children: ReactNode;
};

const CodexSvgIcon: React.FC<CodexSvgIconProps> = ({
	children,
	size,
	...svgProps
}) => {
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			fill="none"
			height={size}
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.5}
			viewBox="0 0 24 24"
			width={size}
			xmlns="http://www.w3.org/2000/svg"
			{...svgProps}
		>
			{children}
		</svg>
	);
};

export const SidebarIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<rect height="15" rx="2.25" width="18" x="3" y="4.5" />
			<path d="M8.25 5v14" />
		</CodexSvgIcon>
	);
};

export const PanelIcon = SidebarIcon;

export const BackIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M19 11H5m6-6-6 6 6 6" />
		</CodexSvgIcon>
	);
};

export const ForwardIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M5 11h14m-6-6 6 6-6 6" />
		</CodexSvgIcon>
	);
};

export const FolderIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M3.75 7.75a2 2 0 0 1 2-2H10l2 2h6.25a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5.75a2 2 0 0 1-2-2z" />
			<path d="M3.75 10h16.5" />
		</CodexSvgIcon>
	);
};

export const ProjectsIcon = FolderIcon;

export const EllipsisIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="6" cy="12" fill="currentColor" r="1.35" stroke="none" />
			<circle cx="12" cy="12" fill="currentColor" r="1.35" stroke="none" />
			<circle cx="18" cy="12" fill="currentColor" r="1.35" stroke="none" />
		</CodexSvgIcon>
	);
};

export const MoreIcon = EllipsisIcon;

export const ShareIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M12 15V4.5" />
			<path d="m8.75 7.75 3.25-3.25 3.25 3.25" />
			<path d="M6.25 11.75v5a2.25 2.25 0 0 0 2.25 2.25h7a2.25 2.25 0 0 0 2.25-2.25v-5" />
		</CodexSvgIcon>
	);
};

export const SlidersIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M4.5 6.25h3M11 6.25h8.5" />
			<circle cx="9.25" cy="6.25" r="1.75" />
			<path d="M4.5 12h8.25M16.25 12h3.25" />
			<circle cx="14.5" cy="12" r="1.75" />
			<path d="M4.5 17.75H7M10.5 17.75h9" />
			<circle cx="8.75" cy="17.75" r="1.75" />
		</CodexSvgIcon>
	);
};

export const ControlsIcon = SlidersIcon;

export const BottomPanelIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<rect height="15" rx="2.25" width="18" x="3" y="4.5" />
			<path d="M3.5 15.5h17" />
		</CodexSvgIcon>
	);
};

export const RightPanelIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<rect height="15" rx="2.25" width="18" x="3" y="4.5" />
			<path d="M16 5v14" />
		</CodexSvgIcon>
	);
};

export const SearchIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="10.75" cy="10.75" r="5.75" />
			<path d="m15 15 4 4" />
		</CodexSvgIcon>
	);
};

export const BellIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M18.25 9.75a6.25 6.25 0 0 0-12.5 0c0 5-2.25 5.75-2.25 5.75h17s-2.25-.75-2.25-5.75Z" />
			<path d="M14.25 18.25a2.5 2.5 0 0 1-4.5 0" />
		</CodexSvgIcon>
	);
};

export const ChevronDownIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="m7.5 9.5 4.5 4.5 4.5-4.5" />
		</CodexSvgIcon>
	);
};

export const ChevronRightIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="m7 7.5 6 4.5-6 4.5" />
		</CodexSvgIcon>
	);
};

export const NewChatIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852Z" />
		</CodexSvgIcon>
	);
};

export const PullRequestIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="6" cy="5" r="2" />
			<circle cx="6" cy="19" r="2" />
			<circle cx="18" cy="19" r="2" />
			<path d="M6 7v10M14 5h.75A3.25 3.25 0 0 1 18 8.25V17" />
			<path d="m12.5 3 2 2-2 2" />
		</CodexSvgIcon>
	);
};

export const ClockIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="12" cy="12" r="8.25" />
			<path d="M12 7.25V12l-3 2" />
		</CodexSvgIcon>
	);
};

export const ScheduledIcon = ClockIcon;

export const AtIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="12" cy="12" r="4" />
			<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
		</CodexSvgIcon>
	);
};

export const PluginIcon = AtIcon;

export const HistoryIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M4.5 7.75V4.5M4.5 4.5h3.25" />
			<path d="M4.85 7a8.25 8.25 0 1 1-.75 7.25" />
			<path d="M12 7.25V12l3 1.75" />
		</CodexSvgIcon>
	);
};

export const OpenInNewIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M14 5h5v5" />
			<path d="m19 5-8 8" />
			<path d="M10 6H6.75A1.75 1.75 0 0 0 5 7.75v9.5A1.75 1.75 0 0 0 6.75 19h9.5A1.75 1.75 0 0 0 18 17.25V14" />
		</CodexSvgIcon>
	);
};

export const HandoffIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M4 12h5l7-7" />
			<path d="M12 5h4v4" />
			<path d="M9 12h2l5 5" />
			<path d="M12 17h4v-4" />
		</CodexSvgIcon>
	);
};

export const SpinnerIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="12" cy="12" opacity={0.38} r="7.75" />
			<path d="M12 4.25A7.75 7.75 0 0 1 19.75 12" />
		</CodexSvgIcon>
	);
};

export const StatusDotIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="12" cy="12" fill="currentColor" r="5.5" stroke="none" />
		</CodexSvgIcon>
	);
};

export const CopyIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<rect height="11.5" rx="2" width="11" x="4.5" y="8" />
			<path d="M8 8V6.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1.5" />
		</CodexSvgIcon>
	);
};

export const ThumbsUpIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M7 10v12" />
			<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
		</CodexSvgIcon>
	);
};

export const ThumbsDownIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M7.5 13.75 11 19.25a2 2 0 0 0 3.75-1v-3.5h3.15a2 2 0 0 0 1.95-2.45l-1.25-5.5a2 2 0 0 0-1.95-1.55H7.5" />
			<path d="M4 4.75h3.5v9.5H4z" />
		</CodexSvgIcon>
	);
};

export const FeedbackIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M2 8h3l3-6.5c.45-.95 1.9-.62 1.9.43V7h2.6c.8 0 1.4.76 1.18 1.53l-1.25 4.65c-.2.76-.9 1.32-1.7 1.32H5" />
			<path d="M2 8v7h3V8" />
			<path d="M22 9v7h-3V9" />
			<path d="M19 9h-3.9c-.8 0-1.5.55-1.7 1.32L12.3 14.5H16v5.57c0 1.05-1.45 1.38-1.9.43l-2-4.5" />
		</CodexSvgIcon>
	);
};

export const PlusIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M12 6.5v11M6.5 12h11" />
		</CodexSvgIcon>
	);
};

export const AlertCircleIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="12" cy="12" r="8" />
			<path d="M12 7.75v5.5" />
			<circle cx="12" cy="16.25" fill="currentColor" r="0.8" stroke="none" />
		</CodexSvgIcon>
	);
};

export const BoltIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path
				d="m13.25 2.75-7.5 11h5.5l-.5 7.5 7.5-11h-5.5z"
				fill="currentColor"
				stroke="none"
			/>
		</CodexSvgIcon>
	);
};

export const SparkIcon = BoltIcon;

export const MicrophoneIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<rect height="10.5" rx="3.25" width="6.5" x="8.75" y="3.25" />
			<path d="M5.75 11.5a6.25 6.25 0 0 0 12.5 0M12 17.75v3M9.25 20.75h5.5" />
		</CodexSvgIcon>
	);
};

export const VoiceIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<path d="M5.5 10v4M9.75 7.5v9M14.25 5.5v13M18.5 9v6" />
		</CodexSvgIcon>
	);
};

export const HelpIcon: React.FC<CodexIconProps> = (props) => {
	return (
		<CodexSvgIcon {...props}>
			<circle cx="12" cy="12" r="8.25" />
			<path d="M9.75 9a2.4 2.4 0 1 1 3.45 2.15c-.8.4-1.2.95-1.2 1.85v.25" />
			<circle cx="12" cy="16.6" fill="currentColor" r="0.8" stroke="none" />
		</CodexSvgIcon>
	);
};

export const HelpCircleIcon = HelpIcon;
