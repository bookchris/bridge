import { Paper, Typography } from "@mui/material";
import { useBoardContext } from "./board";
import { suitColor } from "./colorText";

export function ContractCard() {
  const { handAt, scale } = useBoardContext();
  const contract = handAt.contract;
  if (!contract) return <div />;
  return (
    <Paper
      sx={{
        position: "absolute",
        zIndex: 1,
        display: "flex",
        flexDireciton: "column",
        alignItems: "center",
        left: "1%",
        top: "1%",
        transform: `scale(${scale})`,
        p: 2,
      }}
    >
      <Typography
        fontWeight="bold"
        fontSize="24px"
        sx={{ color: suitColor(contract.suit) }}
      >
        {contract.value}
      </Typography>
    </Paper>
  );
}
