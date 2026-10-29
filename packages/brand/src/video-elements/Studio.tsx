import {getWaveformPortion, useAudioData} from '@remotion/media-utils';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	random,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import {z} from 'zod';
import {Scene11} from '../announcements/whats-new-in-remotion/Scene11';
import {MacBookScreen} from '../WebMCPPromo/MacBookScene';
import {
	BracesIcon,
	CanvasFitIcon,
	CanvasZoomIcon,
	CanvasZoomOutIcon,
	CaretIcon,
	CheckerboardIcon,
	DuplicateIcon,
	EyeIcon,
	FolderIcon,
	FullscreenIcon,
	ImageIcon,
	InPointIcon,
	JumpToStartIcon,
	LoopIcon,
	MagnetIcon,
	OutPointIcon,
	PlaybackRateIcon,
	PlayIcon,
	RemotionGlyph,
	RocketIcon,
	SearchIcon,
	SettingsIcon,
	SidebarIcon,
	StepBackIcon,
	StepForwardIcon,
	TrashIcon,
	VideoIcon,
	VolumeIcon,
	VscodeIcon,
} from './studio-icons';

const BACKGROUND = '#1f2428';
const INPUT_BACKGROUND = '#2f363d';
const LIGHT_TEXT = '#A6A7A9';
const TOOLBAR_FOREGROUND = '#d2d3d4';
const MENU_BAR_ICON_COLOR = '#d8d8d8';
const WHITE = '#ffffff';
const BLUE = '#0b84f3';
const TIMELINE_BACKGROUND = '#15181B';
const TIMELINE_PADDING = 16;
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
const TIMELINE_LABEL_MIN_WIDTH = 250;
const TIMELINE_LABEL_MAX_WIDTH = 350;
const REFERENCE_COMPOSITION_WIDTH = 1920;
const REFERENCE_COMPOSITION_HEIGHT = 1080;
const DIALOGUE_AUDIO = 'https://remotion.media/dialogue.wav';

// Match TimelineSequenceName's fade without masking the connected-composition icon.
const timelineLabelStyle: React.CSSProperties = {
	minWidth: 0,
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	paddingRight: 10,
	maskImage: 'linear-gradient(to right, black calc(100% - 10px), transparent)',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 10px), transparent)',
};

export const studioReferenceSchema = z.object({
	viewportWidth: z.number().int().positive(),
	responsivenessProgress: z.number().min(0).max(1),
});

export type StudioReferenceProps = z.infer<typeof studioReferenceSchema>;

export type StudioTimeline = {
	readonly labelWidth: number;
	readonly sourceLabelWidth: number;
	readonly sourceTrackWidth: number;
	readonly trackScale: number;
	readonly pixelsPerFrame: number;
	readonly imageSrc: string;
	readonly removedRow: {readonly top: number; readonly height: number} | null;
	readonly removedOpeningRows: {
		readonly top: number;
		readonly height: number;
		readonly width: number;
	} | null;
	readonly width: number;
	readonly height: number;
	readonly soundEffects: readonly {
		readonly from: number;
		readonly durationInFrames: number;
	}[];
	readonly soundtrack: {
		readonly name: string;
		readonly assetName: string;
		readonly fadeInFrames: number;
		readonly fadeOutFrames: number;
	} | null;
	readonly capturedChapters: readonly {
		readonly name: string;
		readonly from: number;
		readonly durationInFrames: number;
		readonly sourceLeft: number;
		readonly caption: string;
	}[];
	readonly ending: {
		readonly selected: boolean;
		readonly name: string;
		readonly from: number;
		readonly durationInFrames: number;
		readonly thumbnailSrc: string;
		readonly connectedCompositionName: string;
	} | null;
	readonly regions: readonly {
		readonly left: number;
		readonly top: number;
		readonly width: number;
		readonly height: number;
		readonly capturedOpacity: number;
	}[];
	readonly mediaLabels: readonly {
		readonly top: number;
		readonly height: number;
		readonly left: number;
		readonly name: string;
		readonly assetName: string;
	}[];
};

export type StudioProps = InteractiveBaseProps & {
	readonly compositionName: string;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
	readonly content: React.ReactNode;
	readonly durationInFrames: number;
	readonly frame: number;
	readonly responsivenessProgress: number;
	readonly showTimelineZoom: boolean;
	readonly timelineOffset: number;
	readonly timeline: StudioTimeline | null;
	readonly viewportHeight: number | null;
	readonly viewportWidth: number;
};

const studioInteractivitySchema = {
	...Interactive.baseSchema,
	viewportWidth: {
		type: 'number',
		default: 1600,
		description: 'Viewport width',
		hiddenFromList: false,
		keyframable: false,
		min: 17,
		step: 1,
	},
	responsivenessProgress: {
		type: 'number',
		default: 0,
		description: 'Responsive sidebar progress',
		hiddenFromList: false,
		keyframable: true,
		min: 0,
		max: 1,
		step: 0.01,
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
	readonly responsivenessProgress: number;
}> = ({compositionName, responsivenessProgress}) => {
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
							color={MENU_BAR_ICON_COLOR}
							expanded={responsivenessProgress < 0.5}
							side="left"
							size={16}
						/>
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Remotion menu">
					<IconButton width={30}>
						<RemotionGlyph color={MENU_BAR_ICON_COLOR} size={14} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div
					name="Composition breadcrumb"
					style={{
						alignItems: 'center',
						color: 'rgba(255, 255, 255, 0.8)',
						display: 'flex',
						gap: 5,
						marginLeft: 8,
						whiteSpace: 'nowrap',
					}}
				>
					<span style={{letterSpacing: 0.08}}>
						{compositionName === 'WhatsNew' ? 'announcements' : 'brand'} /{' '}
						{compositionName}
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
			</div>
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
						<SettingsIcon color={MENU_BAR_ICON_COLOR} size={16} />
					</IconButton>
				</Interactive.Div>
				<Interactive.Div name="Right sidebar toggle">
					<IconButton>
						<SidebarIcon
							color={MENU_BAR_ICON_COLOR}
							expanded={responsivenessProgress < 0.5}
							side="right"
							size={16}
						/>
					</IconButton>
				</Interactive.Div>
			</div>
		</Interactive.Div>
	);
};

