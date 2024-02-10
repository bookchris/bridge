import { Seat } from "@bridge/core";
import { StoredHand } from "@bridge/storage";
import {
  Box,
  Card,
  CardProps,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDdsMax } from "../lib/useDds";
import { MiniBoard } from "./board/board";
import { useNavigateToHand } from "./board/position";
import { ResultText } from "./board/resultText";

export interface HandCardProps extends CardProps {
  hand: StoredHand;
}

export function HandCard({ hand, ...cardProps }: HandCardProps) {
  const navigateToHand = useNavigateToHand();
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up("sm"));

  const position = hand.bidding.length;
  const handAt = hand.atPosition(position);

  const seatString = (seat?: Seat) => {
    const name = seat ? hand.getSeatPlayer(seat) || seat.toString() : "";
    return name.startsWith("~M") ? "Robot" : name;
  };

  const ddsMax = useDdsMax(handAt);
  return (
    <Card sx={{ p: 1, ...cardProps.sx }}>
      <Box sx={{ display: "flex" }}>
        {sm && (
          <MiniBoard
            hand={handAt}
            onClick={() => navigateToHand(hand, position)}
          />
        )}
        <Stack sx={{ p: 1 }}>
          <Typography variant="h6">
            Declaring: {seatString(hand.contract.declarer)}
          </Typography>
          <Typography variant="h6">
            {hand.contract.toString()}
            <ResultText result={hand.result} />
          </Typography>
          {ddsMax !== undefined && (
            <Typography variant="h6">
              DDS: <ResultText result={ddsMax} />
            </Typography>
          )}
          <Box flexGrow={1} />
          <Typography variant="h6">
            Dummy: {seatString(hand.contract.declarer?.partner())}
          </Typography>
        </Stack>
        <Box flexGrow={1} />
        <Stack sx={{ p: 1, alignContent: "right" }}>
          <Typography variant="h6">
            Defending: {seatString(hand.contract.declarer?.next())}
          </Typography>
          <Box flexGrow={1} />
          <Typography variant="h6">
            Defending: {seatString(hand.contract.declarer?.next().partner())}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}
