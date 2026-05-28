import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {useMobileLayout} from '../helpers/mobile-layout';
import {noop} from '../helpers/noop';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {getPortal} from './Menu/portals';
import {
	MAX_MENU_WIDTH,
	MAX_MOBILE_MENU_WIDTH,
	fullScreenOverlay,
	menuContainerTowardsTop,
	outerPortal,
} from './Menu/styles';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {MenuContent} from './NewComposition/MenuContent';

type OpenState =
	| {
			type: 'not-open';
	  }
	| {
			type: 'open';
			left: number;
			top: number;
	  };

export const ContextMenu: React.FC<{
	readonly children: React.ReactNode;
	readonly values: ComboboxValue[];
	readonly onOpen: (() => void) | null;
}> = ({children, values, onOpen}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [opened, setOpened] = useState<OpenState>({type: 'not-open'});
	const {currentZIndex} = useZIndex();

	const style: React.CSSProperties = useMemo(() => {
		return {};
	}, []);

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const isMobileLayout = useMobileLayout();

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onClick = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			onOpen?.();
			setOpened({type: 'open', left: e.clientX, top: e.clientY});

			return false;
		};

		current.addEventListener('contextmenu', onClick);

		return () => {
			current.removeEventListener('contextmenu', onClick);
		};
	}, [onOpen, size]);

	const spaceToBottom = useMemo(() => {
		if (size && opened.type === 'open') {
			return size.windowSize.height - opened.top;
		}

		return 0;
	}, [opened, size]);

	const spaceToTop = useMemo(() => {
		if (size && opened.type === 'open') {
			return opened.top;
		}

		return 0;
	}, [opened, size]);

	const portalStyle = useMemo(() => {
		if (opened.type === 'not-open') {
			return;
		}

		if (!size) {
			return;
		}

		const spaceToRight = size.windowSize.width - size.left;
		const spaceToLeft = size.left + size.width;

		const minSpaceRequired = isMobileLayout
			? MAX_MOBILE_MENU_WIDTH
			: MAX_MENU_WIDTH;

		const verticalLayout = spaceToTop > spaceToBottom ? 'bottom' : 'top';
		const canOpenOnLeft = spaceToLeft >= minSpaceRequired;
		const canOpenOnRight = spaceToRight >= minSpaceRequired;
		const horizontalLayout = canOpenOnRight ? 'left' : 'right';

		return {
			...menuContainerTowardsTop,
			...(verticalLayout === 'top'
				? {
						top: opened.top,
					}
				: {
						bottom: size.windowSize.height - opened.top,
					}),
			...(horizontalLayout === 'left'
				? {
						left: opened.left,
					}
				: {
						right: canOpenOnLeft ? size.windowSize.width - opened.left : 0,
					}),
		};
	}, [opened, size, isMobileLayout, spaceToTop, spaceToBottom]);

	const onHide = useCallback(() => {
		setOpened({type: 'not-open'});
	}, []);

	// Prevent deselection of a selected item
	const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
		e.stopPropagation();
	}, []);

	return (
		<>
			<div ref={ref} onContextMenu={() => false} style={style}>
				{children}
			</div>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay}>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex onOutsideClick={onHide} onEscape={onHide}>
									<div style={portalStyle} onPointerDown={onPointerDown}>
										<MenuContent
											onNextMenu={noop}
											onPreviousMenu={noop}
											values={values}
											onHide={onHide}
											leaveLeftSpace
											preselectIndex={false}
											topItemCanBeUnselected={false}
											fixedHeight={null}
										/>
									</div>
								</HigherZIndex>
							</div>
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
