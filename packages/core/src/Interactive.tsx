import React, {forwardRef, useCallback, useContext} from 'react';
import {resolveComponentIdentity} from './component-identity.js';
import type {
	JsxComponentIdentity,
	SequenceControls,
} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {Freeze} from './freeze.js';
import {
	backgroundSchema,
	baseSchema,
	borderRadiusSchema,
	borderSchema,
	captionsSchema,
	childrenSchema,
	cropSchema,
	premountSchema,
	sequenceSchema,
	svgPaintSchema,
	svgStrokeSchema,
	textSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import {resolveSequenceDuration} from './resolve-sequence-duration.js';
import type {AbsoluteFillLayout, SequenceProps} from './Sequence.js';
import {Sequence, SequenceWithoutSchema} from './Sequence.js';
import {useCropStyle} from './use-crop-style.js';
import {usePremounting} from './use-premounting.js';
import {
	withInteractivitySchema,
	type WithInteractivitySchemaOptions,
} from './with-interactivity-schema.js';

type InteractiveHtmlTag =
	| 'a'
	| 'article'
	| 'aside'
	| 'button'
	| 'code'
	| 'div'
	| 'em'
	| 'footer'
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'h5'
	| 'h6'
	| 'header'
	| 'label'
	| 'li'
	| 'main'
	| 'nav'
	| 'ol'
	| 'p'
	| 'pre'
	| 'section'
	| 'small'
	| 'span'
	| 'strong'
	| 'ul';

type InteractiveSvgTag =
	| 'circle'
	| 'ellipse'
	| 'g'
	| 'line'
	| 'path'
	| 'rect'
	| 'svg'
	| 'text';

type InteractiveTag = InteractiveHtmlTag | InteractiveSvgTag;

type ElementForTag<Tag extends InteractiveTag> =
	Tag extends keyof HTMLElementTagNameMap
		? HTMLElementTagNameMap[Tag]
		: Tag extends keyof SVGElementTagNameMap
			? SVGElementTagNameMap[Tag]
			: Element;

export type InteractiveBaseProps = Pick<
	SequenceProps,
	| 'durationInFrames'
	| 'from'
	| 'trimBefore'
	| 'playbackRate'
	| 'loop'
	| 'freeze'
	| 'hidden'
	| 'name'
	| 'showInTimeline'
>;

export type InteractiveTransformProps = Pick<AbsoluteFillLayout, 'style'>;

export type InteractiveCropProps = Pick<
	SequenceProps,
	'cropLeft' | 'cropRight' | 'cropTop' | 'cropBottom'
>;

export type InteractivePremountProps = Pick<
	AbsoluteFillLayout,
	| 'premountFor'
	| 'postmountFor'
	| 'styleWhilePremounted'
	| 'styleWhilePostmounted'
>;

type InteractiveManagedProps = InteractiveBaseProps &
	InteractiveCropProps &
	InteractivePremountProps;

type InteractiveElementProps<Tag extends InteractiveTag> = Omit<
	React.ComponentPropsWithoutRef<Tag>,
	keyof InteractiveManagedProps
> &
	InteractiveManagedProps;

type InteractiveElementComponent<Tag extends InteractiveTag> =
	React.ComponentType<
		InteractiveElementProps<Tag> & React.RefAttributes<ElementForTag<Tag>>
	>;

type RemotionComponentIdentityPackage = 'remotion' | `@remotion/${string}`;

const sourcePathToIdentityPrefix = (
	packageName: RemotionComponentIdentityPackage,
): string => {
	if (packageName === 'remotion') {
		return 'dev.remotion.remotion';
	}

	if (packageName.startsWith('@remotion/')) {
		const normalizedPackageName = packageName
			.slice('@remotion/'.length)
			.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
		return `dev.remotion.${normalizedPackageName}`;
	}

	throw new Error(`Unsupported Remotion package name: ${packageName}`);
};

const makeRemotionComponentIdentity = ({
	packageName,
	componentName,
}: {
	readonly packageName: RemotionComponentIdentityPackage;
	readonly componentName: string;
}): JsxComponentIdentity => {
	return `${sourcePathToIdentityPrefix(packageName)}.${componentName}`;
};

const interactiveElementSchema = {
	...baseSchema,
	...premountSchema,
	...transformSchema,
	...cropSchema,
} as const satisfies InteractivitySchema;

const interactiveBackgroundElementSchema = {
	...interactiveElementSchema,
	...backgroundSchema,
} as const satisfies InteractivitySchema;

const interactiveBorderElementSchema = {
	...interactiveBackgroundElementSchema,
	...borderSchema,
	...borderRadiusSchema,
} as const satisfies InteractivitySchema;

const interactiveTextElementSchema = {
	...interactiveBorderElementSchema,
	...textSchema,
	...childrenSchema,
} as const satisfies InteractivitySchema;

const interactiveSvgTextElementSchema = {
	...interactiveElementSchema,
	...svgPaintSchema,
	...textSchema,
	...childrenSchema,
} as const satisfies InteractivitySchema;

const interactiveSvgElementSchema = {
	...interactiveElementSchema,
	...svgPaintSchema,
} as const satisfies InteractivitySchema;

const interactiveSvgPathElementSchema = {
	...interactiveSvgElementSchema,
	d: {
		type: 'svg-path',
		default: undefined,
		description: 'Path',
		keyframable: true,
	},
} as const satisfies InteractivitySchema;

const interactiveSvgStrokeElementSchema = {
	...interactiveElementSchema,
	...svgStrokeSchema,
} as const satisfies InteractivitySchema;

const interactiveSvgRootElementSchema = {
	...interactiveBorderElementSchema,
	...svgPaintSchema,
} as const satisfies InteractivitySchema;

const setRef = <ElementType,>(
	ref: React.ForwardedRef<ElementType>,
	value: ElementType | null,
) => {
	if (typeof ref === 'function') {
		ref(value);
	} else if (ref) {
		ref.current = value;
	}
};

type NonIntrinsicComponent<Component extends React.ElementType> = Component &
	React.ComponentType<React.ComponentProps<Component>>;

type KeysOfUnion<Props> = Props extends unknown ? keyof Props : never;

type ComponentWithoutReservedProps<
	Component extends React.ElementType,
	ReservedKey extends PropertyKey,
> = NonIntrinsicComponent<Component> &
	(Extract<
		KeysOfUnion<React.ComponentPropsWithoutRef<Component>>,
		ReservedKey
	> extends never
		? unknown
		: never);

type WithSchemaReservedKey =
	| keyof InteractiveBaseProps
	| keyof InteractiveCropProps
	| keyof InteractivePremountProps
	| 'controls';

type IsAny<Value> = 0 extends 1 & Value ? true : false;

type StyleMemberAcceptsCssProperties<Style> =
	IsAny<Style> extends true
		? true
		: Style extends unknown
			? [Style] extends [null | undefined]
				? false
				: Exclude<keyof React.CSSProperties, keyof Style> extends never
					? React.CSSProperties extends Style
						? true
						: false
					: false
			: never;

type StyleAcceptsCssProperties<Style> =
	true extends StyleMemberAcceptsCssProperties<Style> ? true : false;

type PropsBranchAcceptsStyle<Props> = Props extends unknown
	? 'style' extends keyof Props
		? StyleAcceptsCssProperties<Props[Extract<'style', keyof Props>]>
		: false
	: never;

type EveryPropsBranchAcceptsStyle<Props> = [Props] extends [never]
	? false
	: false extends PropsBranchAcceptsStyle<Props>
		? false
		: true;

type ComponentAcceptingStyle<
	Component extends React.ElementType,
	ReservedKey extends PropertyKey,
> = ComponentWithoutReservedProps<Component, ReservedKey> &
	(EveryPropsBranchAcceptsStyle<
		React.ComponentPropsWithoutRef<Component>
	> extends true
		? unknown
		: never);

type WithSchema = {
	<S extends InteractivitySchema, Component extends React.ElementType>(
		options: Omit<
			WithInteractivitySchemaOptions<
				S,
				React.ComponentPropsWithoutRef<Component>
			>,
			'Component' | 'supportsEffects'
		> & {
			readonly Component: ComponentWithoutReservedProps<
				Component,
				WithSchemaReservedKey | 'style' | 'width' | 'height'
			>;
			readonly wrapInSequence: true;
			readonly layout: 'absolute-fill';
		},
	): React.FC<
		React.ComponentPropsWithoutRef<Component> &
			InteractiveBaseProps &
			InteractivePremountProps &
			InteractiveCropProps &
			InteractiveTransformProps &
			Pick<SequenceProps, 'width' | 'height'> & {
				readonly ref?: React.Ref<HTMLDivElement>;
			}
	>;
	<S extends InteractivitySchema, Component extends React.ElementType>(
		options: Omit<
			WithInteractivitySchemaOptions<
				S,
				React.ComponentPropsWithoutRef<Component>
			>,
			'Component' | 'supportsEffects'
		> & {
			readonly Component: ComponentAcceptingStyle<
				Component,
				WithSchemaReservedKey
			>;
			readonly wrapInSequence: true;
			readonly layout?: 'none';
		},
	): React.FC<
		React.ComponentPropsWithRef<Component> &
			InteractiveBaseProps &
			InteractivePremountProps &
			InteractiveCropProps
	>;
	<S extends InteractivitySchema, Props extends object>(
		options: WithInteractivitySchemaOptions<S, Props> & {
			readonly wrapInSequence?: false;
			readonly layout?: never;
		},
	): React.ComponentType<Props>;
};

type WithSchemaImplementationOptions = Omit<
	WithInteractivitySchemaOptions<InteractivitySchema, object>,
	'Component' | 'supportsEffects'
> & {
	readonly Component: React.ComponentType<object>;
	readonly supportsEffects?: boolean;
	readonly wrapInSequence?: false | true;
	readonly layout?: 'none' | 'absolute-fill';
};

const withSchema: WithSchema = (untypedOptions: unknown) => {
	const options = untypedOptions as WithSchemaImplementationOptions;
	if (!options.wrapInSequence) {
		const LegacyWrapped = withInteractivitySchema(
			options as WithInteractivitySchemaOptions<InteractivitySchema, object>,
		);
		addSequenceStackTraces(LegacyWrapped);

		return LegacyWrapped as React.FC<
			React.ComponentProps<typeof LegacyWrapped>
		>;
	}

	const {
		Component,
		componentName,
		schema,
		wrapInSequence: _,
		layout = 'none',
		...rest
	} = options;
	type ComponentWrappedInSequenceProps = React.ComponentProps<
		typeof Component
	> &
		InteractiveBaseProps &
		InteractivePremountProps &
		InteractiveCropProps &
		Pick<SequenceProps, 'width' | 'height'> & {
			readonly controls: SequenceControls | undefined;
		};
	const ComponentWrappedInSequence = forwardRef<
		unknown,
		ComponentWrappedInSequenceProps
	>((props, ref) => {
		const {canvasContent, compositions} = useContext(CompositionManager);
		// The render callback runs after the exported wrapper has been initialized.
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const componentIdentity = resolveComponentIdentity(Wrapped);
		const isCurrentComposition = compositions.some(
			(composition) =>
				canvasContent?.type === 'composition' &&
				composition.id === canvasContent.compositionId &&
				composition.componentFromProps === componentIdentity,
		);
		const {width, height, ...propsWithoutDimensions} = props;
		const {
			durationInFrames,
			from,
			trimBefore,
			playbackRate,
			loop,
			freeze,
			hidden,
			name,
			showInTimeline,
			controls,
			premountFor,
			postmountFor,
			styleWhilePremounted,
			styleWhilePostmounted,
			...componentProps
		} = layout === 'absolute-fill' ? propsWithoutDimensions : props;
		const {
			cropLeft,
			cropRight,
			cropTop,
			cropBottom,
			style,
			...componentPropsWithoutCropping
		} = componentProps as InteractiveCropProps & {
			readonly style?: React.CSSProperties;
			readonly [key: string]: unknown;
		};
		const {
			effectivePremountFor,
			effectivePostmountFor,
			freezeFrame,
			isPremountingOrPostmounting,
			premountingActive,
			postmountingActive,
			premountingStyle,
		} = usePremounting({
			from: from ?? 0,
			durationInFrames: resolveSequenceDuration({
				durationInFrames,
				playbackRate,
				loop,
			}),
			premountFor: premountFor ?? null,
			postmountFor: postmountFor ?? null,
			style: style ?? null,
			styleWhilePremounted: styleWhilePremounted ?? null,
			styleWhilePostmounted: styleWhilePostmounted ?? null,
			hideWhilePremounted: 'opacity',
		});
		const croppedStyle = useCropStyle({
			cropLeft,
			cropRight,
			cropTop,
			cropBottom,
			style: premountingStyle,
			componentName,
		});

		return (
			<Freeze frame={freezeFrame} active={isPremountingOrPostmounting}>
				<SequenceWithoutSchema
					_remotionInternalSingleChildComponent={
						isCurrentComposition ? null : componentIdentity
					}
					layout={layout}
					{...(layout === 'absolute-fill'
						? {
								width,
								height,
								style: {overflow: 'hidden', ...croppedStyle},
								ref: ref as React.ForwardedRef<HTMLDivElement>,
							}
						: {})}
					durationInFrames={durationInFrames}
					from={from}
					trimBefore={trimBefore}
					playbackRate={playbackRate}
					loop={loop}
					freeze={freeze}
					hidden={hidden}
					name={name ?? componentName}
					_remotionInternalDocumentationLink="https://www.remotion.dev/docs/interactive-with-schema"
					showInTimeline={isCurrentComposition ? false : showInTimeline}
					controls={controls}
					_remotionInternalPremountDisplay={effectivePremountFor || null}
					_remotionInternalPostmountDisplay={effectivePostmountFor || null}
					_remotionInternalIsPremounting={premountingActive}
					_remotionInternalIsPostmounting={postmountingActive}
				>
					{React.createElement(Component, {
						...componentPropsWithoutCropping,
						...(layout === 'none'
							? {style: croppedStyle ?? undefined, ref}
							: {}),
					} as React.ComponentProps<typeof Component>)}
				</SequenceWithoutSchema>
			</Freeze>
		);
	});
	const Wrapped = withInteractivitySchema({
		...rest,
		Component: ComponentWrappedInSequence,
		componentName,
		schema: {
			...schema,
			...transformSchema,
			...baseSchema,
			...premountSchema,
			...cropSchema,
		},
		supportsEffects: false,
	});
	addSequenceStackTraces(Wrapped);

	return Wrapped as React.FC<
		React.ComponentProps<typeof Component> &
			InteractiveBaseProps &
			InteractivePremountProps &
			InteractiveCropProps
	>;
};

const makeInteractiveElement = <Tag extends InteractiveTag>(
	tag: Tag,
	displayName: string,
	schema: InteractivitySchema,
): InteractiveElementComponent<Tag> => {
	type ElementType = ElementForTag<Tag>;
	type Props = InteractiveElementProps<Tag>;

	const Inner = forwardRef<
		ElementType,
		Props & {
			readonly controls: SequenceControls | undefined;
		}
	>((propsWithControls, ref) => {
		const {
			durationInFrames,
			from,
			premountFor,
			postmountFor,
			styleWhilePremounted,
			styleWhilePostmounted,
			trimBefore,
			playbackRate,
			loop,
			freeze,
			hidden,
			name,
			showInTimeline,
			controls,
			cropLeft,
			cropRight,
			cropTop,
			cropBottom,
			style,
			...props
		} = propsWithControls as Props & {
			readonly controls: SequenceControls | undefined;
		};

		const {
			effectivePremountFor,
			effectivePostmountFor,
			freezeFrame,
			isPremountingOrPostmounting,
			premountingActive,
			postmountingActive,
			premountingStyle,
		} = usePremounting({
			from: from ?? 0,
			durationInFrames: resolveSequenceDuration({
				durationInFrames,
				playbackRate,
				loop,
			}),
			premountFor: premountFor ?? null,
			postmountFor: postmountFor ?? null,
			style: style ?? null,
			styleWhilePremounted: styleWhilePremounted ?? null,
			styleWhilePostmounted: styleWhilePostmounted ?? null,
			hideWhilePremounted: 'opacity',
		});
		const croppedStyle = useCropStyle({
			cropLeft,
			cropRight,
			cropTop,
			cropBottom,
			style: premountingStyle,
			componentName: displayName,
		});
		const callbackRef = useCallback(
			(element: ElementType | null) => {
				setRef(ref, element);
			},
			[ref],
		);

		return (
			<Freeze
				frame={freezeFrame}
				active={isPremountingOrPostmounting}
				_remotionInternalIsPremounting={premountingActive}
			>
				<Sequence
					layout="none"
					from={from ?? 0}
					trimBefore={trimBefore}
					playbackRate={playbackRate}
					loop={loop}
					durationInFrames={durationInFrames}
					freeze={freeze}
					hidden={hidden}
					name={name ?? displayName}
					showInTimeline={showInTimeline ?? true}
					controls={controls}
					_remotionInternalDocumentationLink="https://www.remotion.dev/docs/interactive"
					_remotionInternalPremountDisplay={effectivePremountFor || null}
					_remotionInternalPostmountDisplay={effectivePostmountFor || null}
					_remotionInternalIsPremounting={premountingActive}
					_remotionInternalIsPostmounting={postmountingActive}
				>
					{React.createElement(tag, {
						...props,
						style: croppedStyle ?? undefined,
						ref: callbackRef,
					})}
				</Sequence>
			</Freeze>
		);
	});

	Inner.displayName = displayName;

	const Wrapped = withSchema({
		Component: Inner,
		componentName: displayName,
		componentIdentity: makeRemotionComponentIdentity({
			packageName: 'remotion',
			componentName: displayName.slice(1, -1),
		}),
		schema,
		supportsEffects: false,
	}) as InteractiveElementComponent<Tag>;

	Wrapped.displayName = displayName;

	return Wrapped;
};

const makeInteractiveTextElement = <Tag extends InteractiveTag>(
	tag: Tag,
	displayName: string,
) => {
	return makeInteractiveElement(tag, displayName, interactiveTextElementSchema);
};

const makeInteractiveSvgElement = <Tag extends InteractiveSvgTag>(
	tag: Tag,
	displayName: string,
) => {
	return makeInteractiveElement(tag, displayName, interactiveSvgElementSchema);
};

const makeInteractiveSvgStrokeElement = <Tag extends InteractiveSvgTag>(
	tag: Tag,
	displayName: string,
) => {
	return makeInteractiveElement(
		tag,
		displayName,
		interactiveSvgStrokeElementSchema,
	);
};

/**
 * @description HTML and SVG elements that are registered in the Remotion Studio timeline and can be visually edited.
 */
export const Interactive = {
	baseSchema,
	captionsSchema,
	childrenSchema,
	transformSchema,
	textSchema,
	backgroundSchema,
	borderSchema,
	borderRadiusSchema,
	cropSchema,
	svgPaintSchema,
	svgStrokeSchema,
	premountSchema,
	sequenceSchema,
	withSchema,
	_internalMakeRemotionComponentIdentity: makeRemotionComponentIdentity,
	A: makeInteractiveTextElement('a', '<Interactive.A>'),
	Article: makeInteractiveTextElement('article', '<Interactive.Article>'),
	Aside: makeInteractiveTextElement('aside', '<Interactive.Aside>'),
	Button: makeInteractiveTextElement('button', '<Interactive.Button>'),
	Circle: makeInteractiveSvgElement('circle', '<Interactive.Circle>'),
	Code: makeInteractiveTextElement('code', '<Interactive.Code>'),
	Div: makeInteractiveTextElement('div', '<Interactive.Div>'),
	Ellipse: makeInteractiveSvgElement('ellipse', '<Interactive.Ellipse>'),
	Em: makeInteractiveTextElement('em', '<Interactive.Em>'),
	Footer: makeInteractiveTextElement('footer', '<Interactive.Footer>'),
	G: makeInteractiveSvgElement('g', '<Interactive.G>'),
	H1: makeInteractiveTextElement('h1', '<Interactive.H1>'),
	H2: makeInteractiveTextElement('h2', '<Interactive.H2>'),
	H3: makeInteractiveTextElement('h3', '<Interactive.H3>'),
	H4: makeInteractiveTextElement('h4', '<Interactive.H4>'),
	H5: makeInteractiveTextElement('h5', '<Interactive.H5>'),
	H6: makeInteractiveTextElement('h6', '<Interactive.H6>'),
	Header: makeInteractiveTextElement('header', '<Interactive.Header>'),
	Label: makeInteractiveTextElement('label', '<Interactive.Label>'),
	Li: makeInteractiveTextElement('li', '<Interactive.Li>'),
	Line: makeInteractiveSvgStrokeElement('line', '<Interactive.Line>'),
	Main: makeInteractiveTextElement('main', '<Interactive.Main>'),
	Nav: makeInteractiveTextElement('nav', '<Interactive.Nav>'),
	Ol: makeInteractiveTextElement('ol', '<Interactive.Ol>'),
	P: makeInteractiveTextElement('p', '<Interactive.P>'),
	Path: makeInteractiveElement(
		'path',
		'<Interactive.Path>',
		interactiveSvgPathElementSchema,
	),
	Pre: makeInteractiveTextElement('pre', '<Interactive.Pre>'),
	Rect: makeInteractiveSvgElement('rect', '<Interactive.Rect>'),
	Section: makeInteractiveTextElement('section', '<Interactive.Section>'),
	Small: makeInteractiveTextElement('small', '<Interactive.Small>'),
	Span: makeInteractiveTextElement('span', '<Interactive.Span>'),
	Strong: makeInteractiveTextElement('strong', '<Interactive.Strong>'),
	Svg: makeInteractiveElement(
		'svg',
		'<Interactive.Svg>',
		interactiveSvgRootElementSchema,
	),
	Text: makeInteractiveElement(
		'text',
		'<Interactive.Text>',
		interactiveSvgTextElementSchema,
	),
	Ul: makeInteractiveTextElement('ul', '<Interactive.Ul>'),
};

export type InteractiveProps<Tag extends InteractiveTag> =
	InteractiveElementProps<Tag>;
