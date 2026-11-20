import {afterEach, beforeEach, expect, test} from 'bun:test';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import {getExpectedVersion, getPlatform} from '../browser/BrowserFetcher';
import {ensureBrowser} from '../ensure-browser';
import type {OnBrowserDownload} from '../options/on-browser-download';

const CUSTOM_VERSION = '144.0.7559.20';

const makeZip = (entryName: string, content: Buffer): Buffer => {
	const name = Buffer.from(entryName);
	const crc = Bun.hash.crc32(content);

	const local = Buffer.alloc(30);
	local.writeUInt32LE(0x04034b50, 0);
	local.writeUInt16LE(20, 4);
	local.writeUInt32LE(crc, 14);
	local.writeUInt32LE(content.length, 18);
	local.writeUInt32LE(content.length, 22);
	local.writeUInt16LE(name.length, 26);

	const central = Buffer.alloc(46);
	central.writeUInt32LE(0x02014b50, 0);
	central.writeUInt16LE(20, 4);
	central.writeUInt16LE(20, 6);
	central.writeUInt32LE(crc, 16);
	central.writeUInt32LE(content.length, 20);
	central.writeUInt32LE(content.length, 24);
	central.writeUInt16LE(name.length, 28);

	const localSize = local.length + name.length + content.length;
	const centralSize = central.length + name.length;
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(1, 8);
	end.writeUInt16LE(1, 10);
	end.writeUInt32LE(centralSize, 12);
	end.writeUInt32LE(localSize, 16);

	return Buffer.concat(
		[local, name, content, central, name, end].map(
			(part) => new Uint8Array(part),
		),
	);
};

const platform = getPlatform();
const executableName =
	platform === 'win64' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell';
const archive = makeZip(
	`chrome-headless-shell-${platform}/${executableName}`,
	Buffer.from('fake browser'),
);

let originalCwd: string;
let originalHttpsGet: typeof https.get;
let projectDir: string;
let server: http.Server;
let downloadedUrls: string[];

beforeEach(async () => {
	originalCwd = process.cwd();
	projectDir = fs.realpathSync(
		fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-ensure-browser-')),
	);
	fs.writeFileSync(path.join(projectDir, 'package.json'), '{}');
	process.chdir(projectDir);

	downloadedUrls = [];
	server = http.createServer((_, res) => {
		res.writeHead(200, {'content-length': archive.length});
		res.end(archive);
	});
	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', resolve);
	});
	const {port} = server.address() as {port: number};

	originalHttpsGet = https.get;
	https.get = ((url: string, options: http.RequestOptions, callback) => {
		downloadedUrls.push(url);
		return http.get(`http://127.0.0.1:${port}/`, options, callback);
	}) as typeof https.get;
});

afterEach(() => {
	https.get = originalHttpsGet;
	server.close();
	process.chdir(originalCwd);
	fs.rmSync(projectDir, {recursive: true, force: true});
});

const pinCustomVersion: OnBrowserDownload = () => ({
	version: CUSTOM_VERSION,
	onProgress: () => undefined,
});

const executableIn = (versionFolder: string) =>
	path.join(
		projectDir,
		'node_modules/.remotion/chrome-headless-shell',
		versionFolder,
		platform,
		`chrome-headless-shell-${platform}`,
		executableName,
	);

test('Installing another Chrome version keeps the installed one', async () => {
	const custom = await ensureBrowser({
		logLevel: 'error',
		onBrowserDownload: pinCustomVersion,
	});
	const fallback = await ensureBrowser({logLevel: 'error'});
	if (
		custom.type !== 'local-puppeteer-browser' ||
		fallback.type !== 'local-puppeteer-browser'
	) {
		throw new Error('Expected downloaded browsers');
	}

	expect(fs.existsSync(custom.path)).toBe(true);
	expect(fs.existsSync(fallback.path)).toBe(true);
	expect(custom.path).not.toBe(fallback.path);

	expect(
		await ensureBrowser({
			logLevel: 'error',
			onBrowserDownload: pinCustomVersion,
		}),
	).toEqual(custom);
	expect(await ensureBrowser({logLevel: 'error'})).toEqual(fallback);
	expect(downloadedUrls).toHaveLength(2);
	expect(downloadedUrls[0]).toContain(CUSTOM_VERSION);
});

test('Reuses a browser from the pre-v4.0.544 layout without downloading', async () => {
	const defaultVersion = getExpectedVersion({
		version: null,
		chromeMode: 'headless-shell',
		platform,
	});
	const chromeModeFolder = path.join(
		projectDir,
		'node_modules/.remotion/chrome-headless-shell',
	);
	const legacyExecutable = path.join(
		chromeModeFolder,
		platform,
		`chrome-headless-shell-${platform}`,
		executableName,
	);
	fs.mkdirSync(path.dirname(legacyExecutable), {recursive: true});
	fs.writeFileSync(legacyExecutable, 'previously installed browser');
	fs.writeFileSync(path.join(chromeModeFolder, 'VERSION'), defaultVersion);

	const status = await ensureBrowser({logLevel: 'error'});

	expect(status).toEqual({
		type: 'local-puppeteer-browser',
		path: executableIn(defaultVersion),
	});
	expect(fs.readFileSync(executableIn(defaultVersion), 'utf-8')).toBe(
		'previously installed browser',
	);
	expect(downloadedUrls).toEqual([]);
});
