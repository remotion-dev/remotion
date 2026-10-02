import React, {useCallback, useContext, useState} from 'react';
import {ShortcutHint} from '../error-overlay/remotion-overlay/ShortcutHint';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../helpers/colors';
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

export const BrowserStudioExperimentalNotice: React.FC = () => {
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
				ariaLabel="Browser Studio is experimental"
				onEscape={onClose}
				onOutsideClick={onClose}
				panelStyle={panelStyle}
			>
				<ModalHeader title="Browser Studio is experimental" onClose={onClose} />
				<div style={{padding: 16, minHeight: 0, overflowY: 'auto'}}>
					<p style={{...bodyTextStyle, margin: '0 0 12px'}}>
						This is a playground for trying Remotion’s editing features.
						Projects aren’t saved between visits, and AI interaction isn’t
						available here as it is in the{' '}
						<a
							className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
							href="https://www.remotion.dev/docs/studio"
							rel="noopener noreferrer"
							style={linkStyle}
							target="_blank"
						>
							regular Remotion Studio
						</a>
						.
					</p>
					<p style={{...bodyTextStyle, margin: 0}}>
						To keep working on your project, use{' '}
						<strong style={bodyTextStyle}>Download project</strong> and continue
						locally.
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
