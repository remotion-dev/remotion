import clsx from 'clsx';
import React from 'react';

export const pageRef = React.createRef<HTMLDivElement>();

export const Page: React.FC<{
	readonly children: React.ReactNode;
	readonly className?: string;
	readonly onDrop?: React.DragEventHandler<HTMLDivElement>;
	readonly onDragOver?: React.DragEventHandler<HTMLDivElement>;
}> = ({children, className, onDrop, onDragOver}) => {
	return (
		<div
			ref={pageRef}
			onDrop={onDrop}
			onDragOver={onDragOver}
			className={clsx(
				'overflow-y-auto w-full bg-[var(--background)] min-h-screen',
				className,
			)}
		>
			{children}
		</div>
	);
};
