import React, {useEffect, useState} from 'react';
import {REMOTION_PRO_ORIGIN} from './config';
import {CopyPromptButton} from './CopyPromptButton';
import {LikeButton} from './LikeButton';
import {MuxPlayer} from './MuxPlayer';
import {NewBackButton} from './NewBackButton';
import {Page} from './Page';
import {getAuthorName, getAvatarUrl, getRelativeTime} from './prompt-helpers';
import type {Submission} from './prompt-types';

export const PromptsShowPage: React.FC = () => {
	const [submission, setSubmission] = useState<Submission | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const slug = new URLSearchParams(window.location.search).get('prompt');
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
	}, []);

	if (error) {
		return (
			<Page className="flex-col">
				<div className="m-auto max-w-[800px] w-full px-4 py-12">
					<p className="text-muted-foreground">{error}</p>
					<a
						href="/prompts"
						className="text-sm mt-4 block no-underline hover:no-underline"
					>
						Back to gallery
					</a>
				</div>
			</Page>
		);
	}

	if (!submission) {
		return null;
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
				<NewBackButton text="Back to gallery" link="/prompts" />
				<div className="h-1" />
				<h1 className="text-2xl font-brand font-black">{submission.title}</h1>
				<div>
					<div className="flex items-center gap-3 mt-4 mb-4">
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

					<div>
						<MuxPlayer
							playbackId={submission.muxPlaybackId}
							title={submission.title}
							rounded={false}
						/>
						{submission.toolUsed && (
							<>
								<h2 className="font-brand font-bold mt-6 mb-2">Tool used</h2>
								<p className="text-sm font-brand">{submission.toolUsed}</p>
							</>
						)}
						{submission.modelUsed && (
							<>
								<h2 className="font-brand font-bold mt-6 mb-2">Model used</h2>
								<p className="text-sm font-brand">{submission.modelUsed}</p>
							</>
						)}
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
