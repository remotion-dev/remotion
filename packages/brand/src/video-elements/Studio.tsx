import React from 'react';
import {
	Img,
	Interactive,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import {z} from 'zod';
import {Scene11} from '../announcements/whats-new-in-remotion/Scene11';
import {
	BracesIcon,
	CanvasFitIcon,
	CanvasZoomIcon,
	CanvasZoomOutIcon,
	CaretIcon,
	CheckerboardIcon,
	EyeIcon,
	FolderIcon,
	FullscreenIcon,
	ImageIcon,
	InPointIcon,
	JumpToStartIcon,
	LoopIcon,
	MagnetIcon,
	OutlineIcon,
	OutPointIcon,
	PlaybackRateIcon,
	PlayIcon,
	RemotionGlyph,
	RocketIcon,
	RulerIcon,
	SearchIcon,
	SettingsIcon,
	SidebarIcon,
	StepBackIcon,
	StepForwardIcon,
	VideoIcon,
	VolumeIcon,
	VscodeIcon,
} from './studio-icons';

const BACKGROUND = '#1f2428';
const INPUT_BACKGROUND = '#2f363d';
const LIGHT_TEXT = '#A6A7A9';
const TOOLBAR_FOREGROUND = '#d2d3d4';
const WHITE = '#ffffff';
const BLUE = '#0b84f3';
const TIMELINE_BACKGROUND = '#15181B';
const SEPARATOR = '#13161B';
const SPLITTER = '#000000';
const PLAYHEAD = '#f02c00';
const MENU_HEIGHT = 30;
const PREVIEW_TOOLBAR_HEIGHT = 40;
const SPLITTER_SIZE = 3;
const LEFT_SIDEBAR_RATIO = 0.1605;
const RIGHT_SIDEBAR_RATIO = 0.222;
const TOP_PANEL_RATIO = 0.662;
const TIMELINE_LABEL_RATIO = 0.2611;
const REFERENCE_COMPOSITION_WIDTH = 1920;
const REFERENCE_COMPOSITION_HEIGHT = 1080;

export const studioReferenceSchema = z.object({
	viewportWidth: z.number().int().positive(),
	showLeftSidebar: z.boolean(),
	showRightSidebar: z.boolean(),
});

export type StudioReferenceProps = z.infer<typeof studioReferenceSchema>;

export type StudioProps = {
	readonly compositionName: string;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
	readonly content: React.ReactNode;
	readonly durationInFrames: number;
	readonly frame: number;
	readonly showLeftSidebar: boolean;
	readonly showRightSidebar: boolean;
	readonly viewportWidth: number;
};

const studioInteractivitySchema = {
	viewportWidth: {
		type: 'number',
		default: 1352,
		description: 'Viewport width',
		hiddenFromList: false,
		keyframable: false,
		min: 17,
		step: 1,
	},
	showLeftSidebar: {
		type: 'boolean',
		default: true,
		description: 'Show left sidebar',
		keyframable: false,
	},
	showRightSidebar: {
		type: 'boolean',
		default: true,
		description: 'Show right sidebar',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

const IconButton: React.FC<{
	readonly children: React.ReactNode;
	readonly active?: boolean;
	readonly width?: number;
}> = ({children, active = false, width = 24}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				backgroundColor: 'transparent',
				borderRadius: 3,
				color: active ? BLUE : TOOLBAR_FOREGROUND,
				display: 'flex',
				height: 24,
				justifyContent: 'center',
				width,
			}}
		>
			{children}
		</div>
	);
};

const Divider: React.FC<{readonly height?: number}> = ({height = 18}) => {
	return (
		<div
			style={{
				backgroundColor: 'transparent',
				height,
				marginLeft: 4,
				marginRight: 4,
				width: 1,
			}}
		/>
	);
};

