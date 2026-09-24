import React, {useCallback, useContext, useMemo, useState} from 'react';
import {restartStudio} from '../api/restart-studio';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLUE, CURRENT_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {InspectorOpenInEditor} from './InspectorOpenInEditor';
import {InspectorQuickAction} from './InspectorPanel/common';
import {Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalFooterContainer} from './ModalFooter';
import {showNotification} from './Notifications/NotificationCenter';

const footer: React.CSSProperties = {
	flex: 'none',
};

const footerRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	height: 28,
	justifyContent: 'space-between',
};

const configFileHint: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '20px',
	whiteSpace: 'nowrap',
};

const configFileName: React.CSSProperties = {
	color: BLUE,
	fontFamily: 'inherit',
	fontSize: 13,
	fontWeight: 'bold',
	lineHeight: '20px',
};

const externalLinkIndicator: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

export const SettingsModalFooter: React.FC<{
	readonly showAboutElements: boolean;
	readonly showLicenseFaq: boolean;
}> = ({showAboutElements, showLicenseFaq}) => {
	const {restartRequired} = useContext(StudioServerConnectionCtx);
	const [restarting, setRestarting] = useState(false);
	const configFileLocation = useMemo(() => {
		return {
			source: 'remotion.config.ts',
			line: 1,
			column: 1,
		};
	}, []);
	const openLicenseFaq = useCallback(() => {
		window.open(
			'https://www.remotion.dev/docs/license/faq',
			'_blank',
			'noopener,noreferrer',
		);
	}, []);
	const openAboutElements = useCallback(() => {
		window.open(
			'https://www.remotion.dev/elements',
			'_blank',
			'noopener,noreferrer',
		);
	}, []);
	const restart = useCallback(() => {
		setRestarting(true);
		restartStudio().catch((error: Error) => {
			setRestarting(false);
			showNotification(`Could not restart Studio: ${error.message}`, 4000);
		});
	}, []);

	return (
		<ModalFooterContainer style={footer}>
			<div style={footerRow}>
				<div style={configFileHint}>
					{restartRequired ? (
						'Restart the server to apply changes'
					) : (
						<>
							Changes save to
							<Spacing x={0.5} />
							<InspectorOpenInEditor
								locationType={null}
								location={configFileLocation}
								label={
									<strong style={configFileName}>remotion.config.ts</strong>
								}
								showTooltips={false}
							/>
						</>
					)}
				</div>
				{restartRequired ? (
					<ModalButton
						disabled={restarting}
						onClick={restart}
						size="compact"
						aria-label="Restart Studio to apply config file changes"
					>
						{restarting ? 'Restarting...' : 'Restart Studio'}
					</ModalButton>
				) : showLicenseFaq || showAboutElements ? (
					<InspectorQuickAction
						disabled={false}
						onClick={showLicenseFaq ? openLicenseFaq : openAboutElements}
						style={{flex: 'none', width: 'fit-content'}}
						aria-label={
							showLicenseFaq
								? 'Open the Remotion License FAQ in a new tab'
								: 'Open Remotion Elements in a new tab'
						}
					>
						{showLicenseFaq ? 'License FAQ' : 'About Elements'}
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							style={externalLinkIndicator}
						>
							<path
								d="M4 12 12 4M6 4h6v6"
								fill="none"
								stroke={CURRENT_COLOR}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1.5"
							/>
						</svg>
					</InspectorQuickAction>
				) : null}
			</div>
		</ModalFooterContainer>
	);
};
