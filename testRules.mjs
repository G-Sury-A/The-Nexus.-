import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const projectId = "test-project-" + Date.now();
const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: {
    rules: readFileSync("./firestore.rules", "utf8"),
  },
});

const db = testEnv.authenticatedContext("V0WufoDwSDhgaaC5ptt2V42yGzJ2", { email: "suryasajitha123@gmail.com", email_verified: true }).firestore();

const payload = {
  name: "Surya",
  jobIndustry: "Technology",
  favoriteSports: ["Tennis"],
  entertainmentInterests: ["Gaming"],
  societyFocus: ["Environment"],
  region: "Asia-Pacific",
  notificationTime: "08:00",
  notificationStyle: "Bullets"
};

try {
  await assertSucceeds(
    setDoc(doc(db, "users/V0WufoDwSDhgaaC5ptt2V42yGzJ2"), {
      ...payload,
      createdAt: serverTimestamp()
    }, { merge: false })
  );
  console.log("Create Succeeded!");
} catch (e) {
  console.error("Create Failed:", e.message);
}

// Test what happens if the document exists and we do a create (update)
try {
  await assertSucceeds(
    setDoc(doc(db, "users/V0WufoDwSDhgaaC5ptt2V42yGzJ2"), {
      ...payload,
      createdAt: serverTimestamp()
    }, { merge: false })
  );
  console.log("Overwrite (Update) Succeeded!");
} catch (e) {
  console.error("Overwrite (Update) Failed:", e.message);
}

await testEnv.cleanup();
