import {notificationCenter} from './Notifications/NotificationCenter';

export const handleUploadFile = async (file: File, assetPath: string) => {
	if (!file) {
		notificationCenter.current?.addNotification({
			content: `Please select a file first!`,
			created: Date.now(),
			duration: 3000,
			id: String(Math.random()),
		});
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
			notificationCenter.current?.addNotification({
				content: `Added ${file.name} to ${assetPath}`,
				created: Date.now(),
				duration: 3000,
				id: String(Math.random()),
			});
		} else {
			const jsonResponse = await response.json();
			notificationCenter.current?.addNotification({
				content: `Upload failed: ${jsonResponse.error}`,
				created: Date.now(),
				duration: 3000,
				id: String(Math.random()),
			});
		}
	} catch (error) {
		notificationCenter.current?.addNotification({
			content: `Error during upload: ${error}`,
			created: Date.now(),
			duration: 3000,
			id: String(Math.random()),
		});
	}
};
