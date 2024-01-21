import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useBoardContext } from "./board";

export function ContractCard() {
  const { hand, handAt } = useBoardContext();
  const contract = hand.contract.toString();
  if (!contract) return <div />;
  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Hand</Typography>
      </Paper>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell>Contract</TableCell>
            <TableCell>{contract}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>N/S</TableCell>
            <TableCell>{handAt.northSouthTricks}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>E/W</TableCell>
            <TableCell>{handAt.eastWestTricks}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}