const MenuToolbar: React.FC<{
	readonly compositionName: string;
	readonly showLeftSidebar: boolean;
	readonly showRightSidebar: boolean;
}> = ({compositionName, showLeftSidebar, showRightSidebar}) => {
	return (
		<Interactive.Div
			name="Menu bar"
			style={{
				alignItems: 'center',
				backgroundColor: BACKGROUND,
				borderBottom: `1px solid ${SPLITTER}`,
				boxSizing: 'border-box',
				color: TOOLBAR_FOREGROUND,
				display: 'flex',
				height: MENU_HEIGHT,
				position: 'relative',
				width: '100%',
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: '100%',
					paddingLeft: 6,
					position: 'absolute',
					left: 0,
				}}
			>
				<Interactive.Div name="Left sidebar toggle" style={{marginRight: 4}}>
					<IconButton>
						<SidebarIcon
							color={LIGHT_TEXT}
							expanded={showLeftSidebar}
							side="left"
							size={16}
						/>
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Remotion menu">
					<IconButton width={30}>
						<RemotionGlyph color={TOOLBAR_FOREGROUND} size={14} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div
					name="File menu"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 24,
						paddingLeft: 8,
						paddingRight: 8,
					}}
				>
					File
				</Interactive.Div>
				<Interactive.Div
					name="View menu"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 24,
						paddingLeft: 8,
						paddingRight: 8,
					}}
				>
					View
				</Interactive.Div>
				<Interactive.Div
					name="Composition menu"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 24,
						paddingLeft: 8,
						paddingRight: 8,
					}}
				>
					Composition
				</Interactive.Div>
				<Interactive.Div
					name="Tools menu"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 24,
						paddingLeft: 8,
						paddingRight: 8,
					}}
				>
					Tools
				</Interactive.Div>
				<Interactive.Div
					name="Help menu"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 24,
						paddingLeft: 8,
						paddingRight: 8,
					}}
				>
					Help
				</Interactive.Div>
			</div>
			<Interactive.Div
				name="Composition breadcrumb"
				style={{
					alignItems: 'center',
					color: 'rgba(255, 255, 255, 0.8)',
					display: 'flex',
					gap: 5,
					left: '50%',
					position: 'absolute',
					translate: '-50% 0',
					whiteSpace: 'nowrap',
				}}
			>
				<span
					style={{
						letterSpacing: 0.08,
						position: 'relative',
						left: -8,
					}}
				>
					brand / {compositionName}
				</span>
				<span style={{color: '#1594f6', display: 'flex'}}>
					<VscodeIcon size={16} />
				</span>
				<CaretIcon
					color="#5a6065"
					direction="down"
					size={13}
					style={{position: 'relative', left: 4, scale: '0.84 1'}}
				/>
			</Interactive.Div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: '100%',
					paddingRight: 6,
					position: 'absolute',
					right: 0,
				}}
			>
				<Interactive.Div name="Settings">
					<IconButton>
						<SettingsIcon color={LIGHT_TEXT} size={16} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Right sidebar toggle">
					<IconButton>
						<SidebarIcon
							color={LIGHT_TEXT}
							expanded={showRightSidebar}
							side="right"
							size={16}
						/>
					</IconButton>
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};

