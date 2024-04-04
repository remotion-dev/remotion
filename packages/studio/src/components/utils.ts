import {showNotification} from './Notifications/NotificationCenter';

export const handleUploadFile = async (file: File, assetPath: string) => {
	if (!file) {
		showNotification('Please select a file first!', 3000);
		return;
	}

	try {
		const url = new URL('/api/add-asset', window.location.origin);
		url.search = new URLSearchParams({
			folder: assetPath,
			file: file.name,
		}).toString();

		const response = await fetch(url, {
			method: 'POST',
			body: file,
		});

		if (response.ok) {
			showNotification(`Added ${file.name} to ${assetPath}`, 3000);
		} else {
			const jsonResponse = await response.json();
			showNotification(`Upload failed: ${jsonResponse.error}`, 3000);
		}
	} catch (error) {
		showNotification(`Error during upload: ${error}`, 3000);
	}
};
