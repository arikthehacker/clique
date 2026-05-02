import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function sendMessage(
  groupId: string,
  senderId: string,
  text: string
)
{
  await addDoc(collection(db, "groups", groupId, "messages"), {
    senderId: senderId,
    text: text,
    createdAt: new Date().toISOString()
  });
}
