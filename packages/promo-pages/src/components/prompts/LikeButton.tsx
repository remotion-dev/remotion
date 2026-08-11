import {Button} from '@remotion/design';
import {Heart} from '@remotion/shapes';
import React, {useCallback, useEffect, useState} from 'react';
import {REMOTION_PRO_ORIGIN} from './config';
import {
	formatLikeCount,
	getLikedIds,
	removeLikedId,
	saveLikedId,
} from './prompt-helpers';
import {useHeartAnimation} from './use-heart-animation';

export const LikeButton: React.FC<{
	readonly submissionId: string;
	readonly initialLikeCount: number;
}> = ({submissionId, initialLikeCount}) => {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(initialLikeCount);
	const {scale, roundness, animate} = useHeartAnimation();

	useEffect(() => {
		setLiked(getLikedIds().has(submissionId));
	}, [submissionId]);

	const onClick = useCallback(async () => {
		if (liked) {
			setLiked(false);
			setLikeCount((c) => c - 1);
			removeLikedId(submissionId);

			try {
				await fetch(`${REMOTION_PRO_ORIGIN}/api/prompts/unlike`, {
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify({submissionId}),
				});
			} catch {
				// Optimistic
			}
		} else {
			animate();
			setLiked(true);
			setLikeCount((c) => c + 1);
			saveLikedId(submissionId);

			try {
				await fetch(`${REMOTION_PRO_ORIGIN}/api/prompts/like`, {
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify({submissionId}),
				});
			} catch {
				// Optimistic
			}
		}
	}, [liked, submissionId, animate]);

	return (
		<Button
			className={`font-brand rounded-full flex items-center ${liked ? 'bg-brand text-white' : ''}`}
			onClick={onClick}
			style={{width: 90}}
		>
			<div className="flex items-center flex-row flex-1 w-[40px] justify-center">
				<Heart
					height={14}
					fill={liked ? 'white' : 'none'}
					stroke={liked ? 'white' : 'var(--text-color)'}
					strokeWidth={2}
					bottomRoundnessAdjustment={roundness}
					style={{transform: `scale(${scale})`}}
				/>
				<span style={{fontSize: 15, marginLeft: 10}}>
					{formatLikeCount(likeCount)}
				</span>
			</div>
		</Button>
	);
};