const LeftSidebar: React.FC<{readonly compositionName: string}> = ({
	compositionName,
}) => {
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
					<FolderIcon color={LIGHT_TEXT} expanded size={18} />
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
						{compositionName === 'WhatsNew'
							? 'WhatsNew'
							: 'SocialMediaAnnouncements'}
					</div>
				</Interactive.Div>
				<Interactive.Div
					name={`${compositionName} composition`}
					style={{
						alignItems: 'center',
						backgroundColor: 'rgba(255, 255, 255, 0.06)',
						borderRadius: 4,
						color: WHITE,
						display: 'flex',
						height: 28,
						marginBottom: 1,
						marginLeft: 8,
						marginRight: 4,
						minWidth: 0,
						paddingLeft: 20,
					}}
				>
					<VideoIcon color={WHITE} size={18} />
					<div
						style={{
							fontSize: 13,
							marginLeft: 8,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{compositionName}
					</div>
				</Interactive.Div>
				{compositionName === 'WhatsNew' ? (
					<Interactive.Div
						name="Endcard connected composition"
						style={{
							alignItems: 'center',
							display: 'flex',
							height: 28,
							marginLeft: 8,
							marginBottom: 1,
							paddingLeft: 20,
							color: LIGHT_TEXT,
						}}
					>
						<VideoIcon color={LIGHT_TEXT} size={18} />
						<span style={{fontSize: 13, marginLeft: 8}}>Endcard</span>
					</Interactive.Div>
				) : null}
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

const SequenceInspectorSection: React.FC<{
	readonly label: string;
	readonly initiallyExpanded: boolean;
	readonly collapsible: boolean;
	readonly action: React.ReactNode;
	readonly children: React.ReactNode;
}> = ({label, initiallyExpanded, collapsible, action, children}) => {
	const [expanded, setExpanded] = React.useState(initiallyExpanded);
	return (
		<div style={{paddingBottom: 4}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					height: 28,
					padding: '0 10px',
					gap: 8,
				}}
			>
				<button
					type="button"
					aria-expanded={collapsible ? expanded : undefined}
					onClick={collapsible ? () => setExpanded(!expanded) : undefined}
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 6,
						flex: 1,
						color: LIGHT_TEXT,
						fontFamily: 'inherit',
						fontSize: 12,
						fontWeight: 600,
						padding: 0,
						background: 'transparent',
						border: 0,
						textAlign: 'left',
					}}
				>
					{label}
					{collapsible ? (
						<CaretIcon
							color={LIGHT_TEXT}
							direction="down"
							size={8}
							style={{
								flexShrink: 0,
								transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
							}}
						/>
					) : null}
				</button>
				{action}
			</div>
			{expanded ? children : null}
		</div>
	);
};

const SequenceInspectorField: React.FC<{
	readonly label: string;
	readonly value: React.ReactNode;
	readonly keyframable: boolean;
}> = ({label, value, keyframable}) => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			height: 28,
			padding: '0 10px',
			gap: 8,
			fontSize: 12,
		}}
	>
		<span style={{flex: 1, minWidth: 0, color: TOOLBAR_FOREGROUND}}>
			{label}
		</span>
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 8,
				color: BLUE,
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			{value}
		</div>
		{keyframable ? (
			<svg
				width={12}
				height={12}
				viewBox="0 0 12 12"
				style={{flexShrink: 0, marginLeft: 4}}
			>
				<path d="M6 1.5 10.5 6 6 10.5 1.5 6Z" fill="none" stroke={LIGHT_TEXT} />
			</svg>
		) : null}
	</div>
);

const RightSidebar: React.FC<{
	readonly compositionName: string;
	readonly compositionWidth: number;
	readonly compositionHeight: number;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly selectedEndcard: StudioTimeline['ending'];
}> = ({
	compositionName,
	compositionWidth,
	compositionHeight,
	durationInFrames,
	fps,
	selectedEndcard,
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
					name="Sequence tab"
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
					Sequence
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
			{selectedEndcard ? (
				<div
					style={{
						height: 'calc(100% - 34px)',
						overflowY: 'auto',
						scrollbarWidth: 'none',
					}}
				>
					<div style={{padding: '4px 10px', color: WHITE}}>
						<div style={{height: 28, display: 'flex', alignItems: 'center'}}>
							{selectedEndcard.connectedCompositionName}
						</div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								height: 28,
								color: LIGHT_TEXT,
							}}
						>
							<BracesIcon color={LIGHT_TEXT} size={18} />
							<span>EndCard.tsx:49</span>
						</div>
					</div>
					<SequenceInspectorSection
						label="Controls"
						initiallyExpanded
						collapsible
						action={null}
					>
						<div style={{marginBottom: 8}}>
							<SequenceInspectorField
								label="Platform"
								keyframable={false}
								value={
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 12,
											height: 22,
											padding: '0 7px',
											backgroundColor: INPUT_BACKGROUND,
											border: '1px solid #13161b',
											borderRadius: 4,
											color: WHITE,
										}}
									>
										youtube
										<CaretIcon
											direction="down"
											size={8}
											style={{flexShrink: 0}}
										/>
									</div>
								}
							/>
						</div>
					</SequenceInspectorSection>
					<SequenceInspectorSection
						label="Transform"
						initiallyExpanded={false}
						collapsible
						action={null}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								padding: '0 10px 8px',
								color: LIGHT_TEXT,
							}}
						>
							{Array.from({length: 6}, (_, index) => (
								<svg
									key={index}
									width={16}
									height={16}
									viewBox="0 0 16 16"
									fill="none"
									style={{
										flexShrink: 0,
										transform: index >= 3 ? 'rotate(90deg)' : undefined,
									}}
								>
									<path
										d={
											['M2.5 2.5V13.5', 'M7.5 2.5V13.5', 'M13.5 2.5V13.5'][
												index % 3
											]
										}
										stroke="currentColor"
										strokeLinecap="square"
									/>
									<line
										x1={[4, 3, 3][index % 3]}
										x2={[13, 12, 12][index % 3]}
										y1={6}
										y2={6}
										stroke="currentColor"
										strokeWidth={2}
									/>
									<line
										x1={[4, 4, 5][index % 3]}
										x2={[11, 11, 12][index % 3]}
										y1={10}
										y2={10}
										stroke="currentColor"
										strokeWidth={2}
									/>
								</svg>
							))}
						</div>
						{[
							{label: 'Transform origin', values: ['50%', '50%']},
							{label: 'Offset', values: ['0px', '0px']},
							{label: 'Scale', values: ['1']},
							{label: 'Rotation', values: ['0°']},
							{label: 'Opacity', values: ['1']},
						].map(({label, values}) => (
							<SequenceInspectorField
								key={label}
								label={label}
								keyframable
								value={values.map((value, index) => (
									<span key={index === 0 ? 'x' : 'y'}>{value}</span>
								))}
							/>
						))}
					</SequenceInspectorSection>
					<SequenceInspectorSection
						label="Crop"
						initiallyExpanded={false}
						collapsible
						action={null}
					>
						{['Crop left', 'Crop right', 'Crop top', 'Crop bottom'].map(
							(label) => (
								<SequenceInspectorField
									key={label}
									label={label}
									value="0"
									keyframable
								/>
							),
						)}
					</SequenceInspectorSection>
					<SequenceInspectorSection
						label="Effects"
						initiallyExpanded={false}
						collapsible={false}
						action={
							<svg
								aria-label="Add effect"
								width={15}
								height={15}
								viewBox="0 0 448 512"
								style={{flexShrink: 0}}
							>
								<path
									fill="currentColor"
									d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z"
								/>
							</svg>
						}
					>
						{null}
					</SequenceInspectorSection>
					<SequenceInspectorSection
						label="Actions"
						initiallyExpanded
						collapsible
						action={null}
					>
						{[
							{
								label: 'Duplicate',
								Icon: DuplicateIcon,
								viewBox: '-32 -32 704 704',
							},
							{label: 'Delete', Icon: TrashIcon, viewBox: '-120 -96 688 688'},
						].map(({label, Icon, viewBox}) => (
							<div
								key={label}
								style={{
									height: 28,
									paddingLeft: 10,
									display: 'flex',
									alignItems: 'center',
									gap: 6,
								}}
							>
								<Icon
									color={LIGHT_TEXT}
									viewBox={viewBox}
									style={{width: 22, height: 22, flexShrink: 0, marginLeft: -2}}
								/>
								{label}
							</div>
						))}
					</SequenceInspectorSection>
				</div>
			) : (
				<>
					<div style={{padding: '4px 0'}}>
						<Interactive.Div
							name="Composition ID"
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
							<span style={{marginLeft: 8}}>
								{compositionName === 'WhatsNew'
									? 'Root.tsx:27'
									: 'Root.tsx:127'}
							</span>
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
							<span style={{marginLeft: 8}}>
								{compositionName === 'WhatsNew'
									? 'WhatsNew.tsx:23'
									: 'Scene11.tsx:11'}
							</span>
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
					</Interactive.Div>
					{compositionName === 'WhatsNew' ? null : (
						<>
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
						</>
					)}
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
				</>
			)}
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
	readonly selectedEndcard: boolean;
}> = ({
	canvasHeight,
	canvasWidth,
	compositionHeight,
	compositionWidth,
	content,
	durationInFrames,
	frame,
	selectedEndcard,
}) => {
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
						freeze={frame}
						height={compositionHeight}
						width={compositionWidth}
					>
						{content}
					</Sequence>
				</div>
				{selectedEndcard ? (
					<div
						aria-hidden
						style={{
							position: 'absolute',
							left: '60%',
							top: 0,
							right: 0,
							bottom: 0,
							border: `2px solid ${BLUE}`,
							boxSizing: 'border-box',
							pointerEvents: 'none',
						}}
					/>
				) : null}
			</Interactive.Div>
		</Interactive.Div>
	);
};

