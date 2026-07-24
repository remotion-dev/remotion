import React, {useCallback} from 'react';
import {WHITE} from '../../helpers/colors';
import {getFileManagerName} from '../../helpers/get-file-manager-name';
import {ExpandedFolderIconSolid} from '../../icons/folder';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {Column, Spacing} from '../layout';
import {RemotionInput} from '../NewComposition/RemInput';
import {ValidationMessage} from '../NewComposition/ValidationMessage';
import {showNotification} from '../Notifications/NotificationCenter';
import {openInFileExplorer} from '../RenderQueue/actions';
import {label, optionRow, rightRow} from './layout';

const existsMessageStyle: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	minWidth: 0,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '18px',
	color: WHITE,
	whiteSpace: 'nowrap',
};

const openIconStyle: React.CSSProperties = {
	width: 12,
	height: 12,
	flexShrink: 0,
};

type Props = {
	readonly existence: boolean;
	readonly inputStyle: React.CSSProperties;
	readonly outName: string;
	readonly onValueChange: React.ChangeEventHandler<HTMLInputElement>;
	readonly validationMessage: string | null;
	readonly label: string;
};

export const RenderModalOutputName = ({
	existence,
	inputStyle,
	outName,
	onValueChange,
	validationMessage,
	label: labelText,
}: Props) => {
	const openExistingOutput = useCallback(() => {
		openInFileExplorer({directory: outName}).catch((err) => {
			showNotification(`Could not open file: ${err.message}`, 2000);
		});
	}, [outName]);

	const renderOpenIcon: RenderInlineAction = useCallback((color) => {
		return <ExpandedFolderIconSolid style={openIconStyle} color={color} />;
	}, []);

	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);

	return (
		<div style={optionRow}>
			<Column>
				<div style={label}>{labelText}</div>
			</Column>
			<div style={rightRow}>
				<div>
					<RemotionInput
						status={validationMessage ? 'error' : existence ? 'warning' : 'ok'}
						style={inputStyle}
						type="text"
						value={outName}
						onChange={onValueChange}
						rightAlign
					/>
					{validationMessage ? (
						<>
							<Spacing y={1} block />
							<ValidationMessage
								align="flex-end"
								message={validationMessage}
								type={'error'}
							/>
						</>
					) : existence ? (
						<>
							<Spacing y={1} block />
							<ValidationMessage
								align="flex-end"
								message={
									<span style={existsMessageStyle}>
										<InlineAction
											onClick={openExistingOutput}
											renderAction={renderOpenIcon}
											title={`Open in ${fileManagerName}`}
										/>
										Exists, will be overwritten
									</span>
								}
								type={'warning'}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
};
