import {Button} from '@remotion/design';
import React, {useState} from 'react';
import {ClipboardIcon} from '../prompts/ClipboardIcon';
import {GithubButton} from './GitHubButton';

const setupPrompt =
	'Set up Remotion for me and help me make my first video. Fetch https://www.remotion.dev/get-started.md and follow it.';

export const GetStarted: React.FC = () => {
	const [clicked, setClicked] = useState<number | null>(null);
	const [manualCopy, setManualCopy] = useState(false);
	const linkButtonClassName = 'w-full px-1.5 min-[360px]:px-2 min-[900px]:px-4';

	return (
		<div className="flex flex-col min-[900px]:flex-row items-center text-center w-full justify-start lg:justify-end">
			<div className="w-full min-[900px]:w-auto">
				<div className="flex flex-row w-full relative">
					{clicked ? (
						<div
							key={clicked}
							style={{
								animation: 'click 0.7s linear',
								animationFillMode: 'forwards',
							}}
							className="absolute z-0 top-[-10px] font-mono text-sm text-center w-full"
						>
							Copied!
						</div>
					) : null}
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
							className="bg-brand text-white rounded-full px-4 cursor-pointer w-full"
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(setupPrompt);
									setClicked(Date.now());
								} catch {
									setManualCopy(true);
								}
							}}
							title="Copy this prompt and paste it into your coding agent"
						>
							<ClipboardIcon />
							<span className="ml-2">Copy agent prompt</span>
						</Button>
					)}
				</div>
			</div>
			<div style={{width: 10, height: 10}} />
			<div className="flex flex-row gap-2 w-full min-[900px]:w-auto">
				<div className="flex-1 min-[900px]:flex-none">
					<Button href="/docs" className={linkButtonClassName}>
						Docs
					</Button>
				</div>
				<div className="flex-1 min-[900px]:flex-none">
					<Button
						href="https://remotion.dev/discord"
						target="_blank"
						className={linkButtonClassName}
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
