export const Switch: React.FC<{
	readonly active: boolean;
	readonly onToggle: () => void;
}> = ({active, onToggle}) => {
	return (
		<div
			data-active={active}
			className="h-6 transition-all rounded-full w-12 border-2 bg-gray-200 dark:data-[active=false]:bg-[#424243] p-[2px] cursor-pointer data-[active=true]:bg-brand border-outline relative"
			onClick={onToggle}
		>
			<div
				data-active={active}
				className="h-4 w-4 left-[2px] transition-all rounded-full bg-white dark:data-[active=false]:bg-[#aaa] border-2 border-outline absolute data-[active=true]:left-[calc(100%-1rem-2px)]"
			/>
		</div>
	);
};