const LeftSidebar: React.FC = () => {
	return (
		<Interactive.Div
			name="Compositions sidebar"
			style={{
				backgroundColor: BACKGROUND,
				color: LIGHT_TEXT,
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', height: 34, flexShrink: 0}}>
				<Interactive.Div
					name="Compositions tab"
					style={{
						alignItems: 'center',
						borderTop: `2px solid ${BLUE}`,
						boxSizing: 'border-box',
						color: WHITE,
						display: 'flex',
						paddingLeft: 10,
						width: 109,
					}}
				>
					Compositions
				</Interactive.Div>
				<Interactive.Div
					name="Assets tab"
					style={{
						alignItems: 'center',
						backgroundColor: INPUT_BACKGROUND,
						display: 'flex',
						flex: 1,
						paddingLeft: 10,
					}}
				>
					Assets
				</Interactive.Div>
			</div>
			<div
				style={{
					alignItems: 'center',
					borderBottom: `1px solid ${SPLITTER}`,
					boxSizing: 'border-box',
					display: 'flex',
					height: 35,
					padding: '4px 4px 4px 8px',
				}}
			>
				<Interactive.Div
					name="Composition search"
					style={{
						alignItems: 'center',
						backgroundColor: 'rgba(255, 255, 255, 0.06)',
						borderRadius: 4,
						display: 'flex',
						height: 26,
						minWidth: 0,
						paddingLeft: 11,
						width: 'calc(100% - 28px)',
					}}
				>
					<SearchIcon color="#8d9296" size={14} />
					<span
						style={{
							fontSize: 12,
							marginLeft: 7,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						Search...
					</span>
					<span
						style={{
							fontSize: 11,
							marginLeft: 'auto',
							marginRight: 10,
							opacity: 0.55,
							whiteSpace: 'nowrap',
						}}
					>
						⌘+K
					</span>
				</Interactive.Div>
				<Interactive.Div
					name="Sidebar options"
					style={{
						fontSize: 16,
						letterSpacing: 1,
						marginLeft: 'auto',
						paddingBottom: 7,
						textAlign: 'center',
						width: 22,
					}}
				>
					…
				</Interactive.Div>
			</div>
			<div style={{paddingTop: 4}}>
				<Interactive.Div
					name="Logo folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div
						style={{
							fontSize: 13,
							marginLeft: 8,
							maxWidth: 154,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						Logo
					</div>
				</Interactive.Div>
				<Interactive.Div
					name="Homepage Assets folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div style={{fontSize: 13, marginLeft: 8}}>HomepageAssets</div>
				</Interactive.Div>
				<Interactive.Div
					name="Showcases folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div style={{fontSize: 13, marginLeft: 8}}>Showcases</div>
				</Interactive.Div>
				<Interactive.Div
					name="Video Elements folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div style={{fontSize: 13, marginLeft: 8}}>VideoElements</div>
				</Interactive.Div>
				<Interactive.Div
					name="Recorder folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div style={{fontSize: 13, marginLeft: 8}}>Recorder</div>
				</Interactive.Div>
				<Interactive.Div
					name="Close Ups folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div style={{fontSize: 13, marginLeft: 8}}>CloseUps</div>
				</Interactive.Div>
				<Interactive.Div
					name="Studio Assets folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div style={{fontSize: 13, marginLeft: 8}}>StudioAssets</div>
				</Interactive.Div>
				<Interactive.Div
					name="Social Media Announcements folder"
					style={{
						alignItems: 'center',
						borderRadius: 4,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 12,
					}}
				>
					<FolderIcon color={LIGHT_TEXT} expanded={false} size={18} />
					<div
						style={{
							fontSize: 13,
							marginLeft: 8,
							maxWidth: 154,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						SocialMediaAnnouncements
					</div>
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};

const InspectorSectionTitle: React.FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				color: LIGHT_TEXT,
				display: 'flex',
				fontSize: 12,
				fontWeight: 600,
				height: 32,
				paddingLeft: 10,
			}}
		>
			{children}
		</div>
	);
};

const MetadataRow: React.FC<{
	readonly label: string;
	readonly value: React.ReactNode;
}> = ({label, value}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				height: 28,
				paddingLeft: 10,
				paddingRight: 17,
			}}
		>
			<span style={{color: LIGHT_TEXT}}>{label}</span>
			<div
				style={{
					color: BLUE,
					display: 'flex',
					gap: 27,
					marginLeft: 'auto',
				}}
			>
				{value}
			</div>
		</div>
	);
};

const RightSidebar: React.FC<{
	readonly compositionName: string;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
	readonly durationInFrames: number;
	readonly fps: number;
}> = ({
	compositionName,
	compositionWidth,
	compositionHeight,
	durationInFrames,
	fps,
}) => {
	return (
		<Interactive.Div
			name="Inspector sidebar"
			style={{
				backgroundColor: BACKGROUND,
				color: LIGHT_TEXT,
				height: '100%',
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', height: 34}}>
				<Interactive.Div
					name="Inspector tab"
					style={{
						alignItems: 'center',
						borderTop: `2px solid ${BLUE}`,
						boxSizing: 'border-box',
						color: WHITE,
						display: 'flex',
						paddingLeft: 10,
						width: '50%',
					}}
				>
					Inspector
				</Interactive.Div>
				<Interactive.Div
					name="Jobs tab"
					style={{
						alignItems: 'center',
						backgroundColor: INPUT_BACKGROUND,
						display: 'flex',
						paddingLeft: 10,
						width: '50%',
					}}
				>
					Jobs
				</Interactive.Div>
			</div>
			<div style={{padding: '4px 0'}}>
				<Interactive.Div
					name="Composition name"
					style={{
						alignItems: 'center',
						color: WHITE,
						display: 'flex',
						fontSize: 13,
						height: 28,
						paddingLeft: 10,
					}}
				>
					{compositionName}
				</Interactive.Div>
				<Interactive.Div
					name="Root source"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 28,
						paddingLeft: 10,
					}}
				>
					<VideoIcon color={LIGHT_TEXT} size={18} />
					<span style={{marginLeft: 8}}>Root.tsx:127</span>
				</Interactive.Div>
				<Interactive.Div
					name="Scene source"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 28,
						paddingLeft: 10,
					}}
				>
					<BracesIcon color={LIGHT_TEXT} size={18} />
					<span style={{marginLeft: 8}}>Scene11.tsx:11</span>
				</Interactive.Div>
			</div>
			<Interactive.Div name="Metadata heading">
				<InspectorSectionTitle>Metadata</InspectorSectionTitle>
			</Interactive.Div>
			<div style={{paddingBottom: 4, paddingTop: 4}}>
				<Interactive.Div name="Dimensions metadata">
					<MetadataRow
						label="Dimensions"
						value={
							<>
								<span>{compositionWidth}</span>
								<span>{compositionHeight}</span>
							</>
						}
					/>
				</Interactive.Div>
				<Interactive.Div name="Frame rate metadata">
					<MetadataRow label="Frame rate" value={<span>{fps}fps</span>} />
				</Interactive.Div>
				<Interactive.Div name="Duration metadata">
					<MetadataRow
						label="Duration"
						value={<span>{durationInFrames} frames</span>}
					/>
				</Interactive.Div>
			</div>
			<Interactive.Div
				name="Default props heading"
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 35,
					paddingLeft: 10,
					paddingRight: 6,
					translate: '0px -2px',
				}}
			>
				<span style={{fontSize: 12, fontWeight: 600}}>Default Props</span>
				<div
					style={{
						border: '1px solid rgba(0, 0, 0, 0.65)',
						display: 'flex',
						height: 22,
						marginLeft: 8,
					}}
				>
					<Interactive.Div
						name="Schema tab"
						style={{
							alignItems: 'center',
							backgroundColor: INPUT_BACKGROUND,
							color: WHITE,
							display: 'flex',
							fontSize: 11,
							paddingLeft: 7,
							paddingRight: 7,
						}}
					>
						Schema
					</Interactive.Div>
					<Interactive.Div
						name="JSON tab"
						style={{
							alignItems: 'center',
							display: 'flex',
							fontSize: 11,
							paddingLeft: 7,
							paddingRight: 7,
						}}
					>
						JSON
					</Interactive.Div>
				</div>
				<Interactive.Div
					name="Warning indicator"
					style={{
						alignItems: 'center',
						backgroundColor: BACKGROUND,
						border: '1px solid #0c0e10',
						boxShadow: 'inset 0 0 0 1px #555555',
						color: '#d6c400',
						display: 'flex',
						fontSize: 11,
						height: 22,
						boxSizing: 'border-box',
						marginLeft: 'auto',
						paddingLeft: 6,
						paddingRight: 5,
						width: 52,
					}}
				>
					⚠<span style={{color: LIGHT_TEXT, marginLeft: 3}}>1</span>
					<CaretIcon color={LIGHT_TEXT} direction="down" size={10} />
				</Interactive.Div>
			</Interactive.Div>
			<Interactive.Div
				name="Platform label"
				style={{
					color: LIGHT_TEXT,
					fontFamily: 'monospace',
					fontSize: 12,
					lineHeight: '23px',
					paddingLeft: 10,
					position: 'relative',
					top: 1,
				}}
			>
				platform:
			</Interactive.Div>
			<Interactive.Div
				name="Platform selector"
				style={{
					alignItems: 'center',
					backgroundColor: INPUT_BACKGROUND,
					border: '1px solid rgba(0, 0, 0, 0.65)',
					borderRadius: 4,
					boxSizing: 'border-box',
					color: WHITE,
					display: 'flex',
					fontSize: 11,
					height: 20,
					marginLeft: 10,
					paddingLeft: 5,
					width: 60,
				}}
			>
				youtube
				<CaretIcon
					color={LIGHT_TEXT}
					direction="down"
					size={9}
					style={{marginLeft: 'auto', marginRight: 3}}
				/>
			</Interactive.Div>
			<div style={{height: 7}} />
			<Interactive.Div name="Actions heading">
				<InspectorSectionTitle>Actions</InspectorSectionTitle>
			</Interactive.Div>
			<div style={{height: 4}} />
			<Interactive.Div
				name="Add solid action"
				style={{
					alignItems: 'center',
					color: LIGHT_TEXT,
					display: 'flex',
					height: 28,
					paddingLeft: 10,
				}}
			>
				<div
					style={{
						border: `1px solid ${LIGHT_TEXT}`,
						borderRadius: 3,
						height: 16,
						width: 18,
					}}
				/>
				<span style={{marginLeft: 8}}>Add Solid</span>
			</Interactive.Div>
			<Interactive.Div
				name="Add asset action"
				style={{
					alignItems: 'center',
					color: LIGHT_TEXT,
					display: 'flex',
					height: 28,
					paddingLeft: 10,
				}}
			>
				<ImageIcon color={LIGHT_TEXT} size={18} />
				<span style={{marginLeft: 8}}>Add asset...</span>
			</Interactive.Div>
			<Interactive.Div
				name="Add composition action"
				style={{
					alignItems: 'center',
					color: LIGHT_TEXT,
					display: 'flex',
					height: 28,
					paddingLeft: 10,
				}}
			>
				<VideoIcon color={LIGHT_TEXT} size={18} />
				<span style={{marginLeft: 8}}>Add composition...</span>
			</Interactive.Div>
			<Interactive.Div
				name="Browse elements action"
				style={{
					alignItems: 'center',
					color: LIGHT_TEXT,
					display: 'flex',
					height: 28,
					paddingLeft: 10,
				}}
			>
				<BracesIcon color={LIGHT_TEXT} size={18} />
				<span style={{marginLeft: 8}}>Browse Elements</span>
			</Interactive.Div>
		</Interactive.Div>
	);
};

