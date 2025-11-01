import React, {useCallback, useRef, useState} from 'react';
import {cn} from '../../cn';
import {Outer} from './Outer';
import {useHoverTransforms} from './hover-transforms';

export const Button3D: React.FC<
	React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({children, className, disabled, ...buttonProps}) => {
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
		borderRadius: number;
	} | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const {isActive, progress} = useHoverTransforms(ref, Boolean(disabled));

	const onPointerEnter = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.pointerType !== 'mouse') {
				return;
			}

			setDimensions((prevDim) => {
				if (prevDim) {
					return prevDim;
				}

				if (!ref.current) {
					throw new Error('Ref is not set');
				}

				const {childNodes} = ref.current;
				if (childNodes.length === 0) {
					throw new Error('No child nodes');
				}

				const childNode = childNodes[0] as HTMLElement;
				if (!childNode) {
					throw new Error('No child node');
				}

				const rect = childNode.getBoundingClientRect();
				const {borderRadius} = getComputedStyle(childNode);
				const cornerRadius = borderRadius.includes('e+0')
					? Infinity
					: parseInt(borderRadius ?? '0', 10);

				return {
					width: rect.width,
					height: rect.height,
					borderRadius: Math.min(cornerRadius, rect.width / 2, rect.height / 2),
				};
			});
		},
		[],
	);

	const content = (
		<button
			type="button"
			disabled={disabled}
			className={cn(
				'text-black',
				'flex',
				'justify-center',
				'bg-white',
				'items-center',
				'font-brand',
				'border-solid',
				'text-[1em]',
				'rounded-md',
				'border-black',
				'border-2',
				'border-b-4',
				'cursor-pointer',
				'px-4',
				'py-3',
				'disabled:border-gray-500',
				'disabled:text-gray-500',
				'transition-colors',
				className,
			)}
			{...buttonProps}
		>
			{children}
		</button>
	);

	return (
		<div ref={ref} className="contents" onPointerEnter={onPointerEnter}>
			{dimensions && (isActive || progress > 0) ? (
				<Outer
					parentRef={ref}
					width={dimensions.width}
					height={dimensions.height}
					cornerRadius={dimensions.borderRadius}
					hoverTransform={progress}
				>
					{content}
				</Outer>
			) : (
				content
			)}
		</div>
	);
};
