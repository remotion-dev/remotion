import React, {useCallback} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {LIGHT_TEXT} from '../helpers/colors';
import {downloadBlob} from '../helpers/download-blob';
import {useConfirmationDialog} from './ConfirmationDialog';
import {LicenseExplanation} from './LicenseExplanation';
import {showNotification} from './Notifications/NotificationCenter';

const downloadLicenseAgreement: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	marginBottom: 0,
	marginTop: 20,
};

const downloadLicenseLink: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '21px',
};

export const useDownloadProject = () => {
	const downloadProject = getBrowserStudioOperations()?.downloadProject ?? null;
	const confirm = useConfirmationDialog();

	const onDownloadProject = useCallback(async () => {
		if (downloadProject === null) {
			return;
		}

		const accepted = await confirm({
			title: 'Download project',
			message: (
				<>
					<LicenseExplanation />
					<p style={downloadLicenseAgreement}>
						By downloading this project, you agree to comply with the{' '}
						<a
							href="https://remotion.dev/license"
							rel="noopener noreferrer"
							style={downloadLicenseLink}
							target="_blank"
						>
							license
						</a>
						.
					</p>
				</>
			),
			confirmLabel: 'Accept and download',
			cancelLabel: 'Cancel',
		});
		if (!accepted) {
			return;
		}

		try {
			const {data, fileName} = await downloadProject();
			const arrayBuffer = data.buffer.slice(
				data.byteOffset,
				data.byteOffset + data.byteLength,
			) as ArrayBuffer;
			downloadBlob(
				new Blob([arrayBuffer], {type: 'application/zip'}),
				fileName,
			);
		} catch (error) {
			showNotification(
				`Could not download project: ${
					error instanceof Error ? error.message : String(error)
				}`,
				2000,
			);
		}
	}, [confirm, downloadProject]);

	return downloadProject === null ? null : onDownloadProject;
};
