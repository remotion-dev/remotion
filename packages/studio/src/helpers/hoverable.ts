import type React from 'react';
import {TRANSPARENT} from './colors';

// Purely visual hover styling must be driven by CSS `:hover` rather than
// React state: When the Studio runs in an <iframe> (like in Browser Studio),
// browsers can fail to deliver `pointerleave` when the pointer exits the
// frame, which would leave a state-driven hover background stuck forever.
// CSS `:hover` is maintained by the browser and self-corrects.
// https://github.com/remotion-dev/remotion/issues/9886

export const HOVERABLE_CLASS_NAME = '__remotion-hoverable';
export const HOVER_GROUP_CLASS_NAME = '__remotion-hover-group';
export const HOVER_GROUP_REVEAL_CLASS_NAME = '__remotion-hover-group-reveal';

const BG_VARIABLE = '--remotion-hoverable-bg';
const HOVER_BG_VARIABLE = '--remotion-hoverable-hover-bg';
const COLOR_VARIABLE = '--remotion-hoverable-color';
const HOVER_COLOR_VARIABLE = '--remotion-hoverable-hover-color';

// To disable the hover effect (e.g. for a disabled control), pass the idle
// values as the hover values.
export const hoverableStyle = ({
	idleBackground,
	hoverBackground,
	idleColor,
	hoverColor,
}: {
	idleBackground: string;
	hoverBackground: string;
	idleColor: string;
	hoverColor: string;
}): React.CSSProperties => {
	return {
		[BG_VARIABLE]: idleBackground,
		[HOVER_BG_VARIABLE]: hoverBackground,
		[COLOR_VARIABLE]: idleColor,
		[HOVER_COLOR_VARIABLE]: hoverColor,
	} as React.CSSProperties;
};

// The doubled class names give these rules a higher specificity than the
// `.css-reset, .css-reset *` rule which sets `color` and `background` on
// every descendant - the injection order of the two stylesheets is not
// deterministic.
// The `*` selectors re-establish color inheritance inside the hoverable
// element so that text and `currentColor`-based icons follow the hover state.
const hoverable = `.${HOVERABLE_CLASS_NAME}.${HOVERABLE_CLASS_NAME}`;
const hoverGroup = `.${HOVER_GROUP_CLASS_NAME}`;
const reveal = `.${HOVER_GROUP_REVEAL_CLASS_NAME}.${HOVER_GROUP_REVEAL_CLASS_NAME}`;

export const makeHoverableCSS = () => `
  ${hoverable} {
    background-color: var(${BG_VARIABLE}, ${TRANSPARENT});
  }

  ${hoverable},
  ${hoverable} * {
    color: var(${COLOR_VARIABLE}, inherit);
  }

  @media (hover: hover) {
    ${hoverable}:hover,
    ${hoverGroup}:hover ${hoverable} {
      background-color: var(${HOVER_BG_VARIABLE}, var(${BG_VARIABLE}, ${TRANSPARENT}));
    }

    ${hoverable}:hover,
    ${hoverable}:hover *,
    ${hoverGroup}:hover ${hoverable},
    ${hoverGroup}:hover ${hoverable} * {
      color: var(${HOVER_COLOR_VARIABLE}, var(${COLOR_VARIABLE}, inherit));
    }

    ${hoverGroup} ${reveal} {
      opacity: 0;
    }

    ${hoverGroup}:hover ${reveal} {
      opacity: 1;
    }
  }
`;
