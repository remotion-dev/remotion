import {Button} from '@remotion/design';
import React, {useEffect, useState} from 'react';
import {GithubButton} from './GitHubButton';
import {PromptAgentLogos} from './PromptAgentLogos';

const setupPrompt =
	'Set up Remotion for me and help me make my first video. Fetch https://www.remotion.dev/get-started.md and follow it.';

export const GetStarted: React.FC = () => {
	const [copiedAt, setCopiedAt] = useState<number | null>(null);
	const [manualCopy, setManualCopy] = useState(false);
	const buttonClassName =
		'w-full px-1.5 py-0 min-[360px]:px-2 min-[900px]:px-4';

	useEffect(() => {
		if (copiedAt === null) {
			return;
		}

		const timeout = window.setTimeout(() => setCopiedAt(null), 950);
		return () => window.clearTimeout(timeout);
	}, [copiedAt]);

	return (
		<div className="flex flex-col min-[900px]:flex-row items-center text-center w-full justify-start lg:justify-end">
			<div className="w-full min-[900px]:w-auto">
				{manualCopy ? (
					<input
						ref={(input) => {
							input?.focus();
							input?.select();
						}}
						aria-label="Select and copy the agent prompt"
						className="w-full rounded-lg border px-3 min-[900px]:w-44"
						readOnly
						value={setupPrompt}
					/>
				) : (
					<Button
						className={buttonClassName}
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(setupPrompt);
								setCopiedAt(Date.now());
							} catch {
								setManualCopy(true);
							}
						}}
						title="Copy this prompt for ChatGPT, Claude, or Cursor"
					>
						<PromptAgentLogos />
						<span
							data-copied={copiedAt !== null}
							className="relative ml-2 flex h-18 items-center text-left whitespace-nowrap transition-transform duration-250 ease-out data-[copied=true]:-translate-y-full motion-reduce:transition-none"
						>
							Copy prompt
							<span
								aria-hidden="true"
								className="absolute inset-x-0 top-full flex h-full items-center"
							>
								Have fun!
							</span>
						</span>
					</Button>
				)}
				<span role="status" className="sr-only">
					{copiedAt === null ? '' : 'Prompt copied. Have fun!'}
				</span>
			</div>
			<div style={{width: 10, height: 10}} />
			<div className="flex flex-row gap-2 w-full min-[900px]:w-auto">
				<div className="flex-1 min-[900px]:flex-none">
					<Button href="/docs" className={buttonClassName}>
						Docs
					</Button>
				</div>
				<div className="flex-1 min-[900px]:flex-none">
					<Button
						href="https://remotion.dev/discord"
						target="_blank"
						className={buttonClassName}
					>
						Discord
					</Button>
				</div>
				<div className="flex-[1.4] min-w-max min-[900px]:flex-none">
					<Button
						href="https://github.com/remotion-dev/remotion"
						target="_blank"
						className="w-full px-2.5 min-[360px]:px-4"
					>
						<GithubButton />
					</Button>
				</div>
			</div>
		</div>
	);
};
