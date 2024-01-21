import { Bid, Suit } from "@bridge/core";
import { Box, Typography } from "@mui/material";

export interface BidTextProps {
  bid: Bid;
}

export const BidText = ({ bid }: BidTextProps) => (
  <Typography variant="inherit">
    {bid.suit ? (
      <>
        {bid.bid[0]}
        <Box component="span" sx={{ color: bidColor(bid.suit) }}>
          {bid.bid.substring(1)}
        </Box>
      </>
    ) : (
      <>{bid.bid}</>
    )}
  </Typography>
);

export function bidColor(suit?: Suit) {
  switch (suit) {
    case Suit.Heart:
      return "red";
    case Suit.Diamond:
      return "orange";
    case Suit.Club:
      return "blue";
    default:
    case Suit.Spade:
      return "black";
  }
}
