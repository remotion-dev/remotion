import {Card} from '@remotion/design';
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
		<div className="text-left lg:text-center px-8 block m-auto">
			<h2 className="font-brand text-xl font-bold mt-14">
				Why use Remotion Convert?
			</h2>
			<div className="h-10" />
			<div className="m-auto inline-block">
				<div className="inline-flex flex-col lg:flex-row gap-8">
					<Card className="lg:w-[300px] text-left px-4 py-6">
						<BoltIcon />
						<div className="h-4" />
						<div className="font-brand font-bold text-2xl mb-2">
							Extremely Fast
						</div>
						<div className="font-brand text-black/90">
							Remotion Convert leverages WebCodecs technology, taking full
							advantage of the hardware acceleration of your device.
						</div>
					</Card>
					<Card className="lg:w-[300px] text-left px-4 py-6">
						<LockIcon />
						<div className="h-4" />
						<div className="font-brand font-bold text-2xl mb-2">
							Private and offline
						</div>
						<div className="font-brand text-black/90">
							You don&apos;t have to upload your video for it to be processed.
							This site works completely offline and your video does not leave
							this device.
							<br />
						</div>
					</Card>
					<Card className="lg:w-[300px] text-left px-4 py-6">
						<AwesomeIcon />
						<div className="h-4" />
						<div className="font-brand font-bold text-2xl mb-2">
							Free and no ads
						</div>
						<div className="font-brand text-black/90">
							This site is free to use and has no ads.
						</div>
						<div className="font-brand">
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
					</Card>
				</div>
				<div className="h-14" />
				<div className="m-auto max-w-[760px] text-left">
					<nav aria-label="Remotion tools" className="grid grid-cols-1 gap-y-2">
						<div>
							<a
								href="https://remotion.dev/?utm_source=convert"
								target="_blank"
								className="font-brand text-sm leading-6 text-slate-600 transition-colors hover:text-brand"
							>
								<span className="font-bold text-foreground">remotion.dev</span>
								{' - '}Make videos programmatically
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
											'font-brand text-sm leading-6 text-slate-600 transition-colors hover:text-brand',
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
										{' - '}
										{tool.description}
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
