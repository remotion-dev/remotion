import {execSync} from 'child_process';
import {lstatSync, readdirSync, statSync} from 'fs';
import path from 'path';

export const fixMacOsLinks = () => {
	const files = readdirSync('ffmpeg/remotion/lib').filter((f) =>
		f.endsWith('.dylib'),
	);
	for (const file of files) {
		const isSymbolicLink = lstatSync(
			path.join(process.cwd(), `ffmpeg/remotion/lib/${file}`),
		).isSymbolicLink();

		if (isSymbolicLink) {
			continue;
		}

		const sharedNames = execSync(`otool -L ${file}`, {
			cwd: 'ffmpeg/remotion/lib',
		});
		const matches = sharedNames.toString().match(/remotion\/lib\/(.*).dylib/g);
		if (!matches) {
			continue;
		}
		for (const match of matches) {
			execSync(
				'install_name_tool -id ' +
					match.replace('remotion/lib/', '') +
					' ' +
					match,
				{
					cwd: 'ffmpeg',
				},
			);
			execSync(
				`install_name_tool -change ${match} ${match.replace(
					'remotion/lib/',
					'',
				)} remotion/lib/${file}`,
				{cwd: 'ffmpeg'},
			);
		}
	}

	const bins = readdirSync('ffmpeg/remotion/bin');
	for (const bin of bins) {
		const links = execSync(`otool -L ${bin}`, {
			cwd: 'ffmpeg/remotion/bin',
		})
			.toString()
			.match(/remotion\/lib\/(.*).dylib/g);

		if (!links) {
			continue;
		}
		for (const link of links) {
			execSync(
				`install_name_tool -change ${link} ${link.replace(
					'remotion/lib/',
					'',
				)} remotion/bin/${bin}`,
				{cwd: 'ffmpeg'},
			);
		}
	}
};
