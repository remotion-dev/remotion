import React from 'react';
import type {TSequence} from 'remotion';
import {useCurrentFrame} from 'remotion';
import {CURRENT_COLOR, WHITE} from '../../helpers/colors';
import {SnowflakeIcon} from '../../icons/snowflake';

const relativeFrameStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontSize: 11,
	fontFamily: 'Arial, Helvetica, sans-serif',
	gap: 4,
	color: WHITE,
	opacity: 0.5,
	whiteSpace: 'nowrap',
	pointerEvents: 'none',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const snowflakeStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

export const TimelineSequenceFrame: React.FC<{
	readonly s: TSequence;
	readonly sequenceFrameOffset: number;
	readonly displayDurationInFrames: number;
	readonly paddingLeft: number;
	readonly frozenFrame: number | null;
}> = ({
	s,
	sequenceFrameOffset,
	displayDurationInFrames,
	paddingLeft,
	frozenFrame,
}) => {
	const frame = useCurrentFrame();
	const relativeFrame = frame - s.from;
	const sequenceFrame =
		relativeFrame * s.sequencePlaybackRate + sequenceFrameOffset;
	const roundedFrame = Math.round(sequenceFrame * 100) / 100;
	const isInRange =
		relativeFrame >= 0 && relativeFrame < displayDurationInFrames;
	const relativeFrameWithPremount = relativeFrame + (s.premountDisplay ?? 0);
	const isPremounting =
		relativeFrameWithPremount >= 0 &&
		relativeFrameWithPremount < displayDurationInFrames &&
		!isInRange;
	const relativeFrameWithPostmount = relativeFrame - displayDurationInFrames;
	const isPostmounting =
		relativeFrameWithPostmount >= 0 &&
		relativeFrameWithPostmount < (s.postmountDisplay ?? 0) &&
		!isInRange;

	if (frozenFrame === null && !isInRange && !isPremounting && !isPostmounting) {
		return null;
	}

	return (
		<div
			style={{
				paddingLeft,
				height: '100%',
				display: 'flex',
				alignItems: 'center',
			}}
		>
			<div style={relativeFrameStyle}>
				{frozenFrame === null ? null : (
					<SnowflakeIcon style={snowflakeStyle} color={CURRENT_COLOR} />
				)}
				{frozenFrame ??
					(isPremounting
						? '0 (Premounted)'
						: isPostmounting
							? `${s.duration - 1} (Postmounted)`
							: roundedFrame)}
			</div>
		</div>
	);
};
