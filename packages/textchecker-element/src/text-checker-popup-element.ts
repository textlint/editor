import { html, render } from "lit-html";
import { eventmit } from "eventmit";

export type TextCheckerPopupElementAttributes = {
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

export type TextCheerHandlers = {
    onFixIt?: () => void;
    onIgnore?: () => void;
    onSeeDocument?: () => void;
};
export type TextCheckerPopupState = {
    card?: TextCheckerCard;
    targetRect?: TextCheckerCardRect;
    handlers?: TextCheerHandlers
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
        const shadow = this.attachShadow({mode: "open"});
        const overlay = document.createElement("div");
        overlay.className = "popup";
        const style = document.createElement("style");
        const highLightColor = "#F35373"
        const normalColor = "#9095AA"
        style.textContent = `
:root {
    --highlight-color: #F35373;
}
.popup {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,.2);
  padding: 0; 
}
.popoup-list {
    margin: 0;
    padding: 0 0 var(--padding) 0;
    list-style: none;
}
.popup-listItem {
    padding: var(--padding);
}

.popup-listItem--icon {
    padding-right: 12px; 
    fill: ${normalColor}
}
.popup-listItem:first-child {
    padding-top: var(--padding);
    padding-bottom: var(--padding);
}
.popup-listItem-message {
    font-size: 12px;
    margin: 0;
    padding: 0 0 6px 0;
}
.popup-listItem-content {
    font-size: 16px;
    /* align icon + text */
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
}
.popup-listItem:hover {
    color: #fff;
    background-color: ${highLightColor};
}
.popup-listItem:hover .popup-listItem--icon {
}
`;

        this.overlay = overlay;
        shadow.append(style);
        shadow.append(overlay);
        this.store.onChange(() => {
            this.renderAnnotationMarkers(this.store.get());
        });
    }

    public updateCard({card, rect, handlers}: { card: TextCheckerCard, rect: TextCheckerCardRect; handlers: TextCheerHandlers }) {
        this.store.update({
            card,
            targetRect: rect,
            handlers
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
        const leftPadding = 16;
        const isFixable = true;
        // TODO: more correct handle
        const firstLine = state.card.message.split(/\n/)[0];
        const items = [
            isFixable ? {
                message: firstLine,
                label: "Fix It!",
                onClick: state.handlers?.onFixIt,
                icon: html`<svg class="popup-listItem--icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 5.6L5 7L6.4 4.5L5 2L7.5 3.4L10 2L8.6 4.5L10 7L7.5 5.6ZM19.5 15.4L22 14L20.6 16.5L22 19L19.5 17.6L17 19L18.4 16.5L17 14L19.5 15.4ZM22 2L20.6 4.5L22 7L19.5 5.6L17 7L18.4 4.5L17 2L19.5 3.4L22 2ZM13.34 12.78L15.78 10.34L13.66 8.22L11.22 10.66L13.34 12.78ZM14.37 7.29L16.71 9.63C17.1 10 17.1 10.65 16.71 11.04L5.04 22.71C4.65 23.1 4 23.1 3.63 22.71L1.29 20.37C0.899998 20 0.899998 19.35 1.29 18.96L12.96 7.29C13.35 6.9 14 6.9 14.37 7.29Z" />
</svg>`
            } : {
                message: state.card.message,
            },
            {
                label: "Ignore",
                onClick: state.handlers?.onIgnore,
                icon: html`<svg class="popup-listItem--icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00299 20C5.00299 21.103 5.89999 22 7.00299 22H17.003C18.106 22 19.003 21.103 19.003 20V8H21.003V6H17.003V4C17.003 2.897 16.106 2 15.003 2H9.00299C7.89999 2 7.00299 2.897 7.00299 4V6H3.00299V8H5.00299V20ZM9.00299 4H15.003V6H9.00299V4ZM8.00299 8H17.003L17.004 20H7.00299V8H8.00299Z" fill="#9095AA"/>
<path d="M9.00299 10H11.003V18H9.00299V10ZM13.003 10H15.003V18H13.003V10Z" />
</svg>
`
            },
            {
                label: "See documentation",
                onClick: state.handlers?.onSeeDocument,
                icon: html`<svg class="popup-listItem--icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F4F4F4"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M8.33502 8.33504H5.39325V18.6067H18.6067V8.33504L18.6067 15.665H8.33502V8.33504Z" fill="#878787"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M5.39325 5.39326H18.6067V8.33504H13.4831V18.6067L18.6067 18.6067H5.39325L10.5168 18.6067V8.33504H5.39325V5.39326Z" fill="black"/>
</svg>`
            }
        ]
        const cardContent = html`<ul class="popoup-list" style="--padding: ${leftPadding}px">
${items.map(item => {
            const clickHadnler = {
                handleEvent: item.onClick,
            };
            if (item.message) {
                return html`<li @click=${clickHadnler} class="popup-listItem" style="--padding: ${leftPadding}px"><p class="popup-listItem-message">${item.message}</p>
<p class="popup-listItem-content">${item.icon}${item.label}</p></li>`

            }
            return html`<li @click=${clickHadnler} class="popup-listItem" style="--padding: ${leftPadding}px"><p class="popup-listItem-content">${item.icon}${item.label}</p></li>`
        })}
</ul>`;
        // https://www.figma.com/file/9kRm0Cr869zbdACytRE74R/textlint-editor?node-id=4%3A2
        const style = `position: fixed; z-index: 2147483644; width: ${rect.width}px; min-width: 300px; top: ${rect.top}px; left: ${rect.left - leftPadding}px;`;
        this.overlay.setAttribute("style", style);
        render(cardContent, this.overlay);
    };
}

if (!window.customElements.get("textchecker-popoup-element")) {
    window.customElements.define("textchecker-popoup-element", TextCheckerPopupElement);
}
