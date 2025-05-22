import { Card, Suit } from "@bridge/core";
import { Typography } from "@mui/material";

export interface CardTextProps {
  card: Card;
}

export function CardText({ card }: CardTextProps) {
  return (
    <Typography variant="inherit" sx={{ color: cardColor(card) }}>
      {card.toString()}
    </Typography>
  );
}

export function cardColor(card: Card) {
  switch (card.suit.value) {
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
