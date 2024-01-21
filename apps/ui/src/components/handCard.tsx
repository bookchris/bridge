import {
  Box,
  Card,
  CardProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StoredHand } from "../../functions/storage/hand";
import { MiniBoard } from "./board/board";

export interface HandCardProps extends CardProps {
  hand: StoredHand;
}

export function HandCard({ hand, ...cardProps }: HandCardProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Card sx={{ p: 1, ...cardProps.sx }}>
      <Box sx={{ display: "flex" }}>
        {sm && (
          <MiniBoard
            hand={hand}
            onClick={() => navigate("/hands/" + hand.id)}
          />
        )}
        <Box sx={{ display: "flex", flexDirection: "column", p: 1 }}>
          <Typography variant="h6">{hand.players.join(", ")}</Typography>
        </Box>
      </Box>
    </Card>
  );
}
