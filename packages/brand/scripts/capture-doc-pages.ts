import {mkdir, readdir, readFile, stat, writeFile} from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';
import puppeteer, {
	type Browser,
	type HTTPResponse,
	type Page,
} from 'puppeteer-core';

type CliValue = string | true;

type Frontmatter = {
	id: string | null;
	slug: string | null;
	title: string | null;
};

type DocsPage = {
	relativePath: string;
	route: string;
	title: string;
	candidates: string[];
};

type CapturedPage = {
	relativePath: string;
	route: string;
	title: string;
	url: string;
	screenshot: string;
};

type FailedPage = {
	relativePath: string;
	route: string;
	error: string;
};

const scriptFile = fileURLToPath(import.meta.url);
const brandRoot = path.resolve(path.dirname(scriptFile), '..');
const repoRoot = path.resolve(brandRoot, '../..');

const parseCli = (): Map<string, CliValue> => {
	const parsed = new Map<string, CliValue>();
	const args = process.argv.slice(2);

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (!arg.startsWith('--')) {
			throw new Error(`Unexpected argument "${arg}". Use --name=value.`);
		}

		const withoutPrefix = arg.slice(2);
		const equalsIndex = withoutPrefix.indexOf('=');
		if (equalsIndex !== -1) {
			parsed.set(
				withoutPrefix.slice(0, equalsIndex),
				withoutPrefix.slice(equalsIndex + 1),
			);
			continue;
		}

		const next = args[i + 1];
		if (next && !next.startsWith('--')) {
			parsed.set(withoutPrefix, next);
			i++;
			continue;
		}

		parsed.set(withoutPrefix, true);
	}

	return parsed;
};

const cli = parseCli();

const getString = (name: string, fallback: string): string => {
	const value = cli.get(name);
	if (value === undefined || value === true) {
		return fallback;
	}

	return value;
};

const getOptionalString = (name: string): string | null => {
	const value = cli.get(name);
	if (value === undefined || value === true) {
		return null;
	}

	return value;
};

const getNumber = (name: string, fallback: number): number => {
	const value = getOptionalString(name);
	if (value === null) {
		return fallback;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		throw new Error(`--${name} must be a number.`);
	}

	return parsed;
};

const getOptionalNumber = (name: string): number | null => {
	const value = getOptionalString(name);
	if (value === null) {
		return null;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		throw new Error(`--${name} must be a number.`);
	}

	return parsed;
};

const docsDir = path.resolve(
	getString('docs-dir', path.join(repoRoot, 'packages/docs/docs')),
);
const outDir = path.resolve(
	getString('out-dir', path.join(brandRoot, 'public/documentation-pages')),
);
const baseUrl = getString('base-url', 'https://www.remotion.dev').replace(
	/\/$/,
	'',
);
const width = getNumber('width', 1920);
const height = getNumber('height', 1080);
const quality = getNumber('quality', 84);
const limit = getOptionalNumber('limit');
const concurrency = getNumber('concurrency', 4);
const timeoutInMilliseconds = getNumber('timeout', 45000);
const force = cli.has('force');
const manifestPath = path.join(outDir, 'manifest.json');

const normalizeSlashes = (value: string): string => {
	return value.replaceAll(path.sep, path.posix.sep);
};

const collectFiles = async (
	dir: string,
	files: string[] = [],
): Promise<string[]> => {
	const entries = await readdir(dir, {withFileTypes: true});

	for (const entry of entries) {
		const absolutePath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			await collectFiles(absolutePath, files);
			continue;
		}

		if (entry.isFile() && !entry.name.includes('redirect')) {
			files.push(absolutePath);
		}
	}

	return files.sort((a, b) => a.localeCompare(b));
};

const cleanFrontmatterValue = (value: string): string => {
	const trimmed = value.trim();

	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}

	return trimmed;
};

const findFrontmatterValue = (
	frontmatter: string,
	key: keyof Frontmatter,
): string | null => {
	const line = frontmatter
		.split(/\r?\n/)
		.find((entry) => entry.startsWith(`${key}: `));

	if (!line) {
		return null;
	}

	return cleanFrontmatterValue(line.slice(`${key}: `.length));
};

const parseFrontmatter = (contents: string): Frontmatter | null => {
	const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
	if (!match) {
		return null;
	}

	return {
		id: findFrontmatterValue(match[1], 'id'),
		slug: findFrontmatterValue(match[1], 'slug'),
		title: findFrontmatterValue(match[1], 'title'),
	};
};

