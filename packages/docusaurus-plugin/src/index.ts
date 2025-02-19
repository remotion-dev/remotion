import type {DocusaurusContext} from '@docusaurus/types';
import path from 'path';
import {remarkTwoslash} from './shiki';
/**
 * @param {import("@docusaurus/types").DocusaurusContext} context
 * @param {import("remark-shiki-twoslash").Settings} pluginOptions
 * @returns {import("@docusaurus/types").Preset}
 */
export function shiki(context: DocusaurusContext, pluginOptions: any) {
	const options = {...pluginOptions, wrapFragments: true};

	// So, how do we hijack the code renderer? We mostly override the user's configuration for
	// the presets.

	if (!context.siteConfig.presets || !context.siteConfig.plugins) {
		throw Error("Couldn't find either a preset or a plugin");
	}

	// Available presets & plugins
	// We could parse out the repeated parts from the strings but
	// I think it's better this way as a way of showing that twoslash could
	// technically support all kinds of presets, not just official ones
	const presets = [['@docusaurus/preset-classic', 'classic']];
	const plugins = [
		['@docusaurus/plugin-content-docs', 'content-docs'],
		['@docusaurus/plugin-content-blog', 'content-blog'],
		['@docusaurus/plugin-content-pages', 'content-pages'],
	];

	// Flag to keep track if at least one of the presets or the plugins are installed
	let flag = false;

	/**
	 * Checks if b is in a
	 * @param {string[][]} a
	 * @param {string | [string] | [string, any]} b
	 */
	const contains = <T>(a: T[][], b: string | T[] | T) =>
		// @ts-expect-error
		a.flat().includes(typeof b === 'string' ? b : b[0]);

	/**
	 * Structure `a` into proper `[a, {}]`
	 * @param {string | [string] | [string, any]} a
	 * @returns {[string, any]}
	 *  - `[a, {}]` if `a` is `string`
	 *  - `[a[0], {}]` if `a` is `[string]`
	 *  - `a` if `a` is already `[string, {}]`
	 */
	const structure = (a: any) =>
		typeof a === 'string' ? [a, {}] : a.length === 1 ? [a[0], {}] : a;

	// Adds remark-shiki-twoslash into beforeDefaultRemarkPlugins
	const addTwoslash = (a: any) => {
		flag = true;

		if (!a.beforeDefaultRemarkPlugins) {
			a.beforeDefaultRemarkPlugins = [];
		}

		a.beforeDefaultRemarkPlugins.push([remarkTwoslash, options]);
		return a;
	};

	const addTwoslashArray = (a: any) => {
		flag = true;

		if (!a[1].beforeDefaultRemarkPlugins) {
			a[1].beforeDefaultRemarkPlugins = [];
		}

		a[1].beforeDefaultRemarkPlugins.push([remarkTwoslash, options]);
		return a;
	};

	context.siteConfig.presets = context.siteConfig.presets.map((preset) => {
		if (!contains(presets, preset as string)) {
			return preset;
		}

		const output = structure(preset);
		const sections = ['docs', 'blog', 'pages'];
		for (const section of sections) {
			// If the plugin is disabled, keep it disabled

			if (output[1][section] === false) continue;
			if (!output[1][section]) output[1][section] = {};
			addTwoslash(output[1][section]);
		}

		return output;
	});

	context.siteConfig.plugins = context.siteConfig.plugins.map((plugin) => {
		if (
			typeof plugin === 'function' ||
			(Array.isArray(plugin) && typeof plugin[0] === 'function')
		) {
			return plugin;
		}

		if (typeof plugin === 'string') {
			return plugin;
		}

		if (typeof plugin === 'boolean') {
			return plugin;
		}

		if (plugin?.[1]?.id === 'learn' || plugin?.[1]?.id === 'success-stories') {
			return addTwoslashArray(structure(plugin));
		}

		// if the plugin is not supported
		// @ts-expect-error
		if (!contains(plugins, plugin)) {
			return plugin;
		}

		return addTwoslash(structure(plugin));
	});

	if (!flag) {
		throw Error(`
    Couldn't find a preset or a plugin supported by twoslash
    Make sure you installed one of these presets [ ${presets
			.map((p) => p[0])
			.join(', ')} ],
    or one of these plugins [ ${plugins.map((p) => p[0]).join(', ')} ].\n`);
	}

	return {
		themes: [path.resolve(process.cwd(), './docusaurus-theme-shiki-twoslash')],
	};
}
