/* eslint-disable no-console */
import asyncHooks from 'async_hooks';
import fs from 'fs';
import {sep} from 'path';
import {stackback} from './stackback';

type Resource = {
	type: string;
	stacks: NodeJS.CallSite[];
	resource: {
		hasRef?: () => boolean;
	};
};

export type NodeIntrospection = {
	hook: asyncHooks.AsyncHook | null;
	active: Map<number, Resource>;
};

export const enableNodeIntrospection = (
	enabled: boolean,
): NodeIntrospection => {
	const active = new Map<number, Resource>();
	if (!enabled) {
		return {
			active,
			hook: null,
		};
	}

	const hook = asyncHooks.createHook({
		init(asyncId, type, _triggerAsyncId, resource) {
			if (type === 'TIMERWRAP' || type === 'PROMISE') return;
			if (type === 'PerformanceObserver' || type === 'RANDOMBYTESREQUEST')
				return;
			const err = new Error('whatevs');
			const stacks = stackback(err);
			active.set(asyncId, {type, stacks, resource});
		},
		destroy(asyncId) {
			active.delete(asyncId);
		},
	});

	hook.enable();
	return {hook, active};
};

export function whyIsNodeRunning({active, hook}: NodeIntrospection) {
	if (!hook) {
		return;
	}

	hook.disable();
	const activeResources = [...active.values()].filter((r) => {
		if (typeof r.resource.hasRef === 'function' && !r.resource.hasRef())
			return false;
		return true;
	});

	console.error(
		'There are %d handle(s) keeping the process running',
		activeResources.length,
	);

	function printStacks(o: Resource) {
		const stacks = o.stacks.slice(1).filter((s) => {
			const filename = s.getFileName();
			return (
				filename &&
				filename.indexOf(sep) > -1 &&
				filename.indexOf('internal' + sep) !== 0
			);
		});

		console.error('');
		console.error('# %s', o.type);

		if (stacks[0]) {
			let padding = '';
			stacks.forEach((s) => {
				const pad = (s.getFileName() + ':' + s.getLineNumber()).replace(
					/./g,
					' ',
				);
				if (pad.length > padding.length) padding = pad;
			});
			stacks.forEach((s) => {
				const prefix = s.getFileName() + ':' + s.getLineNumber();
				try {
					const src = fs
						.readFileSync(s.getFileName() as string, 'utf-8')
						.split(/\n|\r\n/);
					console.error(
						prefix +
							padding.slice(prefix.length) +
							' - ' +
							src[(s.getLineNumber() as number) - 1].trim(),
					);
				} catch {
					console.error(prefix + padding.slice(prefix.length));
				}
			});
		} else {
			console.error('(unknown stack trace)');
		}
	}

	for (const o of activeResources) {
		printStacks(o);
	}
}
