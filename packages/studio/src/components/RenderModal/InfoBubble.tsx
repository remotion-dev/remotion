import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {INPUT_BACKGROUND, LIGHT_TEXT} from '../../helpers/colors';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {getPortal} from '../Menu/portals';
import {outerPortal} from '../Menu/styles';
import {InfoTooltip} from './InfoTooltip';

const icon: React.CSSProperties = {
	color: LIGHT_TEXT,
	height: 15,
};

const container: React.CSSProperties = {
	display: 'inline-block',
	border: 'none',
	fontSize: 14,
	verticalAlign: 'text-bottom',
};

export const InfoBubble: React.FC<{
	readonly title: string;
	readonly children: React.ReactNode;
}> = ({title, children}) => {
	const [hovered, setIsHovered] = useState(false);
	const [opened, setOpened] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const {tabIndex, currentZIndex} = useZIndex();
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const refresh = size?.refresh;

	const onHide = useCallback(() => {
		setOpened(false);
	}, []);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const onMouseEnter = () => setIsHovered(true);
		const onMouseLeave = () => setIsHovered(false);
		const onPointerUp = () => {
			return setOpened((o) => {
				if (!o) {
					refresh?.();
				}

				return !o;
			});
		};

		const onClick = (e: MouseEvent | PointerEvent) => {
			e.stopPropagation();
			const isKeyboardInitiated = e.detail === 0;
			if (!isKeyboardInitiated) {
				return;
			}

			return setOpened((o) => {
				return !o;
			});
		};

		current.addEventListener('mouseenter', onMouseEnter);
		current.addEventListener('mouseleave', onMouseLeave);
		current.addEventListener('pointerup', onPointerUp);
		current.addEventListener('click', onClick);

		return () => {
			current.removeEventListener('mouseenter', onMouseEnter);
			current.removeEventListener('mouseleave', onMouseLeave);
			current.removeEventListener('pointerup', onPointerUp);
			current.removeEventListener('click', onClick);
		};
	}, [refresh]);

	const layout = useMemo(() => {
		if (!size) {
			return 'down';
		}

		const spaceToBottom = size.windowSize.height - (size.top + size.height);
		const spaceToTop = size.top;

		const l = spaceToTop > spaceToBottom ? 'down' : 'up';
		return l;
	}, [size]);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!size || !opened) {
			return null;
		}

		return {
			...(layout === 'up'
				? {
						position: 'fixed',
						top: size.top + size.height,
					}
				: {
						position: 'fixed',
						bottom: size.windowSize.height - size.top,
					}),
			left: size.left,
		};
	}, [layout, opened, size]);

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			userSelect: 'none',
			WebkitUserSelect: 'none',
			color: 'white',
			display: 'inline-flex',
			flexDirection: 'row',
			alignItems: 'center',
			padding: 6,
		};
	}, []);

	return (
		<>
			<button
				ref={ref}
				tabIndex={tabIndex}
				style={style}
				title={title}
				type="button"
			>
				<svg style={icon} viewBox="0 0 512 512">
					<path
						fill={hovered ? 'white' : LIGHT_TEXT}
						d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-8V248c0-13.3-10.7-24-24-24H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h24v64H216zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
					/>
				</svg>
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={outerPortal} className="css-reset">
							<HigherZIndex onOutsideClick={onHide} onEscape={onHide}>
								<div style={portalStyle}>
									<InfoTooltip
										backgroundColor={INPUT_BACKGROUND}
										arrowDirection={layout}
									>
										{children}
									</InfoTooltip>
								</div>
							</HigherZIndex>
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
