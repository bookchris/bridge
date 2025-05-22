import { Hand, Seat } from "@bridge/core";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { BidText } from "./bidText";
import { useBoardContext } from "./board";
import { TableRowGrouper } from "./tableRowGrouper";

export interface BiddingProps {
  hand: Hand;
  position: number;
  seat?: Seat;
}

export function BiddingCard({ hand, seat, position }: BiddingProps) {
  const { setPosition } = useBoardContext();

  const viewer = Seat.South;
  const dealer = hand.dealer;

  const bids = [] as ReactNode[];
  let pos = viewer.next();
  while (!pos.equals(dealer)) {
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

  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Bidding</Typography>
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
          <TableRowGrouper>{bids}</TableRowGrouper>
        </TableBody>
      </Table>
    </Paper>
  );
}
