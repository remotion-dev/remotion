import React, {useCallback, useMemo, useState} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {CLEAR_HOVER, LIGHT_TEXT} from '../../helpers/colors';
import {useZIndex} from '../../state/z-index';
import {removeRenderJob} from './actions';

export const RenderQueueRemoveItem: React.FC<{job: RenderJob}> = ({job}) => {
	const {tabIndex} = useZIndex();

	const onClick = useCallback(() => {
		removeRenderJob(job).catch((err) => {
			// TODO: Handle error
			console.log(err);
		});
	}, [job]);

	const [hovered, setHovered] = useState(false);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 12,
		};
	}, []);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: 'none',
			background: hovered ? CLEAR_HOVER : 'transparent',
			height: 24,
			width: 24,
			display: 'inline-flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 3,
			cursor: 'pointer',
		};
	}, [hovered]);

	return (
		<button
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
			onClick={onClick}
			style={style}
			tabIndex={tabIndex}
		>
			<svg
				style={icon}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 448 512"
			>
				<path
					fill={hovered ? 'white' : LIGHT_TEXT}
					d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
				/>
			</svg>
		</button>
	);
};
