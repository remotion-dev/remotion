import clsx from 'clsx';
import React from 'react';

export const Page: React.FC<{
	readonly children: React.ReactNode;
	readonly className?: string;
}> = ({children, className}) => {
	return (
		<div
			className={clsx(
				'overflow-y-auto w-full bg-slate-50 min-h-[100vh]',
				className,
			)}
		>
			{children}
		</div>
	);
};
