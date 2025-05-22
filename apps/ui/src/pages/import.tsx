import { ImportHandRequest, ImportHandResponse } from "@bridge/api";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCheck from "../components/authCheck";
import { functions } from "../lib/firebase";
import useCallable from "../lib/useCallable";

export default function ImportPage() {
  return (
    <AuthCheck>
      <ImportHand />
    </AuthCheck>
  );
}
function ImportHand() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const [run, inProgress, error] = useCallable<
    ImportHandRequest,
    ImportHandResponse
  >(functions, "importHand");
  return (
    <div>
      <Typography paragraph variant="h3">
        Import a Game
      </Typography>
      {error && (
        <Alert severity="error">{error.message || "unknown error"}</Alert>
      )}
      <Typography paragraph>Paste a BBO handviewer URL</Typography>
      <TextField
        fullWidth
        multiline
        rows="5"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Box sx={{ display: "flex", justifyContent: "right", mt: 1 }}>
        <Button
          disabled={!input || inProgress}
          onClick={
            //() => Hand.fromLin(input)
            () => run({ input }).then(({ id }) => navigate("/hands/" + id))
          }
        >
          Import
        </Button>
      </Box>
    </div>
  );
}
