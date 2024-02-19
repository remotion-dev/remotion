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

	const formData = new FormData();
	formData.append('file', file);
	formData.append('assetPath', assetPath);

	try {
		const response = await fetch('/api/add-asset', {
			method: 'POST',
			body: formData,
		});

		if (response.ok) {
			notificationCenter.current?.addNotification({
				content: `File uploaded successfully`,
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
