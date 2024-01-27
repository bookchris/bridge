import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://www.bridgebase.com/*"],
};

window.addEventListener("load", () => {
  document.body.style.background = "pink";
});

interface TextEventDetails {
  text: string;
}

document.addEventListener("hand", (e: CustomEvent) => {
  try {
    const detail = e.detail as TextEventDetails;
    const { text } = detail;

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
