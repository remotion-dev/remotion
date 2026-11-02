import {expect, test} from 'bun:test';
import type {Page} from '../browser/BrowserPage';
import {Pool} from '../pool';

const page = (closed: boolean) => ({closed}) as unknown as Page;

test('Should skip closed pages on acquire', async () => {
	const open = page(false);
	const pool = new Pool([page(true), page(true), open]);
	expect(await pool.acquire()).toBe(open);
});

test('Should drop a closed page on release', async () => {
	const pool = new Pool([]);
	const waiting = pool.acquire();
	pool.release(page(true));
	const open = page(false);
	pool.release(open);
	expect(await waiting).toBe(open);
});

test('Should wait for an open page when only closed pages are left', async () => {
	const pool = new Pool([page(true)]);
	const waiting = pool.acquire();
	const open = page(false);
	pool.release(open);
	expect(await waiting).toBe(open);
});
