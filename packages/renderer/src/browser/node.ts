import {sync} from 'pkg-dir';
import {rootDirname} from '../open-browser';
import {PuppeteerNode} from './PuppeteerNode';
import {PUPPETEER_REVISIONS} from './revisions';

export const puppeteer = new PuppeteerNode({
	preferredRevision: PUPPETEER_REVISIONS.chromium,
	productName: undefined,
	projectRoot: sync(rootDirname),
});
