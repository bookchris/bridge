import { Hand, Seat, Trick } from "@bridge/core";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
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
        <TableHead>
          <TableRow>
            <TableCell align="center">West</TableCell>
            <TableCell align="center">North</TableCell>
            <TableCell align="center">East</TableCell>
            <TableCell align="center">South</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tricks.map((trick, i) => {
            const cols = trick.cards.map((card, j) => (
              <TableCell
                key={card.id}
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
            ));
            cols.push(
              ...Array(cols.length === 4 ? 0 : 1).fill(
                <TableCell
                  key="blank"
                  sx={{
                    backgroundColor:
                      i * 4 + cols.length === highlighted
                        ? "grey.300"
                        : undefined,
                  }}
                >
                  &nbsp;
                </TableCell>
              )
            );
            cols.push(
              ...Array(4 - cols.length).map((_, i) => (
                <TableCell key={"fill" + i}>&nbsp;</TableCell>
              ))
            );
            let player = Seat.West;
            while (player != trick.leader) {
              cols.unshift(cols.pop()!);
              player = player.next();
            }
            return <TableRow key={i}>{cols}</TableRow>;
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
