import { eventmit } from "eventmit";

export type AnnotationItem = {
    id: string; // unique id
    start: number;
    end: number;
    onMouseEnter: ({ rectItem }: { rectItem: TextCheckerElementRectItem }) => void;
    onMouseLeave: ({ rectItem }: { rectItem: TextCheckerElementRectItem }) => void;
};
/**
 * RectItem is pixel based
 */
export type TextCheckerElementRectItem = {
    id: AnnotationItem["id"];
    left: number;
    top: number;
    height: number;
    width: number;
    // box
    boxPaddingTop: number;
    boxPaddingBottom: number;
    boxMarginTop: number;
    boxMarginBottom: number;
    boxBorderWidth: number;
    boxAbsoluteX: number;
    boxAbsoluteY: number;
    boxWidth: number;
    boxHeight: number;
};
export type TextCheckerState = {
    visibleTop: number;
    visibleLeft: number;
    visibleWidth: number;
    visibleHeight: number;
    rectItems: TextCheckerElementRectItem[];
    annotationItems: AnnotationItem[];
    mouseHoverRectIdMap: Map<TextCheckerElementRectItem["id"], boolean>;
    highlightRectIdSet: Set<TextCheckerElementRectItem["id"]>;
};
export const createTextCheckerStore = (initialState?: Partial<TextCheckerState>) => {
    let textCheckerState: TextCheckerState = {
        visibleTop: 0,
        visibleLeft: 0,
        visibleWidth: 0,
        visibleHeight: 0,
        rectItems: [],
        annotationItems: [],
        highlightRectIdSet: new Set(),
        mouseHoverRectIdMap: new Map(),
        ...initialState
    };
    const changeEvent = eventmit<void>();
    return {
        get(): TextCheckerState {
            return textCheckerState;
        },
        onChange(handler: () => void) {
            changeEvent.on(handler);
        },
        dispose() {
            changeEvent.offAll();
        },

        highlightRectIndexes(idList: TextCheckerElementRectItem["id"][]) {
            textCheckerState = {
                ...textCheckerState,
                highlightRectIdSet: new Set(idList)
            };
            changeEvent.emit();
        },
        update(state: Partial<TextCheckerState>) {
            textCheckerState = {
                ...textCheckerState,
                ...state
            };
            changeEvent.emit();
        },
        clear() {
            textCheckerState = {
                ...textCheckerState,
                rectItems: [],
                annotationItems: [],
                highlightRectIdSet: new Set(),
                mouseHoverRectIdMap: new Map()
            };
            changeEvent.emit();
        },
        clearHoverState() {
            textCheckerState = {
                ...textCheckerState,
                highlightRectIdSet: new Set(),
                mouseHoverRectIdMap: new Map()
            };
            changeEvent.emit();
        }
    };
};
