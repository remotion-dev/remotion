import {sync} from 'pkg-dir';
import {PUPPETEER_REVISIONS} from 'puppeteer-core/lib/cjs/puppeteer/revisions';
import {rootDirname} from '../open-browser';
import {PuppeteerNode} from './PuppeteerNode';

export const puppeteer = new PuppeteerNode({
	isPuppeteerCore: true,
	preferredRevision: PUPPETEER_REVISIONS.chromium,
	productName: undefined,
	projectRoot: sync(rootDirname),
});
