import { Card } from "./card";
import { linFromSuit } from "./lin";
import { Vulnerability } from "./vulnerability";

export function benFromVulnerability(vul: Vulnerability): [boolean, boolean] {
  return [
    vul.value === "North / South" || vul.value === "All",
    vul.value === "East / West" || vul.value === "All",
  ];
}

export function benFromCard(card: Card): string {
  return `${linFromSuit(card.suit)}${card.rank}`;
}
