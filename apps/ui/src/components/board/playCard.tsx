import { Hand, Trick } from "@bridge/core";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useBoardContext } from "./board";
import { CardText } from "./cardText";

export interface PlayProps {
  hand: Hand;
  position: number;
}

export function Play({ hand, position }: PlayProps) {
  const { setPosition } = useBoardContext();

  const highlighted = position - hand.bidding.length;
  const tricks = [...hand.tricks];
  const trump = hand.contract.suitBid?.suit;
  if (!trump) throw new Error("expected contract with suit");
  const openingLeader = hand.openingLeader;
  if (!openingLeader) throw new Error("expected opening leader");

  if (hand.isPlaying) {
    if (hand.tricks.length === 0) {
      tricks.push(new Trick(openingLeader, [], trump));
    } else {
      const winningSeat = hand.tricks[hand.tricks.length - 1].winningSeat;
      if (winningSeat) {
        tricks.push(new Trick(winningSeat, [], trump));
      }
    }
  }

  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Play</Typography>
      </Paper>
      <Table size="small">
        <TableBody>
          {tricks.map((trick, i) => (
            <TableRow key={i}>
              <TableCell align="left" sx={{ display: "flex", gap: 1 }}>
                <Box sx={{ width: "50%" }}>{i + 1}</Box>
                <Box sx={{ width: "50%" }}>{trick.leader.toChar()}</Box>
              </TableCell>
              {trick.cards.map((card, j) => (
                <TableCell
                  key={card.value}
                  onClick={() => setPosition(i * 4 + j + hand.bidding.length)}
                  align="center"
                  sx={{
                    backgroundColor:
                      i * 4 + j === highlighted ? "grey.300" : undefined,
                    cursor: "pointer",
                  }}
                >
                  <CardText card={card} />
                </TableCell>
              ))}
              {Array(4 - trick.cards.length)
                .fill(0)
                .map((_, i) => (
                  <TableCell key={"fill" + i}>&nbsp;</TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
