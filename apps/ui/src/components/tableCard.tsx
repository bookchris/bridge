import {
  Box,
  Card,
  CardProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Table } from "../lib/table";
import { MiniBoard } from "./board/board";

export interface TableCardProps extends CardProps {
  table: Table;
}

export function TableCard({ table, ...cardProps }: TableCardProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Card sx={{ p: 1, ...cardProps.sx }}>
      <Box sx={{ display: "flex" }}>
        {sm && (
          <MiniBoard
            live
            hand={table}
            onClick={() => navigate("/tables/" + table.id)}
          />
        )}
        <Box sx={{ display: "flex", flexDirection: "column", p: 1 }}>
          <Typography variant="h6">{table.uids.join(", ")}</Typography>
        </Box>
      </Box>
    </Card>
  );
}
