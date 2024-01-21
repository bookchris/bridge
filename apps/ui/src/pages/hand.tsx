import { Alert } from "@mui/material";
import { useErrorHandler } from "react-error-boundary";
import { useParams } from "react-router-dom";
import { Board } from "../components/board/board";
import Loading from "../components/loading";
import { useHand } from "../lib/hand";

export default function HandPage() {
  const { handId } = useParams();
  if (!handId) throw new Error("handId not set");

  const [hand, loading, error] = useHand(handId);
  useErrorHandler(error);

  if (loading) return <Loading />;
  if (!hand) return <Alert severity="error">hand ${handId} not found</Alert>;
  return <Board hand={hand} />;
}
