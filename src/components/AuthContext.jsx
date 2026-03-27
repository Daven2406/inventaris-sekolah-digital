import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db, loginWithGoogle, logout } from "../firebase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous snapshot listener if any
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        try {
          // Initial check and creation if needed
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Default role is petugas for new users
            const newProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Unknown User",
              email: firebaseUser.email || "",
              role: firebaseUser.email === "dd24darnell@gmail.com" ? "admin" : "petugas",
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userDoc.data());
          }

          // Start real-time listener for the profile
          unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data());
            } else {
              // User document was deleted by admin!
              console.log("User profile deleted. Logging out...");
              setProfile(null);
              logout(); // Trigger logout from firebase
            }
          }, (error) => {
            console.error("Profile snapshot error:", error);
          });
        } catch (error) {
          console.error("Error fetching/listening to profile:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const login = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("Login popup closed by user.");
        return;
      }
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
