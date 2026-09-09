// Journal & Mood Tracker Service for MysticDeck (Firestore + LocalStorage Fallback)

const LOCAL_STORAGE_JOURNAL_KEY = "mysticdeck_journals_v1";

async function saveJournalEntry(user, entryData) {
  const payload = {
    userId: user ? user.uid : "guest_user",
    userEmail: user ? user.email : "Guest User",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    card: {
      name: entryData.card.name,
      name_short: entryData.card.name_short,
      orientation: entryData.card.orientation,
      orientationLabel: entryData.card.orientationLabel,
      image: entryData.card.image,
      summary: entryData.card.summary
    },
    mood: {
      emoji: entryData.mood.emoji,
      label: entryData.mood.label,
      value: entryData.mood.value
    },
    journalText: entryData.journalText,
    customerCode: entryData.customerCode || null
  };

  const isFirebaseInitialized = typeof window !== "undefined" && window.ArcanaFirebase && window.ArcanaFirebase.isFirebaseInitialized;
  const db = typeof window !== "undefined" && window.ArcanaFirebase ? window.ArcanaFirebase.db : null;

  if (isFirebaseInitialized && user && db) {
    try {
      const docRef = await db.collection("journal_entries").add({
        ...payload,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("✅ Journal entry saved in Firestore. ID:", docRef.id);
      saveToLocalStorage(payload);
      return { success: true, id: docRef.id, storage: "Firestore" };
    } catch (error) {
      console.warn("⚠️ Firestore save error, fallback to LocalStorage:", error);
      saveToLocalStorage(payload);
      return { success: true, id: Date.now().toString(), storage: "LocalStorage" };
    }
  } else {
    saveToLocalStorage(payload);
    return { success: true, id: Date.now().toString(), storage: "LocalStorage" };
  }
}

async function getUserJournals(user) {
  const userId = user ? user.uid : "guest_user";
  const isFirebaseInitialized = typeof window !== "undefined" && window.ArcanaFirebase && window.ArcanaFirebase.isFirebaseInitialized;
  const db = typeof window !== "undefined" && window.ArcanaFirebase ? window.ArcanaFirebase.db : null;

  if (isFirebaseInitialized && user && db) {
    try {
      const snapshot = await db.collection("journal_entries")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const journals = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        journals.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString()
        });
      });
      return journals;
    } catch (error) {
      console.warn("⚠️ Firestore fetch error, fallback to LocalStorage:", error.message);
      return getFromLocalStorage(userId);
    }
  } else {
    return getFromLocalStorage(userId);
  }
}

function saveToLocalStorage(payload) {
  if (typeof localStorage === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_JOURNAL_KEY) || "[]");
    existing.unshift({ id: "local_" + Date.now(), ...payload });
    localStorage.setItem(LOCAL_STORAGE_JOURNAL_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("LocalStorage write error:", e);
  }
}

function getFromLocalStorage(userId) {
  if (typeof localStorage === "undefined") return [];
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_JOURNAL_KEY) || "[]");
    if (!userId || userId === "guest_user") return existing;
    return existing.filter(j => j.userId === userId || j.userId === "guest_user");
  } catch (e) {
    return [];
  }
}

if (typeof window !== "undefined") {
  window.ArcanaJournal = {
    saveJournalEntry,
    getUserJournals
  };
}
