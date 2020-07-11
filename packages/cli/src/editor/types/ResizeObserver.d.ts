/**
 * The **ResizeObserver** interface reports changes to the dimensions of an
 * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)'s content
 * or border box, or the bounding box of an
 * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement).
 *
 * > **Note**: The content box is the box in which content can be placed,
 * > meaning the border box minus the padding and border width. The border box
 * > encompasses the content, padding, and border. See
 * > [The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
 * > for further explanation.
 *
 * `ResizeObserver` avoids infinite callback loops and cyclic dependencies that
 * are often created when resizing via a callback function. It does this by only
 * processing elements deeper in the DOM in subsequent frames. Implementations
 * should, if they follow the specification, invoke resize events before paint
 * and after layout.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 */
declare class ResizeObserver {
  /**
   * The **ResizeObserver** constructor creates a new `ResizeObserver` object,
   * which can be used to report changes to the content or border box of an
   * `Element` or the bounding box of an `SVGElement`.
   *
   * @example
   * var ResizeObserver = new ResizeObserver(callback)
   *
   * @param callback
   * The function called whenever an observed resize occurs. The function is
   * called with two parameters:
   * * **entries**
   *   An array of
   *   [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
   *   objects that can be used to access the new dimensions of the element
   *   after each change.
   * * **observer**
   *   A reference to the `ResizeObserver` itself, so it will definitely be
   *   accessible from inside the callback, should you need it. This could be
   *   used for example to automatically unobserve the observer when a certain
   *   condition is reached, but you can omit it if you don't need it.
   *
   * The callback will generally follow a pattern along the lines of:
   * ```js
   * function(entries, observer) {
   *   for (let entry of entries) {
   *     // Do something to each entry
   *     // and possibly something to the observer itself
   *   }
   * }
   * ```
   *
   * The following snippet is taken from the
   * [resize-observer-text.html](https://mdn.github.io/dom-examples/resize-observer/resize-observer-text.html)
   * ([see source](https://github.com/mdn/dom-examples/blob/master/resize-observer/resize-observer-text.html))
   * example:
   * @example
   * const resizeObserver = new ResizeObserver(entries => {
   *   for (let entry of entries) {
   *     if(entry.contentBoxSize) {
   *       h1Elem.style.fontSize = Math.max(1.5, entry.contentBoxSize.inlineSize/200) + 'rem';
   *       pElem.style.fontSize = Math.max(1, entry.contentBoxSize.inlineSize/600) + 'rem';
   *     } else {
   *       h1Elem.style.fontSize = Math.max(1.5, entry.contentRect.width/200) + 'rem';
   *       pElem.style.fontSize = Math.max(1, entry.contentRect.width/600) + 'rem';
   *     }
   *   }
   * });
   *
   * resizeObserver.observe(divElem);
   */
  constructor(callback: ResizeObserverCallback);

  /**
   * The **disconnect()** method of the
   * [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
   * interface unobserves all observed
   * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) or
   * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement)
   * targets.
   */
  disconnect: () => void;

  /**
   * The `observe()` method of the
   * [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
   * interface starts observing the specified
   * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) or
   * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement).
   *
   * @example
   * resizeObserver.observe(target, options);
   *
   * @param target
   * A reference to an
   * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) or
   * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement)
   * to be observed.
   *
   * @param options
   * An options object allowing you to set options for the observation.
   * Currently this only has one possible option that can be set.
   */
  observe: (target: Element, options?: ResizeObserverObserveOptions) => void;

  /**
   * The **unobserve()** method of the
   * [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
   * interface ends the observing of a specified
   * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) or
   * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement).
   */
  unobserve: (target: Element) => void;
}

interface ResizeObserverObserveOptions {
  /**
   * Sets which box model the observer will observe changes to. Possible values
   * are `content-box` (the default), and `border-box`.
   *
   * @default "content-box"
   */
  box?: "content-box" | "border-box";
}

/**
 * The function called whenever an observed resize occurs. The function is
 * called with two parameters:
 *
 * @param entries
 * An array of
 * [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
 * objects that can be used to access the new dimensions of the element after
 * each change.
 *
 * @param observer
 * A reference to the `ResizeObserver` itself, so it will definitely be
 * accessible from inside the callback, should you need it. This could be used
 * for example to automatically unobserve the observer when a certain condition
 * is reached, but you can omit it if you don't need it.
 *
 * The callback will generally follow a pattern along the lines of:
 * @example
 * function(entries, observer) {
 *   for (let entry of entries) {
 *     // Do something to each entry
 *     // and possibly something to the observer itself
 *   }
 * }
 *
 * @example
 * const resizeObserver = new ResizeObserver(entries => {
 *   for (let entry of entries) {
 *     if(entry.contentBoxSize) {
 *       h1Elem.style.fontSize = Math.max(1.5, entry.contentBoxSize.inlineSize/200) + 'rem';
 *       pElem.style.fontSize = Math.max(1, entry.contentBoxSize.inlineSize/600) + 'rem';
 *     } else {
 *       h1Elem.style.fontSize = Math.max(1.5, entry.contentRect.width/200) + 'rem';
 *       pElem.style.fontSize = Math.max(1, entry.contentRect.width/600) + 'rem';
 *     }
 *   }
 * });
 *
 * resizeObserver.observe(divElem);
 */
type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver
) => void;

/**
 * The **ResizeObserverEntry** interface represents the object passed to the
 * [ResizeObserver()](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/ResizeObserver)
 * constructor's callback function, which allows you to access the new
 * dimensions of the
 * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) or
 * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement)
 * being observed.
 */
interface ResizeObserverEntry {
  /**
   * An object containing the new border box size of the observed element when
   * the callback is run.
   */
  readonly borderBoxSize: ResizeObserverEntryBoxSize;

  /**
   * An object containing the new content box size of the observed element when
   * the callback is run.
   */
  readonly contentBoxSize: ResizeObserverEntryBoxSize;

  /**
   * A [DOMRectReadOnly](https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly)
   * object containing the new size of the observed element when the callback is
   * run. Note that this is better supported than the above two properties, but
   * it is left over from an earlier implementation of the Resize Observer API,
   * is still included in the spec for web compat reasons, and may be deprecated
   * in future versions.
   */
  // node_modules/typescript/lib/lib.dom.d.ts
  readonly contentRect: DOMRectReadOnly;

  /**
   * A reference to the
   * [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) or
   * [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement)
   * being observed.
   */
  readonly target: Element;
}

/**
 * The **borderBoxSize** read-only property of the
 * [ResizeObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
 * interface returns an object containing the new border box size of the
 * observed element when the callback is run.
 */
interface ResizeObserverEntryBoxSize {
  /**
   * The length of the observed element's border box in the block dimension. For
   * boxes with a horizontal
   * [writing-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode),
   * this is the vertical dimension, or height; if the writing-mode is vertical,
   * this is the horizontal dimension, or width.
   */
  blockSize: number;

  /**
   * The length of the observed element's border box in the inline dimension.
   * For boxes with a horizontal
   * [writing-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode),
   * this is the horizontal dimension, or width; if the writing-mode is
   * vertical, this is the vertical dimension, or height.
   */
  inlineSize: number;
}

interface Window {
  ResizeObserver: typeof ResizeObserver;
}
