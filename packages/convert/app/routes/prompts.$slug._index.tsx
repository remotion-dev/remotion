import type {LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
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

export const loader = async ({params}: LoaderFunctionArgs) => {
	return {slug: params.slug};
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

const PromptPermalink: React.FC = () => {
	const {slug} = useLoaderData<typeof loader>();
	const [submission, setSubmission] = useState<Submission | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(
					`${REMOTION_PRO_ORIGIN}/api/prompts/${slug}`,
				);
				if (!res.ok) {
					setError('Submission not found');
					return;
				}

				const data = await res.json();
				setSubmission(data);
				setLikeCount(data.likeCount);
				setLiked(getLikedIds().has(data.id));
			} catch {
				setError('Failed to load submission');
			}
		})();
	}, [slug]);

	const onLike = useCallback(async () => {
		if (!submission || liked) return;

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
			// Optimistic
		}
	}, [submission, liked]);

	if (error) {
		return (
			<Page className="flex-col">
				<div className="m-auto max-w-[800px] w-full px-4 py-12">
					<p className="text-muted-foreground">{error}</p>
					<a href="/prompts" className="underline text-sm mt-4 block">
						Back to gallery
					</a>
				</div>
			</Page>
		);
	}

	if (!submission) {
		return (
			<Page className="flex-col">
				<div className="m-auto max-w-[800px] w-full px-4 py-12">
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</Page>
		);
	}

	const avatarUrl =
		submission.customAvatarUrl ||
		(submission.githubUsername
			? `https://github.com/${submission.githubUsername}.png`
			: null);

	const authorName = submission.githubUsername
		? submission.githubUsername
		: submission.xUsername
			? `@${submission.xUsername}`
			: 'Anonymous';

	const authorLink = submission.githubUsername
		? `https://github.com/${submission.githubUsername}`
		: submission.xUsername
			? `https://x.com/${submission.xUsername}`
			: null;

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full px-4 py-12">
				<a
					href="/prompts"
					className="text-muted-foreground text-sm mb-4 block hover:underline"
				>
					&larr; Back to gallery
				</a>
				<Card className="overflow-hidden">
					<div className="aspect-video bg-black">
						<iframe
							src={`https://stream.mux.com/${submission.muxPlaybackId}`}
							className="w-full h-full"
							allow="autoplay; fullscreen"
							allowFullScreen
							title={submission.title}
						/>
					</div>
					<div className="p-6">
						<h1 className="text-2xl font-brand font-black">
							{submission.title}
						</h1>

						<div className="flex items-center gap-3 mt-4">
							{avatarUrl && (
								<img
									src={avatarUrl}
									width={32}
									height={32}
									className="rounded-full"
									alt=""
								/>
							)}
							{authorLink ? (
								<a
									href={authorLink}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-medium hover:underline"
								>
									{authorName}
								</a>
							) : (
								<span className="text-sm font-medium">
									{authorName}
								</span>
							)}
						</div>

						<h2 className="font-brand font-bold mt-6 mb-2">
							Prompt
						</h2>
						<pre className="whitespace-pre-wrap text-sm bg-slate-100 rounded p-4 border">
							{submission.prompt}
						</pre>

						<div className="mt-6 flex items-center gap-4">
							<Button
								variant={liked ? 'default' : 'outline'}
								onClick={onLike}
								disabled={liked}
							>
								{liked ? '♥' : '♡'} {likeCount}{' '}
								{likeCount === 1 ? 'like' : 'likes'}
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</Page>
	);
};

export default PromptPermalink;
