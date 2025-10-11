import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

import {cn} from '~/lib/utils';

const ScrollBar = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({className, orientation = 'vertical', ...props}, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		ref={ref}
		orientation={orientation}
		className={cn(
			'flex touch-none select-none transition-colors',
			orientation === 'vertical' &&
				'h-full w-2.5 border-l border-l-transparent p-px',
			orientation === 'horizontal' &&
				'h-2.5 flex-col border-t border-t-transparent p-px',
			className,
		)}
		{...props}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

const ScrollArea = React.forwardRef<
	React.ElementRef<typeof ScrollAreaPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
		readonly height: number | 'auto';
	}
>(({className, children, height, ...props}, ref) => (
	<ScrollAreaPrimitive.Root
		ref={ref}
		className={cn('relative overflow-hidden', className)}
		{...props}
	>
		<ScrollAreaPrimitive.Viewport
			className="h-full w-full rounded-[inherit]"
			style={{height}}
		>
			{children}
		</ScrollAreaPrimitive.Viewport>
		<ScrollBar />
		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export {ScrollArea, ScrollBar};
