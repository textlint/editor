export declare type TextCheckerElementAttributes = {
    target: string;
};
export declare type AnnotationItem = {
    start: number;
    end: number;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};
declare type RectItem = {
    index: number;
    left: number;
    top: number;
    height: number;
    width: number;
};
declare class TextCheckerElement extends HTMLElement implements TextCheckerElementAttributes {
    target: string;
    private annotationBox;
    private targetElement;
    private mouseStateMap;
    private rectItems;
    private annotationItems;
    constructor(args: TextCheckerElementAttributes);
    connectedCallback(): void;
    updateAnnotations(annotationItems: AnnotationItem[]): void;
    renderAnnotationMarkers: ({
        rectItems,
        highlightAnnotationItems
    }: {
        rectItems: RectItem[];
        highlightAnnotationItems?: AnnotationItem[] | undefined;
    }) => void;
    updateAnnotationRectItems: (annotationItems: AnnotationItem[], rectItems: RectItem[]) => void;
    onMouseUpdate: (event: MouseEvent) => void;
}
declare global {
    interface Window {
        CustomElementElement: typeof TextCheckerElement;
    }
}
export { TextCheckerElement };
