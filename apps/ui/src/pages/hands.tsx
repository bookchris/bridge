import { Alert } from "@mui/material";
import { useErrorHandler } from "react-error-boundary";
import AuthCheck from "../components/authCheck";
import { CardStack } from "../components/cardStack";
import { HandCard } from "../components/handCard";
import Loading from "../components/loading";
import { useHandList } from "../lib/hand";
import { useUserId } from "../lib/user";

export default function HandsPage() {
  return (
    <AuthCheck>
      <HandList />
    </AuthCheck>
  );
}

function HandList() {
  const userId = useUserId();
  const [hands, loading, error] = useHandList(userId!);
  useErrorHandler(error);

  if (loading) return <Loading />;
  if (!hands) {
    return <Alert severity="error">You have no played hands</Alert>;
  }
  return (
    <CardStack>
      {hands.map((hand) => (
        <HandCard key={hand.id} hand={hand} />
      ))}
    </CardStack>
  );
}
