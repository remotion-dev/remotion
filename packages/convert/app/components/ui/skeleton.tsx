import {cn} from '~/lib/utils';

const Skeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			className={cn('rounded-md bg-muted border-black/15 border', className)}
			{...props}
		/>
	);
};

export {Skeleton};
