import { useFirebase } from "~firebase/hook";

export default function IndexPopup() {
  const { user, isLoading, onLogin, onLogout } = useFirebase();

  return (
    <div
      style={{
        width: 300,
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <h1>Bridge Importer</h1>
      {!user ? (
        <button onClick={() => onLogin()}>Log in</button>
      ) : (
        <button onClick={() => onLogout()}>Log out</button>
      )}
      <div>
        {isLoading ? "Loading..." : ""}
        {!!user ? (
          <div>
            Welcome {user.displayName}, your email address is {user.email}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
