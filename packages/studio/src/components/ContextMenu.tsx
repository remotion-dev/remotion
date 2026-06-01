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

type ContextMenuProps = {
	readonly children: React.ReactNode;
	readonly values: ComboboxValue[];
	readonly onOpen: (() => void) | null;
	// eslint-disable-next-line react/require-default-props
	readonly style?: React.CSSProperties;
	// eslint-disable-next-line react/require-default-props
	readonly className?: string;
	// eslint-disable-next-line react/require-default-props
	readonly onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
};

export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
	(
		{
			children,
			values,
			onOpen,
			style = undefined,
			className = undefined,
			onPointerDown = undefined,
		},
		forwardedRef,
	) => {
		const ref = useRef<HTMLDivElement>(null);
		const [opened, setOpened] = useState<OpenState>({type: 'not-open'});
		const {currentZIndex} = useZIndex();

		const setRef = useCallback(
			(node: HTMLDivElement | null) => {
				ref.current = node;
				if (typeof forwardedRef === 'function') {
					forwardedRef(node);
					return;
				}

				if (forwardedRef) {
					(
						forwardedRef as React.MutableRefObject<HTMLDivElement | null>
					).current = node;
				}
			},
			[forwardedRef],
		);

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
		const onMenuPointerDown = useCallback(
			(e: React.PointerEvent<HTMLDivElement>) => {
				e.stopPropagation();
			},
			[],
		);

		return (
			<>
				<div
					ref={setRef}
					onContextMenu={() => false}
					style={style}
					className={className}
					onPointerDown={onPointerDown}
				>
					{children}
				</div>
				{portalStyle
					? ReactDOM.createPortal(
							<div
								style={fullScreenOverlay}
								onPointerDown={onHide}
								onContextMenu={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onHide();
									const {clientX, clientY} = e;
									requestAnimationFrame(() => {
										const el = document.elementFromPoint(clientX, clientY);
										if (el) {
											el.dispatchEvent(
												new MouseEvent('contextmenu', {
													bubbles: true,
													clientX,
													clientY,
												}),
											);
										}
									});
								}}
							>
								<div style={outerPortal} className="css-reset">
									<HigherZIndex onOutsideClick={onHide} onEscape={onHide}>
										<div style={portalStyle} onPointerDown={onMenuPointerDown}>
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
	},
);

ContextMenu.displayName = 'ContextMenu';
