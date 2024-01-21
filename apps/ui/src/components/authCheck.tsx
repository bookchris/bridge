import { Link } from "@mui/material";
import { ReactNode } from "react";
import { signIn, useUserContext } from "../lib/user";

export default function AuthCheck({ children }: { children: ReactNode }) {
  const { username } = useUserContext();

  return username ? (
    <>{children}</>
  ) : (
    <Link component="button" onClick={signIn}>
      You must be signed in
    </Link>
  );
}
