import React from 'react';
import {PALETTE} from './layout/colors';

export const ReactSourceOfTruth: React.FC = () => {
	return (
		<section
			aria-labelledby="react-source-of-truth"
			className="mb-16 mt-8 lg:mt-2"
		>
			<div aria-hidden="true" className="h-14 w-full">
				<svg
					className="h-full w-full overflow-visible"
					preserveAspectRatio="none"
					viewBox="0 0 1000 60"
				>
					<path
						d="M 116 5 C 116 36.5 127 44 143 54"
						fill="none"
						stroke={PALETTE.TEXT_COLOR}
						strokeLinecap="round"
						strokeWidth={3.2}
						vectorEffect="non-scaling-stroke"
					/>
					<path
						d="M 450 5 C 450 36.5 461 44 477 54"
						fill="none"
						stroke={PALETTE.TEXT_COLOR}
						strokeLinecap="round"
						strokeWidth={3.2}
						vectorEffect="non-scaling-stroke"
					/>
					<path
						d="M 784 5 C 784 36.5 773 44 757 54"
						fill="none"
						stroke={PALETTE.TEXT_COLOR}
						strokeLinecap="round"
						strokeWidth={3.2}
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
			</div>
			<p
				id="react-source-of-truth"
				className="m-0 text-center font-brand leading-relaxed"
			>
				React is the source of truth: All changes save back to clean code.
			</p>
		</section>
	);
};
