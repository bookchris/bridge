import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { auth, firestore } from "../lib/firebase";
import { signIn, useUserContext } from "../lib/user";

export const Avatar = () => {
  const { user, username, creating } = useUserContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  if (!user) {
    return (
      <Button color="inherit" onClick={signIn}>
        Login
      </Button>
    );
  }
  return (
    <>
      {username && (
        <Button
          color="inherit"
          endIcon={<Icon>arrow_drop_down</Icon>}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {username}
        </Button>
      )}
      <UserMenu anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
      <CreateUserDialog open={!!creating} />
    </>
  );
};

function UserMenu({
  anchorEl,
  setAnchorEl,
}: {
  anchorEl: HTMLElement | undefined;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | undefined>>;
}) {
  return (
    <Menu
      id="profile-menu"
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={() => setAnchorEl(undefined)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem
        onClick={() => {
          setAnchorEl(undefined);
          auth.signOut();
        }}
      >
        Logout
      </MenuItem>
    </Menu>
  );
}

function CreateUserDialog({ open }: { open: boolean }) {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useUserContext();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) throw new Error("Expected a valid user");
    const userDoc = doc(firestore, `users/${user.uid}`);
    const usernameDoc = doc(firestore, `usernames/${value}`);

    // Commit both docs together as a batch write.
    const batch = writeBatch(firestore);
    batch.set(userDoc, {
      username: value,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  const valueRef = useRef<string>();
  useEffect(() => {
    valueRef.current = value;
    if (value.length >= 3) {
      const ref = doc(firestore, `usernames/${value}`);
      getDoc(ref).then((doc) => {
        if (valueRef.current === value) {
          setIsValid(!doc.exists());
          setLoading(false);
        }
      });
    }
  }, [value]);

  let errorText = "";
  let helperText = "";
  if (loading) {
    helperText = "Checking...";
  } else if (value.length >= 3) {
    if (isValid) {
      helperText = `${value} is available!`;
    } else if (value && !isValid) {
      errorText = "That username is taken!";
    }
  }

  return (
    <Dialog open={open}>
      <form onSubmit={onSubmit}>
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose the name to represent you on the site.
          </DialogContentText>

          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="name"
            label="Username"
            type="username"
            variant="standard"
            value={value}
            onChange={onChange}
            helperText={helperText || errorText}
            error={!!errorText}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => auth.signOut()}>Cancel</Button>
          <Button type="submit" disabled={!isValid}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