const normalizeRoute = (slug: string): string => {
	const withoutLeadingSlash = slug.replace(/^\/+/, '').replace(/\/+$/, '');

	if (withoutLeadingSlash.length === 0) {
		return '/docs';
	}

	return `/docs/${withoutLeadingSlash}`;
};

const unique = <T>(items: T[]): T[] => {
	return [...new Set(items)];
};

const createRouteCandidates = ({
	frontmatter,
	relativePath,
}: {
	frontmatter: Frontmatter;
	relativePath: string;
}): string[] => {
	const withoutExtension = relativePath.replace(/\.mdx?$/, '');
	const dirName = path.posix.dirname(withoutExtension);
	const dirnameForRoute = dirName === '.' ? '' : dirName;
	const fallbackId = withoutExtension;
	const id = frontmatter.id ?? fallbackId;
	const slug = frontmatter.slug;
	const basename = path.posix.basename(slug ?? id);
	const isIndexPage = path.posix.basename(withoutExtension) === 'index';
	const routeSlug =
		slug && slug.startsWith('/')
			? slug
			: path.posix.join(dirnameForRoute, basename);
	const indexSlug = !slug && isIndexPage ? dirnameForRoute : null;
	const collapsedFolderSlug =
		!slug &&
		dirnameForRoute.length > 0 &&
		path.posix.basename(dirnameForRoute) === path.posix.basename(id)
			? dirnameForRoute
			: null;
	const filePathSlug =
		path.posix.basename(withoutExtension) === 'index'
			? dirnameForRoute
			: withoutExtension;
	const idSlug = path.posix.join(dirnameForRoute, path.posix.basename(id));

	return unique([
		...(collapsedFolderSlug ? [normalizeRoute(collapsedFolderSlug)] : []),
		...(indexSlug ? [normalizeRoute(indexSlug)] : []),
		normalizeRoute(routeSlug),
		normalizeRoute(idSlug),
		normalizeRoute(filePathSlug),
	]);
};

const getDocsPages = async (): Promise<{
	sourceFileCount: number;
	totalBrowserPages: number;
	pages: DocsPage[];
}> => {
	const sourceFiles = await collectFiles(docsDir);
	const pages: DocsPage[] = [];

	for (const sourceFile of sourceFiles) {
		if (!sourceFile.endsWith('.md') && !sourceFile.endsWith('.mdx')) {
			continue;
		}

		const contents = await readFile(sourceFile, 'utf8');
		const frontmatter = parseFrontmatter(contents);

		if (!frontmatter) {
			continue;
		}

		const relativePath = normalizeSlashes(path.relative(docsDir, sourceFile));
		const candidates = createRouteCandidates({frontmatter, relativePath});

		pages.push({
			relativePath,
			route: candidates[0],
			title: frontmatter.title ?? relativePath,
			candidates,
		});
	}

	return {
		sourceFileCount: sourceFiles.length,
		totalBrowserPages: pages.length,
		pages: pages.slice(0, limit ?? pages.length),
	};
};

const slugify = (route: string): string => {
	const withoutDocs = route.replace(/^\/docs\/?/, '') || 'docs';

	return withoutDocs
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 96);
};

const getScreenshotName = (index: number, route: string): string => {
	return `${String(index + 1).padStart(4, '0')}-${slugify(route)}.jpg`;
};

const getScreenshotPath = (fileName: string): string => {
	return path.join(outDir, fileName);
};

const getScreenshotStaticPath = (fileName: string): string => {
	return `documentation-pages/${fileName}`;
};

const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await stat(filePath);
		return true;
	} catch {
		return false;
	}
};

const waitForStablePage = async (page: Page): Promise<void> => {
	await page.evaluate(async () => {
		await document.fonts.ready;
		window.scrollTo(0, 0);
	});
	await new Promise((resolve) => setTimeout(resolve, 250));
};

const isUsableResponse = (response: HTTPResponse | null): boolean => {
	const status = response?.status() ?? 0;
	return status >= 200 && status < 400;
};

const gotoAnyCandidate = async ({
	page,
	candidates,
}: {
	page: Page;
	candidates: string[];
}): Promise<{route: string; url: string}> => {
	let lastError: Error | null = null;

	for (const route of candidates) {
		const url = `${baseUrl}${route}`;

		try {
			const response = await page.goto(url, {
				waitUntil: 'networkidle2',
				timeout: timeoutInMilliseconds,
			});

			if (!isUsableResponse(response)) {
				lastError = new Error(
					`HTTP ${response?.status() ?? 'unknown'} for ${url}`,
				);
				continue;
			}

			await waitForStablePage(page);
			return {route, url};
		} catch (err) {
			lastError = err instanceof Error ? err : new Error(String(err));
		}
	}

	throw lastError ?? new Error('No route candidate could be opened.');
};

