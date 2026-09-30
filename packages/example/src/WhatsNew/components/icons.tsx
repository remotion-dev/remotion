import React from 'react';

type IconProps = {
	readonly size?: number;
	readonly color?: string;
	readonly strokeWidth?: number;
};

const Svg: React.FC<IconProps & {readonly children: React.ReactNode}> = ({
	size = 48,
	color = 'currentColor',
	strokeWidth = 2.2,
	children,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{children}
	</svg>
);

export const SparkIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
		<path d="M19 3v4M21 5h-4" />
	</Svg>
);

export const BoltIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z" />
	</Svg>
);

export const CheckIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M4.5 12.5l5 5 10-11" />
	</Svg>
);

export const XIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M6 6l12 12M18 6L6 18" />
	</Svg>
);

export const SpeakerIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
		<path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
	</Svg>
);

export const TriangleIcon: React.FC<IconProps> = ({
	size = 48,
	color = '#000',
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M12 3L22.5 21H1.5z" fill={color} />
	</svg>
);

export const MicIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<rect x="9" y="3" width="6" height="11" rx="3" />
		<path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" />
	</Svg>
);

export const ScissorsIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<circle cx="6" cy="6" r="2.6" />
		<circle cx="6" cy="18" r="2.6" />
		<path d="M8.2 7.6L20 18M8.2 16.4L20 6" />
	</Svg>
);

export const BarsIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M5 20v-6M9.5 20V8M14 20v-9M18.5 20V4" />
	</Svg>
);

export const LayersIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M12 3l9 5-9 5-9-5z" />
		<path d="M3 13l9 5 9-5" />
	</Svg>
);

export const BrowserIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<rect x="3" y="4.5" width="18" height="15" rx="2.5" />
		<path d="M3 9h18M6.5 6.8h.01M9 6.8h.01" />
	</Svg>
);

export const RobotIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<rect x="4.5" y="8" width="15" height="11" rx="3" />
		<path d="M12 4.5V8M9 13h.01M15 13h.01M9.5 16.5h5" />
		<circle cx="12" cy="3.8" r="1" />
	</Svg>
);

export const EyeIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
		<circle cx="12" cy="12" r="3" />
	</Svg>
);

export const BoxIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
		<path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
	</Svg>
);

export const BellIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z" />
		<path d="M10 20.5a2 2 0 004 0" />
	</Svg>
);

export const ChatIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M4 5.5h16v10H9l-5 4z" />
	</Svg>
);

export const FileIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M6 3h8l5 5v13H6z" />
		<path d="M14 3v5h5" />
	</Svg>
);

export const WandIcon: React.FC<IconProps> = (p) => (
	<Svg {...p}>
		<path d="M4 20L15 9M13 7l4 4" />
		<path d="M18 2.5v3M16.5 4h3M20.5 8.5v2M19.5 9.5h2M9 2.5v2M8 3.5h2" />
	</Svg>
);

export const CursorIcon: React.FC<{readonly size?: number}> = ({size = 44}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path
			d="M5 3l14 7.5-6.2 1.6L9.6 18z"
			fill="#0B0F19"
			stroke="#fff"
			strokeWidth={1.6}
			strokeLinejoin="round"
		/>
	</svg>
);
