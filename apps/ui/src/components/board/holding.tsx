import { Card, Seat } from "@bridge/core";
import { Box } from "@mui/material";
import { useCallback } from "react";
import { Solution } from "../../lib/useDds";
import { useBoardContext } from "./board";
import { PlayingCard } from "./card";
import { useTableContext } from "./table";

export interface HoldingProps {
  seat: Seat;
  nextCard?: Card;
  dds?: Solution;
}

export function Holding({ seat, nextCard, dds }: HoldingProps) {
  const { width, hand, handAt, live, variation, setVariation } =
    useBoardContext();
  const { play, playingAs } = useTableContext();
  const margin = width / 13;
  const cards = handAt.getHolding(seat);

  const isPlayer = playingAs === seat;
  const isDummy = handAt.isDummy(seat);

  const onClick = useCallback((card: Card) => {
    if (play) {
      play(card);
    } else {
      setVariation((list) => [...list, card]);
    }
  }, []);

  const paperSx = {
    [Seat.West.toString()]: {
      left: "1%",
      top: "50%",
      transform: "rotate(270deg) translate(-50%)",
      transformOrigin: "top left",
    },
    [Seat.North.toString()]: {
      top: "1%",
      left: "50%",
      transform: "translate(-50%)",
    },
    [Seat.East.toString()]: {
      right: "1%",
      top: "50%",
      transform: "rotate(90deg) translate(50%)",
      transformOrigin: "top right",
    },
    [Seat.South.toString()]: {
      bottom: "1%",
      left: "50%",
      transform: "translate(-50%)",
    },
  }[seat.toString()];

  return (
    <Box sx={{ display: "flex", position: "absolute", zIndex: 1, ...paperSx }}>
      <Box sx={{ mr: `${margin}px` }} />
      {cards?.map((card) => (
        <PlayingCard
          dds={dds?.[card.value]}
          selected={nextCard?.value === card.value}
          enabled={
            !live
              ? handAt.canPlay(card)
              : playingAs && handAt.canPlay(card, playingAs)
          }
          faceUp={!live || isPlayer || isDummy}
          key={card.value}
          card={card}
          onClick={() => onClick(card)}
          sx={{ ml: `-${margin}px` }}
        />
      ))}
    </Box>
  );
}
