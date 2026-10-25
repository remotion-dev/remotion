import {Button} from '@remotion/design';
import React, {useState} from 'react';
import {GithubButton} from './GitHubButton';

export const GetStarted: React.FC<{
	readonly alignRight: boolean;
	readonly command: string;
}> = ({alignRight, command}) => {
	const [clicked, setClicked] = useState<number | null>(null);
	const linkButtonClassName = alignRight
		? 'w-full px-1.5 min-[360px]:px-2 min-[900px]:px-4'
		: 'w-full';

	return (
		<div
			className={`flex flex-col min-[900px]:flex-row items-center text-center w-full ${alignRight ? 'justify-start lg:justify-end' : 'justify-center'}`}
		>
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
					<Button
						className="bg-[#333] text-white rounded-lg px-4 font-mono hover:[#444] cursor-pointer w-full"
						onClick={() => {
							navigator.clipboard.writeText(command);

							setClicked(Date.now());
						}}
						title="Click to copy"
					>
						$ {command}
					</Button>
				</div>
			</div>
			<div style={{width: 10, height: 10}} />
			<div
				className={
					alignRight
						? 'flex flex-row gap-2 w-full min-[900px]:w-auto'
						: 'contents'
				}
			>
				<div
					className={
						alignRight
							? 'flex-1 min-[900px]:flex-none'
							: 'w-full min-[900px]:w-auto'
					}
				>
					<Button href="/docs" className={linkButtonClassName}>
						Docs
					</Button>
				</div>
				{alignRight ? null : <div className="w-2 h-2" />}
				<div
					className={
						alignRight
							? 'flex-1 min-[900px]:flex-none'
							: 'w-full min-[900px]:w-auto'
					}
				>
					<Button
						href="https://remotion.dev/discord"
						target="_blank"
						className={linkButtonClassName}
					>
						Discord
					</Button>
				</div>
				{alignRight ? null : <div className="w-2 h-2" />}
				<div
					className={
						alignRight
							? 'flex-[1.4] min-w-max min-[900px]:flex-none'
							: 'w-full min-[900px]:w-auto'
					}
				>
					<Button
						href="https://github.com/remotion-dev/remotion"
						target="_blank"
						className={
							alignRight
								? 'w-full px-2.5 min-[360px]:px-4'
								: linkButtonClassName
						}
					>
						<GithubButton />
					</Button>
				</div>
			</div>
		</div>
	);
};
