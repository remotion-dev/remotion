export const Switch: React.FC<{
	readonly active: boolean;
	readonly onToggle: () => void;
}> = ({active, onToggle}) => {
	return (
		<div
			data-active={active}
			className="h-6 transition-none rounded-full w-12 border-2 bg-gray-200 dark:bg-[#424243] p-[2px] cursor-pointer before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-brand before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100 border-outline relative"
			onClick={onToggle}
		>
			<div
				data-active={active}
				className="h-4 w-4 left-[2px] transition-[left] rounded-full bg-white dark:bg-[#aaa] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-white before:opacity-0 before:transition-opacity data-[active=true]:before:opacity-100 border-2 border-outline absolute data-[active=true]:left-[calc(100%-1rem-2px)]"
			/>
		</div>
	);
};
