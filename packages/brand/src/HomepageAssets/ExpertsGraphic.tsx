import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {experts} from '../../../promo-pages/src/components/experts/experts-data';

export const expertsGraphicDurationInFrames = 1800;

const avatarBorderWidth = 10;
const avatarSize = 300;
const avatarGap = 28;
const compositionXOffset = -48;
const compositionYOffset = 48;
const surroundingAvatarCount = 6;
const visibleAvatarCount = surroundingAvatarCount + 1;
const flipDurationInFrames = 48;

export const ExpertsGraphic: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();
	const rotation = (frame / durationInFrames) * Math.PI * 2;
	const groupCount = Math.ceil(experts.length / visibleAvatarCount);
	const framesPerGroup = durationInFrames / groupCount;
	const groupIndex = Math.floor(frame / framesPerGroup);
	const frameInGroup = frame % framesPerGroup;

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Interactive.Div
				name="Orbiting expert avatars"
				style={{
					height: '100%',
					perspective: 1400,
					position: 'relative',
					width: '100%',
				}}
			>
				{Array.from({length: visibleAvatarCount}, (_, slotIndex) => {
					const flipCenter =
						((slotIndex + 0.5) / visibleAvatarCount) * framesPerGroup;
					const flipProgress = interpolate(
						frameInGroup,
						[
							flipCenter - flipDurationInFrames / 2,
							flipCenter + flipDurationInFrames / 2,
						],
						[0, 1],
						{
							easing: Easing.inOut(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					);
					const displayedGroup =
						(flipProgress < 0.5 ? groupIndex : groupIndex + 1) % groupCount;
					const displayedExpert =
						experts[
							(displayedGroup * visibleAvatarCount + slotIndex) % experts.length
						];
					const flipAngle =
						flipProgress < 0.5
							? interpolate(flipProgress, [0, 0.5], [0, 90])
							: interpolate(flipProgress, [0.5, 1], [-90, 0]);
					const isCenter = slotIndex === 0;
					const angle =
						rotation + ((slotIndex - 1) / surroundingAvatarCount) * Math.PI * 2;
					const centerX = isCenter
						? width / 2 + compositionXOffset
						: width / 2 +
							compositionXOffset +
							Math.cos(angle) * (avatarSize + avatarGap);
					const centerY = isCenter
						? height / 2 + compositionYOffset
						: height / 2 +
							compositionYOffset +
							Math.sin(angle) * (avatarSize + avatarGap);

					return (
						<div
							key={slotIndex}
							style={{
								backgroundColor: 'white',
								border: `${avatarBorderWidth}px solid #111111`,
								borderRadius: '50%',
								boxSizing: 'border-box',
								height: avatarSize,
								left: centerX - avatarSize / 2,
								overflow: 'hidden',
								position: 'absolute',
								top: centerY - avatarSize / 2,
								transform: `rotateY(${flipAngle}deg)`,
								width: avatarSize,
							}}
						>
							<Img
								alt={displayedExpert.name}
								src={new URL(
									`../../../promo-pages/public/img/freelancers/${displayedExpert.image.replace('/img/freelancers/', '')}`,
									import.meta.url,
								).toString()}
								style={{
									height: '100%',
									objectFit: 'cover',
									width: '100%',
								}}
							/>
						</div>
					);
				})}
			</Interactive.Div>
		</AbsoluteFill>
	);
};
