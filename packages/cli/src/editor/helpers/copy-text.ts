export const copyCmd = (cmd: string) => {
	const permissionName = 'clipboard-write' as PermissionName;
	navigator.permissions
		.query({name: permissionName})
		.then((result) => {
			if (result.state === 'granted' || result.state === 'prompt') {
				navigator.clipboard.writeText(cmd);
			}
		})
		.catch((err) => {
			console.log('Could not copy command', err);
		});
};
