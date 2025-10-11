import React from 'react';

export const DragOverOverlay: React.FC<{
	readonly active: boolean;
}> = ({active}) => {
	return (
		<div
			data-active={String(active)}
			className="inset-0 absolute bg-slate-50 pointer-events-none flex justify-center items-center font-brand flex-col transition-opacity opacity-0 data-[active=true]:opacity-100"
		>
			<h2 className="text-2xl font-medium">Drop a video</h2>
			<div className="h-1" />
			<p className="text-muted-foreground">
				The current video will be replaced.
			</p>
		</div>
	);
};
