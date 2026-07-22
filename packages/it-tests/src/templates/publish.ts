import {
	cpSync,
	existsSync,
	readdirSync,
	readFileSync,
	renameSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'path';
import {$} from 'bun';
import {CreateVideoInternals} from 'create-video';

type MinimalTemplate = {
	shortName: string;
	org: string;
	repoName: string;
	defaultBranch: string;
	templateInMonorepo: string;
};

const folders = CreateVideoInternals.FEATURED_TEMPLATES.filter(
	(t) => t.templateInMonorepo !== null,
);

const skillsTemplate: MinimalTemplate = {
	defaultBranch: 'main',
	templateInMonorepo: 'skills',
	org: 'remotion-dev',
	repoName: 'skills',
	shortName: 'Skills',
};

const templates = [skillsTemplate, ...folders];

const embeddedSkillFilename = 'REFERENCE.md';

const prepareEmbeddedBestPractices = (root: string) => {
	const embeddedRoot = path.join(root, 'skills', 'remotion-best-practices');

	if (!existsSync(embeddedRoot)) {
		return;
	}

	const embeddedSkillNames = readdirSync(embeddedRoot, {withFileTypes: true})
		.filter((entry) => {
			const child = path.join(embeddedRoot, entry.name);
			return (
				entry.isDirectory() &&
				entry.name !== 'rules' &&
				statSync(path.join(child, 'SKILL.md'), {
					throwIfNoEntry: false,
				})?.isFile()
			);
		})
		.map((entry) => entry.name)
		.sort();

	const rewriteMarkdownFiles = (dir: string) => {
		for (const entry of readdirSync(dir, {withFileTypes: true})) {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				rewriteMarkdownFiles(file);
				continue;
			}

			if (!entry.isFile() || !file.endsWith('.md')) {
				continue;
			}

			const contents = readFileSync(file, 'utf-8');
			let rewritten = contents.replaceAll('../remotion-best-practices/', '../');
			for (const skillName of embeddedSkillNames) {
				rewritten = rewritten.replaceAll(
					`${skillName}/SKILL.md`,
					`${skillName}/${embeddedSkillFilename}`,
				);
			}
			if (contents !== rewritten) {
				writeFileSync(file, rewritten);
			}
		}
	};

	rewriteMarkdownFiles(embeddedRoot);

	for (const skillName of embeddedSkillNames) {
		const child = path.join(embeddedRoot, skillName);
		renameSync(
			path.join(child, 'SKILL.md'),
			path.join(child, embeddedSkillFilename),
		);
	}
};

const publish = async (template: MinimalTemplate) => {
	const folder = path.join(
		__dirname,
		'..',
		'..',
		'..',
		template.templateInMonorepo as string,
	);

	const tmpDir = tmpdir();
	const workingDir = path.join(tmpDir, `template-${Math.random()}`);

	await $`git add .`.cwd(folder);
	const files = await $`git ls-files`.cwd(folder).quiet();
	const filesInTemplate = files.stdout
		.toString('utf-8')
		.trim()
		.split('\n')
		.filter(Boolean);

	await $`git clone git@github.com:${template.org}/${template.repoName}.git ${workingDir} --depth 1`;

	const defaultBranch = await $`git branch --show-current`
		.cwd(workingDir)
		.text();
	const existingFilesInRepo = await $`git ls-files`.cwd(workingDir).quiet();
	for (const file of existingFilesInRepo.stdout
		.toString('utf-8')
		.trim()
		.split('\n')) {
		if (file === '') continue;
		await $`rm ${file}`.cwd(workingDir).quiet();
	}

	for (const file of filesInTemplate) {
		const src = path.join(folder, file);
		const dst = path.join(workingDir, file);
		cpSync(src, dst, {dereference: true, recursive: true});

		if (file === 'package.json') {
			const dstFile = await Bun.file(dst).text();
			const currentVersion = dstFile.replaceAll('workspace:*', '^4.0.0');
			await Bun.write(dst, currentVersion);
		}
	}

	if (template.templateInMonorepo === 'skills') {
		prepareEmbeddedBestPractices(workingDir);
	}

	await $`git add .`.cwd(workingDir).nothrow();
	const hasChanges = await $`git status --porcelain`.cwd(workingDir).text();
	if (!hasChanges) {
		console.log(`No changes in ${template.shortName}`);
		return;
	}

	await $`git commit -m "Update template"`.cwd(workingDir);
	await $`git push origin ${defaultBranch.trim()}`.cwd(workingDir);
};

const publishCodexPlugin = async () => {
	const codexPluginDir = path.join(__dirname, '..', '..', '..', 'codex-plugin');

	// Run the build step to assemble skills
	await $`bun build.mts`.cwd(codexPluginDir);

	const tmpDir = tmpdir();
	const workingDir = path.join(tmpDir, `codex-plugin-${Math.random()}`);

	await $`git clone git@github.com:remotion-dev/codex-plugin.git ${workingDir} --depth 1`;

	const defaultBranch = await $`git branch --show-current`
		.cwd(workingDir)
		.text();
	const existingFilesInRepo = await $`git ls-files`.cwd(workingDir).quiet();
	for (const file of existingFilesInRepo.stdout
		.toString('utf-8')
		.trim()
		.split('\n')) {
		if (file === '') continue;
		await $`rm ${file}`.cwd(workingDir).quiet();
	}

	const filesToCopy = ['.codex-plugin', 'assets', 'skills', 'README.md'];
	for (const entry of filesToCopy) {
		const src = path.join(codexPluginDir, entry);
		const dst = path.join(workingDir, entry);
		cpSync(src, dst, {recursive: true});
	}

	await $`git add .`.cwd(workingDir).nothrow();
	const hasChanges = await $`git status --porcelain`.cwd(workingDir).text();
	if (!hasChanges) {
		console.log('No changes in codex-plugin');
		return;
	}

	await $`git commit -m "Update codex plugin"`.cwd(workingDir);
	await $`git push origin ${defaultBranch.trim()}`.cwd(workingDir);
};

