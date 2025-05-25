import { CreateTableRequest, CreateTableResponse } from "@bridge/api";
import {
  Box,
  Button,
  ButtonProps,
  Card,
  CardContent,
  Typography,
  TypographyProps,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useErrorHandler } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import AuthCheck from "../components/authCheck";
import { CardStack } from "../components/cardStack";
import { HandCard } from "../components/handCard";
import Loading from "../components/loading";
import { TableCard } from "../components/tableCard";
import { functions } from "../lib/firebase";
import { useHandList } from "../lib/hand";
import { useMyTableList } from "../lib/table";
import useCallable from "../lib/useCallable";
import { signIn, useUserContext, useUserId } from "../lib/user";

export default function HomePage() {
  return (
    <Box sx={{ my: 2, mx: 1 }}>
      <QuickPlay />
      <AuthCheck>
        <MyTables />
        <MyHands />
      </AuthCheck>
    </Box>
  );
}

const SectionHeader = ({ sx, ...props }: TypographyProps) => (
  <Typography variant="h5" sx={{ my: 2, ...sx }} {...props} />
);

const QuickPlayButton = ({ sx, ...props }: ButtonProps) => (
  <Button fullWidth variant="outlined" sx={{ p: 5, ...sx }} {...props} />
);

function QuickPlay() {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const notImplemented = () => enqueueSnackbar("Sorry, not implemented yet");

  const [createTable, , error] = useCallable<
    CreateTableRequest,
    CreateTableResponse
  >(functions, "createtable");
  useErrorHandler(error);

  const { user, username } = useUserContext();
  const needLogin = (func: () => void) => {
    return () => {
      if (!user || !username) {
        signIn();
      } else {
        func();
      }
    };
  };

  return (
    <div style={{ flexGrow: 1 }}>
      <SectionHeader>Quick Play</SectionHeader>
      <Card>
        <CardContent>
          <Typography>Play with humans</Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <QuickPlayButton onClick={notImplemented}>
              Start a table
            </QuickPlayButton>
            <QuickPlayButton onClick={() => navigate("/tables")}>
              Join a table
            </QuickPlayButton>
          </Box>
          <Typography sx={{ mt: 2 }}>Play with a robot</Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <QuickPlayButton
              onClick={needLogin(() =>
                createTable({ mode: "solitaire" }).then(({ id }) =>
                  navigate("/tables/" + id),
                ),
              )}
            >
              Just play
            </QuickPlayButton>
            <QuickPlayButton onClick={notImplemented}>
              Daily tournament
            </QuickPlayButton>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

function MyTables() {
  const [tables, , error] = useMyTableList();
  useErrorHandler(error);

  if (!tables) return <Loading />;
  if (!tables.length) return <></>;
  return (
    <div>
      <SectionHeader>Continue your games</SectionHeader>
      <CardStack>
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </CardStack>
    </div>
  );
}

function MyHands() {
  const userId = useUserId();
  if (!userId) throw new Error("missing userId");
  const [hands, , error] = useHandList(userId);
  useErrorHandler(error);

  if (!hands) return <Loading />;
  return (
    <div>
      <SectionHeader>Recent hands</SectionHeader>
      <CardStack>
        {hands.map((hand) => (
          <HandCard key={hand.id} hand={hand} />
        ))}
      </CardStack>
    </div>
  );
}
