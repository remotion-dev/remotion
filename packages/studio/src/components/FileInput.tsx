import {useState} from 'react';
import {notificationCenter} from './Notifications/NotificationCenter';

const FileUpload = () => {
	const [selectedFile, setSelectedFile] = useState<File | undefined | null>(
		null,
	);

	const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
		event,
	) => {
		setSelectedFile(event.target.files?.[0]);
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			notificationCenter.current?.addNotification({
				content: `Please select a file first!`,
				created: Date.now(),
				duration: 1000,
				id: String(Math.random()),
			});
			return;
		}

		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('assetPath', '/');

		try {
			const response = await fetch('/api/add-asset', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				const jsonResponse = await response.json();
				notificationCenter.current?.addNotification({
					content: `File uploaded successfully: ${jsonResponse}`,
					created: Date.now(),
					duration: 1000,
					id: String(Math.random()),
				});
			} else {
				const jsonResponse = await response.json();
				notificationCenter.current?.addNotification({
					content: `Upload failed: ${JSON.stringify(jsonResponse)}`,
					created: Date.now(),
					duration: 1000,
					id: String(Math.random()),
				});
			}
		} catch (error) {
			notificationCenter.current?.addNotification({
				content: `Error during upload: ${error}`,
				created: Date.now(),
				duration: 1000,
				id: String(Math.random()),
			});
		}
	};

	return (
		<div>
			<input type="file" onChange={handleFileChange} />
			<button onClick={handleUpload} type="button">
				Upload File
			</button>
		</div>
	);
};

export default FileUpload;
