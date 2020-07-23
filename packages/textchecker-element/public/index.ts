import { TextCheckerElement } from "../src/textchecker-element";
import { TextCheckerPopupElement } from "../src/text-checker-popup-element";

const targetElement = document.querySelector("#js-target") as HTMLTextAreaElement;
const textChecker = new TextCheckerElement({
    targetElement: targetElement
});
const textCheckerPopup = new TextCheckerPopupElement();
targetElement.before(textChecker);
document.body.append(textCheckerPopup);
let count = 0;
setInterval(() => {
    const card = {
        id: "card-id",
        message: "Hello!"
    };

    textChecker.updateAnnotations([
        {
            start: 0,
            end: count++,
            onMouseEnter: ({ rectItem }) => {
                console.log("enteR", count);
                const boundingClientRect = targetElement.getBoundingClientRect();
                textCheckerPopup.updateCard(card, {
                    index: rectItem.index,
                    top: boundingClientRect.y + rectItem.top + rectItem.height,
                    left: boundingClientRect.x + rectItem.left,
                    width: rectItem.width,
                    height: rectItem.height
                });
            },
            onMouseLeave() {
                console.log("leave", count);
                textCheckerPopup.dismissCard(card);
            }
        }
    ]);
}, 1000);
