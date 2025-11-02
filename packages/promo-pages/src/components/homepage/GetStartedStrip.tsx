import {Button} from '@remotion/design';
import React, {useState} from 'react';
import {GithubButton} from './GitHubButton';

export const GetStarted: React.FC = () => {
	const [clicked, setClicked] = useState<number | null>(null);

	return (
		<div className="flex flex-col lg:flex-row items-center justify-center text-center w-full">
			<div className="w-full lg:w-auto">
				<div className="flex flex-row w-full relative">
					{clicked ? (
						<div
							key={clicked}
							style={{
								animation: 'click 0.7s linear',
								animationFillMode: 'forwards',
							}}
							className="absolute z-0 top-[-20px] font-mono text-sm text-center w-full"
						>
							Copied!
						</div>
					) : null}
					<Button
						className="bg-[#333] text-white rounded-lg px-4 font-mono hover:[#444] cursor-pointer w-full"
						onClick={() => {
							navigator.clipboard.writeText('npx create-video@latest');

							setClicked(Date.now());
						}}
						title="Click to copy"
					>
						$ npx create-video@latest
					</Button>
				</div>
			</div>
			<div className="w-2 h-2" />
			<div className="w-full lg:w-auto">
				<a
					className={'no-underline w-full block'}
					href="https://www.youtube.com/watch?v=deg8bOoziaE"
					target="_blank"
				>
					<Button className="w-full">Watch demo</Button>
				</a>
			</div>
			<div style={{width: 10, height: 10}} />
			<a className={'no-underline w-full lg:w-auto'} href="/docs">
				<Button className="w-full">Docs</Button>
			</a>
			<div className="w-2 h-2" />
			<a
				className="no-underline w-full lg:w-auto"
				href="https://remotion.dev/discord"
				target="_blank"
			>
				<Button className="w-full">Discord</Button>
			</a>
			<div className="w-2 h-2" />
			<a
				className="no-underline w-full lg:w-auto"
				href="https://github.com/remotion-dev/remotion"
				target="_blank"
			>
				<Button className="w-full">
					<GithubButton />
				</Button>
			</a>
		</div>
	);
};
