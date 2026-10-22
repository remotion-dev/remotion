import {NoReactInternals} from 'remotion/no-react';
import type {CodemodValue} from './codemod-value';

export type CodemodElementChild = CodemodElement | string;

export type CodemodElementOptions = {
	component: string;
	importPath?: string | null;
	importName?: string | null;
	props?: Record<string, CodemodValue>;
	children?: readonly (CodemodElement | CodemodElementOptions | string)[];
};

const componentRegex = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/;
const importedComponentRegex = /^[A-Z_$][\w$]*$/;
const propNameRegex = /^[A-Za-z_$][\w$-]*(:[A-Za-z_$][\w$-]*)?$/;

const isCodemodValue = (value: unknown): value is CodemodValue => {
	if (
		value === null ||
		typeof value === 'string' ||
		typeof value === 'boolean' ||
		(typeof value === 'number' && Number.isFinite(value))
	) {
		return true;
	}

	if (Array.isArray(value)) {
		return value.every(isCodemodValue);
	}

	return (
		typeof value === 'object' &&
		Object.getPrototypeOf(value) === Object.prototype &&
		Object.values(value).every(isCodemodValue)
	);
};

/**
 * Describes a JSX element to insert into source code.
 * Instances are immutable: every method returns a new element and leaves the
 * original untouched, so an element can be reused as a template.
 * `JSON.stringify()` produces a plain description that `createElement()`
 * accepts again.
 */
export class CodemodElement {
	readonly component: string;
	readonly importPath: string | null;
	readonly importName: string | null;
	readonly props: Readonly<Record<string, CodemodValue>>;
	readonly children: readonly CodemodElementChild[];

	constructor({
		component,
		importPath = null,
		importName = null,
		props = {},
		children = [],
	}: CodemodElementOptions) {
		if (typeof component !== 'string' || !componentRegex.test(component)) {
			throw new Error(
				`${JSON.stringify(component)} is not a valid JSX tag name. Use a component such as "Solid", a member expression such as "Interactive.Div" or an HTML tag such as "div"`,
			);
		}

		if (importPath !== null) {
			if (typeof importPath !== 'string' || importPath.trim() === '') {
				throw new Error('importPath must be a non-empty module specifier');
			}

			if (!importedComponentRegex.test(component.split('.')[0])) {
				throw new Error(
					`Imported components must start with an uppercase letter, _ or $. Omit importPath to use the HTML tag "${component}"`,
				);
			}
		}

		if (importName !== null) {
			if (importPath === null) {
				throw new Error('importName requires an importPath');
			}

			if (
				typeof importName !== 'string' ||
				!importedComponentRegex.test(importName)
			) {
				throw new Error(
					`${JSON.stringify(importName)} is not a valid named export to import`,
				);
			}
		}

		for (const [name, value] of Object.entries(props)) {
			if (!propNameRegex.test(name)) {
				throw new Error(`"${name}" is not a valid JSX prop name`);
			}

			if (!isCodemodValue(value)) {
				throw new Error(
					`The value of prop "${name}" must be a string, finite number, boolean, null, array or plain object`,
				);
			}
		}

		this.component = component;
		this.importPath = importPath;
		this.importName = importName;
		this.props = {...props};
		this.children = children.map((child) => {
			if (typeof child === 'string' || child instanceof CodemodElement) {
				return child;
			}

			if (typeof child === 'object' && child !== null) {
				return new CodemodElement(child);
			}

			throw new Error(
				'Children must be strings, element descriptions or elements created with createElement()',
			);
		});
	}

	/** Returns a copy with the prop set to the value. */
	withProp(name: string, value: CodemodValue): CodemodElement {
		return this.withProps({[name]: value});
	}

	/** Returns a copy with the props merged into the existing props. */
	withProps(props: Record<string, CodemodValue>): CodemodElement {
		return new CodemodElement({
			component: this.component,
			importPath: this.importPath,
			importName: this.importName,
			props: {...this.props, ...props},
			children: this.children,
		});
	}

	/** Returns a copy without the prop. */
	withoutProp(name: string): CodemodElement {
		return new CodemodElement({
			component: this.component,
			importPath: this.importPath,
			importName: this.importName,
			props: Object.fromEntries(
				Object.entries(this.props).filter(([key]) => key !== name),
			),
			children: this.children,
		});
	}

	/** Returns a copy with the child appended after the existing children. */
	withChild(child: CodemodElement | CodemodElementOptions | string) {
		return this.withChildren([...this.children, child]);
	}

	/** Returns a copy whose children are replaced. */
	withChildren(
		children: readonly (CodemodElement | CodemodElementOptions | string)[],
	): CodemodElement {
		return new CodemodElement({
			component: this.component,
			importPath: this.importPath,
			importName: this.importName,
			props: this.props,
			children,
		});
	}
}

export const createElement = (options: CodemodElementOptions): CodemodElement =>
	new CodemodElement(options);

/**
 * Returns a value that is written as `staticFile(path)` when inserted into
 * source code. Pass it as a prop value to `createElement()` or
 * `updateNodeProps()`.
 */
export const staticFileValue = (path: string): string => {
	if (typeof path !== 'string' || path === '' || path.includes('\\')) {
		throw new Error(
			'staticFileValue() expects a path relative to the public folder',
		);
	}

	return `${NoReactInternals.FILE_TOKEN}${path
		.split('/')
		.map(encodeURIComponent)
		.join('/')}`;
};
