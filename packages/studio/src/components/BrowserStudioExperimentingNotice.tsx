import React, {useCallback, useContext, useState} from 'react';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {LIGHT_TEXT, TRANSPARENT, WARNING_COLOR, WHITE} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {SetSelectedModalContext} from '../state/modals';
import {Flex, Row} from './layout';
import {ModalButton} from './ModalButton';
import {getMaxModalWidth, ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {WarningTriangle} from './NewComposition/ValidationMessage';

export const experimentalNoticeStorageKey =
	'remotion-browser-studio-experimental-notice-acknowledged';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	maxHeight: 'calc(100dvh - 40px)',
	minWidth: 0,
	overflow: 'hidden',
	width: getMaxModalWidth(520),
};

const bodyTextStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const linkStyle: React.CSSProperties = {
	fontFamily: bodyTextStyle.fontFamily,
	fontSize: bodyTextStyle.fontSize,
	lineHeight: bodyTextStyle.lineHeight,
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	cursor: 'default',
};

const buttonTextStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

export const BrowserStudioExperimentingNotice: React.FC = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [keyboardNavigation, setKeyboardNavigation] = useState(false);

	const onClose = useCallback(() => {
		try {
			window.localStorage.setItem(experimentalNoticeStorageKey, 'true');
		} catch {
			// Still allow experimenting when browser storage is unavailable.
		}

		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<div
			className="__remotion-browser-studio-experimental-notice"
			data-keyboard-navigation={keyboardNavigation}
			onKeyDown={(event) => {
				if (event.key === 'Tab') {
					setKeyboardNavigation(true);
				}
			}}
		>
			<style>{`
				.__remotion-browser-studio-experimental-notice[data-keyboard-navigation="false"] .${FOCUS_VISIBLE_ONLY_CLASS_NAME}:focus {
					box-shadow: none;
				}
			`}</style>
			<ModalContainer
				ariaLabel="Before you start"
				onEscape={onClose}
				onOutsideClick={onClose}
				panelStyle={panelStyle}
			>
				<ModalHeader title="Before you start" onClose={onClose} />
				<div style={{padding: 16, minHeight: 0, overflowY: 'auto'}}>
					<p style={{...bodyTextStyle, margin: '0 0 12px'}}>
						remotion.dev/new is a playground for experimenting with Remotion’s
						editing features.
					</p>
					<p
						style={{
							...bodyTextStyle,
							margin: '0 0 12px',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<WarningTriangle
							aria-hidden
							style={{
								width: 14,
								height: 14,
								flexShrink: 0,
								fill: WARNING_COLOR,
							}}
						/>
						<strong style={{...bodyTextStyle, fontWeight: 'bold'}}>
							Projects aren’t saved between visits.
						</strong>
					</p>
					<p
						style={{
							...bodyTextStyle,
							margin: '0 0 12px',
							display: 'flex',
							alignItems: 'flex-start',
							gap: 8,
						}}
					>
						<WarningTriangle
							aria-hidden
							style={{
								width: 14,
								height: 14,
								marginTop: 3.5,
								flexShrink: 0,
								fill: WARNING_COLOR,
							}}
						/>
						<span style={bodyTextStyle}>
							AI interaction requires the{' '}
							<a
								className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
								href="https://www.remotion.dev/docs/studio"
								rel="noopener noreferrer"
								style={linkStyle}
								target="_blank"
							>
								local Remotion Studio
							</a>
							.
						</span>
					</p>
					<p
						style={{
							...bodyTextStyle,
							margin: '0 0 12px',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}
					>
						<WarningTriangle
							aria-hidden
							style={{
								width: 14,
								height: 14,
								flexShrink: 0,
								fill: WARNING_COLOR,
							}}
						/>
						<span style={bodyTextStyle}>
							Only browser rendering is available here.
						</span>
					</p>
					<p style={{...bodyTextStyle, margin: 0}}>
						To keep working on your project, use{' '}
						<strong style={{...bodyTextStyle, fontWeight: 'bold'}}>
							Download project
						</strong>{' '}
						and continue locally.
					</p>
				</div>
				<ModalFooterContainer style={{minWidth: 0, flex: 'none'}}>
					<Row align="center">
						<Flex />
						<ModalButton
							onClick={onClose}
							autoFocus
							buttonContainerStyle={buttonTextStyle}
						>
							OK
							<ShortcutHint keyToPress="↵" cmdOrCtrl={false} />
						</ModalButton>
					</Row>
				</ModalFooterContainer>
			</ModalContainer>
		</div>
	);
};
