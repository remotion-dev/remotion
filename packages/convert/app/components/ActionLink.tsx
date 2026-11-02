import type {ReactNode} from 'react';

export const ActionLink = ({
	children,
	onClick,
}: {
	readonly children: ReactNode;
	readonly onClick: () => void;
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 font-brand text-sm font-medium leading-6 text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
		>
			{children}
			<svg aria-hidden="true" className="ml-2.5 h-4" viewBox="0 0 448 512">
				<path
					fill="currentColor"
					d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
				/>
			</svg>
		</button>
	);
};
