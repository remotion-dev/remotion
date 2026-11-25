import React, {useLayoutEffect, useRef} from 'react';
import {useZIndex} from '../state/z-index';

export const ModalFocusScope: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const ref = useRef<HTMLDivElement>(null);
	const {isHighestContext} = useZIndex();

	useLayoutEffect(() => {
		const scope = ref.current;
		if (!scope || !isHighestContext) return;

		const keepFocusInside = (event: FocusEvent) => {
			if (event.target instanceof Node && !scope.contains(event.target)) {
				scope
					.querySelector<HTMLElement>('button')
					?.focus({preventScroll: true});
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey)
				return;

			const tabbable = [
				...scope.querySelectorAll<HTMLElement>(
					'button, input, select, textarea, a[href], [tabindex]',
				),
			].filter(
				(element) =>
					element.tabIndex >= 0 &&
					!element.matches(':disabled') &&
					element.getClientRects().length > 0,
			);
			const first = tabbable[0];
			const last = tabbable[tabbable.length - 1];
			const focused = document.activeElement;
			if (
				!scope.contains(focused) ||
				focused === (event.shiftKey ? first : last)
			) {
				event.preventDefault();
				(event.shiftKey ? last : first)?.focus();
			}
		};

		document.addEventListener('focusin', keepFocusInside);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('focusin', keepFocusInside);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [isHighestContext]);

	useLayoutEffect(() => {
		const opener = document.activeElement;
		ref.current
			?.querySelector<HTMLElement>('button')
			?.focus({preventScroll: true});
		return () => {
			if (opener instanceof HTMLElement && opener.isConnected) {
				opener.focus({preventScroll: true});
			}
		};
	}, []);

	return (
		<div ref={ref} style={{display: 'contents'}}>
			{children}
		</div>
	);
};
