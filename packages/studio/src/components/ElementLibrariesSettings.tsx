import React, {useCallback, useContext, useState} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {CURRENT_COLOR, LIGHT_TEXT, TRANSPARENT, WHITE} from '../helpers/colors';
import {THIRD_PARTY_ELEMENTS_URL} from '../helpers/element-libraries';
import {getElementLibraryLabel} from '../helpers/get-element-library-label';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {BookIcon} from '../icons/book';
import {LinkIcon} from '../icons/link';
import {TrashIcon} from '../icons/trash';
import {SetSelectedModalContext} from '../state/modals';
import {ActionTooltip} from './ActionTooltip';
import {Button} from './Button';
import {ElementLibraryDialog} from './ElementLibraryDialog';
import {ElementLibraryIcon} from './ElementLibraryIcon';
import {InlineAction} from './InlineAction';
import {sectionHeader} from './InspectorPanel/styles';
import {useSettings} from './SettingsContext';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	minWidth: 0,
	width: '100%',
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: '16px 16px 12px',
};

const addLibraryHeading: React.CSSProperties = {
	...sectionHeader,
	margin: '12px 0 0',
	padding: '4px 16px',
};

const addLibraryActions: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	padding: '4px 16px 4px 6px',
};

const addLibraryButtonContent: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 6,
};

const addLibraryButtonIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 14,
	width: 14,
};

const libraryRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 10,
	minHeight: 38,
	padding: '4px 16px',
};

const libraryDetails: React.CSSProperties = {
	alignItems: 'flex-start',
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const libraryName: React.CSSProperties = {
	fontSize: 13,
	maxWidth: '100%',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const libraryUrlStyle: React.CSSProperties = {
	...hoverableStyle({
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
	}),
	cursor: 'default',
	fontSize: 12,
	maxWidth: '100%',
	minWidth: 0,
	outline: 'none',
	overflow: 'hidden',
	textDecoration: 'none',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const trashIcon: React.CSSProperties = {
	height: 14,
	width: 14,
};

export const ElementLibrariesSettings: React.FC = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig, removeElementLibrary} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [isAddByUrlVisible, setIsAddByUrlVisible] = useState(false);
	const libraries = studioRuntimeConfig?.elementLibraries ?? [];
	const canSave = previewServerState.type === 'connected';
	const closeAddDialog = useCallback(() => setIsAddByUrlVisible(false), []);

	const renderTrash = useCallback((color: string) => {
		return <TrashIcon color={color} style={trashIcon} />;
	}, []);
	const discoverThirdPartyElements = useCallback(() => {
		setSelectedModal({
			type: 'element-library',
			view: 'library',
			name: 'Third-party Elements',
			url: THIRD_PARTY_ELEMENTS_URL,
		});
	}, [setSelectedModal]);

	return (
		<section style={container}>
			<p style={description}>
				Add libraries to browse their elements in Studio.
			</p>
			<div role="list" aria-label="Element Libraries">
				{libraries.map((library) => (
					<div key={library.url} role="listitem" style={libraryRow}>
						<ElementLibraryIcon
							url={library.url}
							color={LIGHT_TEXT}
							size={22}
						/>
						<div style={libraryDetails}>
							<div style={libraryName}>{getElementLibraryLabel(library)}</div>
							<a
								href={library.url}
								className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
								target="_blank"
								rel="noopener noreferrer"
								style={libraryUrlStyle}
							>
								{library.url.replace(/^https?:\/\//, '')}
							</a>
						</div>
						<ActionTooltip
							label="Remove"
							shortcut={null}
							delay={800}
							dismissOnClick
						>
							<InlineAction
								aria-label={`Remove ${library.displayName ?? library.url}`}
								disabled={!canSave}
								onClick={() => removeElementLibrary(library.url)}
								renderAction={renderTrash}
								variant={null}
							/>
						</ActionTooltip>
					</div>
				))}
			</div>
			<h3 style={addLibraryHeading}>Add new library</h3>
			<div style={addLibraryActions}>
				<Button
					onClick={discoverThirdPartyElements}
					size="default"
					buttonContainerStyle={addLibraryButtonContent}
				>
					<BookIcon
						aria-hidden
						color={CURRENT_COLOR}
						style={addLibraryButtonIcon}
					/>
					Explore libraries
				</Button>
				<Button
					onClick={() => setIsAddByUrlVisible(true)}
					size="default"
					buttonContainerStyle={addLibraryButtonContent}
				>
					<LinkIcon
						aria-hidden
						color={CURRENT_COLOR}
						style={addLibraryButtonIcon}
					/>
					Add by URL
				</Button>
			</div>
			{isAddByUrlVisible ? (
				<ElementLibraryDialog library={null} onClose={closeAddDialog} />
			) : null}
		</section>
	);
};
