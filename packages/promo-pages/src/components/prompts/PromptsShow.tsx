import React from 'react';
import {CopyPromptButton} from './CopyPromptButton';
import {LikeButton} from './LikeButton';
import {MuxPlayer} from './MuxPlayer';
import {NewBackButton} from './NewBackButton';
import {Page} from './Page';
import {getAuthorName, getAvatarUrl, getRelativeTime} from './prompt-helpers';
import type {PromptSubmission} from './prompt-types';

export const PromptsShowPage: React.FC<{
	readonly promptSubmission: PromptSubmission;
}> = ({promptSubmission}) => {
	const avatarUrl = getAvatarUrl(promptSubmission);
	const authorName = getAuthorName(promptSubmission);

	const authorLink = promptSubmission.githubUsername
		? `https://github.com/${promptSubmission.githubUsername}`
		: promptSubmission.xUsername
			? `https://x.com/${promptSubmission.xUsername}`
			: null;

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[800px] w-full px-4 py-12">
				<NewBackButton text="Back to gallery" link="/prompts" />
				<div className="h-1" />
				<h1 className="text-2xl font-brand font-black">
					{promptSubmission.title}
				</h1>
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
								Prompted by{' '}
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
								title={new Date(promptSubmission.createdAt).toLocaleString()}
							>
								{getRelativeTime(promptSubmission.createdAt)}
							</div>
						</div>
					</div>

					<div>
						<MuxPlayer
							playbackId={promptSubmission.muxPlaybackId}
							title={promptSubmission.title}
							rounded={false}
						/>
						{promptSubmission.toolUsed && (
							<>
								<h2 className="font-brand font-bold mt-6 mb-2">Tool used</h2>
								<p className="text-sm font-brand">
									{promptSubmission.toolUsed}
								</p>
							</>
						)}
						{promptSubmission.modelUsed && (
							<>
								<h2 className="font-brand font-bold mt-6 mb-2">Model used</h2>
								<p className="text-sm font-brand">
									{promptSubmission.modelUsed}
								</p>
							</>
						)}
						<h2 className="font-brand font-bold mt-6 mb-2">Prompt</h2>
						<pre
							className="whitespace-pre-wrap text-sm rounded p-4 text-white"
							style={{backgroundColor: '#272A36'}}
						>
							{promptSubmission.prompt}
						</pre>
						<div className="mt-6 flex items-center gap-2">
							<LikeButton
								submissionId={promptSubmission.id}
								initialLikeCount={promptSubmission.likeCount}
							/>
							<CopyPromptButton prompt={promptSubmission.prompt} />
						</div>
					</div>
				</div>
			</div>
		</Page>
	);
};
