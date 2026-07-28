import {burlap} from '@remotion/effects/burlap';
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	Solid,
	staticFile,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';

export const skills2AnnouncementSchema = z.object({
	title: z.string(),
});

loadFont({
	family: 'GT Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

export const RemotionCube: React.FC<{readonly name: string}> = ({name}) => {
	return (
		<Interactive.Svg
			name={name}
			viewBox="0 0 22 28"
			style={{
				width: 66,
				height: 84,
				overflow: 'visible',
			}}
			showInTimeline={false}
		>
			<Interactive.Path
				name="Cube outline"
				d="M11 1.5 20.25 7v14L11 26.5 1.75 21V7Z"
				fill="none"
				stroke="#2888dd"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
			/>
			<Interactive.Path
				name="Cube facets"
				d="M1.75 7 11 12.5 20.25 7M11 12.5v14M1.75 14 11 19.5 20.25 14"
				fill="none"
				stroke="#2888dd"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
			/>
		</Interactive.Svg>
	);
};

const StaticRemotionCube: React.FC = () => {
	return (
		<Interactive.Div
			name="Static Remotion cube"
			style={{
				display: 'flex',
			}}
		>
			<RemotionCube name="Remotion cube" />
		</Interactive.Div>
	);
};

export const Skills2Announcement: React.FC<
	z.infer<typeof skills2AnnouncementSchema> & {
		readonly revealScale?: number;
	}
> = ({title, revealScale = 1}) => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Interactive.Div
				name="Best practices title lockup"
				style={{
					position: 'relative',
					display: 'inline-flex',
					alignItems: 'center',
					width: 'fit-content',
					padding: '18px 54px',
					borderRadius: 24,
					backgroundColor: '#edf7ff',
					filter: 'drop-shadow(0 14px 20px rgba(18, 45, 58, 0.28))',
					scale: revealScale,
					transformOrigin: 'left center',
				}}
			>
				<StaticRemotionCube />
				<Interactive.Div
					name="Typed title"
					style={{
						display: 'flex',
						alignItems: 'center',
						width: 'fit-content',
						height: 102,
						marginLeft: 36,
						overflow: 'hidden',
					}}
				>
					<Interactive.Div
						name="Title text"
						style={{
							height: 102,
							display: 'flex',
							alignItems: 'center',
							color: '#2888dd',
							fontFamily: 'GT Planar, sans-serif',
							fontSize: 88,
							fontWeight: 500,
							letterSpacing: -1.5,
							lineHeight: 1,
							translate: '0 -2px',
							whiteSpace: 'nowrap',
						}}
					>
						{title}
					</Interactive.Div>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const Skills2AnnouncementComposition: React.FC<
	z.infer<typeof skills2AnnouncementSchema>
> = ({title}) => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill>
			<Solid
				width={width}
				height={height}
				color="#f5fafb"
				style={{position: 'absolute'}}
				effects={[
					burlap({
						size: 10,
						roughness: 0,
						color: '#e9e9e9',
					}),
				]}
			/>
			<Skills2Announcement title={title} />
		</AbsoluteFill>
	);
};

export default Skills2Announcement;
