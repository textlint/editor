/**
 * optional settings for calculating the coordinates
 */
declare interface CaretOptions {
    /**
     * show shadow DIV that is used for calculating the caret coordinates; this will also include the created DIV in the coordinates-object in property `_div`
     *
     * (DEFAULT: false)
     */
    debug?: boolean;
    /**
     * reuse shadow DIV that is used for calculating the caret coordinates
     *
     * (DEFAULT: false)
     */
    reuse?: boolean;
    /**
     * if reuse was enabled, returns the shadow DIV in the coordinates-object in property `_div`
     *
     * (DEFAULT: false)
     */
    returnDiv?: boolean;
    /**
     * returns the caret offset height instead of the computed `lineHeight` in the returned
     * coordinates-object in property `height`
     *
     * (DEFAULT: false)
     */
    returnHeight?: boolean;
    /**
     * the id attribute for the shadow DIV
     *
     * (DEFAULT: "input-textarea-caret-position-mirror-div")
     */
    id?: string;
    /**
     * if TRUE, styling of the shadow DIV is not updated, if the current target element has the same type (Tag Name) as the previous one.
     * If function: a callback for determining, if the shadow DIV's style should be updated (return TRUE, if it should get updated): `callback(shadowDiv) : boolean`
     * NOTE this option is only relevant, if "reuse" is TRUE.
     *
     * (DEFAULT: false)
     */
    guessIfUpdateStyle?: boolean | ((fauxDiv: HTMLElement) => boolean);
    /**
     * force updating the style of the shadow DIV; only relevant, if "reuse" is TRUE
     *
     * (DEFAULT: false)
     */
    forceUpdateStyle?: boolean;
    /**
     * force faux span to use "cleared" style (e.g. in case SPAN is globally styled)
     *
     * (DEFAULT: false)
     */
    forceClearFauxStyle?: boolean;
    /**
     * use ID for faux span (e.g. for styling faux span)
     *
     * (DEFAULT: undefined)
     */
    fauxId?: string;
    /**
     * apply zoom factor to font-size.
     * If `true` (boolean) the zoom factor will be calculated using `measureFontZoom()`, and the option-value
     * (`true`) will be replaced with the measured zoom factor.
     *
     * (DEFAULT: undefined)
     */
    fontZoom?: number | boolean;
    /**
     * if TRUE, allows text-wrapping for INPUT elements
     *
     * Note: the W3C specifically states that text in INPUT will not be wrapped, even if styles would "request" it,
     *       like "word-wrap: break-word" or "word-break: break-all | break-word" or similar
     *
     * (DEFAULT: false)
     */
    allowInputWrap?: boolean;
    /**
     * transfers additional styles properties from the target element to the shadow DIV
     */
    additionalStyles?: Array<string>;
    /**
     * transfers additional (node) attributes from the target element to the shadow DIV
     *
     * (DEFAULT: undefined)
     */
    additionalAttributes?: Array<string>;
    /**
     * the text value that should be used for the calculation.
     *
     * If function: a callback which's return value is used as the text: `callback(element, options) : string`
     *
     * (DEFAULT: undefined)
     */
    text?: string | ((element: HTMLElement, options: CaretOptions) => string);
}

export interface CaretPosition {
    top: number;
    left: number;
    height: number;
    _div?: HTMLElement;
}

/**
 * create faux DIV
 * @param [options] additional options
 */
export function createDiv(options?: CaretOptions): void;

/**
 * calculate a "font zoom": zoom that is applied "by the environment" and not set by the CSS/HTML itself
 * (e.g. some Android variants allow setting a font zoom in the system settings).
 * If not "font zoom" is detected, returns `1` by default (i.e. no scaling).
 * @return the font zoom
 */
export function measureFontZoom(): number;
/**
 * apply styling of the target-element to the faux-DIV for accurately calculating the coordinates
 * @param element the target element (textarea or input)
 * @param position the character/text index, i.e. position for which the coordinates should be calculated
 * @param div the faux DIV for calculating the coordinates
 * @param [options] additional options
 */
export function styleDiv(
    element: HTMLInputElement | HTMLTextAreaElement,
    position: number,
    div: HTMLElement,
    options?: CaretOptions
): void;

/**
 * reset styling for faux DIV, i.e. force re-styling for next calculation (only relevant if DIV is reused)
 */
export function resetStyleDiv(): void;

/**
 * reset/remove faux DIV, if reuse or debug was enabled
 *
 * NOTE if faux DIV was created with custom `options.id`,
 *      then the options-argument must contain the same `id`
 *      (otherwise this call will have not effect)
 * @param [options] additional options
 */
export function resetDiv(options?: CaretOptions): void;

/**
 * recalulate the coordinates (e.g. due to changed text) without re-styling the faux DIV
 *
 * @param element the target element (textarea or input)
 * @param position the character/text index, i.e. position for which the coordinates should be calculated
 * @param div the faux DIV for calculating the coordinates
 * @param [options] additional options
 */
export function updateCoordinates(
    element: HTMLInputElement | HTMLTextAreaElement,
    position: number,
    div: HTMLElement,
    options?: CaretOptions
): CaretPosition;

/**
 * get coordinates in the target `element` for the text `position` (i.e. index in string)
 *
 * @param element the target element (textarea or input)
 * @param position the character/text index, i.e. position for which the coordinates should be calculated
 * @param [options] additional options
 */
export function getCoordinates(
    element: HTMLInputElement | HTMLTextAreaElement,
    position: number,
    options?: CaretOptions
): CaretPosition;
