import clsx from 'clsx';
import React from 'react';
import {convertTools, getActiveConvertTool} from '~/lib/convert-tools';
import type {RouteAction} from '~/seo';
import {AwesomeIcon} from './AwesomeIcon';
import {BoltIcon} from './BoltIcon';
import {Footer} from './Footer';
import {LockIcon} from './LockIcon';

export const WhyRemotionConvert: React.FC<{
	readonly routeAction: RouteAction;
}> = ({routeAction}) => {
	const activeTool = getActiveConvertTool(routeAction);

	return (
		<div className="mx-auto w-full max-w-[500px] px-5 pt-10 text-left min-[900px]:max-w-[1000px]">
			<div className="w-full">
				<div className="flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-[repeat(3,270px)] min-[900px]:justify-between min-[900px]:gap-x-0">
					<div className="flex min-w-0 flex-col items-start">
						<BoltIcon />
						<div className="h-4" />
						<h2 className="font-brand font-medium text-2xl leading-[1.1] mb-2">
							Extremely Fast
						</h2>
						<div className="font-brand text-foreground/90 leading-relaxed text-pretty">
							remotion.dev/convert leverages WebCodecs technology, taking full
							advantage of the hardware acceleration of your device.
						</div>
					</div>
					<div className="flex min-w-0 flex-col items-start">
						<LockIcon />
						<div className="h-4" />
						<h2 className="font-brand font-medium text-2xl leading-[1.1] mb-2">
							Private and offline
						</h2>
						<div className="font-brand text-foreground/90 leading-relaxed text-pretty">
							You don&apos;t have to upload your video for it to be processed.
							This site works completely offline and your video does not leave
							this device.
							<br />
						</div>
					</div>
					<div className="flex min-w-0 flex-col items-start">
						<AwesomeIcon />
						<div className="h-4" />
						<h2 className="font-brand font-medium text-2xl leading-[1.1] mb-2">
							Free and no ads
						</h2>
						<div className="font-brand text-foreground/90 leading-relaxed text-pretty">
							No monetization on this site.
						</div>
						<div className="font-brand leading-relaxed text-pretty">
							It simply serves as a GUI for{' '}
							<a
								href="https://mediabunny.dev"
								target="_blank"
								className="text-brand hover:underline underline-offset-4"
							>
								Mediabunny
							</a>
							, an open-source multimedia library we love!
						</div>
					</div>
				</div>
				<div className="h-14" />
				<div className="w-full text-left">
					<nav aria-label="Remotion tools" className="grid grid-cols-1 gap-y-2">
						<div>
							<a
								href="https://remotion.dev/?utm_source=convert"
								target="_blank"
								className="grid gap-x-3 font-brand text-sm leading-6 text-muted-foreground transition-colors hover:text-brand min-[600px]:grid-cols-[230px_1fr] min-[900px]:grid-cols-[calc((100%_-_270px)/2)_1fr] min-[900px]:gap-x-0"
							>
								<span className="font-bold text-foreground">remotion.dev</span>
								<span>Make videos programmatically</span>
							</a>
						</div>
						{convertTools.map((tool) => {
							const active = tool.key === activeTool;

							return (
								<div key={tool.key}>
									<a
										href={tool.href}
										aria-current={active ? 'page' : undefined}
										className={clsx(
											'grid gap-x-3 font-brand text-sm leading-6 text-muted-foreground transition-colors hover:text-brand min-[600px]:grid-cols-[230px_1fr] min-[900px]:grid-cols-[calc((100%_-_270px)/2)_1fr] min-[900px]:gap-x-0',
											active && 'text-brand',
										)}
									>
										<span
											className={clsx(
												'font-bold',
												active ? 'text-brand' : 'text-foreground',
											)}
										>
											{tool.displayUrl}
										</span>
										<span>{tool.description}</span>
									</a>
								</div>
							);
						})}
					</nav>
				</div>
				<div className="h-20" />
				<Footer routeAction={routeAction} />
			</div>
			<div className="h-10" />
		</div>
	);
};
