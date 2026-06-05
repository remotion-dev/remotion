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

type OpenedState = Extract<OpenState, {type: 'open'}>;

type ContextMenuOpenHandler = () => false | void;
type ContextMenuTargetOpenHandler = (event: MouseEvent) => false | void;

type ContextMenuSizeSource =
	| React.RefObject<HTMLElement | null>
	| HTMLElement
	| null;

type ContextMenuProps = {
	readonly children: React.ReactNode;
	readonly values: ComboboxValue[];
	readonly onOpen: ContextMenuOpenHandler | null;
	// eslint-disable-next-line react/require-default-props
	readonly style?: React.CSSProperties;
	// eslint-disable-next-line react/require-default-props
	readonly className?: string;
	// eslint-disable-next-line react/require-default-props
	readonly onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
};

const ContextMenuPortal: React.FC<{
	readonly sizeSource: ContextMenuSizeSource;
	readonly currentZIndex: number;
	readonly onHide: () => void;
	readonly opened: OpenedState;
	readonly values: ComboboxValue[];
}> = ({sizeSource, currentZIndex, onHide, opened, values}) => {
	const size = PlayerInternals.useElementSize(sizeSource, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const isMobileLayout = useMobileLayout();

	const spaceToBottom = useMemo(() => {
		if (size) {
			return size.windowSize.height - opened.top;
		}

		return 0;
	}, [opened.top, size]);

	const spaceToTop = useMemo(() => {
		if (size) {
			return opened.top;
		}

		return 0;
	}, [opened.top, size]);

	const portalStyle = useMemo(() => {
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
	}, [
		opened.left,
		opened.top,
		size,
		isMobileLayout,
		spaceToTop,
		spaceToBottom,
	]);

	// Prevent deselection of a selected item
	const onMenuPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			e.stopPropagation();
		},
		[],
	);

	if (!portalStyle) {
		return null;
	}

	return ReactDOM.createPortal(
		<div style={fullScreenOverlay}>
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
	);
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

		useEffect(() => {
			const {current} = ref;
			if (!current) {
				return;
			}

			const onClick = (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				if (onOpen?.() === false) {
					return false;
				}

				setOpened({type: 'open', left: e.clientX, top: e.clientY});

				return false;
			};

			current.addEventListener('contextmenu', onClick);

			return () => {
				current.removeEventListener('contextmenu', onClick);
			};
		}, [onOpen]);

		const onHide = useCallback(() => {
			setOpened({type: 'not-open'});
		}, []);

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
				{opened.type === 'open' ? (
					<ContextMenuPortal
						sizeSource={ref}
						currentZIndex={currentZIndex}
						onHide={onHide}
						opened={opened}
						values={values}
					/>
				) : null}
			</>
		);
	},
);

ContextMenu.displayName = 'ContextMenu';

export const ContextMenuForTarget: React.FC<{
	readonly triggerRef: React.RefObject<HTMLElement | SVGElement | null>;
	readonly values: ComboboxValue[];
	readonly onOpen: ContextMenuTargetOpenHandler | null;
}> = ({triggerRef, values, onOpen}) => {
	const [opened, setOpened] = useState<OpenState>({type: 'not-open'});
	const [body, setBody] = useState<HTMLElement | null>(null);
	const {currentZIndex} = useZIndex();

	useEffect(() => {
		setBody(document.body);
	}, []);

	useEffect(() => {
		const {current} = triggerRef;
		if (!current) {
			return;
		}

		const onClick = (event: Event) => {
			const e = event as MouseEvent;
			e.preventDefault();
			e.stopPropagation();

			if (values.length === 0 || onOpen?.(e) === false) {
				return false;
			}

			setOpened({type: 'open', left: e.clientX, top: e.clientY});

			return false;
		};

		current.addEventListener('contextmenu', onClick);

		return () => {
			current.removeEventListener('contextmenu', onClick);
		};
	}, [onOpen, triggerRef, values.length]);

	const onHide = useCallback(() => {
		setOpened({type: 'not-open'});
	}, []);

	return opened.type === 'open' ? (
		<ContextMenuPortal
			sizeSource={body}
			currentZIndex={currentZIndex}
			onHide={onHide}
			opened={opened}
			values={values}
		/>
	) : null;
};