const PreviewCanvas: React.FC<{
	readonly canvasHeight: number;
	readonly canvasWidth: number;
	readonly compositionHeight: number;
	readonly compositionWidth: number;
	readonly content: React.ReactNode;
	readonly durationInFrames: number;
	readonly frame: number;
}> = ({
	canvasHeight,
	canvasWidth,
	compositionHeight,
	compositionWidth,
	content,
	durationInFrames,
	frame,
}) => {
	const outerFrame = useCurrentFrame();
	const scale = Math.min(
		(canvasWidth - 16) / compositionWidth,
		(canvasHeight - 15) / compositionHeight,
	);
	const previewWidth = compositionWidth * scale;
	const previewHeight = compositionHeight * scale;

	return (
		<Interactive.Div
			name="Preview workspace"
			style={{
				alignItems: 'center',
				backgroundColor: BACKGROUND,
				display: 'flex',
				height: canvasHeight,
				justifyContent: 'center',
				overflow: 'hidden',
				width: canvasWidth,
			}}
		>
			<Interactive.Div
				name="Composition viewport"
				style={{
					backgroundColor: 'white',
					height: previewHeight,
					overflow: 'hidden',
					position: 'relative',
					width: previewWidth,
				}}
			>
				<div
					style={{
						height: compositionHeight,
						left: 0,
						position: 'absolute',
						scale: String(scale),
						top: 0,
						transformOrigin: 'top left',
						width: compositionWidth,
					}}
				>
					<Sequence
						durationInFrames={durationInFrames}
						from={outerFrame - frame}
						height={compositionHeight}
						width={compositionWidth}
					>
						{content}
					</Sequence>
				</div>
			</Interactive.Div>
		</Interactive.Div>
	);
};

