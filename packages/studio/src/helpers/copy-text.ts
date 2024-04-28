export const copyText = (cmd: string) => {
	const permissionName = 'clipboard-write' as PermissionName;

	return new Promise<void>((resolve, reject) => {
		navigator.permissions
			.query({name: permissionName})
			.then((result) => {
				if (result.state === 'granted' || result.state === 'prompt') {
					navigator.clipboard.writeText(cmd);
					resolve();
				} else {
					reject(new Error('Permission to copy not granted'));
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
};
