import React, {useContext, useLayoutEffect, useMemo} from 'react';
import {
	jsx as reactJsx,
	jsxs as reactJsxs,
	Fragment as ReactFragment,
} from 'react/jsx-runtime';
import {
	TimelineSceneContext,
	TimelineSceneOrderContext,
} from '../timeline-scene-context';
import {TimelineSceneNode} from '../timeline-scene-node';

export type {JSX} from 'react/jsx-runtime';

const SceneText: React.FC<{readonly value: string}> = ({value}) => {
	const parent = useContext(TimelineSceneContext);
	const order = useContext(TimelineSceneOrderContext);
	const node = useMemo(
		() => (parent ? new TimelineSceneNode('#text', parent.store) : null),
		[parent],
	);
	useLayoutEffect(() => {
		if (!node || !parent) return;
		node.parent = parent;
		parent.children.push(node);
		parent.store.invalidate();
		return () => {
			parent.children = parent.children.filter((child) => child !== node);
			node.parent = null;
			parent.store.invalidate();
		};
	}, [node, parent]);
	useLayoutEffect(() => {
		if (node) {
			node.text = value;
			node.order = order;
			node.store.invalidate();
		}
	}, [node, order, value]);
	return parent ? null : value;
};

const SceneChildren: React.FC<{
	readonly children: React.ReactNode;
	readonly staticChildren: boolean;
}> = ({children, staticChildren}) => {
	const parent = useContext(TimelineSceneContext);
	const order = useContext(TimelineSceneOrderContext);
	if (!parent) {
		return (staticChildren ? reactJsxs : reactJsx)(ReactFragment, {children});
	}

	return React.Children.toArray(children).map((child, index) =>
		React.createElement(
			TimelineSceneOrderContext.Provider,
			{
				key: React.isValidElement(child) ? (child.key ?? index) : index,
				value: `${order}/${String(index).padStart(6, '0')}`,
			},
			typeof child === 'string' || typeof child === 'number'
				? React.createElement(SceneText, {value: String(child)})
				: child,
		),
	);
};

const SceneHost: React.FC<{
	readonly tag: keyof React.JSX.IntrinsicElements;
	readonly hostProps: Record<string, unknown>;
	readonly staticChildren: boolean;
}> = ({tag, hostProps, staticChildren}) => {
	const parent = useContext(TimelineSceneContext);
	const order = useContext(TimelineSceneOrderContext);
	const node = useMemo(
		() => (parent ? new TimelineSceneNode(tag, parent.store) : null),
		[parent, tag],
	);
	const ref = hostProps.ref as React.Ref<unknown> | undefined;
	useLayoutEffect(() => {
		if (!parent || !node) return;
		node.parent = parent;
		parent.children.push(node);
		parent.store.invalidate();
		return () => {
			parent.children = parent.children.filter((child) => child !== node);
			node.parent = null;
			parent.store.invalidate();
		};
	}, [node, parent]);
	useLayoutEffect(() => {
		if (!node) return;
		if (node.order !== order) node.store.invalidate();
		node.order = order;
		node.setProps(hostProps);
	}, [hostProps, node, order]);
	useLayoutEffect(() => {
		if (!node || !ref) return;
		const cleanup = typeof ref === 'function' ? ref(node) : undefined;
		if (typeof ref !== 'function') ref.current = node;
		return () => {
			if (typeof cleanup === 'function') cleanup();
			else if (typeof ref === 'function') ref(null);
			else ref.current = null;
		};
	}, [node, ref]);
	useLayoutEffect(() => {
		if (!node || tag !== 'img') return;
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => {
			node.image = image;
			node.store.invalidate();
		};

		image.onerror = () => {
			node.image = null;
			node.store.repaint();
		};

		image.src = String(hostProps.src ?? '');
		return () => {
			image.onload = null;
			image.onerror = null;
			node.image = null;
		};
	}, [hostProps.src, node, tag]);
	if (!parent || !node) {
		return (staticChildren ? reactJsxs : reactJsx)(tag, hostProps);
	}

	if (/^(style|script)$/.test(tag)) return null;
	return React.createElement(
		TimelineSceneContext.Provider,
		{value: node},
		reactJsx(SceneChildren, {staticChildren, children: hostProps.children}),
	);
};

// Only timeline components and their shared controls use this runtime. Outside
// the scene provider they remain normal Studio elements; inside, their hosts
// are retained Pixi layout/input nodes and produce no browser elements.
export const jsx: typeof reactJsx = (type, props, key) =>
	typeof type === 'string'
		? reactJsx(
				SceneHost,
				{tag: type, hostProps: props, staticChildren: false},
				key,
			)
		: reactJsx(
				type === ReactFragment ? SceneChildren : type,
				type === SceneChildren || type === ReactFragment
					? {...(props as Record<string, unknown>), staticChildren: false}
					: props,
				key,
			);
export const jsxs: typeof reactJsxs = (type, props, key) =>
	typeof type === 'string'
		? reactJsxs(
				SceneHost,
				{tag: type, hostProps: props, staticChildren: true},
				key,
			)
		: reactJsxs(
				type === ReactFragment ? SceneChildren : type,
				type === SceneChildren || type === ReactFragment
					? {...(props as Record<string, unknown>), staticChildren: true}
					: props,
				key,
			);
export const Fragment = SceneChildren;
