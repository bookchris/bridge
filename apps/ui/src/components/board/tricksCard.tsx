import { Box, Paper, Typography } from "@mui/material";
import { useBoardContext } from "./board";

const length = "100px";
const width = "50px";

export function TricksCard() {
  const { handAt, scale } = useBoardContext();
  const contract = handAt.contract.toShortString();
  if (!contract) return <div />;
  return (
    <Box
      sx={{
        position: "absolute",
        zIndex: 1,
        display: "flex",
        flexDireciton: "column",
        alignItems: "center",
        right: "1%",
        top: "1%",
        transform: `scale(${scale})`,
      }}
    >
      <Box sx={{ position: "relative", width: length, height: length }}>
        <Paper
          sx={{
            position: "absolute",
            bottom: "0%",
            right: "0%",
            width: length,
            height: width,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box width="50%" />
          <Typography
            component="div"
            fontWeight="bold"
            fontSize="20px"
            width="50%"
            textAlign="center"
          >
            {handAt.eastWestTricks}
          </Typography>
        </Paper>
        <Paper
          sx={{
            position: "absolute",
            width: width,
            height: length,
            top: "0%",
            left: "0%",
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
          }}
        >
          <Box
            height="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography fontWeight="bold" fontSize="20px">
              {handAt.northSouthTricks}
            </Typography>
          </Box>
          <Box height="50%" />
        </Paper>
      </Box>
    </Box>
  );
}
