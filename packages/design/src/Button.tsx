import React, {useCallback, useRef, useState} from 'react';
import {cn} from './helpers/cn';
import {useHoverTransforms} from './helpers/hover-transforms';
import {Outer} from './helpers/Outer';
import {Spinner} from './Spinner';

type CommonProps = {
	readonly depth?: number;
	readonly loading?: boolean;
	readonly disabled?: boolean;
};

type ButtonAsButton = CommonProps &
	Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href' | 'disabled'> & {
		readonly href?: undefined;
	};

type ButtonAsAnchor = CommonProps &
	Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> & {
		readonly href: string;
	};

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button: React.FC<ButtonProps> = ({
	children,
	className,
	disabled,
	depth,
	loading,
	...rest
}) => {
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
		borderRadius: number;
	} | null>(null);

	const ref = useRef<HTMLDivElement>(null);
	const {isActive, progress} = useHoverTransforms(
		ref,
		Boolean(disabled || loading),
	);

	const onPointerEnter = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.pointerType !== 'mouse') {
				return;
			}

			setDimensions((prevDim) => {
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

				const cornerRadius = borderRadius.includes('e')
					? Infinity
					: parseInt(borderRadius ?? '0', 10);

				const newCornerRadius = Math.min(
					cornerRadius,
					rect.width / 2,
					rect.height / 2,
				);

				if (prevDim) {
					return {
						width: rect.width,
						height: rect.height,
						borderRadius: prevDim.borderRadius,
					};
				}

				return {
					width: rect.width,
					height: rect.height,
					borderRadius: newCornerRadius,
				};
			});
		},
		[],
	);

	const isDisabled = disabled || loading;

	const sharedClasses = cn(
		'text-text',
		'flex',
		'justify-center',
		'bg-button-bg',
		'items-center',
		'font-brand',
		'border-solid',
		'text-[1em]',
		'rounded-lg',
		'border-black',
		'border-2',
		'border-b-4',
		'cursor-pointer',
		'px-4',
		'h-12',
		'flex',
		'flex-row',
		'items-center',
		'relative',
		'overflow-hidden',
		isDisabled && 'cursor-default opacity-50',
		className,
	);

	const innerContent = (
		<>
			<div className={cn(loading && 'invisible', 'inline-flex items-center')}>
				{children}
			</div>
			{loading ? (
				<div
					className={cn(
						'absolute w-full h-full flex inset-0 items-center justify-center text-inherit bg-inherit',
					)}
				>
					<Spinner size={20} duration={1} />
				</div>
			) : null}
		</>
	);

	const isAnchor = 'href' in rest && rest.href !== undefined;

	const content = isAnchor ? (
		<a
			{...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
			className={cn('no-underline text-inherit', sharedClasses)}
			aria-disabled={isDisabled || undefined}
			tabIndex={isDisabled ? -1 : undefined}
			onClick={
				isDisabled
					? (e: React.MouseEvent<HTMLAnchorElement>) => {
							e.preventDefault();
						}
					: (rest as React.AnchorHTMLAttributes<HTMLAnchorElement>).onClick
			}
		>
			{innerContent}
		</a>
	) : (
		<button
			type="button"
			disabled={isDisabled}
			className={sharedClasses}
			{...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{innerContent}
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
					depthFactor={depth ?? 1}
				>
					{content}
				</Outer>
			) : (
				content
			)}
		</div>
	);
};
