import {Button} from '@remotion/design';
import React from 'react';

export const GetStartedCta: React.FC = () => {
	return (
		<section
			aria-labelledby="get-started-cta"
			className="my-16 flex items-center justify-between gap-3 min-[900px]:gap-6"
		>
			<h2
				id="get-started-cta"
				className="m-0 font-brand text-base leading-[1.1] font-bold min-[360px]:text-lg min-[450px]:text-xl min-[900px]:text-3xl min-[900px]:leading-tight"
			>
				<span className="block whitespace-nowrap min-[900px]:inline">
					Ready to make
				</span>{' '}
				<span className="block whitespace-nowrap min-[900px]:inline">
					your first video?
				</span>
			</h2>
			<Button
				href="/docs"
				className="h-11 shrink-0 rounded-full bg-brand px-3 text-sm font-medium whitespace-nowrap text-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand min-[450px]:px-4 min-[450px]:text-base min-[900px]:h-12 min-[900px]:px-5 min-[900px]:text-lg"
			>
				<span className="mr-2 min-[900px]:mr-3">Get started</span>
				<svg
					width={20}
					height={20}
					className="h-4 w-4 min-[900px]:h-5 min-[900px]:w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					focusable="false"
				>
					<path d="M4 12h16m-6-6 6 6-6 6" />
				</svg>
			</Button>
		</section>
	);
};
