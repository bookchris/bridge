import { Trick as CoreTrick, Hand, Seat } from "@bridge/core";
import { Box, Fade } from "@mui/material";
import { forwardRef } from "react";
import { SwitchTransition } from "react-transition-group";
import { PlayingCard } from "./card";

export interface TrickProps {
  hand: Hand;
}

export function Trick({ hand }: TrickProps) {
  const tricks = hand.tricks;
  const trick = tricks.length ? tricks[tricks.length - 1] : undefined;

  if (!trick) return <></>;
  return (
    <SwitchTransition>
      <Fade
        key={tricks.length - 1}
        enter={false}
        //addEndListener={(node, done) =>
        //          node.addEventListener("transitionend", done, false)
        //}
        timeout={1000}
      >
        <OneTrick trick={trick} />
      </Fade>
    </SwitchTransition>
  );
}

const OneTrick = forwardRef<HTMLDivElement, { trick: CoreTrick }>(
  ({ trick, ...props }, ref) => {
    const seatSxProps = {
      [Seat.West.toString()]: {
        left: "50%",
        top: "50%",
        transform: "translate(-90%, -45%)",
      },
      [Seat.North.toString()]: {
        top: "50%",
        left: "50%",
        transform: "translate(-53%, -80%)",
      },
      [Seat.East.toString()]: {
        top: "50%",
        left: "50%",
        transform: "translate(-10%, -55%)",
      },
      [Seat.South.toString()]: {
        top: "50%",
        left: "50%",
        transform: "translate(-47%, -20%)",
      },
    };
    return (
      <Box ref={ref} {...props}>
        {trick?.cards.map((card, i) => (
          <PlayingCard
            faceUp
            key={card.id}
            card={card}
            sx={{
              position: "absolute",
              ...seatSxProps[trick.leader.next(i).toString()],
            }}
          />
        ))}
      </Box>
    );
  }
);
OneTrick.displayName = "OneTrick";
