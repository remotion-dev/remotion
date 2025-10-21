import clsx from 'clsx';
import React from 'react';

export const pageRef = React.createRef<HTMLDivElement>();

export const Page: React.FC<{
	readonly children: React.ReactNode;
	readonly className?: string;
}> = ({children, className}) => {
	return (
		<div
			ref={pageRef}
			className={clsx(
				'overflow-y-auto w-full bg-slate-50 min-h-screen',
				className,
			)}
		>
			{children}
		</div>
	);
};
