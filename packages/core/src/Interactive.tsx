import React, {forwardRef, useCallback, useRef} from 'react';
import type {
	JsxComponentIdentity,
	SequenceControls,
} from './CompositionManager.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {
	backgroundSchema,
	baseSchema,
	borderSchema,
	premountSchema,
	sequenceSchema,
	textContentSchema,
	textSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import type {AbsoluteFillLayout, SequenceProps} from './Sequence.js';
import {Sequence} from './Sequence.js';
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
	| 'freeze'
	| 'hidden'
	| 'name'
	| 'showInTimeline'
>;

export type InteractiveTransformProps = Pick<AbsoluteFillLayout, 'style'>;

export type InteractivePremountProps = Pick<
	AbsoluteFillLayout,
	| 'premountFor'
	| 'postmountFor'
	| 'styleWhilePremounted'
	| 'styleWhilePostmounted'
>;

type InteractiveSequenceProps = InteractiveBaseProps & {
	/**
	 * @deprecated For internal use only
	 */
	readonly stack?: string;
};

type InteractiveElementProps<Tag extends InteractiveTag> = Omit<
	React.ComponentPropsWithoutRef<Tag>,
	keyof InteractiveSequenceProps
> &
	InteractiveSequenceProps;

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
	...transformSchema,
} as const satisfies InteractivitySchema;

const interactiveBackgroundElementSchema = {
	...interactiveElementSchema,
	...backgroundSchema,
} as const satisfies InteractivitySchema;

const interactiveBorderElementSchema = {
	...interactiveBackgroundElementSchema,
	...borderSchema,
} as const satisfies InteractivitySchema;

const interactiveTextElementSchema = {
	...interactiveBorderElementSchema,
	...textSchema,
	...textContentSchema,
} as const satisfies InteractivitySchema;

const interactiveSvgTextElementSchema = {
	...interactiveElementSchema,
	...textSchema,
	...textContentSchema,
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

const withSchema = <S extends InteractivitySchema, Props extends object>(
	options: WithInteractivitySchemaOptions<S, Props>,
): React.ComponentType<Props> => {
	const Wrapped = withInteractivitySchema(options);
	addSequenceStackTraces(Wrapped);

	return Wrapped;
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
			trimBefore,
			freeze,
			hidden,
			name,
			showInTimeline,
			stack,
			controls,
			...props
		} = propsWithControls as Props & {
			readonly controls: SequenceControls | undefined;
		};
		const refForOutline = useRef<ElementType | null>(null);
		const callbackRef = useCallback(
			(element: ElementType | null) => {
				refForOutline.current = element;
				setRef(ref, element);
			},
			[ref],
		);

		return (
			<Sequence
				layout="none"
				from={from ?? 0}
				trimBefore={trimBefore}
				durationInFrames={durationInFrames ?? Infinity}
				freeze={freeze}
				hidden={hidden}
				name={name ?? displayName}
				showInTimeline={showInTimeline ?? true}
				controls={controls}
				_remotionInternalStack={stack}
				_remotionInternalDocumentationLink="https://www.remotion.dev/docs/interactive"
				outlineRef={refForOutline}
			>
				{React.createElement(tag, {
					...props,
					ref: callbackRef,
				})}
			</Sequence>
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

const makeInteractiveNonTextElement = <Tag extends InteractiveTag>(
	tag: Tag,
	displayName: string,
) => {
	return makeInteractiveElement(tag, displayName, interactiveElementSchema);
};

/**
 * @description HTML and SVG elements that are registered in the Remotion Studio timeline and can be visually edited.
 */
export const Interactive = {
	baseSchema,
	transformSchema,
	textSchema,
	backgroundSchema,
	borderSchema,
	premountSchema,
	sequenceSchema,
	withSchema,
	_internalMakeRemotionComponentIdentity: makeRemotionComponentIdentity,
	A: makeInteractiveTextElement('a', '<Interactive.A>'),
	Article: makeInteractiveTextElement('article', '<Interactive.Article>'),
	Aside: makeInteractiveTextElement('aside', '<Interactive.Aside>'),
	Button: makeInteractiveTextElement('button', '<Interactive.Button>'),
	Circle: makeInteractiveNonTextElement('circle', '<Interactive.Circle>'),
	Code: makeInteractiveTextElement('code', '<Interactive.Code>'),
	Div: makeInteractiveTextElement('div', '<Interactive.Div>'),
	Ellipse: makeInteractiveNonTextElement('ellipse', '<Interactive.Ellipse>'),
	Em: makeInteractiveTextElement('em', '<Interactive.Em>'),
	Footer: makeInteractiveTextElement('footer', '<Interactive.Footer>'),
	G: makeInteractiveNonTextElement('g', '<Interactive.G>'),
	H1: makeInteractiveTextElement('h1', '<Interactive.H1>'),
	H2: makeInteractiveTextElement('h2', '<Interactive.H2>'),
	H3: makeInteractiveTextElement('h3', '<Interactive.H3>'),
	H4: makeInteractiveTextElement('h4', '<Interactive.H4>'),
	H5: makeInteractiveTextElement('h5', '<Interactive.H5>'),
	H6: makeInteractiveTextElement('h6', '<Interactive.H6>'),
	Header: makeInteractiveTextElement('header', '<Interactive.Header>'),
	Label: makeInteractiveTextElement('label', '<Interactive.Label>'),
	Li: makeInteractiveTextElement('li', '<Interactive.Li>'),
	Line: makeInteractiveNonTextElement('line', '<Interactive.Line>'),
	Main: makeInteractiveTextElement('main', '<Interactive.Main>'),
	Nav: makeInteractiveTextElement('nav', '<Interactive.Nav>'),
	Ol: makeInteractiveTextElement('ol', '<Interactive.Ol>'),
	P: makeInteractiveTextElement('p', '<Interactive.P>'),
	Path: makeInteractiveNonTextElement('path', '<Interactive.Path>'),
	Pre: makeInteractiveTextElement('pre', '<Interactive.Pre>'),
	Rect: makeInteractiveNonTextElement('rect', '<Interactive.Rect>'),
	Section: makeInteractiveTextElement('section', '<Interactive.Section>'),
	Small: makeInteractiveTextElement('small', '<Interactive.Small>'),
	Span: makeInteractiveTextElement('span', '<Interactive.Span>'),
	Strong: makeInteractiveTextElement('strong', '<Interactive.Strong>'),
	Svg: makeInteractiveElement(
		'svg',
		'<Interactive.Svg>',
		interactiveBorderElementSchema,
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
