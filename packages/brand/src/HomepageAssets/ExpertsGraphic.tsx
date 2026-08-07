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
					const loopProgress = frame / durationInFrames;
					const firstFlipCenter = (slotIndex + 0.5) / (visibleAvatarCount * 2);
					const secondFlipCenter = firstFlipCenter + 0.5;
					const halfFlipWindow = flipDurationInFrames / durationInFrames / 2;
					const originalExpert = experts[slotIndex % experts.length];
					const alternateExpert =
						experts[(slotIndex + visibleAvatarCount) % experts.length];
					const isFirstFlip =
						loopProgress >= firstFlipCenter - halfFlipWindow &&
						loopProgress <= firstFlipCenter + halfFlipWindow;
					const isSecondFlip =
						loopProgress >= secondFlipCenter - halfFlipWindow &&
						loopProgress <= secondFlipCenter + halfFlipWindow;
					const flipProgress = isFirstFlip
						? interpolate(
								loopProgress,
								[
									firstFlipCenter - halfFlipWindow,
									firstFlipCenter + halfFlipWindow,
								],
								[0, 1],
								{
									easing: Easing.inOut(Easing.cubic),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							)
						: isSecondFlip
							? interpolate(
									loopProgress,
									[
										secondFlipCenter - halfFlipWindow,
										secondFlipCenter + halfFlipWindow,
									],
									[0, 1],
									{
										easing: Easing.inOut(Easing.cubic),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								)
							: 0;
					const currentExpert =
						loopProgress < firstFlipCenter - halfFlipWindow || isFirstFlip
							? originalExpert
							: loopProgress > secondFlipCenter + halfFlipWindow
								? originalExpert
								: alternateExpert;
					const nextExpert = isSecondFlip ? originalExpert : alternateExpert;
					const displayedExpert =
						flipProgress < 0.5 ? currentExpert : nextExpert;
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
								src={`https://www.remotion.dev${displayedExpert.image}`}
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
