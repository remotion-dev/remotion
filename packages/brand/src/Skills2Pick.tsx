import {loadFont} from '@remotion/fonts';
import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {RemotionCube} from './Skills2Announcement';

loadFont({
	family: 'GT Planar',
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

const SkillPill: React.FC<{readonly name: string}> = ({name}) => {
	return (
		<Interactive.Div
			name={name}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 28,
				width: 760,
				height: 112,
				paddingLeft: 42,
				paddingRight: 42,
				borderRadius: 24,
				backgroundColor: '#edf7ff',
				color: '#2888dd',
				fontFamily: 'GT Planar, sans-serif',
				fontSize: 54,
				fontWeight: 500,
				letterSpacing: -1,
				lineHeight: 1,
				whiteSpace: 'nowrap',
			}}
			showInTimeline={false}
		>
			<Interactive.Div
				name={`${name} icon size`}
				style={{display: 'flex', scale: 0.82}}
				showInTimeline={false}
			>
				<RemotionCube name={`${name} icon`} />
			</Interactive.Div>
			{name}
		</Interactive.Div>
	);
};

export const Skills2Pick: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: '#ffffff'}}>
			<Interactive.Div
				name="Skill picker"
				style={{
					position: 'absolute',
					left: 960,
					top: 0,
					width: 960,
					height: 1080,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 48,
					translate: '-110.2px 0px',
				}}
				showInTimeline={false}
			>
				<Interactive.Div
					name="Remotion create pill"
					style={{position: 'relative', width: 844, height: 112}}
					showInTimeline={false}
				>
					<SkillPill name="/remotion-create" />
				</Interactive.Div>
				<Interactive.Div
					name="Remotion markup pill"
					style={{
						position: 'relative',
						width: 844,
						height: 112,
						translate: interpolate(
							frame,
							[42, 45, 48, 51, 54, 57, 60, 63, 66, 69],
							[
								'0px 0px',
								'-14px 0px',
								'-48px 0px',
								'-97.8px 0px',
								'-201.2px 0px',
								'-399.3px 2.7px',
								'-852.6px 2.7px',
								'-1016.1px 2.7px',
								'-1492.7px 2.7px',
								'-1751.8px 2.7px',
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								posterize: 3,
							},
						),
						rotate: interpolate(frame, [44], ['0deg'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<SkillPill name="/remotion-markup" />
				</Interactive.Div>
				<Interactive.Div
					name="Remotion interactivity pill"
					style={{position: 'relative', width: 844, height: 112}}
					showInTimeline={false}
				>
					<SkillPill name="/remotion-interactivity" />
				</Interactive.Div>
				<Interactive.Div
					name="Remotion maps pill"
					style={{position: 'relative', width: 844, height: 112}}
					showInTimeline={false}
				>
					<SkillPill name="/remotion-maps" />
				</Interactive.Div>
				<Interactive.Div
					name="Remotion captions pill"
					style={{position: 'relative', width: 844, height: 112}}
					showInTimeline={false}
				>
					<SkillPill name="/remotion-captions" />
				</Interactive.Div>
			</Interactive.Div>
			<Video
				src="https://remotion.media/skills-2-announcement/grainy-retro-hand-pinch.mov"
				durationInFrames={78}
				style={{
					position: 'absolute',
					translate: '-508.4px -180px',
					width: 2560,
					height: 1440,
					scale: 0.898,
				}}
			/>
		</AbsoluteFill>
	);
};
