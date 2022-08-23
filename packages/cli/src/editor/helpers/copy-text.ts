export const copyText = (cmd: string) => {
	const permissionName = 'clipboard-write' as PermissionName;
	navigator.permissions
		.query({name: permissionName})
		.then((result) => {
			if (result.state === 'granted' || result.state === 'prompt') {
				navigator.clipboard.writeText(cmd);
			}
		})
		.catch((err) => {
			// eslint-disable-next-line no-alert
			alert('Could not copy:' + err);
		});
};
