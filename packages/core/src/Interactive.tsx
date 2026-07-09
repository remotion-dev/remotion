import React, {forwardRef, useCallback, useRef} from 'react';
import type {SequenceControls} from './CompositionManager.js';
import {addSequenceStackTraces} from './enable-sequence-stack-traces.js';
import {
	baseSchema,
	premountSchema,
	sequenceSchema,
	textContentSchema,
	textSchema,
	transformSchema,
	type InteractivitySchema,
} from './interactivity-schema.js';
import type {AbsoluteFillLayout, SequenceProps} from './Sequence.js';
import {Sequence} from './Sequence.js';
import {withInteractivitySchema} from './with-interactivity-schema.js';

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

const interactiveElementSchema = {
	...baseSchema,
	...transformSchema,
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

const makeInteractiveElement = <Tag extends InteractiveTag>(
	tag: Tag,
	displayName: string,
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

	const Wrapped = withInteractivitySchema({
		Component: Inner,
		componentName: displayName,
		componentIdentity: `dev.remotion.remotion.${displayName.slice(1, -1)}`,
		schema: interactiveElementSchema,
		supportsEffects: false,
	}) as InteractiveElementComponent<Tag>;

	Wrapped.displayName = displayName;
	addSequenceStackTraces(Wrapped);

	return Wrapped;
};

/**
 * @description HTML and SVG elements that are registered in the Remotion Studio timeline and can be visually edited.
 */
export const Interactive = {
	baseSchema,
	transformSchema,
	textSchema,
	premountSchema,
	sequenceSchema,
	withSchema: withInteractivitySchema,
	A: makeInteractiveElement('a', '<Interactive.A>'),
	Article: makeInteractiveElement('article', '<Interactive.Article>'),
	Aside: makeInteractiveElement('aside', '<Interactive.Aside>'),
	Button: makeInteractiveElement('button', '<Interactive.Button>'),
	Circle: makeInteractiveElement('circle', '<Interactive.Circle>'),
	Code: makeInteractiveElement('code', '<Interactive.Code>'),
	Div: makeInteractiveElement('div', '<Interactive.Div>'),
	Ellipse: makeInteractiveElement('ellipse', '<Interactive.Ellipse>'),
	Em: makeInteractiveElement('em', '<Interactive.Em>'),
	Footer: makeInteractiveElement('footer', '<Interactive.Footer>'),
	G: makeInteractiveElement('g', '<Interactive.G>'),
	H1: makeInteractiveElement('h1', '<Interactive.H1>'),
	H2: makeInteractiveElement('h2', '<Interactive.H2>'),
	H3: makeInteractiveElement('h3', '<Interactive.H3>'),
	H4: makeInteractiveElement('h4', '<Interactive.H4>'),
	H5: makeInteractiveElement('h5', '<Interactive.H5>'),
	H6: makeInteractiveElement('h6', '<Interactive.H6>'),
	Header: makeInteractiveElement('header', '<Interactive.Header>'),
	Label: makeInteractiveElement('label', '<Interactive.Label>'),
	Li: makeInteractiveElement('li', '<Interactive.Li>'),
	Line: makeInteractiveElement('line', '<Interactive.Line>'),
	Main: makeInteractiveElement('main', '<Interactive.Main>'),
	Nav: makeInteractiveElement('nav', '<Interactive.Nav>'),
	Ol: makeInteractiveElement('ol', '<Interactive.Ol>'),
	P: makeInteractiveElement('p', '<Interactive.P>'),
	Path: makeInteractiveElement('path', '<Interactive.Path>'),
	Pre: makeInteractiveElement('pre', '<Interactive.Pre>'),
	Rect: makeInteractiveElement('rect', '<Interactive.Rect>'),
	Section: makeInteractiveElement('section', '<Interactive.Section>'),
	Small: makeInteractiveElement('small', '<Interactive.Small>'),
	Span: makeInteractiveElement('span', '<Interactive.Span>'),
	Strong: makeInteractiveElement('strong', '<Interactive.Strong>'),
	Svg: makeInteractiveElement('svg', '<Interactive.Svg>'),
	Text: makeInteractiveElement('text', '<Interactive.Text>'),
	Ul: makeInteractiveElement('ul', '<Interactive.Ul>'),
};

export type InteractiveProps<Tag extends InteractiveTag> =
	InteractiveElementProps<Tag>;
