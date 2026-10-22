import React, {useCallback, useContext} from 'react';
import {BLACK_ALPHA_30, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {CopyIcon} from '../icons/copy';
import type {ModalState} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {Flex, Row} from './layout';
import {ModalButton} from './ModalButton';
import {getMaxModalWidth} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {showNotification} from './Notifications/NotificationCenter';

const chromeFlagUrl = 'chrome://flags/#canvas-draw-element';

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	display: 'flex',
	flexDirection: 'column',
	minWidth: 0,
	overflow: 'hidden',
	width: getMaxModalWidth(520),
};

const contentStyle: React.CSSProperties = {
	padding: 16,
};

const bodyTextStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const urlFieldStyle: React.CSSProperties = {
	alignItems: 'center',
	background: BLACK_ALPHA_30,
	borderRadius: 6,
	display: 'flex',
	gap: 8,
	margin: '12px 0',
	padding: '8px 8px 8px 10px',
	width: '100%',
};

const urlStyle: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 13,
	fontWeight: 'normal',
	lineHeight: 1.5,
	margin: 0,
	minWidth: 0,
	overflowWrap: 'anywhere',
	whiteSpace: 'pre-wrap',
};

const copyActionStyle: React.CSSProperties = {flexShrink: 0};
const copyIconStyle: React.CSSProperties = {height: 12, width: 12};
const footerStyle: React.CSSProperties = {minWidth: 0};
const buttonTextStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

type State = Extract<ModalState, {type: 'html-in-canvas-unavailable'}>;

export const HtmlInCanvasUnavailableModal: React.FC<{
	readonly state: State;
}> = ({state}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {copied, markCopied} = useCopyFeedback();

	const onCopy = useCallback(() => {
		copyText(chromeFlagUrl)
			.then(markCopied)
			.catch((error) => {
				showNotification(`Could not copy: ${error.message}`, 2000);
			});
	}, [markCopied]);

	const renderCopy: RenderInlineAction = useCallback(
		(color) => <CopyIcon copied={copied} color={color} style={copyIconStyle} />,
		[copied],
	);

	const onClose = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title="Enable HTML-in-canvas in Chrome" />
			<div style={contentStyle}>
				<div style={bodyTextStyle}>
					{state.action === 'motion-blur'
						? 'Enable HTML-in-canvas in Chrome to apply motion blur to this element.'
						: 'Enable HTML-in-canvas in Chrome to apply effects to this element.'}
				</div>
				<div style={urlFieldStyle}>
					<pre style={urlStyle}>{chromeFlagUrl}</pre>
					<InlineAction
						onClick={onCopy}
						renderAction={renderCopy}
						style={copyActionStyle}
						aria-label={copied ? 'Copied Chrome URL' : 'Copy Chrome URL'}
						variant={null}
					/>
				</div>
				<div style={bodyTextStyle}>
					Set the HTML-in-Canvas flag to Enabled, then fully restart Chrome and
					reopen Remotion Studio.
				</div>
			</div>
			<ModalFooterContainer style={footerStyle}>
				<Row align="center">
					<Flex />
					<ModalButton
						onClick={onClose}
						autoFocus
						buttonContainerStyle={buttonTextStyle}
					>
						Got it
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</DismissableModal>
	);
};
