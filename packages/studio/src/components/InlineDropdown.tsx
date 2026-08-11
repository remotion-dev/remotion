import {PlayerInternals} from '@remotion/player';
import {useCallback, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {WHITE} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {noop} from '../helpers/noop';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {InlineAction, type InlineActionProps} from './InlineAction';
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

// Some duplicate state with ContextMenu.tsx

type OpenState =
	| {
			type: 'not-open';
	  }
	| {
			type: 'open';
			left: number;
			top: number;
			values: ComboboxValue[] | null;
	  };

const container: React.CSSProperties = {
	display: 'flex',
	height: 24,
};

export const InlineDropdown = ({
	values,
	getItems,
	onOpenChange,
	unhoveredColor,
	...props
}: Omit<InlineActionProps, 'onClick'> & {
	readonly values?: ComboboxValue[];
	readonly getItems?: () => ComboboxValue[];
	readonly onOpenChange?: (open: boolean) => void;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [opened, setOpened] = useState<OpenState>({type: 'not-open'});

	const {currentZIndex} = useZIndex();

	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const isMobileLayout = useMobileLayout();

	const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			e.preventDefault();
			e.stopPropagation();
			const invocationValues = getItems?.() ?? null;
			if (invocationValues?.length === 0) {
				return;
			}

			setOpened({
				type: 'open',
				left: e.clientX,
				top: e.clientY,
				values: invocationValues,
			});
			onOpenChange?.(true);
		},
		[getItems, onOpenChange],
	);

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
		onOpenChange?.(false);
	}, [onOpenChange]);

	return (
		<>
			<div ref={ref} style={container}>
				<InlineAction
					onClick={onClick}
					unhoveredColor={opened.type === 'open' ? WHITE : unhoveredColor}
					{...props}
				/>
			</div>
			{portalStyle && opened.type === 'open'
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay}>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex onOutsideClick={onHide} onEscape={onHide}>
									<div style={portalStyle}>
										<MenuContent
											onNextMenu={noop}
											onPreviousMenu={noop}
											values={opened.values ?? values ?? []}
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
