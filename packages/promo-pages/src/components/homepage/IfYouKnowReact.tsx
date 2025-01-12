import React from 'react';
import {CodeExample} from './CodeExample';
import {BlueButton} from './layout/Button';

export const IfYouKnowReact: React.FC = () => {
	return (
		<div className="flex flex-col-reverse lg:flex-row text-left lg:text-right justify-start lg:justify-end items-start lg:items-center">
			<CodeExample />
			<div className="h-10 lg:w-10" />
			<div className="lg:text-right">
				<h2 className="text-4xl fontbrand">
					Leverage <span className="text-brand">React</span> <br />
					to express yourself.
				</h2>
				<p className="leading-relaxed">
					Remotion gives you the tools for video creation, <br /> but the rules
					of React stay the same. <br />
				</p>
				Learn the fundamentals in just a few minutes.
				<div className="h-7" />
				<a className="no-underline inline-block" href="/docs/the-fundamentals">
					<BlueButton size="sm" loading={false}>
						Learn Remotion
					</BlueButton>
				</a>
			</div>
		</div>
	);
};
