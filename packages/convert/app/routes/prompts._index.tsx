import React, {useCallback, useEffect, useState} from 'react';
import {REMOTION_PRO_ORIGIN} from '~/lib/config';
import {Page} from '~/components/Page';
import {Button} from '~/components/ui/button';
import {Card} from '~/components/ui/card';

type Submission = {
	id: string;
	createdAt: string;
	title: string;
	slug: string;
	muxPlaybackId: string;
	prompt: string;
	githubUsername: string | null;
	xUsername: string | null;
	customAvatarUrl: string | null;
	likeCount: number;
};

const LIKED_KEY = 'remotion-prompt-likes';

const getLikedIds = (): Set<string> => {
	try {
		const stored = localStorage.getItem(LIKED_KEY);
		return new Set(stored ? JSON.parse(stored) : []);
	} catch {
		return new Set();
	}
};

const saveLikedId = (id: string) => {
	const liked = getLikedIds();
	liked.add(id);
	localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
};

const getAvatarUrl = (s: Submission): string | null => {
	if (s.customAvatarUrl) return s.customAvatarUrl;
	if (s.githubUsername) return `https://github.com/${s.githubUsername}.png`;
	return null;
};

const getAuthorName = (s: Submission): string => {
	if (s.githubUsername) return s.githubUsername;
	if (s.xUsername) return `@${s.xUsername}`;
	return 'Anonymous';
};

const SubmissionCard: React.FC<{readonly submission: Submission}> = ({
	submission,
}) => {
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(submission.likeCount);

	useEffect(() => {
		setLiked(getLikedIds().has(submission.id));
	}, [submission.id]);

	const onLike = useCallback(async () => {
		if (liked) return;

		setLiked(true);
		setLikeCount((c) => c + 1);
		saveLikedId(submission.id);

		try {
			await fetch(`${REMOTION_PRO_ORIGIN}/api/prompts/like`, {
				method: 'POST',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify({submissionId: submission.id}),
			});
		} catch {
			// Optimistic update, don't revert
		}
	}, [liked, submission.id]);

	const avatarUrl = getAvatarUrl(submission);

	return (
		<a href={`/prompts/${submission.slug}`} className="block">
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<img
					src={`https://image.mux.com/${submission.muxPlaybackId}/thumbnail.png?width=400&height=225&fit_mode=smartcrop`}
					className="w-full aspect-video object-cover"
					alt={submission.title}
				/>
				<div className="p-4">
					<h3 className="font-brand font-bold text-sm truncate">
						{submission.title}
					</h3>
					<p className="text-muted-foreground text-xs mt-1 line-clamp-2">
						{submission.prompt}
					</p>
					<div className="flex items-center justify-between mt-3">
						<div className="flex items-center gap-2">
							{avatarUrl && (
								<img
									src={avatarUrl}
									width={20}
									height={20}
									className="rounded-full"
									alt=""
								/>
							)}
							<span className="text-xs text-muted-foreground">
								{getAuthorName(submission)}
							</span>
						</div>
						<button
							onClick={(e) => {
								e.preventDefault();
								onLike();
							}}
							className={`text-xs flex items-center gap-1 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
							type="button"
						>
							{liked ? '♥' : '♡'} {likeCount}
						</button>
					</div>
				</div>
			</Card>
		</a>
	);
};

const PromptsGallery: React.FC = () => {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchPage = useCallback(async (cursor?: string) => {
		setLoading(true);
		try {
			const url = cursor
				? `${REMOTION_PRO_ORIGIN}/api/prompts?cursor=${cursor}`
				: `${REMOTION_PRO_ORIGIN}/api/prompts`;
			const res = await fetch(url);
			const data = await res.json();
			setSubmissions((prev) =>
				cursor ? [...prev, ...data.items] : data.items,
			);
			setNextCursor(data.nextCursor);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPage();
	}, [fetchPage]);

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[1200px] w-full px-4 py-12">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-brand font-black">
						Prompt Gallery
					</h1>
					<a href="/prompts/submit">
						<Button>Submit a prompt</Button>
					</a>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{submissions.map((s) => (
						<SubmissionCard key={s.id} submission={s} />
					))}
				</div>

				{loading && (
					<div className="text-center text-muted-foreground mt-8">
						Loading...
					</div>
				)}

				{!loading && submissions.length === 0 && (
					<div className="text-center text-muted-foreground mt-8">
						No submissions yet. Be the first to{' '}
						<a href="/prompts/submit" className="underline">
							submit a prompt
						</a>
						!
					</div>
				)}

				{nextCursor && !loading && (
					<div className="text-center mt-8">
						<Button
							variant="outline"
							onClick={() => fetchPage(nextCursor)}
						>
							Load more
						</Button>
					</div>
				)}
			</div>
		</Page>
	);
};

export default PromptsGallery;
