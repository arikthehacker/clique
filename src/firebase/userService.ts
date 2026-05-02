import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function createUserProfile(
  userId: string,
  username: string,
  avatarUrl: string | null
)
{
  await setDoc(doc(db, "users", userId), {
    username: username,
    avatarUrl: avatarUrl,
    createdAt: new Date().toISOString()
  });
}
