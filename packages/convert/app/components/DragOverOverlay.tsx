import React from 'react';

export const DragOverOverlay: React.FC<{
	readonly active: boolean;
	readonly replacing: boolean;
}> = ({active, replacing}) => {
	return (
		<div
			data-active={String(active)}
			className="inset-0 fixed z-20 bg-page pointer-events-none flex justify-center items-center font-brand flex-col transition-opacity opacity-0 data-[active=true]:opacity-100"
		>
			<h2 className="text-2xl font-medium">Drop a video</h2>
			<div className="h-1" />
			<p className="text-muted-foreground">
				{replacing
					? 'The current video will be replaced.'
					: 'Drop your file anywhere to get started.'}
			</p>
		</div>
	);
};