const PreviewToolbar: React.FC = () => {
	return (
		<Interactive.Div
			name="Preview toolbar"
			style={{
				alignItems: 'center',
				backgroundColor: BACKGROUND,
				borderTop: '1px solid rgba(0, 0, 0, 0.5)',
				boxSizing: 'border-box',
				display: 'flex',
				height: PREVIEW_TOOLBAR_HEIGHT,
				position: 'relative',
				width: '100%',
			}}
		>
			<div
				style={{
					alignItems: 'center',
					color: TOOLBAR_FOREGROUND,
					display: 'flex',
					height: 28,
					left: 16,
					position: 'absolute',
				}}
			>
				<Interactive.Div
					name="Canvas fit control"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 28,
						paddingLeft: 4,
						paddingRight: 4,
					}}
				>
					<CanvasFitIcon color={TOOLBAR_FOREGROUND} size={20} />
					<div style={{width: 4}} />
					<span style={{fontSize: 12, lineHeight: '16px', width: 32}}>Fit</span>
					<div style={{width: 4}} />
					<CaretIcon color={TOOLBAR_FOREGROUND} direction="down" size={10} />
				</Interactive.Div>
				<div style={{width: 16}} />
				<Interactive.Div
					name="Playback rate control"
					style={{
						alignItems: 'center',
						display: 'flex',
						height: 28,
						paddingLeft: 4,
						paddingRight: 4,
					}}
				>
					<PlaybackRateIcon color={TOOLBAR_FOREGROUND} size={20} />
					<div style={{width: 4}} />
					<span style={{fontSize: 12, lineHeight: '16px', width: 30}}>1x</span>
					<div style={{width: 4}} />
					<CaretIcon color={TOOLBAR_FOREGROUND} direction="down" size={10} />
				</Interactive.Div>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					left: '50%',
					position: 'absolute',
					translate: '-50% 0',
				}}
			>
				<div style={{width: 16}} />
				<Interactive.Div name="Jump to start">
					<IconButton>
						<JumpToStartIcon color={TOOLBAR_FOREGROUND} size={18} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Step backward">
					<IconButton>
						<StepBackIcon color={TOOLBAR_FOREGROUND} size={16} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Play">
					<IconButton>
						<PlayIcon color={TOOLBAR_FOREGROUND} size={14} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Step forward">
					<IconButton>
						<StepForwardIcon color={TOOLBAR_FOREGROUND} size={16} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 16}} />
				<Interactive.Div name="Loop playback">
					<IconButton active>
						<LoopIcon color={BLUE} size={18} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 6}} />
				<Interactive.Div name="Volume">
					<IconButton>
						<VolumeIcon color={TOOLBAR_FOREGROUND} size={21} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 16}} />
				<Interactive.Div name="Set in point">
					<IconButton width={18}>
						<InPointIcon color={TOOLBAR_FOREGROUND} size={17} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Set out point">
					<IconButton width={18}>
						<OutPointIcon color={TOOLBAR_FOREGROUND} size={17} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 16}} />
				<Interactive.Div name="Transparency grid">
					<IconButton active>
						<CheckerboardIcon color={BLUE} size={18} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 2}} />
				<Interactive.Div name="Canvas outline">
					<IconButton active>
						<OutlineIcon color={BLUE} size={18} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 2}} />
				<Interactive.Div name="Rulers">
					<IconButton>
						<RulerIcon color={TOOLBAR_FOREGROUND} size={18} />
					</IconButton>
				</Interactive.Div>
				<div style={{width: 2}} />
				<Interactive.Div name="Snapping">
					<IconButton active>
						<MagnetIcon
							color={BLUE}
							size={18}
							style={{position: 'relative', top: 1}}
						/>
					</IconButton>
				</Interactive.Div>
				<div style={{width: 16}} />
				<Interactive.Div name="Fullscreen">
					<IconButton>
						<FullscreenIcon color={TOOLBAR_FOREGROUND} size={18} />
					</IconButton>
				</Interactive.Div>
			</div>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 28,
					position: 'absolute',
					right: 12,
				}}
			>
				<Interactive.Div
					name="Render"
					style={{
						alignItems: 'center',
						color: TOOLBAR_FOREGROUND,
						display: 'flex',
						gap: 6,
						height: 28,
						paddingLeft: 8,
						paddingRight: 7,
					}}
				>
					<RocketIcon color={TOOLBAR_FOREGROUND} size={18} />
					<span style={{fontSize: 12}}>Render</span>
				</Interactive.Div>
				<Divider height={22} />
				<Interactive.Div name="Render options">
					<CaretIcon color="#9ba0a4" direction="down" size={12} />
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};

const TimelineRowLabel: React.FC<{
	readonly children: React.ReactNode;
	readonly depth: number;
	readonly expanded?: boolean;
	readonly secondary?: string;
}> = ({children, depth, expanded, secondary}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				borderBottom: `1px solid ${SEPARATOR}`,
				boxSizing: 'border-box',
				color: 'rgba(255, 255, 255, 0.8)',
				display: 'flex',
				height: '100%',
				minWidth: 0,
				paddingLeft: 10,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					backgroundColor: 'rgba(0, 0, 0, 0.4)',
					borderRadius: 2,
					display: 'flex',
					flexShrink: 0,
					height: 16,
					justifyContent: 'center',
					marginRight: 6,
					width: 16,
				}}
			>
				<EyeIcon color="#dddddd" size={12} />
			</div>
			<div style={{flexShrink: 0, width: depth * 10}} />
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexShrink: 0,
					height: 16,
					justifyContent: 'center',
					width: 12,
				}}
			>
				{expanded === undefined ? null : (
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							height: 10,
							justifyContent: 'center',
							rotate: expanded ? '90deg' : '0deg',
							width: 10,
						}}
					>
						<svg aria-hidden="true" height="8" viewBox="0 0 8 10" width="6.4">
							<path d="M0 0L8 5L0 10Z" fill="#a6a7a9" />
						</svg>
					</div>
				)}
			</div>
			<div
				style={{
					fontSize: 12,
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
				}}
			>
				{children}
			</div>
			{secondary ? (
				<div
					style={{
						color: 'rgba(255, 255, 255, 0.35)',
						fontSize: 12,
						marginLeft: 20,
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{secondary}
				</div>
			) : null}
		</div>
	);
};

