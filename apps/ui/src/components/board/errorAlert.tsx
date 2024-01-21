import { Alert } from "@mui/material";

export const ErrorAlert = ({ error }: { error: unknown }) => {
  const message = error instanceof Error ? error.message : String(error);
  return <Alert severity="error">{message}</Alert>;
};
