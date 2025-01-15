import React from 'react';
import {AwesomeIcon} from './AwesomeIcon';
import {BoltIcon} from './BoltIcon';
import {Footer} from './Footer';
import {LockIcon} from './LockIcon';

export const WhyRemotionConvert: React.FC = () => {
	return (
		<div className="text-left lg:text-center px-8 block m-auto">
			<h2 className="font-brand text-xl font-bold mt-14">
				Why use Remotion Convert?
			</h2>
			<div className="h-20" />
			<div className="m-auto inline-block">
				<div className="inline-flex flex-col lg:flex-row gap-12">
					<div className="w-[300px] text-left">
						<BoltIcon />
						<div className="h-4" />
						<div className="font-brand font-bold text-2xl mb-2">
							Extremely Fast
						</div>
						<div className="font-brand text-black/90">
							Remotion Convert leverages WebCodecs technology, taking full
							advantage of the hardware acceleration of your device. No other
							site can do this!
						</div>
					</div>
					<div className="w-[300px] text-left">
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
					</div>
					<div className="w-[300px] text-left">
						<AwesomeIcon />
						<div className="h-4" />
						<div className="font-brand font-bold text-2xl mb-2">
							Free and no ads
						</div>
						<div className="font-brand text-black/90">
							This site is free to use and has no ads.
						</div>
						<div className="font-brand">
							It simply serves as a demo of{' '}
							<a
								href="https://remotion.dev/webcodecs"
								target="_blank"
								className="text-brand hover:underline underline-offset-4"
							>
								our solution for developers to convert videos programmatically
								in the browser!
							</a>
						</div>
					</div>
				</div>
				<div className="h-20" />
				<Footer />
			</div>
			<div className="h-10" />
		</div>
	);
};
