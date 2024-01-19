import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {noop} from '../helpers/noop';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {getPortal} from './Menu/portals';
import {
	fullScreenOverlay,
	MAX_MENU_WIDTH,
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
	children: React.ReactNode;
	values: ComboboxValue[];
}> = ({children, values}) => {
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

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onClick = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setOpened({type: 'open', left: e.clientX, top: e.clientY});

			return false;
		};

		current.addEventListener('contextmenu', onClick);

		return () => {
			current.removeEventListener('contextmenu', onClick);
		};
	}, [size]);

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

		const spaceToRight = size.windowSize.width - (opened.left + size.width);
		const minSpaceToRightRequired = MAX_MENU_WIDTH;

		const verticalLayout = spaceToTop > spaceToBottom ? 'bottom' : 'top';
		const horizontalLayout =
			spaceToRight >= minSpaceToRightRequired ? 'left' : 'right';

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
						right: size.windowSize.width - opened.left,
				  }),
		};
	}, [opened, spaceToBottom, spaceToTop, size]);

	const onHide = useCallback(() => {
		setOpened({type: 'not-open'});
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
									<div style={portalStyle}>
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
