import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://www.bridgebase.com/*"],
  world: "MAIN",
};

const XHR = XMLHttpRequest.prototype;

const open = XHR.open;
const send = XHR.send;
const setRequestHeader = XHR.setRequestHeader;

XHR.open = function () {
  this._requestHeaders = {};

  return open.apply(this, arguments);
};

XHR.setRequestHeader = function (header, value) {
  this._requestHeaders[header] = value;
  return setRequestHeader.apply(this, arguments);
};

XHR.send = function () {
  const rules = {
    apps: [
      {
        urlPattern: /https:\/\/webutil\.bridgebase\.com\/v2\/mh_hand.php/,
        eventName: "hand",
      },
    ],
  };
  this.addEventListener("load", function () {
    try {
      for (const { urlPattern, eventName } of rules.apps) {
        const url = this.responseURL;
        if (!urlPattern.test(url)) {
          continue;
        }
        if (this.responseType == "text") {
          document.dispatchEvent(
            new CustomEvent(eventName, { detail: { text: this.responseText } })
          );
        }
      }
    } catch (e: unknown) {
      console.error("Error processing response", e);
    }
  });
  return send.apply(this, arguments);
};
