import {expect, test} from 'bun:test';
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import execa from 'execa';

const repoRoot = path.join(process.cwd(), '..', '..');
const templateRoot = path.join(process.cwd(), '..', 'template-electron');
const remotionVersion = JSON.parse(
	readFileSync(path.join(repoRoot, 'packages/core/package.json'), 'utf8'),
).version as string;

function getPackageRoot(workingDir: string): string {
	return path.join(
		workingDir,
		'out',
		`template-electron-${process.platform}-${process.arch}`,
	);
}

function getPackagedResourcesPath(workingDir: string): string {
	const packageRoot = getPackageRoot(workingDir);

	if (process.platform === 'darwin') {
		return path.join(
			packageRoot,
			'template-electron.app',
			'Contents',
			'Resources',
		);
	}

	return path.join(packageRoot, 'resources');
}

function getLaunchPath(workingDir: string): string {
	const packageRoot = getPackageRoot(workingDir);

	if (process.platform === 'darwin') {
		return path.join(
			packageRoot,
			'template-electron.app',
			'Contents',
			'MacOS',
			'template-electron',
		);
	}

	if (process.platform === 'win32') {
		return path.join(packageRoot, 'template-electron.exe');
	}

	return path.join(packageRoot, 'template-electron');
}

async function copyTemplateForPublishCheck(workingDir: string): Promise<void> {
	const {stdout} = await execa(
		'git',
		['ls-files', '--cached', '--others', '--exclude-standard'],
		{
			cwd: templateRoot,
		},
	);

	for (const file of stdout.split('\n').filter(Boolean)) {
		const src = path.join(templateRoot, file);
		const dst = path.join(workingDir, file);
		mkdirSync(path.dirname(dst), {recursive: true});
		cpSync(src, dst);
	}

	const packageJsonPath = path.join(workingDir, 'package.json');
	const contents = readFileSync(packageJsonPath, 'utf8');
	writeFileSync(
		packageJsonPath,
		contents.replaceAll('workspace:*', `^${remotionVersion}`),
	);
}

async function packagePublishedTemplate(workingDir: string): Promise<void> {
	await copyTemplateForPublishCheck(workingDir);
	await execa('bun', ['install'], {
		cwd: workingDir,
		stdio: 'inherit',
	});
	await execa('bun', ['run', 'package'], {
		cwd: workingDir,
		stdio: 'inherit',
	});
}

async function runPackagedRender(
	workingDir: string,
	outputPath: string,
): Promise<void> {
	const launchPath = getLaunchPath(workingDir);

	await execa(launchPath, ['--integration-render-test', outputPath], {
		cwd: path.dirname(launchPath),
		stdio: 'inherit',
		timeout: 240000,
	});
}

test('Electron template should package and render after publish-style dependency rewriting', async () => {
	const workingDir = mkdtempSync(path.join(tmpdir(), 'remotion-electron-'));
	const outputPath = path.join(workingDir, 'integration-render.mp4');

	try {
		await packagePublishedTemplate(workingDir);

		const resourcesPath = getPackagedResourcesPath(workingDir);
		expect(existsSync(path.join(resourcesPath, 'app.asar'))).toBe(true);

		await runPackagedRender(workingDir, outputPath);

		expect(existsSync(outputPath)).toBe(true);
		expect(statSync(outputPath).size).toBeGreaterThan(0);
	} finally {
		rmSync(workingDir, {recursive: true, force: true});
	}
}, 360000);
