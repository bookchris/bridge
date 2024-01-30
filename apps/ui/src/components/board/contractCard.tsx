import { Paper, Typography } from "@mui/material";
import { useBoardContext } from "./board";

export function ContractCard() {
  const { handAt, scale } = useBoardContext();
  const contract = handAt.contract.toShortString();
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
      <Typography fontWeight="bold" fontSize="24px">
        {contract}
      </Typography>
    </Paper>
  );
}
