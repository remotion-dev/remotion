import {Heart} from '@remotion/shapes';
import React, {useCallback, useEffect, useState} from 'react';
import {REMOTION_PRO_ORIGIN} from '~/lib/config';
import {
	formatLikeCount,
	getLikedIds,
	removeLikedId,
	saveLikedId,
} from '~/lib/prompt-helpers';
import {useHeartAnimation} from '~/lib/use-heart-animation';

export const CardLikeButton: React.FC<{
	readonly submissionId: string;
	readonly initialLikeCount: number;
}> = ({submissionId, initialLikeCount}) => {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(initialLikeCount);
	const {scale, roundness, animate} = useHeartAnimation();

	useEffect(() => {
		setLiked(getLikedIds().has(submissionId));
	}, [submissionId]);

	const onClick = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
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
		},
		[liked, submissionId, animate],
	);

	return (
		<button onClick={onClick} className="flex items-center" type="button">
			<Heart
				height={16}
				fill={liked ? 'var(--color-brand)' : 'none'}
				stroke={liked ? 'var(--color-brand)' : 'black'}
				strokeWidth={2}
				bottomRoundnessAdjustment={roundness}
				style={{transform: `scale(${scale})`, marginTop: 2}}
			/>
			<span className="font-brand font-medium" style={{marginLeft: 8, flex: 1}}>
				{formatLikeCount(likeCount)}
			</span>
		</button>
	);
};
