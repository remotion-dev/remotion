import {useCallback, useRef, useState} from 'react';
import {Outer} from './Outer';

export const ButtonDemo = () => {
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
		borderRadius: number;
	} | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	const onPointerEnter = useCallback(() => {
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
			const cornerRadius = parseInt(
				getComputedStyle(childNode).borderRadius ?? '0',
				10,
			);

			return {
				width: rect.width,
				height: rect.height,
				borderRadius: cornerRadius,
			};
		});
	}, []);

	const onPointerLeave = useCallback(() => {
		setDimensions(null);
	}, []);

	const content = (
		<div
			style={{
				fontFamily: 'GT Planar',
				backgroundColor: 'white',
			}}
			className="text-black flex justify-center items-center font-sans border-solid rounded-md border-black cursor-pointer px-4 py-2"
		>
			This is a button
		</div>
	);

	return (
		<div className="flex absolute h-full w-full justify-center items-center bg-[#F9FAFC]">
			<div
				ref={ref}
				className="contents"
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
			>
				{dimensions ? (
					<Outer
						width={dimensions.width}
						height={dimensions.height}
						cornerRadius={dimensions.borderRadius}
					>
						{content}
					</Outer>
				) : (
					content
				)}
			</div>
		</div>
	);
};
