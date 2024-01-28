import type { PlasmoCSConfig } from "plasmo";
import { app, auth } from "~firebase";

export const config: PlasmoCSConfig = {
  matches: ["https://www.bridgebase.com/*"],
};

window.addEventListener("load", () => {
  document.body.style.background = "pink";
  console.log("Initialized Firebase!", app);
  console.log("current user", auth.currentUser);
});

interface TextEventDetails {
  text: string;
}

document.addEventListener("hand", (e: Event) => {
  try {
    const textEvent = e as CustomEvent<TextEventDetails>;
    const text = textEvent.detail.text;

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    const linhand = doc.getElementsByTagName("linhand")[0];
    if (linhand) {
      const lin = linhand.innerHTML;
      console.log("got lin", lin);
    }
  } catch (e: unknown) {
    console.error("Error processing hand", e);
  }
});
