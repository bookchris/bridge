import { Stack, StackProps } from "@mui/material";

export const CardStack = ({ sx, ...props }: StackProps) => (
  <Stack sx={{ gap: 2, ...sx }} {...props} />
);
