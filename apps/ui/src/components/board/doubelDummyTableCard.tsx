import { AllSuits, Hand, Seat } from "@bridge/core";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { DoubleDummyTableAndPar, useDds } from "../../lib/useDds";

export interface PlayProps {
  hand: Hand;
}

export function DoubleDummyTableCard({ hand }: PlayProps) {
  const dds = useDds();
  const [tableAndPar, setTableAndPar] = useState<DoubleDummyTableAndPar>();
  useEffect(() => {
    dds.ddsCalcTable(hand).then(setTableAndPar);
  }, [hand]);

  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Contracts</Typography>
      </Paper>
      {!!tableAndPar && (
        <>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell />
                {AllSuits.map((suit, i) => (
                  <TableCell key={i}>{suit.toString()}</TableCell>
                ))}
              </TableRow>
              {[Seat.North, Seat.South, Seat.East, Seat.West].map((seat, i) => (
                <TableRow key={i}>
                  <TableCell>{seat.toChar()}</TableCell>
                  {AllSuits.map((suit, i) => (
                    <TableCell key={i}>
                      {tableAndPar.table[suit.value][seat.toChar()]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* <Typography sx={{ width: "100%", textAlign: "center", m: 1 }}>
            Par: {tableAndPar.par.score}{" "}
            {tableAndPar.par.contracts.map((contract, i) => (
              <Fragment key={i}>
                <br />
                {contract}
              </Fragment>
            ))}
          </Typography> */}
        </>
      )}
    </Paper>
  );
}
