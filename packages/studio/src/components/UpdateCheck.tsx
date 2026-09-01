import React, {useCallback, useContext, useMemo, useState} from 'react';
import {
	TRANSPARENT,
	WARNING_COLOR,
	WHITE,
	WHITE_ALPHA_80,
} from '../helpers/colors';
import {SetSelectedModalContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {useUpdateStatus} from './UpdateStatusContext';

const buttonStyle: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	fontWeight: 'bold',
	backgroundColor: TRANSPARENT,
	cursor: 'pointer',
	fontSize: 14,
	display: 'inline-flex',
	justifyContent: 'center',
	marginLeft: 8,
};

const updateIconContainer: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
};

export const UpdateCheck = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {tabIndex} = useZIndex();
	const {info, knownBugs} = useUpdateStatus();
	const [hovered, setHovered] = useState(false);

	const hasBugfixesAvailable = useMemo(() => {
		return Boolean(info?.updateAvailable && knownBugs && knownBugs.length > 0);
	}, [info?.updateAvailable, knownBugs]);

	const openModal = useCallback(() => {
		setSelectedModal({
			type: 'settings',
			initialTab: 'updates',
			initialPublicLicenseKey:
				window.remotion_renderDefaults?.publicLicenseKey ?? null,
		});
	}, [setSelectedModal]);

	const dynButtonStyle: React.CSSProperties = useMemo(() => {
		return {
			...buttonStyle,
			color: hovered
				? WHITE
				: hasBugfixesAvailable
					? WARNING_COLOR
					: WHITE_ALPHA_80,
		};
	}, [hasBugfixesAvailable, hovered]);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const renderUpdateIcon: RenderInlineAction = useCallback((color) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				style={{
					height: 16,
					width: 16,
					color,
					flexShrink: 0,
				}}
				viewBox="0 0 512 512"
			>
				<path
					fill={color}
					d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4c-4.5 4.2-7.1 10.1-7.1 16.3c0 12.3 10 22.3 22.3 22.3H208v96c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V256h57.7c12.3 0 22.3-10 22.3-22.3c0-6.2-2.6-12.1-7.1-16.3L269.8 117.5c-3.8-3.5-8.7-5.5-13.8-5.5s-10.1 2-13.8 5.5L135.1 217.4z"
				/>
			</svg>
		);
	}, []);

	if (!info) {
		return null;
	}

	if (!info.updateAvailable && !info.skillsUpdateAvailable) {
		return null;
	}

	if (!hasBugfixesAvailable) {
		return (
			<div style={updateIconContainer}>
				<InlineAction
					variant={null}
					onClick={openModal}
					renderAction={renderUpdateIcon}
					unhoveredColor={WHITE_ALPHA_80}
					title="Update available"
				/>
			</div>
		);
	}

	return (
		<button
			tabIndex={tabIndex}
			style={dynButtonStyle}
			onClick={openModal}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
			title="Bugfixes available"
		>
			Bugfixes available
		</button>
	);
};
