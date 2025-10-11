import React from 'react';
import {useMobileLayout} from './layout/use-mobile-layout';

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

export const MoreTemplatesButton: React.FC = () => {
	const mobileLayout = useMobileLayout();

	return (
		<a href="/templates" className="no-underline text-inherit">
			<div className="right-0 border-2 rounded-full text-inherit px-4 py-2 fontbrand font-semibold text-sm flex flex-row items-center">
				{mobileLayout ? 'Templates' : 'Find a template'}
				<svg
					style={icon}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 448 512"
				>
					<path
						fill="currentColor"
						d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
					/>
				</svg>
			</div>
		</a>
	);
};
