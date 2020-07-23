export declare type TextCheckerElementAttributes = {
    target: string;
};
export declare type AnnotationItem = {
    start: number;
    end: number;
    onHover: () => void;
};
declare class TextCheckerElement extends HTMLElement implements TextCheckerElementAttributes {
    target: string;
    private annotationBox;
    private targetElement;
    constructor(args: TextCheckerElementAttributes);
    connectedCallback(): void;
    updateAnnotations(annotations: AnnotationItem[]): void;
}
declare global {
    interface Window {
        CustomElementElement: typeof TextCheckerElement;
    }
}
export { TextCheckerElement };
