import React, {useContext, useEffect, useRef, useState} from 'react';
import {SplitterContext} from './SplitterContext';

export const SPLITTER_HANDLE_SIZE = 3;

const containerRow: React.CSSProperties = {
	height: SPLITTER_HANDLE_SIZE,
	cursor: 'row-resize',
};

const containerColumn: React.CSSProperties = {
	width: SPLITTER_HANDLE_SIZE,
	cursor: 'col-resize',
};

export const SplitterHandle: React.FC = () => {
	const context = useContext(SplitterContext);
	if (!context) {
		throw new Error('Cannot find splitter context');
	}
	const [lastPointerUp, setLastPointerUp] = useState(() => Date.now());
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (context.isDragging.current) {
			return;
		}
		if (!context.domRect) {
			return;
		}
		const {current} = ref;
		if (!current) {
			return;
		}

		const getNewValue = (e: PointerEvent) => {
			if (!context.isDragging.current) {
				throw new Error('cannot get value if not dragging');
			}
			if (!context.domRect) {
				throw new Error('domRect is not mounted');
			}
			const {width, height} = context.domRect;
			const change = (() => {
				if (context.orientation === 'vertical') {
					return (
						(e.clientX - context.isDragging.current.x) /
						(width - SPLITTER_HANDLE_SIZE)
					);
				}
				return (
					(e.clientY - context.isDragging.current.y) /
					(height - SPLITTER_HANDLE_SIZE)
				);
			})();

			const newFlex = context.flexValue + change;
			return Math.min(context.maxFlex, Math.max(context.minFlex, newFlex));
		};

		const onPointerDown = (e: PointerEvent) => {
			context.isDragging.current = {
				x: e.clientX,
				y: e.clientY,
			};
			ref.current?.classList.add('remotion-splitter-active');
			window.addEventListener(
				'pointerup',
				(ev: PointerEvent) => {
					context.persistFlex(getNewValue(ev));
					cleanup();
					setLastPointerUp(Date.now());
				},
				{once: true}
			);
			window.addEventListener('pointermove', onPointerMove);
		};

		const onPointerMove = (e: PointerEvent) => {
			if (context.isDragging.current) {
				const val = getNewValue(e);
				context.setFlexValue(val);
			}
		};

		const cleanup = () => {
			context.isDragging.current = false;
			ref.current?.classList.remove('remotion-splitter-active');

			current.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
		};

		current.addEventListener('pointerdown', onPointerDown);

		return () => {
			if (!context.isDragging.current) {
				cleanup();
			}
		};
	}, [context, context.domRect, context.flexValue, lastPointerUp]);

	return (
		<div
			ref={ref}
			className="remotion-splitter"
			style={
				context.orientation === 'horizontal' ? containerRow : containerColumn
			}
		/>
	);
};
