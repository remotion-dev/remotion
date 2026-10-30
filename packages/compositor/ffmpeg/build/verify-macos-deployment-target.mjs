import {spawnSync} from 'child_process';
import {closeSync, openSync, readSync, readdirSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {MACOS_DEPLOYMENT_TARGET} from './const.mjs';

const MACH_O_MAGICS = new Set([
	'feedface',
	'cefaedfe',
	'feedfacf',
	'cffaedfe',
	'cafebabe',
	'bebafeca',
	'cafebabf',
	'bfbafeca',
]);

const compareVersions = (left, right) => {
	const leftParts = left.split('.').map(Number);
	const rightParts = right.split('.').map(Number);
	const length = Math.max(leftParts.length, rightParts.length);

	for (let index = 0; index < length; index++) {
		const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
		if (difference !== 0) {
			return difference;
		}
	}

	return 0;
};

const isMachO = (file) => {
	const descriptor = openSync(file, 'r');
	try {
		const magic = Buffer.alloc(4);
		if (readSync(descriptor, magic, 0, magic.length, 0) !== magic.length) {
			return false;
		}

		return MACH_O_MAGICS.has(magic.toString('hex'));
	} finally {
		closeSync(descriptor);
	}
};

const collectMachOFiles = (directory) => {
	const files = [];

	for (const entry of readdirSync(directory, {withFileTypes: true}).sort(
		(left, right) => left.name.localeCompare(right.name),
	)) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectMachOFiles(entryPath));
		} else if (entry.isFile() && isMachO(entryPath)) {
			files.push(entryPath);
		}
	}

	return files;
};

const parseArchitectureSections = (output, file) => {
	const sections = [];
	let current = null;

	for (const line of output.split(/\r?\n/)) {
		if (!line.startsWith(' ') && line.endsWith(':')) {
			if (current) {
				sections.push(current);
			}

			const architecture = line.match(/ \(architecture ([^)]+)\):$/)?.[1];
			current = {
				label: architecture ?? path.basename(file),
				lines: [],
			};
		} else if (current) {
			current.lines.push(line);
		}
	}

	if (current) {
		sections.push(current);
	}

	if (sections.length === 0) {
		throw new Error(`otool returned no architecture data for ${file}`);
	}

	return sections;
};

const deploymentVersions = (section, file) => {
	const versions = [];

	for (let index = 0; index < section.lines.length; index++) {
		const command = section.lines[index].match(
			/^\s*cmd\s+(LC_BUILD_VERSION|LC_VERSION_MIN_MACOSX)\s*$/,
		)?.[1];
		if (!command) {
			continue;
		}

		const versionField = command === 'LC_BUILD_VERSION' ? 'minos' : 'version';
		let version = null;
		for (
			let commandIndex = index + 1;
			commandIndex < section.lines.length &&
			!/^Load command \d+$/.test(section.lines[commandIndex]);
			commandIndex++
		) {
			const match = section.lines[commandIndex].match(
				new RegExp(`^\\s*${versionField}\\s+([0-9]+(?:\\.[0-9]+)*)\\s*$`),
			);
			if (match) {
				version = match[1];
				break;
			}
		}

		if (version === null) {
			throw new Error(
				`${file} (${section.label}) has ${command} without ${versionField}`,
			);
		}
		versions.push({command, version});
	}

	if (versions.length === 0) {
		throw new Error(
			`${file} (${section.label}) has neither LC_BUILD_VERSION nor LC_VERSION_MIN_MACOSX`,
		);
	}

	return versions;
};

export const verifyMacOSDeploymentTarget = ({
	rootDirectory = process.cwd(),
} = {}) => {
	if (process.platform !== 'darwin') {
		console.log(
			`Skipping macOS deployment target validation on ${process.platform}`,
		);
		return;
	}

	const files = ['bin', 'lib'].flatMap((directory) =>
		collectMachOFiles(path.join(rootDirectory, 'remotion', directory)),
	);
	let architectureCount = 0;

	for (const file of files) {
		const inspected = spawnSync(
			'/usr/bin/otool',
			['-arch', 'all', '-l', file],
			{
				encoding: 'utf8',
				maxBuffer: 64 * 1024 * 1024,
			},
		);
		if (inspected.status !== 0) {
			throw new Error(
				`otool failed for ${file}: ${inspected.error?.message ?? inspected.stderr.trim()}`,
			);
		}

		for (const section of parseArchitectureSections(inspected.stdout, file)) {
			architectureCount++;
			for (const {command, version} of deploymentVersions(section, file)) {
				if (compareVersions(version, MACOS_DEPLOYMENT_TARGET) > 0) {
					throw new Error(
						`${file} (${section.label}) has ${command} deployment target ${version}, which exceeds ${MACOS_DEPLOYMENT_TARGET}`,
					);
				}
			}
		}
	}

	console.log(
		`Validated ${files.length} Mach-O files (${architectureCount} architectures) with macOS deployment target <= ${MACOS_DEPLOYMENT_TARGET}`,
	);
};

if (
	process.argv[1] &&
	fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
	verifyMacOSDeploymentTarget();
}
