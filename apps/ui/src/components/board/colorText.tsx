import { Suit } from "@bridge/core";
import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface ColorTextProps {
  suit?: Suit;
  children: ReactNode;
}

export function ColorText({ suit, children }: ColorTextProps) {
  const color = suit ? suitColor(suit) : undefined;
  return (
    <Typography variant="inherit" sx={{ color }}>
      {children}
    </Typography>
  );
}

export function suitColor(suit: Suit) {
  switch (suit.value) {
    case Suit.Heart.value:
      return "red";
    case Suit.Diamond.value:
      return "orange";
    case Suit.Club.value:
      return "blue";
    default:
    case Suit.Spade.value:
      return "black";
  }
}
