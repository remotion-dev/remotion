import {spawn} from 'node:child_process';

const terminalSafe = (value: string) =>
	value.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 300);

const powershellSafe = (value: string) => value.replaceAll("'", "''");

const notifyWindows = (title: string, body: string) => {
	const type = 'Windows.UI.Notifications';
	const script = [
		`[${type}.ToastNotificationManager, ${type}, ContentType = WindowsRuntime] > $null`,
		`$xml = [${type}.ToastNotificationManager]::GetTemplateContent([${type}.ToastTemplateType]::ToastText02)`,
		`$xml.GetElementsByTagName('text')[0].AppendChild($xml.CreateTextNode('${powershellSafe(title)}')) > $null`,
		`$xml.GetElementsByTagName('text')[1].AppendChild($xml.CreateTextNode('${powershellSafe(body)}')) > $null`,
		`[${type}.ToastNotificationManager]::CreateToastNotifier('Pi Pullfrog Monitor').Show([${type}.ToastNotification]::new($xml))`,
	].join('; ');
	const child = spawn('powershell.exe', ['-NoProfile', '-Command', script], {
		stdio: 'ignore',
		detached: true,
	});
	child.on('error', () => undefined);
	child.unref();
};

export const notifyPullfrogReady = (title: string, body: string) => {
	try {
		if (process.env.WT_SESSION) {
			notifyWindows(title, body);
			return;
		}
		const safeTitle = terminalSafe(title);
		const safeBody = terminalSafe(body);
		if (process.env.KITTY_WINDOW_ID) {
			process.stdout.write(`\x1b]99;i=pullfrog:d=0;${safeTitle}\x1b\\`);
			process.stdout.write(`\x1b]99;i=pullfrog:p=body;${safeBody}\x1b\\`);
			return;
		}
		process.stdout.write(`\x1b]777;notify;${safeTitle};${safeBody}\x07`);
	} catch {
		// The persisted widget remains the fallback when notifications are unsupported.
	}
};
