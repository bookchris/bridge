import { Hand } from "@bridge/core";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useBoardContext } from "./board";
import { cardColor } from "./cardText";

export interface LinesProps {
  hand: Hand;
  position: number;
}

export function LinesCard({ hand, position }: LinesProps) {
  const { setPosition } = useBoardContext();

  const highlighted = position - hand.bidding.length;
  const tricks = [...hand.tricks];
  const trump = hand.contract.suitBid?.suit;
  if (!trump) throw new Error("expected contract with suit");
  const openingLeader = hand.openingLeader;
  if (!openingLeader) throw new Error("expected opening leader");

  /*

  const viewer = Seat.South;
  const dealer = hand.dealer;

  const bids = [] as ReactNode[];
  let pos = viewer.next();
  while (pos != dealer) {
    pos = pos.next();
    bids.push(<TableCell key={"empty" + pos} />);
  }
  hand.bidding.forEach((bid, i) => {
    bids.push(
      <TableCell
        onClick={() => setPosition(i)}
        key={"bid" + i}
        align="center"
        sx={{
          backgroundColor: i === position ? "grey.300" : undefined,
          cursor: "pointer",
        }}
      >
        <BidText bid={bid} />
      </TableCell>
    );
  });
  if (hand.isBidding) {
    bids.push(
      <TableCell
        key="next"
        onClick={() => setPosition(hand.positions)}
        sx={{
          backgroundColor: position === hand.positions ? "grey.300" : undefined,
          cursor: "pointer",
        }}
      >
        &nbsp;
      </TableCell>
    );
  }
  */

  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Lines</Typography>
      </Paper>
      <Stack sx={{ display: "flex", p: 1, gap: 1 }}>
        {tricks.map((trick, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-end" }}>
            <Typography variant="subtitle2">
              {i + 1}.{trick.leader.toChar()}.&nbsp;
            </Typography>
            {trick.cards.map((card, j) => (
              <Typography
                key={card.id}
                sx={{ mr: 1, color: cardColor(card) }}
                //onClick={() => setPosition(i * 4 + j + hand.bidding.length)}
              >
                {card.toString()}
              </Typography>
            ))}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