const createPage = async (browser: Browser): Promise<Page> => {
	const page = await browser.newPage();

	await page.setViewport({
		width,
		height,
		deviceScaleFactor: 1,
	});
	await page.emulateMediaFeatures([
		{name: 'prefers-color-scheme', value: 'light'},
	]);

	page.setDefaultTimeout(timeoutInMilliseconds);
	page.setDefaultNavigationTimeout(timeoutInMilliseconds);

	return page;
};

const capturePage = async ({
	browser,
	docsPage,
	index,
}: {
	browser: Browser;
	docsPage: DocsPage;
	index: number;
}): Promise<CapturedPage> => {
	const fileName = getScreenshotName(index, docsPage.route);
	const absoluteScreenshotPath = getScreenshotPath(fileName);
	const staticScreenshotPath = getScreenshotStaticPath(fileName);

	if (!force && (await fileExists(absoluteScreenshotPath))) {
		return {
			relativePath: docsPage.relativePath,
			route: docsPage.route,
			title: docsPage.title,
			url: `${baseUrl}${docsPage.route}`,
			screenshot: staticScreenshotPath,
		};
	}

	const page = await createPage(browser);

	try {
		const opened = await gotoAnyCandidate({
			page,
			candidates: docsPage.candidates,
		});

		await page.screenshot({
			path: absoluteScreenshotPath,
			type: 'jpeg',
			quality,
			clip: {
				x: 0,
				y: 0,
				width,
				height,
			},
		});

		return {
			relativePath: docsPage.relativePath,
			route: opened.route,
			title: docsPage.title,
			url: opened.url,
			screenshot: staticScreenshotPath,
		};
	} finally {
		await page.close();
	}
};

const getLaunchOptions = () => {
	const executablePath =
		process.env.CHROME_EXECUTABLE ??
		process.env.PUPPETEER_EXECUTABLE_PATH ??
		null;

	return executablePath
		? {executablePath}
		: {
				channel: 'chrome' as const,
			};
};

const run = async () => {
	await mkdir(outDir, {recursive: true});

	const {sourceFileCount, totalBrowserPages, pages} = await getDocsPages();
	const browser = await puppeteer.launch({
		...getLaunchOptions(),
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const captured: CapturedPage[] = [];
	const failed: FailedPage[] = [];
	let nextIndex = 0;

	const worker = async () => {
		while (nextIndex < pages.length) {
			const pageIndex = nextIndex++;
			const docsPage = pages[pageIndex];

			try {
				const result = await capturePage({
					browser,
					docsPage,
					index: pageIndex,
				});
				captured[pageIndex] = result;
				console.log(
					`[${pageIndex + 1}/${pages.length}] ${result.route} -> ${result.screenshot}`,
				);
			} catch (err) {
				const error = err instanceof Error ? err.message : String(err);
				failed.push({
					relativePath: docsPage.relativePath,
					route: docsPage.route,
					error,
				});
				console.error(
					`[${pageIndex + 1}/${pages.length}] ${docsPage.route}: ${error}`,
				);
			}
		}
	};

	await Promise.all(
		Array.from({length: Math.max(1, concurrency)}, () => worker()),
	);
	await browser.close();

	const successfulPages = captured.filter(Boolean);

	await writeFile(
		manifestPath,
		`${JSON.stringify(
			{
				version: 1,
				createdAt: new Date().toISOString(),
				sourceBaseUrl: baseUrl,
				width,
				height,
				format: 'jpeg',
				quality,
				totalDocumentationSourceFiles: sourceFileCount,
				totalBrowserPages,
				capturedBrowserPages: pages.length,
				pages: successfulPages,
				failed,
			},
			null,
			2,
		)}\n`,
	);

	if (failed.length > 0) {
		throw new Error(
			`Captured ${successfulPages.length} pages, but ${failed.length} failed. See ${manifestPath}.`,
		);
	}

	console.log(`Captured ${successfulPages.length} pages.`);
	console.log(`Manifest written to ${manifestPath}.`);
};

run().catch((err) => {
	console.error(err instanceof Error ? err.message : err);
	process.exit(1);
});