const PreviewToolbar: React.FC<{
	readonly responsivenessProgress: number;
}> = ({responsivenessProgress}) => {
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
					opacity: interpolate(responsivenessProgress, [0.4, 0.6], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
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
				<div
					style={{
						alignItems: 'center',
						display: 'flex',
						opacity: interpolate(responsivenessProgress, [0.4, 0.6], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						right: '100%',
					}}
				>
					<Interactive.Div name="Loop playback">
						<IconButton active>
							<LoopIcon color={BLUE} size={18} />
						</IconButton>
					</Interactive.Div>
					<Interactive.Div name="Volume">
						<IconButton>
							<VolumeIcon color={TOOLBAR_FOREGROUND} size={21} />
						</IconButton>
					</Interactive.Div>
					<div style={{width: 8}} />
					<Interactive.Div name="Set in point">
						<IconButton width={18}>
							<InPointIcon color={TOOLBAR_FOREGROUND} size={16} />
						</IconButton>
					</Interactive.Div>
					<Interactive.Div name="Set out point">
						<IconButton width={18}>
							<OutPointIcon color={TOOLBAR_FOREGROUND} size={16} />
						</IconButton>
					</Interactive.Div>
					<div style={{width: 24}} />
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
				</div>
				<Interactive.Div name="Play">
					<IconButton>
						<PlayIcon color={TOOLBAR_FOREGROUND} size={14} />
					</IconButton>
				</Interactive.Div>
				<div
					style={{
						alignItems: 'center',
						display: 'flex',
						opacity: interpolate(responsivenessProgress, [0.4, 0.6], [1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						left: '100%',
						position: 'absolute',
					}}
				>
					<Interactive.Div name="Step forward">
						<IconButton>
							<StepForwardIcon color={TOOLBAR_FOREGROUND} size={16} />
						</IconButton>
					</Interactive.Div>
					<div style={{width: 24}} />
					<Interactive.Div name="Transparency grid">
						<IconButton active width={26}>
							<CheckerboardIcon color={BLUE} size={18} />
						</IconButton>
					</Interactive.Div>
					<Interactive.Div name="Snapping">
						<IconButton active width={26}>
							<MagnetIcon color={BLUE} size={18} />
						</IconButton>
					</Interactive.Div>
					<Interactive.Div name="View options">
						<IconButton width={20}>
							<CaretIcon
								color={TOOLBAR_FOREGROUND}
								direction="down"
								size={10}
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
	const audioData = useAudioData(DIALOGUE_AUDIO);
	const waveformHeight = 13;
	const numberOfSamples = Math.max(1, Math.floor(width / 2));
	const waveform = React.useMemo(() => {
		if (!audioData) {
			return [];
		}

		return getWaveformPortion({
			audioData,
			durationInSeconds: audioData.durationInSeconds,
			numberOfSamples,
			startTimeInSeconds: 0,
		});
	}, [audioData, numberOfSamples]);

	return (
		<div
			style={{
				display: 'flex',
				height,
				overflow: 'hidden',
				position: 'relative',
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
			<div
				style={{
					backgroundColor: '#60347d',
					borderTop: '1px solid #8b5aa4',
					bottom: 0,
					boxSizing: 'border-box',
					height: waveformHeight,
					left: 0,
					position: 'absolute',
					width,
				}}
			>
				<svg
					height={waveformHeight}
					viewBox={`0 0 ${width} ${waveformHeight}`}
					width={width}
				>
					{waveform.map(({amplitude, index}) => {
						const barHeight = Math.max(
							1,
							amplitude ** 0.7 * (waveformHeight - 3),
						);
						const x = (index / Math.max(1, waveform.length - 1)) * width;

						return (
							<line
								key={index}
								stroke="rgba(255, 255, 255, 0.62)"
								strokeWidth={1}
								x1={x}
								x2={x}
								y1={(waveformHeight - barHeight) / 2}
								y2={(waveformHeight + barHeight) / 2}
							/>
						);
					})}
				</svg>
			</div>
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
	readonly showZoom: boolean;
	readonly timelineOffset: number;
	readonly timeline: StudioTimeline | null;
	readonly width: number;
}> = ({
	durationInFrames,
	fps,
	frame,
	height,
	showZoom,
	timelineOffset,
	timeline,
	width,
}) => {
	const opacityFilterId = React.useId();
	const labelWidth = Math.min(
		width,
		Math.max(
			TIMELINE_LABEL_MIN_WIDTH,
			Math.min(
				TIMELINE_LABEL_MAX_WIDTH,
				Math.round(width * TIMELINE_LABEL_RATIO),
			),
		),
	);
	const trackWidth = width - labelWidth;
	const timelineContentOffset =
		timelineOffset + TIMELINE_LABEL_MAX_WIDTH - labelWidth;
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
	if (timeline) {
		const trackViewportWidth = Math.max(1, width - timeline.labelWidth);
		// Use Studio's default fit zoom, which follows the viewport while resizing.
		// Matches studio/src/helpers/get-timeline-max-zoom.ts.
		const timelineZoom = Math.min(
			30,
			Math.max(1, trackViewportWidth - TIMELINE_PADDING * 2) / durationInFrames,
		);
		const trackScale =
			timeline.trackScale * (timelineZoom / timeline.pixelsPerFrame);
		const capturedPlayhead = frame * timelineZoom;
		const {ending} = timeline;
		const endingIsActive =
			ending !== null &&
			frame >= ending.from &&
			frame < ending.from + ending.durationInFrames;
		const endingWidth = (ending?.durationInFrames ?? 0) * timelineZoom;
		// Use the same label spacing and tick thresholds as Studio's ruler.
		const secondIntervals = [
			1, 2, 5, 10, 15, 30, 60, 120, 180, 300, 600, 900, 1800, 3600,
		];
		const rawLabelInterval =
			(8 + timecode.length * 12 * 0.6 + 16) / (timelineZoom * timelineFps);
		const labelSeconds =
			secondIntervals.find((interval) => interval >= rawLabelInterval) ??
			Math.ceil(rawLabelInterval / 3600) * 3600;
		const majorInterval = labelSeconds * timelineFps;
		const frameIntervals = Array.from(
			{length: timelineFps},
			(_, i) => i + 1,
		).filter(
			(interval) => timelineFps % interval === 0 && interval < timelineFps,
		);
		const minorFrames = frameIntervals.find(
			(interval) => interval >= 5 / timelineZoom,
		);
		const minorSeconds = secondIntervals.find(
			(interval) =>
				interval >= 16 / (timelineZoom * timelineFps) &&
				interval < labelSeconds &&
				labelSeconds % interval === 0,
		);
		const minorInterval =
			minorFrames ?? (minorSeconds ?? labelSeconds) * timelineFps;
		const mediumInterval = minorFrames
			? (frameIntervals.find(
					(interval) =>
						interval >= 24 / timelineZoom && interval % minorFrames === 0,
				) ?? majorInterval)
			: (secondIntervals.find(
					(interval) =>
						interval >= 48 / (timelineZoom * timelineFps) &&
						interval < labelSeconds &&
						interval % (minorSeconds ?? labelSeconds) === 0 &&
						labelSeconds % interval === 0,
				) ?? labelSeconds) * timelineFps;
		const timelineTicks = Array.from(
			{length: durationInFrames},
			(_, tick) => tick,
		).filter(
			(tick) => tick % majorInterval === 0 || tick % minorInterval === 0,
		);
		const rowScale = timeline.height / 582;
		const soundtrackTop = 280 * rowScale;
		const soundtrackHeight = 34;
		const volumeRowHeight = 21;
		const soundtrackRowsHeight = timeline.soundtrack
			? soundtrackHeight + volumeRowHeight
			: 0;
		const soundtrackWidth = durationInFrames * timelineZoom;
		const soundtrackPeaks = timeline.soundtrack
			? Array.from(
					{length: Math.ceil(durationInFrames / 2)},
					(_, index) =>
						3 +
						random(`soundtrack-${index}`) *
							23 *
							(0.45 + 0.55 * Math.abs(Math.sin(index * 0.16))),
				)
			: [];
		// One continuous shape avoids translucent seams between touching bars.
		const soundtrackWaveformPoints = [
			...soundtrackPeaks.map((peak, index) => {
				const y = (soundtrackHeight - peak) / 2;
				return `${index * 2},${y} ${Math.min(durationInFrames, (index + 1) * 2)},${y}`;
			}),
			...soundtrackPeaks
				.map((peak, index) => {
					const y = (soundtrackHeight + peak) / 2;
					return `${Math.min(durationInFrames, (index + 1) * 2)},${y} ${index * 2},${y}`;
				})
				.reverse(),
		].join(' ');
		const soundtrackKeyframes = timeline.soundtrack
			? [
					0,
					timeline.soundtrack.fadeInFrames,
					durationInFrames - 1 - timeline.soundtrack.fadeOutFrames,
					durationInFrames - 1,
				]
			: [];
		const {removedRow} = timeline;
		const captureRows = removedRow
			? [
					{top: 0, sourceTop: 0, height: removedRow.top},
					{
						top: removedRow.top,
						sourceTop: removedRow.top + removedRow.height,
						height: timeline.height - removedRow.top - removedRow.height,
					},
				]
			: [{top: 0, sourceTop: 0, height: timeline.height}];
		const {removedOpeningRows} = timeline;
		const trackCaptureRows = captureRows
			.flatMap((row) => {
				if (!removedOpeningRows) {
					return [{...row, left: 0, width: timeline.sourceTrackWidth}];
				}

				const removedBottom =
					removedOpeningRows.top + removedOpeningRows.height;
				return [
					{
						...row,
						left: removedOpeningRows.width,
						width: timeline.sourceTrackWidth - removedOpeningRows.width,
					},
					...[
						[row.top, Math.min(row.top + row.height, removedOpeningRows.top)],
						[Math.max(row.top, removedBottom), row.top + row.height],
					]
						.filter(([start, end]) => end > start)
						.map(([start, end]) => ({
							top:
								start -
								(start >= removedBottom ? removedOpeningRows.height : 0),
							sourceTop: row.sourceTop + start - row.top,
							height: end - start,
							left: 0,
							width: removedOpeningRows.width,
						})),
				];
			})
			.flatMap((row) => {
				if (!timeline.soundtrack) {
					return [row];
				}

				const split = Math.max(
					0,
					Math.min(row.height, soundtrackTop - row.top),
				);
				return [
					{...row, height: split},
					{
						...row,
						top: row.top + split + soundtrackRowsHeight,
						sourceTop: row.sourceTop + split,
						height: row.height - split,
					},
				].filter((slice) => slice.height > 0);
			});
		return (
			<Interactive.Div
				name="Timeline"
				style={{
					height,
					width,
					overflow: 'hidden',
					position: 'relative',
					backgroundColor: TIMELINE_BACKGROUND,
				}}
			>
				{/* Undo the capture's dimming against its timeline background, or
				    apply it to clips outside the displayed playhead. */}
				<svg width={0} height={0} aria-hidden style={{position: 'absolute'}}>
					<defs>
						{[
							{suffix: 'dim', slope: 0.5},
							{suffix: 'brighten', slope: 2},
						].map(({suffix, slope}) => (
							<filter
								key={suffix}
								id={`${opacityFilterId}-${suffix}`}
								colorInterpolationFilters="sRGB"
							>
								<feComponentTransfer>
									<feFuncR
										type="linear"
										slope={slope}
										intercept={(22 / 255) * (1 - slope)}
									/>
									<feFuncG
										type="linear"
										slope={slope}
										intercept={(24 / 255) * (1 - slope)}
									/>
									<feFuncB
										type="linear"
										slope={slope}
										intercept={(27 / 255) * (1 - slope)}
									/>
								</feComponentTransfer>
							</filter>
						))}
					</defs>
				</svg>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: timeline.labelWidth,
						height,
						overflow: 'hidden',
						backgroundColor: '#202428',
					}}
				>
					{captureRows.map((row) => (
						<div
							key={row.sourceTop}
							style={{
								position: 'absolute',
								top: row.top,
								width: '100%',
								height: row.height,
								overflow: 'hidden',
							}}
						>
							<Img
								src={timeline.imageSrc}
								showInTimeline={false}
								style={{
									position: 'absolute',
									left: 0,
									top: -row.sourceTop,
									width: timeline.width,
									height: timeline.height,
									maxWidth: 'none',
								}}
							/>
						</div>
					))}
					{timeline.mediaLabels.map((label) => (
						<div
							key={label.name}
							style={{
								position: 'absolute',
								top:
									label.top -
									(removedRow && label.top >= removedRow.top + removedRow.height
										? removedRow.height
										: 0),
								height: label.height,
								left: 32,
								right: 2,
								backgroundColor: '#202428',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								paddingLeft: label.left - 32,
								fontFamily: 'Arial, Helvetica, sans-serif',
								fontSize: 12,
							}}
						>
							<div
								style={{
									height: 16,
									lineHeight: '16px',
									color: '#d2d3d4',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									paddingRight: 10,
									maskImage:
										'linear-gradient(to right, black calc(100% - 10px), transparent)',
								}}
							>
								{label.name}
							</div>
							<div
								style={{
									height: 14,
									lineHeight: '14px',
									marginTop: -2,
									paddingLeft: 2,
									paddingRight: 10,
									color: 'rgba(255, 255, 255, 0.3)',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									maskImage:
										'linear-gradient(to right, black calc(100% - 10px), transparent)',
								}}
							>
								{label.assetName}
							</div>
						</div>
					))}
					{endingIsActive ? (
						<div
							style={{
								position: 'absolute',
								top: 144 * rowScale,
								bottom: 0,
								left: 0,
								right: 2,
								backgroundColor: '#202428',
							}}
						>
							{[
								{
									top: 0,
									height: 92,
									name: '<Video>',
									asset: 'whats11.mov',
									connected: false,
								},
								{
									top: 92,
									height: 44,
									name: '<BasicCaptions>',
									asset: null,
									connected: false,
								},
								{
									top: 136,
									height: 58,
									name: ending.connectedCompositionName,
									asset: null,
									connected: true,
								},
							].map((row) => (
								<div
									key={row.name}
									style={{
										position: 'absolute',
										top:
											row.top * rowScale +
											(row.connected ? soundtrackRowsHeight : 0),
										height: row.height * rowScale,
										left: 0,
										right: 0,
										borderBottom: '1px solid #171b1e',
										backgroundColor:
											row.connected && ending.selected
												? '#3b3f42'
												: 'transparent',
										boxSizing: 'border-box',
										display: 'flex',
										alignItems: 'center',
										color: TOOLBAR_FOREGROUND,
										fontSize: 12,
									}}
								>
									<EyeIcon
										color={TOOLBAR_FOREGROUND}
										size={12}
										style={{position: 'absolute', left: 8}}
									/>
									<div
										style={{
											position: 'absolute',
											left: 44,
											display: 'flex',
											alignItems: 'center',
											gap: 4,
										}}
									>
										{row.connected ? (
											<VideoIcon
												color={TOOLBAR_FOREGROUND}
												size={12}
												style={{flexShrink: 0}}
											/>
										) : (
											<div style={{width: 12}} />
										)}
										<div>
											<div>{row.name}</div>
											{row.asset ? (
												<div
													style={{
														color: 'rgba(255, 255, 255, 0.3)',
														fontSize: 12,
														lineHeight: '14px',
														paddingLeft: 2,
													}}
												>
													{row.asset}
												</div>
											) : null}
										</div>
									</div>
								</div>
							))}
						</div>
					) : null}
					{timeline.soundtrack ? (
						<div
							style={{
								position: 'absolute',
								top: soundtrackTop,
								left: 0,
								right: 2,
								height: soundtrackHeight + volumeRowHeight,
								backgroundColor: '#202428',
							}}
						>
							<div
								style={{
									height: soundtrackHeight,
									display: 'flex',
									alignItems: 'center',
									borderTop: '1px solid #171b1e',
									borderBottom: '1px solid #171b1e',
									boxSizing: 'border-box',
								}}
							>
								<EyeIcon
									color={TOOLBAR_FOREGROUND}
									size={12}
									style={{position: 'absolute', left: 8}}
								/>
								<CaretIcon
									color={LIGHT_TEXT}
									direction="down"
									size={10}
									style={{position: 'absolute', left: 30}}
								/>
								<div
									style={{paddingLeft: 44, fontSize: 12, lineHeight: '14px'}}
								>
									<div style={{color: TOOLBAR_FOREGROUND}}>
										{timeline.soundtrack.name}
									</div>
									<div style={{color: 'rgba(255,255,255,0.3)'}}>
										{timeline.soundtrack.assetName}
									</div>
								</div>
							</div>
							<div
								style={{
									height: volumeRowHeight,
									display: 'flex',
									alignItems: 'center',
									paddingLeft: 62,
									fontSize: 12,
									color: LIGHT_TEXT,
								}}
							>
								Volume
							</div>
						</div>
					) : null}
					<div
						style={{
							position: 'absolute',
							right: 0,
							top: 0,
							width: 2,
							height,
							backgroundColor: BACKGROUND,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: 40,
							backgroundColor: BACKGROUND,
						}}
					>
						<div
							style={{
								position: 'absolute',
								right: 7,
								top: 10,
								display: 'flex',
								alignItems: 'center',
								gap: 5,
								color: LIGHT_TEXT,
							}}
						>
							<CanvasZoomOutIcon size={17} />
							<div
								style={{
									width: 40,
									height: 4,
									backgroundColor: '#353a3e',
									borderRadius: 4,
									position: 'relative',
								}}
							>
								<div
									style={{
										position: 'absolute',
										left: 15,
										top: -3,
										width: 10,
										height: 10,
										borderRadius: '50%',
										backgroundColor: WHITE,
									}}
								/>
							</div>
							<CanvasZoomIcon size={17} />
						</div>
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: timeline.labelWidth,
						top: 0,
						width: trackViewportWidth,
						height,
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: TIMELINE_PADDING,
							top: 0,
							width: timeline.sourceTrackWidth,
							height: timeline.height,
							overflow: 'hidden',
							transform: `scaleX(${trackScale})`,
							transformOrigin: 'left top',
						}}
					>
						{trackCaptureRows.map((row) => (
							<div
								key={`${row.left}-${row.sourceTop}`}
								style={{
									position: 'absolute',
									left: row.left,
									top: row.top,
									height: row.height,
									width: row.width,
									overflow: 'hidden',
								}}
							>
								<div
									style={{
										position: 'absolute',
										left: -row.left,
										top: -row.sourceTop,
										width: timeline.sourceTrackWidth,
										height: timeline.height,
									}}
								>
									<Img
										src={timeline.imageSrc}
										showInTimeline={false}
										style={{
											position: 'absolute',
											left: -timeline.sourceLabelWidth,
											top: 0,
											width: timeline.width,
											height: timeline.height,
											maxWidth: 'none',
										}}
									/>
									{timeline.regions.map((region) => {
										const active =
											capturedPlayhead >= region.left * trackScale &&
											capturedPlayhead <
												(region.left + region.width) * trackScale;
										const opacity = active ? 1 : 0.5;
										if (opacity === region.capturedOpacity) {
											return null;
										}

										return (
											<div
												key={`${region.left}-${region.top}`}
												style={{
													position: 'absolute',
													left: region.left,
													top: region.top,
													width: region.width,
													height: region.height,
													overflow: 'hidden',
												}}
											>
												<Img
													src={timeline.imageSrc}
													showInTimeline={false}
													style={{
														position: 'absolute',
														left: -timeline.sourceLabelWidth - region.left,
														top: -region.top,
														width: timeline.width,
														height: timeline.height,
														maxWidth: 'none',
														filter: `url(#${opacityFilterId}-${active ? 'brighten' : 'dim'})`,
													}}
												/>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
					{timeline.capturedChapters.map((chapter) => {
						const active =
							frame >= chapter.from &&
							frame < chapter.from + chapter.durationInFrames;
						// Stretch Intro's captured waveform without its trailing silence.
						const openingWaveformScale =
							(chapter.durationInFrames * timelineZoom) / (222 * rowScale);
						return (
							<div
								key={chapter.name}
								style={{
									position: 'absolute',
									left: TIMELINE_PADDING + chapter.from * timelineZoom,
									top: 0,
									width: chapter.durationInFrames * timelineZoom,
									height: timeline.height,
								}}
							>
								{[
									{
										top: 84,
										bottom: 144,
										label: chapter.name,
										color: BLUE,
										composition: true,
									},
									{
										top: 236,
										bottom: 280,
										label: chapter.caption,
										color: '#dd8625',
										composition: false,
									},
									{
										top: 280,
										bottom: 338,
										label: 'Sound effects',
										color: BLUE,
										composition: false,
									},
								].map((row) => (
									<div
										key={row.top}
										style={{
											position: 'absolute',
											top:
												row.top * rowScale +
												(row.top >= 280 ? soundtrackRowsHeight : 0),
											height: (row.bottom - row.top) * rowScale,
											width: '100%',
											backgroundColor: active
												? row.color
												: `color-mix(in srgb, ${row.color} 50%, ${TIMELINE_BACKGROUND})`,
											border: `1px solid ${TIMELINE_BACKGROUND}`,
											boxSizing: 'border-box',
											overflow: 'hidden',
										}}
									>
										<div
											style={{
												height: '100%',
												paddingLeft: 4,
												fontSize: 12,
												color: WHITE,
												opacity: active ? 1 : 0.5,
												display: 'flex',
												flexDirection: 'row',
												alignItems: 'center',
												gap: row.composition ? 4 : 0,
												whiteSpace: 'nowrap',
											}}
										>
											{row.composition ? (
												<VideoIcon
													color={WHITE}
													size={10}
													style={{flexShrink: 0}}
												/>
											) : null}
											<span style={timelineLabelStyle}>{row.label}</span>
										</div>
									</div>
								))}
								<div
									style={{
										position: 'absolute',
										top: 144 * rowScale,
										height: 52 * rowScale,
										width: '100%',
										overflow: 'hidden',
										backgroundColor: TIMELINE_BACKGROUND,
									}}
								>
									<Img
										src={timeline.imageSrc}
										showInTimeline={false}
										style={{
											position: 'absolute',
											left: -timeline.sourceLabelWidth - chapter.sourceLeft,
											top: -202 * rowScale,
											width: timeline.width,
											height: timeline.height,
											maxWidth: 'none',
											opacity: active ? 1 : 0.5,
											filter:
												chapter.from === 0
													? undefined
													: `url(#${opacityFilterId}-brighten)`,
										}}
									/>
								</div>
								{chapter.from === 0 ? (
									<div
										style={{
											position: 'absolute',
											top: 196 * rowScale,
											height: 40 * rowScale,
											width: '100%',
											overflow: 'hidden',
											backgroundColor: TIMELINE_BACKGROUND,
										}}
									>
										<Img
											src={timeline.imageSrc}
											showInTimeline={false}
											style={{
												position: 'absolute',
												left: -timeline.sourceLabelWidth * openingWaveformScale,
												opacity: active ? 1 : 0.5,
												top: -254 * rowScale,
												width: timeline.width * openingWaveformScale,
												height: timeline.height,
												maxWidth: 'none',
											}}
										/>
									</div>
								) : null}
							</div>
						);
					})}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 337 * rowScale + soundtrackRowsHeight,
							bottom: 0,
							backgroundColor: TIMELINE_BACKGROUND,
						}}
					>
						{timeline.soundEffects.map((effect, effectIndex) => {
							const effectHeight = 100 * rowScale;
							const active =
								frame >= effect.from &&
								frame < effect.from + effect.durationInFrames;
							const peaks = Array.from({length: 80}, (_, index) => {
								const progress = index / 79;
								let envelope: number;
								switch (effectIndex % 4) {
									case 0:
										// A sharp hit with a decaying tail.
										envelope =
											Math.min(1, progress * 12) * (1 - progress) ** 1.6;
										break;
									case 1:
										// A whoosh that swells in the middle.
										envelope = Math.sin(progress * Math.PI) ** 1.7;
										break;
									case 2:
										// Two distinct impacts.
										envelope = Math.min(
											1,
											Math.exp(-(((progress - 0.2) / 0.08) ** 2)) +
												0.7 * Math.exp(-(((progress - 0.62) / 0.14) ** 2)),
										);
										break;
									default:
										// A longer, pulsing rattle with short fades.
										envelope =
											Math.min(1, progress * 12, (1 - progress) * 12) *
											(0.5 + 0.5 * Math.abs(Math.sin(progress * Math.PI * 5)));
								}

								return (
									2 +
									(effectHeight - 6) *
										envelope *
										(0.25 + random(`effect-${effect.from}-${index}`) * 0.75)
								);
							});
							const points = [
								...peaks.map(
									(peak, index) =>
										`${index},${(effectHeight - peak) / 2} ${index + 1},${(effectHeight - peak) / 2}`,
								),
								...peaks
									.map(
										(peak, index) =>
											`${index + 1},${(effectHeight + peak) / 2} ${index},${(effectHeight + peak) / 2}`,
									)
									.reverse(),
							].join(' ');
							return (
								<div
									key={effect.from}
									style={{
										position: 'absolute',
										left: TIMELINE_PADDING + effect.from * timelineZoom,
										top: rowScale,
										width: effect.durationInFrames * timelineZoom,
										height: effectHeight,
										background:
											'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)',
										borderRadius: 2,
										overflow: 'hidden',
										opacity: active ? 1 : 0.5,
									}}
								>
									<svg
										width="100%"
										height={effectHeight}
										viewBox={`0 0 80 ${effectHeight}`}
										preserveAspectRatio="none"
										style={{display: 'block'}}
									>
										<polygon points={points} fill="rgba(255,255,255,0.6)" />
									</svg>
								</div>
							);
						})}
					</div>
					{ending ? (
						<div
							style={{
								position: 'absolute',
								left: TIMELINE_PADDING + ending.from * timelineZoom,
								top: 0,
								width: endingWidth,
								height: timeline.height,
								opacity: endingIsActive ? 1 : 0.5,
							}}
						>
							{[
								{
									top: 84,
									bottom: 144,
									label: ending.name,
									chapter: true,
									connected: false,
									color: BLUE,
								},
								{
									top: 236,
									bottom: 280,
									label: 'Subscribe for more videos.',
									chapter: false,
									connected: false,
									color: '#b66f1f',
								},
								{
									top: 280,
									bottom: 338,
									label: ending.connectedCompositionName,
									chapter: false,
									connected: true,
									color: BLUE,
								},
							].map((row) => (
								<div
									key={row.top}
									style={{
										position: 'absolute',
										top:
											row.top * rowScale +
											(row.connected ? soundtrackRowsHeight : 0),
										height: (row.bottom - row.top) * rowScale,
										width: '100%',
										boxSizing: 'border-box',
										border: '1px solid #15181b',
										boxShadow:
											row.connected && ending.selected
												? 'inset 0 0 0 2px white'
												: 'none',
										backgroundColor: row.color,
										color: WHITE,
										fontSize: 12,
										overflow: 'hidden',
										whiteSpace: 'nowrap',
										paddingLeft: 4,
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										gap: row.chapter || row.connected ? 4 : 0,
									}}
								>
									{row.chapter || row.connected ? (
										<VideoIcon
											color={WHITE}
											size={10}
											style={{flexShrink: 0}}
										/>
									) : null}
									<span style={timelineLabelStyle}>{row.label}</span>
								</div>
							))}
							<div
								style={{
									position: 'absolute',
									top: 144 * rowScale,
									height: 52 * rowScale,
									width: '100%',
									display: 'flex',
									overflow: 'hidden',
								}}
							>
								{Array.from(
									{length: Math.ceil(endingWidth / ((52 * rowScale * 16) / 9))},
									(_, index) => (
										<Img
											key={index}
											src={ending.thumbnailSrc}
											showInTimeline={false}
											style={{
												height: '100%',
												width: (52 * rowScale * 16) / 9,
												flexShrink: 0,
											}}
										/>
									),
								)}
							</div>
							<div
								style={{
									position: 'absolute',
									top: 196 * rowScale,
									height: 40 * rowScale,
									width: '100%',
									overflow: 'hidden',
								}}
							>
								<Img
									src={timeline.imageSrc}
									showInTimeline={false}
									style={{
										position: 'absolute',
										top: -254 * rowScale,
										left:
											(-timeline.sourceLabelWidth -
												timeline.sourceTrackWidth * 0.75) *
											(timelineZoom / timeline.pixelsPerFrame),
										width:
											timeline.width * (timelineZoom / timeline.pixelsPerFrame),
										height: timeline.height,
										maxWidth: 'none',
										filter: `url(#${opacityFilterId}-brighten)`,
									}}
								/>
							</div>
						</div>
					) : null}
					{timeline.soundtrack ? (
						<div
							style={{
								position: 'absolute',
								left: TIMELINE_PADDING,
								top: soundtrackTop,
								width: soundtrackWidth,
								height: soundtrackHeight + volumeRowHeight,
							}}
						>
							<div
								style={{
									position: 'relative',
									height: soundtrackHeight,
									overflow: 'hidden',
									borderRadius: 2,
									background:
										'linear-gradient(rgb(16 171 58), rgb(43 165 63) 60%)',
								}}
							>
								<svg
									width={soundtrackWidth}
									height={soundtrackHeight}
									viewBox={`0 0 ${durationInFrames} ${soundtrackHeight}`}
									preserveAspectRatio="none"
									style={{display: 'block'}}
								>
									<polygon
										points={soundtrackWaveformPoints}
										fill="rgba(255,255,255,0.6)"
									/>
									<path
										d={`M 0 0 L 0 ${soundtrackHeight} L ${timeline.soundtrack.fadeInFrames} 0 L ${durationInFrames - 1 - timeline.soundtrack.fadeOutFrames} 0 L ${durationInFrames - 1} ${soundtrackHeight} L ${durationInFrames} ${soundtrackHeight} L ${durationInFrames} 0 Z`}
										fill="rgba(0,0,0,0.6)"
									/>
								</svg>
							</div>
							<svg
								width={soundtrackWidth}
								height={volumeRowHeight}
								style={{display: 'block', overflow: 'visible'}}
							>
								<line
									x1={0}
									x2={(durationInFrames - 1) * timelineZoom}
									y1={volumeRowHeight / 2}
									y2={volumeRowHeight / 2}
									stroke="rgba(255,255,255,0.1)"
									strokeWidth={2}
								/>
								{soundtrackKeyframes.map((keyframe) => (
									<polygon
										key={keyframe}
										transform={`translate(${keyframe * timelineZoom - 6},${volumeRowHeight / 2 - 6})`}
										points="6 1.5 10.5 6 6 10.5 1.5 6"
										fill={LIGHT_TEXT}
										stroke="rgba(0,0,0,0.4)"
										strokeWidth={1}
										strokeLinejoin="round"
									/>
								))}
							</svg>
						</div>
					) : null}
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							height: 40,
							width: '100%',
							backgroundColor: BACKGROUND,
							overflow: 'hidden',
						}}
					>
						{timelineTicks.map((tick) => (
							<React.Fragment key={tick}>
								<div
									style={{
										position: 'absolute',
										top: 0,
										left: TIMELINE_PADDING + tick * timelineZoom,
										width: 1,
										height:
											tick % majorInterval === 0
												? 15
												: tick % mediumInterval === 0 ||
													  (minorFrames && tick % timelineFps === 0)
													? 5
													: 2,
										backgroundColor: '#3b4145',
									}}
								/>
								{tick > 0 && tick % majorInterval === 0 ? (
									<div
										style={{
											position: 'absolute',
											top: 5,
											left: TIMELINE_PADDING + tick * timelineZoom + 8,
											color: LIGHT_TEXT,
											fontSize: 12,
											whiteSpace: 'nowrap',
										}}
									>
										00:{String(tick / timelineFps).padStart(2, '0')}.00
									</div>
								) : null}
							</React.Fragment>
						))}
					</div>
					<div
						style={{
							position: 'absolute',
							left: TIMELINE_PADDING + capturedPlayhead,
							top: 0,
							bottom: 0,
							width: 1,
							backgroundColor: PLAYHEAD,
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: -8,
								top: 3,
								width: 17,
								height: 16,
								backgroundColor: PLAYHEAD,
								clipPath: 'polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%)',
							}}
						/>
					</div>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 2,
						top: 2,
						width: 100,
						height: 38,
						backgroundColor: BACKGROUND,
						paddingLeft: 6,
						boxSizing: 'border-box',
						color: LIGHT_TEXT,
						fontFamily: 'monospace',
					}}
				>
					<div style={{fontSize: 14, lineHeight: '22px'}}>{timecode}</div>
					<div style={{fontSize: 10, lineHeight: '12px'}}>{frame}</div>
				</div>
			</Interactive.Div>
		);
	}

	// Mirrors the layer tree the real Studio shows for the Outro composition.
	const layers: {
		name: string;
		secondary: string | null;
		depth: number;
		expanded: boolean | null;
		track: 'filmstrip' | 'sequence' | 'avatar';
	}[] = [
		{
			name: 'Presenter video',
			secondary: 'whats11.mov',
			depth: 0,
			expanded: null,
			track: 'filmstrip',
		},
		{
			name: 'Endcard',
			secondary: null,
			depth: 0,
			expanded: true,
			track: 'sequence',
		},
		{
			name: 'Remotion avatar',
			secondary: 'remotion-avatar.png',
			depth: 1,
			expanded: null,
			track: 'avatar',
		},
		{
			name: 'Call to action button',
			secondary: null,
			depth: 1,
			expanded: null,
			track: 'sequence',
		},
		{
			name: 'X channel',
			secondary: null,
			depth: 1,
			expanded: null,
			track: 'sequence',
		},
		{
			name: 'Instagram channel',
			secondary: null,
			depth: 1,
			expanded: null,
			track: 'sequence',
		},
		{
			name: 'LinkedIn channel',
			secondary: null,
			depth: 1,
			expanded: null,
			track: 'sequence',
		},
	];

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
					{showZoom ? (
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
					) : null}
				</div>
				{layers.map((layer) => (
					<div
						key={layer.name}
						style={{height: layer.track === 'filmstrip' ? 46 : 22}}
					>
						<TimelineRowLabel
							depth={layer.depth}
							expanded={layer.expanded ?? undefined}
							secondary={layer.secondary ?? undefined}
						>
							{layer.name}
						</TimelineRowLabel>
					</div>
				))}
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
									left:
										timelineContentOffset + trackLeft + tick * pixelsPerFrame,
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
										left:
											timelineContentOffset +
											trackLeft +
											tick * pixelsPerFrame +
											9,
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
				{layers.map((layer) => (
					<div
						key={layer.name}
						style={{
							height: layer.track === 'filmstrip' ? 46 : 22,
							paddingLeft: trackLeft,
							translate: `${timelineContentOffset}px 0`,
						}}
					>
						{layer.track === 'filmstrip' ? (
							<Interactive.Div
								name="Video filmstrip"
								style={{height: 45, width: sequenceWidth}}
							>
								<Filmstrip height={45} width={sequenceWidth} />
							</Interactive.Div>
						) : layer.track === 'avatar' ? (
							<Interactive.Div
								name="Avatar strip"
								style={{height: 21, width: sequenceWidth}}
							>
								<AvatarStrip height={21} width={sequenceWidth} />
							</Interactive.Div>
						) : (
							<div
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
							</div>
						)}
					</div>
				))}
				<Interactive.Div
					name="Timeline playhead"
					style={{
						backgroundColor: PLAYHEAD,
						bottom: 0,
						left: timelineContentOffset + playheadLeft,
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

const StudioInner: React.FC<
	StudioProps & {readonly controls: SequenceControls | undefined}
> = ({
	compositionName,
	compositionWidth,
	compositionHeight,
	content,
	controls,
	durationInFrames,
	from,
	freeze,
	frame,
	hidden,
	name,
	responsivenessProgress,
	showInTimeline,
	showTimelineZoom,
	timelineOffset,
	timeline,
	trimAfter,
	trimBefore,
	loop,
	viewportHeight,
	viewportWidth,
}) => {
	const {height: videoHeight, fps} = useVideoConfig();
	const height = viewportHeight ?? videoHeight;
	const width = viewportWidth;
	const topPanelHeight = timeline
		? height -
			MENU_HEIGHT -
			SPLITTER_SIZE -
			timeline.height -
			(timeline.soundtrack ? 12 : 0)
		: Math.round((height - MENU_HEIGHT - SPLITTER_SIZE) * TOP_PANEL_RATIO);
	const timelineHeight = height - MENU_HEIGHT - topPanelHeight - SPLITTER_SIZE;
	const canvasRowHeight = topPanelHeight - PREVIEW_TOOLBAR_HEIGHT;
	const leftSidebarWidth = Math.min(
		350,
		Math.round(width * LEFT_SIDEBAR_RATIO),
	);
	const rightSidebarWidth = Math.min(
		350,
		Math.max(250, Math.round(width * RIGHT_SIDEBAR_RATIO)),
	);
	const sidebarProgress = timeline
		? responsivenessProgress
		: interpolate(responsivenessProgress, [0, 0.2], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
	const leftSidebarOccupiedWidth =
		(leftSidebarWidth + SPLITTER_SIZE) * (1 - sidebarProgress);
	const rightSidebarOccupiedWidth =
		(rightSidebarWidth + SPLITTER_SIZE) * (1 - sidebarProgress);
	const canvasWidth = Math.max(
		17,
		width - leftSidebarOccupiedWidth - rightSidebarOccupiedWidth,
	);

	return (
		<Sequence
			controls={controls}
			durationInFrames={durationInFrames}
			freeze={freeze}
			from={from ?? 0}
			hidden={hidden}
			layout="none"
			name={name ?? '<Studio>'}
			showInTimeline={showInTimeline ?? true}
			trimAfter={trimAfter}
			trimBefore={trimBefore}
			loop={loop}
		>
			<div
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
					responsivenessProgress={responsivenessProgress}
				/>
				<div style={{height: topPanelHeight, width}}>
					<div style={{display: 'flex', height: canvasRowHeight, width}}>
						<div
							style={{
								flexShrink: 0,
								height: canvasRowHeight,
								overflow: 'hidden',
								position: 'relative',
								width: leftSidebarOccupiedWidth,
							}}
						>
							<div
								style={{
									display: 'flex',
									height: canvasRowHeight,
									left: 0,
									position: 'absolute',
									translate: `${-sidebarProgress * (leftSidebarWidth + SPLITTER_SIZE)}px 0px`,
									width: leftSidebarWidth + SPLITTER_SIZE,
								}}
							>
								<div style={{width: leftSidebarWidth}}>
									<LeftSidebar compositionName={compositionName} />
								</div>
								<Interactive.Div
									name="Left sidebar splitter"
									style={{backgroundColor: SPLITTER, width: SPLITTER_SIZE}}
								/>
							</div>
						</div>
						<PreviewCanvas
							canvasHeight={canvasRowHeight}
							canvasWidth={canvasWidth}
							compositionHeight={compositionHeight}
							compositionWidth={compositionWidth}
							content={content}
							durationInFrames={durationInFrames}
							frame={frame}
							selectedEndcard={timeline?.ending?.selected ?? false}
						/>
						<div
							style={{
								flexShrink: 0,
								height: canvasRowHeight,
								overflow: 'hidden',
								position: 'relative',
								width: rightSidebarOccupiedWidth,
							}}
						>
							<div
								style={{
									display: 'flex',
									height: canvasRowHeight,
									left: 0,
									position: 'absolute',
									width: rightSidebarWidth + SPLITTER_SIZE,
								}}
							>
								<Interactive.Div
									name="Right sidebar splitter"
									style={{backgroundColor: SPLITTER, width: SPLITTER_SIZE}}
								/>
								<div style={{width: rightSidebarWidth}}>
									<RightSidebar
										selectedEndcard={
											timeline?.ending?.selected ? timeline.ending : null
										}
										compositionHeight={compositionHeight}
										compositionName={compositionName}
										compositionWidth={compositionWidth}
										durationInFrames={durationInFrames}
										fps={fps}
									/>
								</div>
							</div>
						</div>
					</div>
					<PreviewToolbar responsivenessProgress={responsivenessProgress} />
				</div>
				<Interactive.Div
					name="Timeline splitter"
					style={{backgroundColor: SPLITTER, height: SPLITTER_SIZE, width}}
				/>
				<Timeline
					timeline={timeline}
					durationInFrames={durationInFrames}
					fps={fps}
					frame={frame}
					height={timelineHeight}
					showZoom={showTimelineZoom}
					timelineOffset={timelineOffset}
					width={width}
				/>
			</div>
		</Sequence>
	);
};

StudioInner.displayName = '<Studio>';

export const Studio = Interactive.withSchema({
	Component: StudioInner,
	componentName: '<Studio>',
	schema: studioInteractivitySchema,
	supportsEffects: false,
});

export const StudioReference: React.FC<StudioReferenceProps> = ({
	responsivenessProgress,
	viewportWidth,
}) => {
	return (
		<Studio
			compositionHeight={REFERENCE_COMPOSITION_HEIGHT}
			compositionName="Outro"
			compositionWidth={REFERENCE_COMPOSITION_WIDTH}
			content={<Scene11 platform="youtube" />}
			durationInFrames={742}
			frame={655}
			responsivenessProgress={responsivenessProgress}
			showTimelineZoom
			timelineOffset={0}
			timeline={null}
			viewportHeight={null}
			viewportWidth={viewportWidth}
		/>
	);
};

export const StudioDeviceFrame: React.FC<StudioReferenceProps> = ({
	responsivenessProgress,
	viewportWidth,
}) => {
	const frame = useCurrentFrame();
	const bezelSize = 18;
	const viewportHeight = 900;
	const deviceViewportWidth = Math.max(1600, viewportWidth);
	const animatedViewportWidth = interpolate(
		frame,
		[0, 90],
		[viewportWidth / 2, viewportWidth],
		{
			easing: Easing.bezier(0.16, 1, 0.3, 1),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const animatedResponsivenessProgress = interpolate(
		frame,
		[0, 90],
		[1, responsivenessProgress],
		{
			easing: Easing.bezier(0.16, 1, 0.3, 1),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);
	const macBookWidth = deviceViewportWidth + bezelSize * 2;
	const macBookHeight = viewportHeight + bezelSize * 2;

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Interactive.Div
				name="Viewport width animation"
				style={{
					bottom: -96,
					height: macBookHeight,
					left: '50%',
					position: 'absolute',
					translate: '-50% 0px',
					width: macBookWidth,
				}}
			>
				<MacBookScreen
					borderRadius={null}
					height={macBookHeight}
					left={0}
					showCameraNotch={false}
					showShadow
					top={0}
					width={macBookWidth}
				>
					<Sequence
						height={viewportHeight}
						name="Studio UI"
						style={{
							borderRadius: 19,
							left: '50%',
							overflow: 'hidden',
							top: bezelSize,
							translate: '-50% 0px',
						}}
						width={animatedViewportWidth}
					>
						<StudioReference
							responsivenessProgress={animatedResponsivenessProgress}
							viewportWidth={animatedViewportWidth}
						/>
					</Sequence>
				</MacBookScreen>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
