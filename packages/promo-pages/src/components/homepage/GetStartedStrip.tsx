import React, {useState} from 'react';
import {GithubButton} from './GitHubButton';
import {PlainButton} from './layout/Button';

export const GetStarted: React.FC = () => {
	const [clicked, setClicked] = useState<number | null>(null);

	return (
		<div className="flex flex-col lg:flex-row items-center justify-center text-center w-full">
			<div className="w-full lg:w-auto">
				<div className="flex flex-row w-full ">
					{clicked ? (
						<div
							key={clicked}
							style={{
								animation: 'click 0.7s linear',
								animationFillMode: 'forwards',
							}}
							className="absolute z-0 top-0 font-mono text-sm text-center w-full"
						>
							Copied!
						</div>
					) : null}
					<div
						className="bg-[#333] text-white rounded-lg px-4 font-mono hover:[#444] cursor-pointer justify-center items-center flex flex-1 min-h-12"
						onClick={() => {
							navigator.clipboard.writeText('npx create-video@latest');

							setClicked(Date.now());
						}}
						title="Click to copy"
					>
						$ npx create-video@latest
					</div>
				</div>
			</div>
			<div className="w-2 h-2" />
			<div className="w-full lg:w-auto">
				<a
					className={'no-underline w-full block'}
					href="https://www.youtube.com/watch?v=deg8bOoziaE"
					target="_blank"
				>
					<PlainButton size="sm" loading={false} className="w-full">
						Watch demo
					</PlainButton>
				</a>
			</div>
			<div style={{width: 10, height: 10}} />
			<a className={'no-underline w-full lg:w-auto'} href="/docs">
				<PlainButton size="sm" loading={false} className="w-full">
					Docs
				</PlainButton>
			</a>
			<div className="w-2 h-2" />
			<a
				className="no-underline w-full lg:w-auto"
				href="https://remotion.dev/discord"
				target="_blank"
			>
				<PlainButton size="sm" loading={false} className="w-full">
					Discord
				</PlainButton>
			</a>
			<div className="w-2 h-2" />
			<a
				className="no-underline w-full lg:w-auto"
				href="https://github.com/remotion-dev/remotion"
				target="_blank"
			>
				<PlainButton size="sm" loading={false} className="w-full">
					<GithubButton />
				</PlainButton>
			</a>
		</div>
	);
};
