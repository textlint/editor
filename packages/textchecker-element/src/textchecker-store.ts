import { eventmit } from "eventmit";

export type AnnotationItem = {
    start: number;
    end: number;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

export type RectItem = { index: number; left: number; top: number; height: number; width: number };
export type TextCheckerState = {
    rectItems: RectItem[];
    annotationItems: AnnotationItem[];
    highlightRectIdSet: Set<RectItem["index"]>;
};
export const createTextCheckerStore = (initialState?: Partial<TextCheckerState>) => {
    let textCheckerState: TextCheckerState = {
        rectItems: [],
        annotationItems: [],
        highlightRectIdSet: new Set(),
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
        highlightRectIndexes(indexes: RectItem["index"][]) {
            textCheckerState = {
                ...textCheckerState,
                highlightRectIdSet: new Set([...textCheckerState.highlightRectIdSet, ...indexes])
            };
            changeEvent.emit();
        },
        update(state: Partial<TextCheckerState>) {
            textCheckerState = {
                ...textCheckerState,
                ...state
            };
            changeEvent.emit();
        }
    };
};