const Filmstrip: React.FC<{
	readonly height: number;
	readonly width: number;
}> = ({height, width}) => {
	const cells = Math.ceil(width / 957);

	return (
		<div
			style={{
				display: 'flex',
				height,
				overflow: 'hidden',
				width,
			}}
		>
			{Array.from({length: cells}).map((_, index) => (
				<Img
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					name="Video filmstrip tile"
					showInTimeline={false /* repeated image tile */}
					src={staticFile('studio-timeline-filmstrip.png')}
					style={{flex: '0 0 957px', height, width: 957}}
				/>
			))}
		</div>
	);
};

const AvatarStrip: React.FC<{
	readonly height: number;
	readonly width: number;
}> = ({height, width}) => {
	const cells = Math.ceil(width / 957);

	return (
		<div
			style={{
				display: 'flex',
				height,
				overflow: 'hidden',
				width,
			}}
		>
			{Array.from({length: cells}).map((_, index) => (
				<Img
					// eslint-disable-next-line react/no-array-index-key
					key={index}
					name="Avatar strip tile"
					showInTimeline={false /* repeated image tile */}
					src={staticFile('studio-timeline-avatar-strip.png')}
					style={{flex: '0 0 957px', height, width: 957}}
				/>
			))}
		</div>
	);
};