const publishClaudeCodePlugin = async () => {
	const claudeCodePluginDir = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'claude-code-plugin',
	);

	// Run the build step to assemble skills
	await $`bun build.mts`.cwd(claudeCodePluginDir);

	const tmpDir = tmpdir();
	const workingDir = path.join(tmpDir, `claude-code-plugin-${Math.random()}`);

	await $`git clone git@github.com:remotion-dev/claude-code-plugin.git ${workingDir} --depth 1`;

	const defaultBranch = await $`git branch --show-current`
		.cwd(workingDir)
		.text();
	const existingFilesInRepo = await $`git ls-files`.cwd(workingDir).quiet();
	for (const file of existingFilesInRepo.stdout
		.toString('utf-8')
		.trim()
		.split('\n')) {
		if (file === '') continue;
		await $`rm ${file}`.cwd(workingDir).quiet();
	}

	const filesToCopy = ['.claude-plugin', 'skills', 'README.md'];
	for (const entry of filesToCopy) {
		const src = path.join(claudeCodePluginDir, entry);
		const dst = path.join(workingDir, entry);
		cpSync(src, dst, {recursive: true});
	}

	const packageJson = JSON.parse(
		readFileSync(path.join(claudeCodePluginDir, 'package.json'), 'utf-8'),
	);
	const pluginJsonPath = path.join(workingDir, '.claude-plugin', 'plugin.json');
	const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
	writeFileSync(
		pluginJsonPath,
		`${JSON.stringify({...pluginJson, version: packageJson.version}, null, '\t')}\n`,
	);

	await $`git add .`.cwd(workingDir).nothrow();
	const hasChanges = await $`git status --porcelain`.cwd(workingDir).text();
	if (!hasChanges) {
		console.log('No changes in claude-code-plugin');
		return;
	}

	await $`git commit -m "Update Claude Code plugin"`.cwd(workingDir);
	await $`git push origin ${defaultBranch.trim()}`.cwd(workingDir);
};

const publishKimiCodePlugin = async () => {
	const kimiCodePluginDir = path.join(
		__dirname,
		'..',
		'..',
		'..',
		'kimi-code-plugin',
	);

	// Run the build step to assemble skills
	await $`bun build.mts`.cwd(kimiCodePluginDir);

	const tmpDir = tmpdir();
	const workingDir = path.join(tmpDir, `kimi-code-plugin-${Math.random()}`);

	await $`git clone git@github.com:remotion-dev/kimi-code-plugin.git ${workingDir} --depth 1`;

	const defaultBranch = await $`git branch --show-current`
		.cwd(workingDir)
		.text();
	const existingFilesInRepo = await $`git ls-files`.cwd(workingDir).quiet();
	for (const file of existingFilesInRepo.stdout
		.toString('utf-8')
		.trim()
		.split('\n')) {
		if (file === '') continue;
		await $`rm ${file}`.cwd(workingDir).quiet();
	}

	const filesToCopy = ['.kimi-plugin', 'skills', 'README.md'];
	for (const entry of filesToCopy) {
		const src = path.join(kimiCodePluginDir, entry);
		const dst = path.join(workingDir, entry);
		cpSync(src, dst, {recursive: true});
	}

	const packageJson = JSON.parse(
		readFileSync(path.join(kimiCodePluginDir, 'package.json'), 'utf-8'),
	);
	const pluginJsonPath = path.join(workingDir, '.kimi-plugin', 'plugin.json');
	const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));
	writeFileSync(
		pluginJsonPath,
		`${JSON.stringify({...pluginJson, version: packageJson.version}, null, '\t')}\n`,
	);

	await $`git add .`.cwd(workingDir).nothrow();
	const hasChanges = await $`git status --porcelain`.cwd(workingDir).text();
	if (!hasChanges) {
		console.log('No changes in kimi-code-plugin');
		return;
	}

	await $`git commit -m "Update Kimi Code plugin"`.cwd(workingDir);
	await $`git push origin ${defaultBranch.trim()}`.cwd(workingDir);
};

const CONCURRENCY = 1;

const results: PromiseSettledResult<void>[] = [];

for (let i = 0; i < templates.length; i += CONCURRENCY) {
	const batch = templates.slice(i, i + CONCURRENCY);
	const batchResults = await Promise.allSettled(
		batch.map((template) => publish(template)),
	);
	results.push(...batchResults);
}

results.push(
	...(await Promise.allSettled([
		publishCodexPlugin(),
		publishClaudeCodePlugin(),
		publishKimiCodePlugin(),
	])),
);

const failures = results.filter(
	(r): r is PromiseRejectedResult => r.status === 'rejected',
);

if (failures.length > 0) {
	console.error(`${failures.length} template(s) failed to publish:`);
	for (const failure of failures) {
		console.error(failure.reason);
	}

	process.exit(1);
}
