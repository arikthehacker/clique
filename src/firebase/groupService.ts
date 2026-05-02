import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function createGroup(
  name: string,
  imageUrl: string | null,
  createdBy: string
)
{
  const groupRef = await addDoc(collection(db, "groups"), {
    name: name,
    imageUrl: imageUrl,
    createdBy: createdBy,
    members: [createdBy],
    createdAt: new Date().toISOString()
  });

  return groupRef.id;
}