const Timeline: React.FC<{
	readonly durationInFrames: number;
	readonly fps: number;
	readonly frame: number;
	readonly height: number;
	readonly width: number;
}> = ({durationInFrames, fps, frame, height, width}) => {
	const labelWidth = Math.round(width * TIMELINE_LABEL_RATIO);
	const trackWidth = width - labelWidth;
	const pixelsPerFrame = 1.29;
	const sequenceWidth = durationInFrames * pixelsPerFrame;
	const trackLeft = 19;
	const timelineFps = Math.max(1, Math.round(fps));
	const playheadLeft = Math.min(
		trackLeft + sequenceWidth,
		trackLeft + frame * pixelsPerFrame,
	);
	const totalSeconds = Math.floor(frame / timelineFps);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const frameWithinSecond = frame % timelineFps;
	const timecode = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(frameWithinSecond).padStart(2, '0')}`;
	const ticks = Array.from(
		{length: Math.floor(durationInFrames / 5) + 1},
		(_, index) => index * 5,
	);
	const rows = [22, 22, 46, 22, 22, 22];

	return (
		<Interactive.Div
			name="Timeline"
			style={{
				backgroundColor: TIMELINE_BACKGROUND,
				color: LIGHT_TEXT,
				display: 'flex',
				height,
				overflow: 'hidden',
				position: 'relative',
				width,
			}}
		>
			<Interactive.Div
				name="Timeline layer list"
				style={{
					backgroundColor: BACKGROUND,
					flexShrink: 0,
					height: '100%',
					width: labelWidth,
				}}
			>
				<div
					style={{
						borderBottom: `1px solid ${SEPARATOR}`,
						boxSizing: 'border-box',
						height: 39,
						paddingLeft: 10,
						paddingTop: 6,
					}}
				>
					<Interactive.Div name="Timeline time display">
						<div
							style={{
								color: LIGHT_TEXT,
								fontFamily: 'monospace',
								fontSize: 14,
								fontVariantNumeric: 'tabular-nums',
								lineHeight: '18px',
							}}
						>
							{timecode}
						</div>
						<div
							style={{
								fontFamily: 'monospace',
								fontSize: 10,
								lineHeight: '10px',
							}}
						>
							{frame}
						</div>
					</Interactive.Div>
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							gap: 4,
							left: 217,
							position: 'absolute',
							top: 7,
						}}
					>
						<Interactive.Div name="Timeline zoom out">
							<IconButton>
								<CanvasZoomOutIcon color={TOOLBAR_FOREGROUND} size={20} />
							</IconButton>
						</Interactive.Div>
						<Interactive.Div
							name="Timeline zoom control"
							style={{
								backgroundColor: '#353a3e',
								borderRadius: 8,
								height: 6,
								position: 'relative',
								width: 80,
							}}
						>
							<div
								style={{
									backgroundColor: WHITE,
									borderRadius: '50%',
									height: 14,
									left: 0,
									position: 'absolute',
									top: -4,
									width: 14,
								}}
							/>
						</Interactive.Div>
						<Interactive.Div name="Timeline zoom in">
							<IconButton>
								<CanvasZoomIcon color={TOOLBAR_FOREGROUND} size={20} />
							</IconButton>
						</Interactive.Div>
					</div>
				</div>
				<Interactive.Div name="Video layer" style={{height: rows[0]}}>
					<TimelineRowLabel depth={0} expanded>
						Video
					</TimelineRowLabel>
				</Interactive.Div>
				<Interactive.Div name="Container layer" style={{height: rows[1]}}>
					<TimelineRowLabel depth={1} expanded>
						Container
					</TimelineRowLabel>
				</Interactive.Div>
				<Interactive.Div name="Video clip layer" style={{height: rows[2]}}>
					<TimelineRowLabel depth={2} secondary="whats11.mov">
						&lt;Video&gt;
					</TimelineRowLabel>
				</Interactive.Div>
				<Interactive.Div name="Absolute Fill layer 1" style={{height: rows[3]}}>
					<TimelineRowLabel depth={1} expanded>
						&lt;AbsoluteFill&gt;
					</TimelineRowLabel>
				</Interactive.Div>
				<Interactive.Div name="Absolute Fill layer 2" style={{height: rows[4]}}>
					<TimelineRowLabel depth={2} expanded>
						&lt;AbsoluteFill&gt;
					</TimelineRowLabel>
				</Interactive.Div>
				<Interactive.Div name="Avatar image layer" style={{height: rows[5]}}>
					<TimelineRowLabel depth={4} secondary="remotion-avatar.png">
						&lt;Img&gt;
					</TimelineRowLabel>
				</Interactive.Div>
			</Interactive.Div>
			<Interactive.Div
				name="Timeline tracks"
				style={{
					backgroundColor: TIMELINE_BACKGROUND,
					height: '100%',
					overflow: 'hidden',
					position: 'relative',
					width: trackWidth,
				}}
			>
				<Interactive.Div
					name="Timeline ruler"
					style={{
						backgroundColor: BACKGROUND,
						borderBottom: `1px solid ${SEPARATOR}`,
						boxSizing: 'border-box',
						height: 39,
						position: 'relative',
					}}
				>
					{ticks.map((tick) => (
						<React.Fragment key={tick}>
							<div
								style={{
									backgroundColor: '#303438',
									height:
										tick % (timelineFps * 5) === 0
											? 15
											: tick % timelineFps === 0
												? 5
												: 2,
									left: trackLeft + tick * pixelsPerFrame,
									position: 'absolute',
									top: 0,
									width: 2,
								}}
							/>
							{tick > 0 && tick % (timelineFps * 5) === 0 ? (
								<div
									style={{
										color: 'rgba(255, 255, 255, 0.55)',
										fontSize: 12,
										left: trackLeft + tick * pixelsPerFrame + 9,
										position: 'absolute',
										top: 3,
									}}
								>
									00:{String(tick / timelineFps).padStart(2, '0')}.00
								</div>
							) : null}
						</React.Fragment>
					))}
				</Interactive.Div>
				<div style={{height: rows[0], paddingLeft: trackLeft}}>
					<Interactive.Div
						name="Video sequence"
						style={{
							backgroundColor: '#0d69bd',
							border: '1px solid #327cbf',
							borderRadius: 2,
							boxSizing: 'border-box',
							color: '#8bc5f0',
							fontFamily: 'monospace',
							fontSize: 11,
							height: 21,
							lineHeight: '19px',
							overflow: 'hidden',
							paddingLeft: 5,
							width: sequenceWidth,
						}}
					>
						{frame}
					</Interactive.Div>
				</div>
				<div style={{height: rows[1], paddingLeft: trackLeft}}>
					<Interactive.Div
						name="Container sequence"
						style={{
							backgroundColor: '#0d69bd',
							border: '1px solid #327cbf',
							borderRadius: 2,
							boxSizing: 'border-box',
							color: '#8bc5f0',
							fontFamily: 'monospace',
							fontSize: 11,
							height: 21,
							lineHeight: '19px',
							overflow: 'hidden',
							paddingLeft: 5,
							width: sequenceWidth,
						}}
					>
						{frame}
					</Interactive.Div>
				</div>
				<div style={{height: rows[2], paddingLeft: trackLeft}}>
					<Interactive.Div
						name="Video filmstrip"
						style={{height: 45, width: sequenceWidth}}
					>
						<Filmstrip height={45} width={sequenceWidth} />
					</Interactive.Div>
				</div>
				<div style={{height: rows[3], paddingLeft: trackLeft}}>
					<Interactive.Div
						name="Absolute Fill sequence 1"
						style={{
							backgroundColor: '#0d69bd',
							border: '1px solid #327cbf',
							borderRadius: 2,
							boxSizing: 'border-box',
							color: '#8bc5f0',
							fontFamily: 'monospace',
							fontSize: 11,
							height: 21,
							lineHeight: '19px',
							overflow: 'hidden',
							paddingLeft: 5,
							width: sequenceWidth,
						}}
					>
						{frame}
					</Interactive.Div>
				</div>
				<div style={{height: rows[4], paddingLeft: trackLeft}}>
					<Interactive.Div
						name="Absolute Fill sequence 2"
						style={{
							backgroundColor: '#0d69bd',
							border: '1px solid #327cbf',
							borderRadius: 2,
							boxSizing: 'border-box',
							color: '#8bc5f0',
							fontFamily: 'monospace',
							fontSize: 11,
							height: 21,
							lineHeight: '19px',
							overflow: 'hidden',
							paddingLeft: 5,
							width: sequenceWidth,
						}}
					>
						{frame}
					</Interactive.Div>
				</div>
				<div style={{height: rows[5], paddingLeft: trackLeft}}>
					<Interactive.Div
						name="Avatar strip"
						style={{height: 21, width: sequenceWidth}}
					>
						<AvatarStrip height={21} width={sequenceWidth} />
					</Interactive.Div>
				</div>
				<Interactive.Div
					name="Timeline playhead"
					style={{
						backgroundColor: PLAYHEAD,
						bottom: 0,
						left: playheadLeft,
						position: 'absolute',
						top: 0,
						width: 1,
						zIndex: 2,
					}}
				>
					<div
						style={{
							backgroundColor: PLAYHEAD,
							clipPath: 'polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%)',
							height: 16,
							left: -8,
							position: 'absolute',
							top: 0,
							width: 17,
						}}
					/>
				</Interactive.Div>
			</Interactive.Div>
		</Interactive.Div>
	);
};

const StudioInner = React.forwardRef<
	HTMLDivElement,
	StudioProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			compositionName,
			compositionWidth,
			compositionHeight,
			content,
			controls,
			durationInFrames,
			frame,
			showLeftSidebar,
			showRightSidebar,
			viewportWidth,
		},
		ref,
	) => {
		const outlineRef = React.useRef<HTMLDivElement>(null);
		React.useImperativeHandle(
			ref,
			() => outlineRef.current as HTMLDivElement,
			[],
		);
		const {height, fps} = useVideoConfig();
		const width = viewportWidth;
		const topPanelHeight = Math.round(
			(height - MENU_HEIGHT - SPLITTER_SIZE) * TOP_PANEL_RATIO,
		);
		const timelineHeight =
			height - MENU_HEIGHT - topPanelHeight - SPLITTER_SIZE;
		const canvasRowHeight = topPanelHeight - PREVIEW_TOOLBAR_HEIGHT;
		const leftSidebarWidth = showLeftSidebar
			? Math.min(350, Math.round(width * LEFT_SIDEBAR_RATIO))
			: 0;
		const rightSidebarWidth = showRightSidebar
			? Math.min(350, Math.max(250, Math.round(width * RIGHT_SIDEBAR_RATIO)))
			: 0;
		const canvasWidth = Math.max(
			17,
			width -
				leftSidebarWidth -
				rightSidebarWidth -
				(showLeftSidebar ? SPLITTER_SIZE : 0) -
				(showRightSidebar ? SPLITTER_SIZE : 0),
		);

		return (
			<Sequence
				controls={controls}
				layout="none"
				name="<Studio>"
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						backgroundColor: BACKGROUND,
						color: WHITE,
						display: 'flex',
						flexDirection: 'column',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 13,
						fontWeight: 400,
						height,
						left: 0,
						lineHeight: 1.5,
						overflow: 'hidden',
						position: 'absolute',
						top: 0,
						width,
					}}
				>
					<MenuToolbar
						compositionName={compositionName}
						showLeftSidebar={showLeftSidebar}
						showRightSidebar={showRightSidebar}
					/>
					<div style={{height: topPanelHeight, width}}>
						<div style={{display: 'flex', height: canvasRowHeight, width}}>
							{showLeftSidebar ? (
								<>
									<div style={{width: leftSidebarWidth}}>
										<LeftSidebar />
									</div>
									<Interactive.Div
										name="Left sidebar splitter"
										style={{backgroundColor: SPLITTER, width: SPLITTER_SIZE}}
									/>
								</>
							) : null}
							<PreviewCanvas
								canvasHeight={canvasRowHeight}
								canvasWidth={canvasWidth}
								compositionHeight={compositionHeight}
								compositionWidth={compositionWidth}
								content={content}
								durationInFrames={durationInFrames}
								frame={frame}
							/>
							{showRightSidebar ? (
								<>
									<Interactive.Div
										name="Right sidebar splitter"
										style={{backgroundColor: SPLITTER, width: SPLITTER_SIZE}}
									/>
									<div style={{width: rightSidebarWidth}}>
										<RightSidebar
											compositionHeight={compositionHeight}
											compositionName={compositionName}
											compositionWidth={compositionWidth}
											durationInFrames={durationInFrames}
											fps={fps}
										/>
									</div>
								</>
							) : null}
						</div>
						<PreviewToolbar />
					</div>
					<Interactive.Div
						name="Timeline splitter"
						style={{backgroundColor: SPLITTER, height: SPLITTER_SIZE, width}}
					/>
					<Timeline
						durationInFrames={durationInFrames}
						fps={fps}
						frame={frame}
						height={timelineHeight}
						width={width}
					/>
				</div>
			</Sequence>
		);
	},
);

StudioInner.displayName = '<Studio>';

export const Studio = Interactive.withSchema({
	Component: StudioInner,
	componentName: '<Studio>',
	schema: studioInteractivitySchema,
	supportsEffects: false,
});

export const StudioReference: React.FC<StudioReferenceProps> = ({
	showLeftSidebar,
	showRightSidebar,
	viewportWidth,
}) => {
	return (
		<Studio
			compositionHeight={REFERENCE_COMPOSITION_HEIGHT}
			compositionName="Chapter11-Outro"
			compositionWidth={REFERENCE_COMPOSITION_WIDTH}
			content={<Scene11 platform="youtube" />}
			durationInFrames={742}
			frame={655}
			showLeftSidebar={showLeftSidebar}
			showRightSidebar={showRightSidebar}
			viewportWidth={viewportWidth}
		/>
	);
};
