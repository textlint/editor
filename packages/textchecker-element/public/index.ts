import { TextCheckerElement } from "../src/textchecker-element";

const target = document.querySelector("#js-target");
const textChecker = new TextCheckerElement({
    target: "#js-target"
});
target.before(textChecker);
let count = 0;
setInterval(() => {
    textChecker.updateAnnotations([
        {
            start: 0,
            end: count++,
            onMouseEnter: () => {
                console.log("enteR", count);
            },
            onMouseLeave() {
                console.log("leave", count);
            }
        }
    ]);
}, 1000);
