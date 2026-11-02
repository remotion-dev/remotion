import {expect, test} from 'bun:test';
import type {Page} from '../browser/BrowserPage';
import {Pool} from '../pool';

const page = (closed: boolean) => ({closed}) as unknown as Page;

test('Should drop a closed page on release', async () => {
	const pool = new Pool([]);
	const waiting = pool.acquire();
	pool.release(page(true));
	const open = page(false);
	pool.release(open);
	expect(await waiting).toBe(open);
});

test('Should not keep a closed page as an idle resource', () => {
	const pool = new Pool([]);
	pool.release(page(true));
	expect(pool.resources).toEqual([]);
});
