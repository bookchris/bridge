import { signInWithPopup, User } from "firebase/auth";
import {
  doc,
  DocumentData,
  FirestoreDataConverter,
  getDoc,
  onSnapshot,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { auth, firestore, googleAuthProvider } from "./firebase";

const userConverter: FirestoreDataConverter<StoredUser> = {
  toFirestore(user: StoredUser): DocumentData {
    return user;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): StoredUser {
    return snapshot.data(options) as StoredUser;
  },
};

export interface StoredUser {
  username: string;
  photoURL: string;
  displayName: string;
}

export const UserContext = createContext<{
  user?: User;
  username?: string;
  creating?: boolean;
}>({});

export const signIn = async () => signInWithPopup(auth, googleAuthProvider);

export const useUserContext = () => useContext(UserContext);

export const useUserId = () => {
  const { user, username } = useUserContext();
  if (user && username) {
    return user.uid;
  }
  return undefined;
};

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState<string>();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (user) {
      const ref = doc(firestore, "users", user.uid);
      getDoc(ref).then((doc) => {
        if (doc.exists()) {
          setUsername(doc.data()?.username);
          setCreating(false);
        } else {
          setCreating(true);
        }
      });
      unsubscribe = onSnapshot(ref, (doc) => {
        setUsername(doc.data()?.username);
        setCreating(false);
      });
    } else {
      setUsername(undefined);
      setCreating(false);
    }

    return unsubscribe;
  }, [user]);

  const value = useMemo(
    () => ({
      user: user || undefined,
      username,
      creating,
    }),
    [creating, user, username]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(userId?: string) {
  const ref = userId
    ? doc(firestore, "users", userId).withConverter(userConverter)
    : null;
  return useDocumentData(ref);
}
