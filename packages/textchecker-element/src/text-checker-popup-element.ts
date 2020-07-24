import { html, render } from "lit-html";
import { eventmit } from "eventmit";

export type TextCheckerElementAttributes = {
    target?: HTMLElement;
};
export type TextCheckerCard = {
    id: string;
    message: string;
};
export type TextCheckerCardRect = {
    left: number;
    top: number;
    width: number;
    height?: number;
};

type TextCheckerPopupState = {
    card?: TextCheckerCard;
    targetRect?: TextCheckerCardRect;
};
const createTextCheckerPopupState = (state?: Partial<TextCheckerPopupState>) => {
    let currentState: TextCheckerPopupState = {
        ...state
    };
    const changeEvent = eventmit<void>();
    return {
        get(): TextCheckerPopupState {
            return currentState;
        },
        onChange(handler: () => void) {
            changeEvent.on(handler);
        },
        dispose() {
            changeEvent.offAll();
        },
        update(state: Partial<TextCheckerPopupState>) {
            currentState = {
                ...currentState,
                ...state
            };
            changeEvent.emit();
        },
        removeCartById(cardId: TextCheckerCard["id"]) {
            if (currentState?.card?.id !== cardId) {
                return;
            }
            currentState = {
                ...currentState,
                card: undefined
            };
            changeEvent.emit();
        }
    };
};

export class TextCheckerPopupElement extends HTMLElement {
    private overlay!: HTMLDivElement;
    private store: ReturnType<typeof createTextCheckerPopupState>;

    constructor() {
        super();
        this.store = createTextCheckerPopupState();
    }

    connectedCallback(): void {
        const shadow = this.attachShadow({ mode: "open" });
        const overlay = document.createElement("div");
        overlay.className = "popup";
        const style = document.createElement("style");
        style.textContent = `
.popup {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,.2);
  padding: 0 0.2rem; 
}
`;

        this.overlay = overlay;
        shadow.append(style);
        shadow.append(overlay);
        this.store.onChange(() => {
            this.renderAnnotationMarkers(this.store.get());
        });
    }

    public updateCard(card: TextCheckerCard, rect: TextCheckerCardRect) {
        this.store.update({
            card,
            targetRect: rect
        });
    }

    public dismissCard(card: TextCheckerCard) {
        this.store.removeCartById(card.id);
    }

    private renderAnnotationMarkers = (state: TextCheckerPopupState) => {
        const rect = state.targetRect;
        if (!rect) {
            return;
        }
        if (!state.card) {
            render("", this.overlay);
            return;
        }
        const cardContent = html`<h1>${state.card.message}</h1>`;
        const style = `position: fixed; z-index: 2147483644; width: ${rect.width}px; min-width: 300px; top: ${rect.top}px; left: ${rect.left}px;`;
        this.overlay.setAttribute("style", style);
        render(cardContent, this.overlay);
    };
}

if (!window.customElements.get("textchecker-popoup-element")) {
    window.customElements.define("textchecker-popoup-element", TextCheckerPopupElement);
}
