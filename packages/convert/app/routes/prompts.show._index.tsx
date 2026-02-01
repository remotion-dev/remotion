import {useSearchParams} from '@remix-run/react';
import React, {useEffect, useState} from 'react';
import {CopyPromptButton} from '~/components/CopyPromptButton';
import {LikeButton} from '~/components/LikeButton';
import {MuxPlayer} from '~/components/MuxPlayer';
import {NewBackButton} from '~/components/NewBackButton';
import {Page} from '~/components/Page';
import {REMOTION_PRO_ORIGIN} from '~/lib/config';
import {
	getAuthorName,
	getAvatarUrl,
	getRelativeTime,
} from '~/lib/prompt-helpers';
import type {Submission} from '~/lib/prompt-types';

const PromptPermalink: React.FC = () => {
	const [searchParams] = useSearchParams();
	const slug = searchParams.get('prompt');
	const [submission, setSubmission] = useState<Submission | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) {
			setError('No prompt specified');
			return;
		}

		(async () => {
			try {
				const res = await fetch(`${REMOTION_PRO_ORIGIN}/api/prompts/${slug}`);
				if (!res.ok) {
					setError('Submission not found');
					return;
				}

				const data = await res.json();
				setSubmission(data);
			} catch {
				setError('Failed to load submission');
			}
		})();
	}, [slug]);

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

	const avatarUrl = getAvatarUrl(submission);
	const authorName = getAuthorName(submission);

	const authorLink = submission.githubUsername
		? `https://github.com/${submission.githubUsername}`
		: submission.xUsername
			? `https://x.com/${submission.xUsername}`
			: null;

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full px-4 py-12">
				<NewBackButton color="black" text="Back to gallery" link="/prompts" />
				<div className="h-6" />
				<div>
					<MuxPlayer
						playbackId={submission.muxPlaybackId}
						title={submission.title}
						rounded={false}
					/>
					<div className="pt-6">
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
									alt={authorName ? `${authorName}'s avatar` : 'Author avatar'}
								/>
							)}
							<div>
								<div className="text-sm font-brand">
									Submitted by{' '}
									{authorLink ? (
										<a
											href={authorLink}
											target="_blank"
											rel="noopener noreferrer"
											className="font-medium hover:underline"
										>
											{authorName}
										</a>
									) : (
										<span className="font-medium">{authorName}</span>
									)}
								</div>
								<div
									className="text-xs text-muted-foreground font-brand"
									title={new Date(submission.createdAt).toLocaleString()}
								>
									{getRelativeTime(submission.createdAt)}
								</div>
							</div>
						</div>

						<h2 className="font-brand font-bold mt-6 mb-2">Prompt</h2>
						<pre
							className="whitespace-pre-wrap text-sm rounded p-4 text-white"
							style={{backgroundColor: '#272A36'}}
						>
							{submission.prompt}
						</pre>
						<div className="mt-6 flex items-center gap-2">
							<LikeButton
								submissionId={submission.id}
								initialLikeCount={submission.likeCount}
							/>
							<CopyPromptButton prompt={submission.prompt} />
						</div>
					</div>
				</div>
			</div>
		</Page>
	);
};

export default PromptPermalink;
