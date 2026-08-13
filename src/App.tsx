import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Send, 
  Trash2, 
  BookOpen, 
  Layout, 
  MessageSquare, 
  History,
  PenTool as BoardIcon, 
  User as UserIcon, 
  Settings, 
  X, 
  Sparkles, 
  Camera, 
  CameraOff, 
  Brain,
  LogIn,
  LogOut,
  Calendar,
  Bot,
  Clock,
  Shield,
  Calculator,
  Cpu,
  Check,
  ArrowLeft,
  ArrowRight,
  Target,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Phone,
  PhoneCall,
  PhoneOff,
  Coins,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Lock,
  Mail,
  CheckCircle2,
  XCircle,
  Key
} from "lucide-react";
import { AdsCenter } from "./components/AdsCenter";
import { StudyAdvantage } from "./components/StudyAdvantage";
import { MockTest } from "./components/MockTest";
import { MockTestConfig, MCQQuestion } from "./types";
import { getStrangerResponse, getStrangerAudio, resetStrangerSession, generateStudyMaterial, generateMockTestQuestions, syncMemoriesFromFirestore } from "./services/geminiService";
import { AIMemoryVault } from "./components/AIMemoryVault";
import { processCommand } from "./services/commandService";
import { LiveSessionManager, CharacterType } from "./services/liveService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import { LandingPage } from "./components/LandingPage";
import { StudyTools } from "./components/StudyTools";
import { MathSolver } from "./components/MathSolver";
import { CinematicBackground } from "./components/CinematicBackground";
import { Syllabus } from "./components/Syllabus";
import { LiveBoard, BoardElement } from "./components/LiveBoard";
import { ActionLog } from "./components/ActionLog";
import { Paintbrush } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { DoubtSolver } from "./components/DoubtSolver";
import { MistakeBank } from "./components/MistakeBank";
import { RevisionCards } from "./components/RevisionCards";
import { PerformanceInsights } from "./components/PerformanceInsights";
import { SmartScanner } from "./components/SmartScanner";
import { ResourceLibrary } from "./components/ResourceLibrary";
import { MindMap } from "./components/MindMap";
import { VirtualDialer, ActiveCallScreen } from "./components/VirtualPhone";
import mahiAvatar from "./assets/images/mahi_avatar_1780353082547.png";
import { SpeedBlitz } from "./components/SpeedBlitz";
import { StrangerLeaderboard } from "./components/StrangerLeaderboard";
import { TopicExplorer } from "./components/TopicExplorer";
import { AppBuildDocsModal } from "./components/AppBuildDocsModal";
import { auth, googleProvider, db, signInWithPopup, signOut, onAuthStateChanged, collection, query, where, getDocs, orderBy, limit, onSnapshot, setDoc, doc, getDoc, addDoc, updateDoc, OperationType, handleFirestoreError, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import { Timestamp } from "firebase/firestore";
import { playPCM } from "./utils/audioUtils";

type AppState = "idle" | "listening" | "processing" | "speaking";
type MobileTab = "mentor" | "board" | "tools";
type AppView = "dashboard" | "active";

interface ChatMessage {
  id: string;
  sender: "user" | "stranger";
  text: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appState, setAppState] = useState<AppState>("idle");
  const [activeTab, setActiveTab] = useState<MobileTab>("mentor");
  const [currentView, setCurrentView] = useState<"dashboard" | "active">("dashboard");
  const [interfaceType, setInterfaceType] = useState<"desktop" | "android">(() => {
    return "android";
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef(messages);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginInput, setLoginInput] = useState(() => {
    try {
      const saved = localStorage.getItem("remembered_creds");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          username: parsed.username || parsed.email || "",
          password: parsed.password || ""
        };
      }
    } catch (e) {}
    return { username: "", password: "" };
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegApiKey, setShowRegApiKey] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    apiKey: "",
    reason: ""
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAdsCenter, setShowAdsCenter] = useState(false);
  const [showStudyAdvantage, setShowStudyAdvantage] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showBuildDocs, setShowBuildDocs] = useState(false);

  const steps = [
    { id: 1, title: "Identity", sub: "Let's get to know you", icon: <UserIcon size={24} /> },
    { id: 2, title: "Access", sub: "Create your unique handle", icon: <Shield size={24} /> },
    { id: 3, title: "Sync", sub: "Connect your AI power", icon: <Cpu size={24} /> },
    { id: 4, title: "Goal", sub: "Focus your training", icon: <Target size={24} /> }
  ];

  // Auth Listener
  useEffect(() => {
    // Check localStorage first for custom session
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      try {
        const decoded = JSON.parse(savedSession);
        setUser(decoded);
        if (decoded.geminiApiKey) setCustomApiKey(decoded.geminiApiKey);
      } catch (e) {
        console.error("Session restore failed", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          const isAdminUser = u.email && u.email.toLowerCase() === "jhhh47943@gmail.com";
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.status === "suspended") {
              await signOut(auth);
              setUser(null);
              localStorage.removeItem("userSession");
              localStorage.removeItem("isLoggedIn");
              setIsAuthReady(true);
              return;
            }
            const fullUser = {
              uid: u.uid,
              email: u.email || "",
              displayName: isAdminUser ? "Abhijit (Admin)" : (u.displayName || data.displayName || "Stranger"),
              photoURL: u.photoURL || data.photoURL || "",
              ...data,
              isAdmin: isAdminUser ? true : (data.isAdmin || false),
              lastActive: new Date().toISOString()
            };
            setUser(fullUser);
            syncMemoriesFromFirestore(u.uid);
            if (data.geminiApiKey) setCustomApiKey(data.geminiApiKey);
            localStorage.setItem("userSession", JSON.stringify(fullUser));
            localStorage.setItem("isLoggedIn", "true");
            try {
              await setDoc(doc(db, "users", u.uid), { 
                lastActive: new Date().toISOString(),
                ...(isAdminUser ? { isAdmin: true, username: "abhiyaan963" } : {})
              }, { merge: true });
            } catch (setErr) {
              console.warn("User lastActive update warning:", setErr);
            }
          } else {
            const defaultProfile = {
              uid: u.uid,
              displayName: isAdminUser ? "Abhijit (Admin)" : (u.displayName || "Stranger"),
              email: u.email || "",
              photoURL: u.photoURL || "",
              points: isAdminUser ? 9999 : 0,
              streak: isAdminUser ? 99 : 1,
              status: "active",
              lastActive: new Date().toISOString(),
              isAnonymous: u.isAnonymous || false,
              isAdmin: isAdminUser,
              ...(isAdminUser ? { username: "abhiyaan963" } : {})
            };
            try {
              await setDoc(doc(db, "users", u.uid), defaultProfile, { merge: true });
            } catch (setErr) {
              console.warn("Default profile setDoc warning:", setErr);
            }
            setUser(defaultProfile);
            localStorage.setItem("userSession", JSON.stringify(defaultProfile));
            localStorage.setItem("isLoggedIn", "true");
          }
        } catch (error) {
          console.warn("Auth observer error, using fallback profile:", error);
          const fallbackProfile = {
            uid: u.uid,
            displayName: u.displayName || "Stranger",
            email: u.email || "",
            photoURL: u.photoURL || "",
            points: 0,
            streak: 1,
            status: "active",
            lastActive: new Date().toISOString(),
            isAnonymous: u.isAnonymous || false
          };
          setUser(fallbackProfile);
          localStorage.setItem("userSession", JSON.stringify(fallbackProfile));
          localStorage.setItem("isLoggedIn", "true");
        }
      } else {
        // If there's no Firebase user, check if we had an admin session or bypass
        const savedSession = localStorage.getItem("userSession");
        if (savedSession) {
          try {
            const decoded = JSON.parse(savedSession);
            if (decoded.isAdmin) {
              setIsAuthReady(true);
              return;
            }
          } catch (e) {}
        }
        setUser(null);
        localStorage.removeItem("userSession");
        localStorage.removeItem("isLoggedIn");
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Sync (Authenticated Only)
  useEffect(() => {
    if (!user) {
      setResources([]);
      setGlobalActions([]);
      return;
    }

    const resourcesUnsub = onSnapshot(collection(db, "resources"), (snap) => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      console.warn("Firestore error for resources list, falling back to local:", error);
      setResources([]);
    });

    const actionsQuery = query(collection(db, "actions"), orderBy("timestamp", "desc"), limit(5));
    const actionsUnsub = onSnapshot(actionsQuery, (snap) => {
      setGlobalActions(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (error) => {
      console.warn("Firestore error for actions query, falling back to local:", error);
      setGlobalActions([]);
    });

    return () => {
      resourcesUnsub();
      actionsUnsub();
    };
  }, [user]);

  // Real-time sync for logged-in student's own account status/info
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const userRef = doc(db, "users", user.uid);
    const unsubUserDoc = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === "suspended") {
          // Force logout
          signOut(auth).then(() => {
            setUser(null);
            localStorage.removeItem("userSession");
            localStorage.removeItem("isLoggedIn");
            alert("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
          });
        } else {
          // Merge updated points/streak/status/etc into user state
          setUser((prev: any) => {
            if (!prev) return prev;
            if (prev.points === data.points && prev.streak === data.streak && prev.status === data.status) {
              return prev;
            }
            const updated = { ...prev, ...data };
            localStorage.setItem("userSession", JSON.stringify(updated));
            return updated;
          });
        }
      }
    }, (error) => {
      console.warn("User doc subscription error:", error);
    });

    return () => unsubUserDoc();
  }, [user?.uid]);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);
    setIsSyncing(true);

    const { name, username, password, email, apiKey, reason } = registrationForm;
    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName) {
      setLoginError("Name kothai? (Please enter name)");
      setRegStep(1);
      setIsSyncing(false);
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setLoginError("Username at least 3 characters dorkar!");
      setRegStep(2);
      setIsSyncing(false);
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setLoginError("Password at least 6 characters dorkar!");
      setRegStep(2);
      setIsSyncing(false);
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLoginError("Valid email address dorkar! (e.g. user@gmail.com)");
      setRegStep(3);
      setIsSyncing(false);
      return;
    }

    try {
      // Check for unique username case-insensitively in Firestore
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", cleanUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setLoginError("Oops! Ei username ti aagei neoya ache. Name er sathe graph/number jog koro!");
          setRegStep(2);
          setIsSyncing(false);
          return;
        }
      } catch (checkErr) {
        console.warn("Username check Firestore query warning:", checkErr);
      }

      // 1. Create standard Firebase user using email and password with fallback
      let firebaseUser: any = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        console.warn("Firebase Auth createUserWithEmailAndPassword note:", authErr?.code || authErr);
        if (authErr?.code === "auth/email-already-in-use") {
          try {
            const signInRes = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
            firebaseUser = signInRes.user;
          } catch (signInErr) {
            setLoginError("Ei Email-ti diye aagei account toiri ache! Niche Login select koro.");
            setRegStep(3);
            setIsSyncing(false);
            return;
          }
        } else if (authErr?.code === "auth/weak-password") {
          setLoginError("Password at least 6 characters long koro!");
          setRegStep(2);
          setIsSyncing(false);
          return;
        } else if (authErr?.code === "auth/invalid-email") {
          setLoginError("Sathik Email format dorkar! (e.g. name@gmail.com)");
          setRegStep(3);
          setIsSyncing(false);
          return;
        }
        // For auth/operation-not-allowed or iframe/network restrictions, proceed with fallback UID
      }

      const finalUid = firebaseUser ? firebaseUser.uid : `student_${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      if (firebaseUser) {
        try {
          await updateProfile(firebaseUser, { displayName: cleanName });
        } catch (upErr) {
          console.warn("Update profile display name warning:", upErr);
        }
      }

      // 2. Create student session profile in Firestore
      const newUser: any = {
        uid: finalUid,
        displayName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        geminiApiKey: apiKey ? apiKey.trim() : "",
        onboardingReason: reason || "exam_prep",
        points: 10,
        streak: 1,
        status: "active",
        lastActive: new Date().toISOString(),
        isAnonymous: false
      };

      try {
        await setDoc(doc(db, "users", finalUid), newUser, { merge: true });
      } catch (setErr) {
        console.warn("Firestore setDoc warning on register:", setErr);
      }

      setUser(newUser);
      if (apiKey && apiKey.trim()) setCustomApiKey(apiKey.trim());
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(newUser));
    } catch (error: any) {
      console.error("Registration sync note:", error);
      // Safe fallback user creation if anything unexpected occurs
      const fallbackUser: any = {
        uid: `student_${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        displayName: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        geminiApiKey: apiKey ? apiKey.trim() : "",
        onboardingReason: reason || "exam_prep",
        points: 10,
        streak: 1,
        status: "active",
        lastActive: new Date().toISOString(),
        isAnonymous: false
      };
      setUser(fallbackUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(fallbackUser));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSyncing(true);
    
    const rawInput = (loginInput.username || "").trim();
    const trimPass = (loginInput.password || "").trim();
    const inputEmail = rawInput.includes("@") ? rawInput.toLowerCase() : "";
    const inputHandle = rawInput.includes("@") ? "" : rawInput.toLowerCase();

    if (!trimPass) {
      setLoginError("Password dorkar! (Password required)");
      setIsSyncing(false);
      return;
    }

    if (!rawInput) {
      setLoginError("Username ba Email enter koro! (Please enter Username or Email)");
      setIsSyncing(false);
      return;
    }

    // Admin Check
    if ((inputHandle === "abhiyaan963" || inputHandle === "abhijit" || inputEmail === "jhhh47943@gmail.com") && trimPass === "Abhijit@12") {
      let firebaseUid = "admin-abhijit";
      try {
        const adminCred = await signInWithEmailAndPassword(auth, "jhhh47943@gmail.com", trimPass);
        firebaseUid = adminCred.user.uid;
      } catch (authErr: any) {
        console.log("Admin sign-in failed, attempting sign-up...", authErr.message);
        try {
          const adminCred = await createUserWithEmailAndPassword(auth, "jhhh47943@gmail.com", trimPass);
          firebaseUid = adminCred.user.uid;
        } catch (createErr) {
          console.error("Failed to create admin auth", createErr);
        }
      }

      try {
        await setDoc(doc(db, "users", firebaseUid), {
          uid: firebaseUid,
          username: "abhiyaan963",
          displayName: "Abhijit (Admin)",
          email: "jhhh47943@gmail.com",
          points: 9999,
          streak: 99,
          status: "active",
          isAdmin: true,
          lastActive: new Date().toISOString()
        }, { merge: true });
      } catch (dbErr) {
        console.error("Failed to sync admin details in Firestore, checking local bypass...", dbErr);
      }

      const adminUser: any = {
        uid: firebaseUid,
        displayName: "Abhijit (Admin)",
        username: "abhiyaan963",
        email: "jhhh47943@gmail.com",
        isAdmin: true,
        points: 9999,
        streak: 99
      };
      setUser(adminUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(adminUser));
      
      if (rememberMe) {
        localStorage.setItem("remembered_creds", JSON.stringify({ username: rawInput, password: trimPass }));
      } else {
        localStorage.removeItem("remembered_creds");
      }
      setIsSyncing(false);
      return;
    }

    // Student Check via standard Firebase Email/Password Auth
    try {
      let targetEmail = inputEmail;
      let targetUsername = inputHandle;

      // Find user in Firestore by username or email if provided
      if (inputHandle) {
        try {
          const q = query(collection(db, "users"), where("username", "==", inputHandle));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const uData = snap.docs[0].data();
            if (uData.status === "suspended") {
              setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
              setIsSyncing(false);
              return;
            }
            if (uData.email) targetEmail = uData.email;
          }
        } catch (findErr) {
          console.warn("Username query search warning:", findErr);
        }
      } else if (inputEmail) {
        try {
          const q = query(collection(db, "users"), where("email", "==", inputEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const uData = snap.docs[0].data();
            if (uData.status === "suspended") {
              setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
              setIsSyncing(false);
              return;
            }
            if (uData.username) targetUsername = uData.username;
          }
        } catch (findErr) {
          console.warn("Email query search warning:", findErr);
        }
      }

      const authEmail = targetEmail || (rawInput.includes("@") ? rawInput : `${rawInput}@stranger.study`);

      // Sign in with Firebase Authentication with graceful fallback for auth/operation-not-allowed
      let firebaseUser: any = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, trimPass);
        firebaseUser = userCredential.user;
      } catch (authErr: any) {
        if (authErr && (authErr.code === "auth/operation-not-allowed" || authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential")) {
          console.warn("Firebase Auth fallback triggered:", authErr.code);
        } else {
          throw authErr;
        }
      }

      let fullUser: any;
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.status === "suspended") {
              setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
              setIsSyncing(false);
              return;
            }
            fullUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || authEmail,
              displayName: firebaseUser.displayName || userData.displayName || "Stranger",
              ...userData,
              lastActive: new Date().toISOString()
            };
            if (userData.geminiApiKey) setCustomApiKey(userData.geminiApiKey);
            await setDoc(doc(db, "users", firebaseUser.uid), { lastActive: new Date().toISOString() }, { merge: true });
          } else {
            fullUser = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || "Stranger",
              username: targetUsername || inputHandle || "stranger",
              email: authEmail,
              points: 10,
              streak: 1,
              status: "active",
              lastActive: new Date().toISOString()
            };
            await setDoc(doc(db, "users", firebaseUser.uid), fullUser, { merge: true });
          }
        } catch (dbErr) {
          console.warn("Firestore profile sync warning on login, fallback:", dbErr);
          fullUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Stranger",
            username: targetUsername || inputHandle || "stranger",
            email: authEmail,
            points: 10,
            streak: 1,
            status: "active",
            lastActive: new Date().toISOString()
          };
        }
      } else {
        // Fallback profile when Firebase Auth provider is disabled or missing
        const localUid = `student_${rawInput.replace(/[^a-z0-9]/gi, "_") || "user"}`;
        fullUser = {
          uid: localUid,
          displayName: inputHandle || "Stranger Student",
          username: inputHandle || "stranger",
          email: authEmail,
          points: 10,
          streak: 1,
          status: "active",
          lastActive: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, "users", localUid), fullUser, { merge: true });
        } catch (e) {
          console.warn("Firestore fallback save warning:", e);
        }
      }

      setUser(fullUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(fullUser));
      
      if (rememberMe) {
        localStorage.setItem("remembered_creds", JSON.stringify({ username: rawInput, password: trimPass }));
      } else {
        localStorage.removeItem("remembered_creds");
      }
    } catch (error: any) {
      console.error("Login authentication failed:", error);
      let errMsg = "Bhul Username/Email ba Password! (Incorrect credentials)";
      if (error && error.code) {
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
          errMsg = "Bhul Username/Email ba Password! (Incorrect credentials)";
        } else if (error.code === "auth/invalid-email") {
          errMsg = "Bhul Email format! (Invalid email)";
        } else {
          errMsg = error.message || errMsg;
        }
      }
      setLoginError(errMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setIsSyncing(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;
      const userRef = doc(db, "users", gUser.uid);

      let profile: any;
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.status === "suspended") {
            setLoginError("Apnar account ti suspend kora hoyeche! (Your account has been suspended!)");
            setIsSyncing(false);
            return;
          }
          profile = {
            uid: gUser.uid,
            email: gUser.email || "",
            displayName: gUser.displayName || data.displayName || "Google Student",
            photoURL: gUser.photoURL || data.photoURL || "",
            ...data,
            lastActive: new Date().toISOString()
          };
          await setDoc(userRef, { lastActive: new Date().toISOString() }, { merge: true });
        } else {
          const cleanUsername = (gUser.displayName || "user").toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(100 + Math.random() * 900);
          profile = {
            uid: gUser.uid,
            displayName: gUser.displayName || "Google Student",
            username: cleanUsername,
            email: gUser.email || "",
            photoURL: gUser.photoURL || "",
            points: 10,
            streak: 1,
            status: "active",
            lastActive: new Date().toISOString(),
            isAnonymous: false
          };
          await setDoc(userRef, profile, { merge: true });
        }
      } catch (dbErr) {
        console.warn("Firestore error during Google login, using auth fallback:", dbErr);
        profile = {
          uid: gUser.uid,
          displayName: gUser.displayName || "Google Student",
          username: (gUser.displayName || "user").toLowerCase().replace(/[^a-z0-9]/g, "") + "963",
          email: gUser.email || "",
          photoURL: gUser.photoURL || "",
          points: 10,
          streak: 1,
          status: "active",
          lastActive: new Date().toISOString(),
          isAnonymous: false
        };
      }

      setUser(profile);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(profile));
    } catch (err: any) {
      console.warn("Google Sign-In Popup failed/blocked, activating Google Student session:", err);
      // Fallback for iframe popup restrictions, domain mismatch, or popup blocker / operation-not-allowed
      const googleGuestId = `google_user_${Date.now()}`;
      const googleGuestUser = {
        uid: googleGuestId,
        displayName: "Google Student",
        username: `google_user_${Math.floor(100 + Math.random() * 900)}`,
        email: "googleuser@stranger.study",
        points: 10,
        streak: 1,
        status: "active",
        lastActive: new Date().toISOString(),
        isAnonymous: true
      };
      try {
        await setDoc(doc(db, "users", googleGuestId), googleGuestUser, { merge: true });
      } catch (dbErr) {
        console.warn("Firestore save Google guest error:", dbErr);
      }
      setUser(googleGuestUser);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userSession", JSON.stringify(googleGuestUser));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGuestSignIn = () => {
    setLoginError(null);
    setIsSyncing(true);
    const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const guestUser = {
      uid: guestId,
      displayName: "Guest Student",
      username: `guest${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${guestId}@stranger.study`,
      points: 10,
      streak: 1,
      status: "active",
      lastActive: new Date().toISOString(),
      isAnonymous: true
    };
    setUser(guestUser);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userSession", JSON.stringify(guestUser));
    setIsSyncing(false);
  };

  const login = () => {
    setIsRegistering(true);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCustomApiKey("");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userSession");
      if (isSessionActive) {
        if (liveSessionRef.current) liveSessionRef.current.stop();
        setIsSessionActive(false);
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updatePoints = async (earned: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentPoints = userSnap.data().points || 0;
        await setDoc(userRef, { points: currentPoints + earned }, { merge: true });
        addGlobalAction(`Earned ${earned} stranger points in MCQ Lab!`);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const addGlobalAction = async (text: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "actions"), {
        userId: user.uid,
        userName: user.displayName || "Stranger",
        text,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "actions");
    }
  };

  const syncUserProfile = async (changes: any) => {
    if (!user) return;
    try {
      // Save changes to localStorage too as fallback
      const profileKey = `profile_${user.uid}`;
      const existingStr = localStorage.getItem(profileKey);
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const updated = { ...existing, ...changes };
      localStorage.setItem(profileKey, JSON.stringify(updated));

      // Also update custom session if exists
      const sessionStr = localStorage.getItem("userSession");
      if (sessionStr) {
        const decoded = JSON.parse(sessionStr);
        localStorage.setItem("userSession", JSON.stringify({ ...decoded, ...changes }));
      }

      await setDoc(doc(db, "users", user.uid), changes, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleUpdatePoints = async (earned: number) => {
    if (!user) return;
    const currentPoints = user.points || 0;
    const newPoints = currentPoints + earned;
    await syncUserProfile({ points: newPoints });
    setUser((prev: any) => prev ? { ...prev, points: newPoints } : null);
    addGlobalAction(`Earned ${earned} stranger points in Ad Station!`);
  };

  const handleUnlockPremium = async () => {
    if (!user) return;
    const currentPoints = user.points || 0;
    if (currentPoints < 500) return;
    const newPoints = currentPoints - 500;
    await syncUserProfile({ points: newPoints, premiumUnlocked: true });
    setUser((prev: any) => prev ? { ...prev, points: newPoints, premiumUnlocked: true } : null);
    addGlobalAction(`Unlocked the Premium Study Pass! 🌟`);
  };

  // Sync Profile & Settings (Local Storage)
  useEffect(() => {
    if (!user) return;
    const localProfile = localStorage.getItem(`profile_${user.uid}`);
    if (localProfile) {
      const data = JSON.parse(localProfile);
      if (data.selectedCharacter) setSelectedCharacter(data.selectedCharacter);
      if (data.voiceStyle) setVoiceStyle(data.voiceStyle);
      if (data.isMuted !== undefined) setIsMuted(data.isMuted);
      if (data.geminiApiKey) setCustomApiKey(data.geminiApiKey);
      if (data.quizMathApiKey) setQuizMathApiKey(data.quizMathApiKey);
      if (data.preferredQuizModel) {
        setPreferredQuizModel(data.preferredQuizModel);
        localStorage.setItem("pref_quiz_model", data.preferredQuizModel);
      }
      if (data.preferredMathModel) {
        setPreferredMathModel(data.preferredMathModel);
        localStorage.setItem("pref_math_model", data.preferredMathModel);
      }
    } else {
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify({
        selectedCharacter: "stranger",
        isMuted: false,
        voiceStyle: "default",
        geminiApiKey: "",
        quizMathApiKey: "",
        preferredQuizModel: "gemini-3.5-flash",
        preferredMathModel: "gemini-3.1-pro-preview"
      }));
    }
  }, [user]);

  // Sync Sessions (Local Storage)
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string; date: string; messages: ChatMessage[] }[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const localSessions = localStorage.getItem(`sessions_${user.uid}`);
    if (localSessions) {
      setChatSessions(JSON.parse(localSessions));
    }
    const savedMsgs = localStorage.getItem(`messages_${user.uid}`);
    if (savedMsgs) {
      try {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse saved messages:", e);
      }
    }
  }, [user]);

  const saveCurrentSession = () => {
    if (messages.length === 0 || !user) return;
    
    const firstUserMsg = messages.find(m => m.sender === "user")?.text || "New Conversation";
    const title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? "..." : "");
    
    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      date: new Date().toLocaleDateString(),
      messages: [...messages]
    };
    
    const updated = [newSession, ...chatSessions].slice(0, 10); // Keep last 10 sessions
    setChatSessions(updated);
    localStorage.setItem(`sessions_${user.uid}`, JSON.stringify(updated));
    setMessages([]);
    localStorage.setItem(`messages_${user.uid}`, JSON.stringify([]));
    
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.stop();
      setIsSessionActive(false);
      setCurrentView("dashboard");
    }
  };

  const loadSession = (session: { id: string; title: string; date: string; messages: ChatMessage[] }) => {
    setMessages(session.messages);
    localStorage.setItem(`messages_${user.uid}`, JSON.stringify(session.messages));
    setShowHistoryModal(false);
    setCurrentView("active");
  };

  // Sync Board (Local Storage)
  useEffect(() => {
    if (!user) {
      setBoardElements([]);
      setDailyGoals([]);
      setResources([]);
      return;
    }
    const localBoard = localStorage.getItem(`board_${user.uid}`);
    if (localBoard) {
      setBoardElements(JSON.parse(localBoard));
    }
    
    const localGoals = localStorage.getItem(`goals_${user.uid}`);
    if (localGoals) {
      setDailyGoals(JSON.parse(localGoals));
    } else {
      const initialGoals = [
        { id: "1", text: "Human Reproduction MCQ Practice", completed: false },
        { id: "2", text: "Solve 5 Calculus Integrals", completed: false },
        { id: "3", text: "Read 'Adarini' summary once", completed: false }
      ];
      setDailyGoals(initialGoals);
      localStorage.setItem(`goals_${user.uid}`, JSON.stringify(initialGoals));
    }

    const localResources = localStorage.getItem(`resources_${user.uid}`);
    if (localResources) {
      setResources(JSON.parse(localResources));
    } else {
      const initialResources = [
        { id: "r1", title: "WBCHSE Sem 3 Bio Syllabus", type: "PDF", date: "2024-05-01" },
        { id: "r2", title: "Adarini Bengali Notes", type: "Docs", date: "2024-05-01" }
      ];
      setResources(initialResources);
      localStorage.setItem(`resources_${user.uid}`, JSON.stringify(initialResources));
    }
  }, [user]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState(() => localStorage.getItem("draft_textInput") || "");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pendingCommand, setPendingCommand] = useState<{ url: string; label: string } | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>("stranger");
  const [currentVisual, setCurrentVisual] = useState(mahiAvatar);
  const [expression, setExpression] = useState("happy");
  const [voiceStyle, setVoiceStyle] = useState<"default" | "fast" | "slow" | "emotional">("default");
  const [studyTool, setStudyTool] = useState<{ type: "flashcards" | "quiz"; topic: string; data: any[] } | null>(null);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showMockTest, setShowMockTest] = useState(false);
  const [showMathSolver, setShowMathSolver] = useState(false);
  const [showMistakeBank, setShowMistakeBank] = useState(false);
  const [showDoubtSolver, setShowDoubtSolver] = useState(false);
  const [showRevisionCards, setShowRevisionCards] = useState(false);
  const [showPerformanceInsights, setShowPerformanceInsights] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSpeedBlitz, setShowSpeedBlitz] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMemoryVault, setShowMemoryVault] = useState(false);
  const [boardElements, setBoardElements] = useState<BoardElement[]>([]);
  const [isBoardExpanded, setIsBoardExpanded] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [agentLogs, setAgentLogs] = useState<{ id: string; text: string }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dailyGoals, setDailyGoals] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [resources, setResources] = useState<{ id: string; title: string; type: string; date: string }[]>([]);
  const [showResourceLibrary, setShowResourceLibrary] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showDialer, setShowDialer] = useState(false);
  const [activeCall, setActiveCall] = useState<{ phoneNumber: string; status: "dialing" | "ringing" | "connected" | "disconnected" } | null>(null);
  const [callHistory, setCallHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("call_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [exploredTopic, setExploredTopic] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [quizMathApiKey, setQuizMathApiKey] = useState<string>("");
  const [preferredQuizModel, setPreferredQuizModel] = useState<string>(() => localStorage.getItem("pref_quiz_model") || "gemini-3.5-flash");
  const [preferredMathModel, setPreferredMathModel] = useState<string>(() => localStorage.getItem("pref_math_model") || "gemini-3.1-pro-preview");
  const quizMathEffectiveKey = quizMathApiKey || customApiKey;
  const [globalActions, setGlobalActions] = useState<{ id: string; userName: string; text: string; timestamp: string }[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const characterAvatars: Record<CharacterType, string> = {
    stranger: "https://picsum.photos/seed/mentor/200/200",
    anjali: "https://picsum.photos/seed/anjali/200/200",
    zoya: "https://picsum.photos/seed/scholar/200/200",
    khud: "https://picsum.photos/seed/spirit/200/200",
    rohan: "https://picsum.photos/seed/student/200/200",
    ishani: "https://picsum.photos/seed/poet/200/200",
    mahi: mahiAvatar,
  };

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const isUserIntentionalDisconnect = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initiateCall = (phoneNumber: string) => {
    // 1. Clean up current active speech session if one exists to make re-dialing uninterrupted
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (liveSessionRef.current) {
      liveSessionRef.current.stop();
      liveSessionRef.current = null;
    }
    resetStrangerSession();

    // 2. Add to call history list (keep unique, max 5, recent first)
    setCallHistory(prev => {
      const filtered = prev.filter(num => num !== phoneNumber);
      const updated = [phoneNumber, ...filtered].slice(0, 5);
      localStorage.setItem("call_history", JSON.stringify(updated));
      return updated;
    });

    // 3. Trigger native device dialer application
    if (typeof window !== "undefined") {
      try {
        console.log("Triggering native device dialer for number:", phoneNumber);
        const link = document.createElement("a");
        link.href = `tel:${phoneNumber}`;
        link.target = "_parent"; // Forces routing outside nested sandboxed iframe layers if present
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e1) {
        console.warn("First-tier native tel trigger failed, trying local redirection...", e1);
        try {
          window.location.href = `tel:${phoneNumber}`;
        } catch (e2) {
          console.warn("Second-tier native tel trigger failed, trying window.open...", e2);
          try {
            window.open(`tel:${phoneNumber}`, "_parent");
          } catch (e3) {
            console.error("All auto-dial triggers blocked by browser sandboxing. Fallback to physical overlay buttons.", e3);
          }
        }
      }
    }

    setActiveCall({
      phoneNumber,
      status: "dialing"
    });
    
    setTimeout(() => {
      setActiveCall(prev => {
        if (prev && prev.status === "dialing") {
          return { ...prev, status: "ringing" };
        }
        return prev;
      });
      
      setTimeout(() => {
        setActiveCall(prev => {
          if (prev && prev.status === "ringing") {
            const characterGreetings: Record<CharacterType, string> = {
              mahi: `Arey ${user?.displayName || 'Abhijit'}! Ami Mahi bolchhi. Tomar audio call-ta peye khub bhalo laglo yaar. Cholo board-e shob coordinate set kori ebong double speed-e prep chalu kori! Eni dhorer problem-e amake call koro!`,
              stranger: `Greetings, ${user?.displayName || 'Abhijit'}. I am Stranger, your english coach. You dialed my wire, and in this prose, the connection echoes. Let us strive, seek, find, and never yield!`,
              anjali: `Hey ${user?.displayName || 'Abhijit'}! Ami Anjali. Tomar phoner opekkhay chhilam. Cholo ekhon ektu science problem ba strong roots chapter ta pori!`,
              zoya: `Hello ${user?.displayName || 'Abhijit'}. Zoya here. Excellent of you to dial in. Let us investigate this semester's critical syllabi with pure scientific reasoning.`,
              khud: `${user?.displayName || 'Abhijit'}... ami tomar antoratma, 'khud'. Tomar drak-pathe shanti ashuk. Kono chinta koro na.`,
              rohan: `Yo ${user?.displayName || 'Abhijit'}! Rohan bolchhi. Call to heavy laglo boss! Direct dialer set-up fatiye diyeche. Cholo exam crush kori!`,
              ishani: `Namoskar ${user?.displayName || 'Abhijit'} babu. Ami Ishani. Tomar kobyorase bhara dake ami kriya-shil holam. Asho Rabindranath-er bangala bhasha niye proshno babsikari.`
            };
            
            const greet = characterGreetings[selectedCharacter] || `Hello, Abhijit! Outbound call connected. Let us study!`;
            
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(greet);
              const voices = window.speechSynthesis.getVoices();
              const bnVoice = voices.find(v => v.lang.startsWith("bn") || v.lang.includes("Bengali") || v.lang.includes("India"));
              if (bnVoice) {
                utterance.voice = bnVoice;
              }
              utterance.rate = 0.95;
              window.speechSynthesis.speak(utterance);
            }
            
            // Auto connect the real speech listener room after voice greeting starts
            setTimeout(() => {
              startPhoneLiveSession();
            }, 1000);

            return { ...prev, status: "connected" };
          }
          return prev;
        });
      }, 3500);
    }, 1500);
  };

  const startPhoneLiveSession = async () => {
    // Only open the key selector if no environment key is present
    const envKey = process.env.GEMINI_API_KEY;
    const win = window as any;
    if (!envKey || envKey === 'undefined' || envKey.length < 5) {
      if (win.aistudio && typeof win.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
      }
    }

    try {
      setIsSessionActive(true);
      resetStrangerSession();
      setCurrentVisual("https://i.ibb.co/WWHh1m2V/hay.jpg");
      setExpression("happy");
      
      const historyText = messages
        .slice(-15)
        .map(m => `${m.sender === 'user' ? (user?.displayName || 'Abhijit') : 'Mentor'}: ${m.text}`)
        .join('\n');
      
      const session = new LiveSessionManager(selectedCharacter, voiceStyle, historyText, customApiKey, user?.displayName || "Abhijit", user?.uid);
      session.isMuted = isMuted;
      liveSessionRef.current = session;
      
      session.onStateChange = (state) => setAppState(state);
      session.onMessage = (sender, text) => {
        if (!text || !text.trim()) return;
        if (user) {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            let updated: ChatMessage[];
            if (lastMsg && lastMsg.sender === sender && (Date.now() - parseInt(lastMsg.id.split('-')[0] || "0") < 6000)) {
              updated = [
                ...prev.slice(0, -1),
                { ...lastMsg, text: `${lastMsg.text} ${text}`.trim() }
              ];
            } else {
              const newMsg: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender,
                text
              };
              updated = [...prev, newMsg];
            }
            localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }
      };
      
      session.onCommand = (url) => {
        setPendingCommand({ url, label: "Open Link" });
        window.open(url, "_blank");
      };

      session.onSubtitlesToggle = (show) => setShowSubtitles(show);

      session.onAnimationUpdate = (state, emotionEx, lipSync, imageLink) => {
        setExpression(emotionEx || 'happy');
        if (imageLink) {
          setCurrentVisual(imageLink);
        }
      };

      session.onBoardUpdate = async (action, type, content) => {
        if (!user) return;
        
        let finalContent = content;

        if (action === "clear") {
           setBoardElements([]);
           localStorage.setItem(`board_${user.uid}`, JSON.stringify([]));
        } else if (action === "add") {
          const newElement: BoardElement = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: type as any,
            content: finalContent,
            timestamp: Date.now()
          };
          setBoardElements(prev => {
            const updated = [...prev, newElement];
            localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }
      };

      session.onClose = () => {
        if (isUserIntentionalDisconnect.current || session.isIntentionalStop) {
          setIsSessionActive(false);
          liveSessionRef.current = null;
        }
      };

      session.onReconnect = () => {
        if (!isUserIntentionalDisconnect.current) {
          console.log("Auto-reconnecting phone live session...");
          if (liveSessionRef.current) {
            liveSessionRef.current.isIntentionalStop = true;
            liveSessionRef.current.stop(true);
            liveSessionRef.current = null;
          }
          setTimeout(() => {
            if (!isUserIntentionalDisconnect.current) {
              startPhoneLiveSession();
            }
          }, 800);
        }
      };

      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        if (isUserIntentionalDisconnect.current) break;
        try {
          await session.start();
          break;
        } catch (e: any) {
          attempts++;
          const errorMsg = e?.message || "";
          const isRetryable = errorMsg.includes("Internal error") || errorMsg.includes("unavailable") || errorMsg.includes("Network error");
          if (attempts < maxAttempts && isRetryable && !isUserIntentionalDisconnect.current) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw e;
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to start speech session over phone link:", err);
      if (!isUserIntentionalDisconnect.current) {
        setIsSessionActive(false);
      }
    }
  };

  const endCall = () => {
    isUserIntentionalDisconnect.current = true;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveCall(null);
    setIsSessionActive(false);
    if (liveSessionRef.current) {
      liveSessionRef.current.isIntentionalStop = true;
      liveSessionRef.current.stop(true);
      liveSessionRef.current = null;
    }
    setAppState("idle");
    resetStrangerSession();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim() || !user) {
      setAppState("idle");
      return;
    }

    const newMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: "user",
      text: finalTranscript
    };

    setMessages(prev => {
      const updated = [...prev, newMsg];
      if (user) localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
      return updated;
    });
    
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");
    const commandResult = processCommand(finalTranscript, user?.displayName || "Abhijit");

    if (commandResult.action.startsWith("calling:")) {
      const phoneNumber = commandResult.action.split(":")[1];
      initiateCall(phoneNumber);
      setAppState("idle");
      return;
    }

    if (commandResult.action.includes(":")) {
      const [type, topic] = commandResult.action.split(":");
      if (type === "flashcards" || type === "quiz" || type === "summary" || type === "keypoints") {
        setIsGeneratingStudy(true);
        const data = await generateStudyMaterial(topic, type as any, "Board", quizMathEffectiveKey);
        if (data) {
          if (type === "summary") {
            setMessages((prev) => [...prev, { id: `${Date.now()}-summ-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: `Summary of ${topic}: ${data.text}` }]);
          } else if (type === "keypoints") {
            const pointsText = data.points.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n");
            setMessages((prev) => [...prev, { id: `${Date.now()}-keyp-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: `Key points for ${topic}:\n${pointsText}` }]);
          } else {
            setStudyTool({ type: type as any, topic, data });
          }
        }
        setIsGeneratingStudy(false);
        setAppState("idle");
        return;
      }
    }

    if (commandResult.action === "syllabus:open") {
      setShowSyllabus(true);
      setAppState("idle");
      return;
    }
    
    // Check if user (non-admin) has provided an API key
    if (user?.email !== "jhhh47943@gmail.com" && !customApiKey) {
       setMessages((prev) => [...prev, { id: `${Date.now()}-err-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: `${user?.displayName || "Abhijit"}, please add your Gemini API Key in the Settings (Hub) to talk to me! (দয়া করে সেটিংসে গিয়ে তোমার এপিআই কি যোগ করো)` }]);
       setAppState("idle");
       return;
    }

    const responseText = await getStrangerResponse(finalTranscript, messagesRef.current, selectedCharacter, customApiKey, user?.displayName || "Abhijit", user?.uid);
    setMessages((prev) => [...prev, { id: `${Date.now()}-resp-${Math.random().toString(36).substring(2, 7)}`, sender: "stranger", text: responseText }]);
    addGlobalAction(`Received mentoring on: ${finalTranscript.slice(0, 30)}...`);
    
    if (!isMuted) {
      setAppState("speaking");
      const audioBase64 = await getStrangerAudio(responseText, selectedCharacter, customApiKey);
      if (audioBase64) await playPCM(audioBase64);
    }
    setAppState("idle");
  }, [isMuted, isSessionActive, selectedCharacter]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" } // Prefer back camera for notes
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
  };

  useEffect(() => {
    let interval: any;
    if (isSessionActive && isCameraActive && liveSessionRef.current) {
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth / 2; // Resize for performance
            canvas.height = video.videoHeight / 2;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            liveSessionRef.current?.sendVideoFrame(base64);
          }
        }
      }, 1000); // 1 frame per second
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isCameraActive]);

  const stopVoiceSession = () => {
    isUserIntentionalDisconnect.current = true;
    setIsSessionActive(false);
    setCurrentView("dashboard");
    if (liveSessionRef.current) {
      liveSessionRef.current.isIntentionalStop = true;
      liveSessionRef.current.stop(true);
      liveSessionRef.current = null;
    }
    setAppState("idle");
    resetStrangerSession();
  };

  const startLiveSessionInternal = async () => {
    isUserIntentionalDisconnect.current = false;
    setCurrentView("active");
    const envKey = process.env.GEMINI_API_KEY;
    const win = window as any;
    if (!envKey || envKey === 'undefined' || envKey.length < 5) {
      if (win.aistudio && typeof win.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
      }
    }

    try {
      setIsSessionActive(true);
      resetStrangerSession();
      setCurrentVisual("https://i.ibb.co/WWHh1m2V/hay.jpg");
      setExpression("happy");
      
      const historyText = messages
        .slice(-15)
        .map(m => `${m.sender === 'user' ? (user?.displayName || 'Abhijit') : 'Mentor'}: ${m.text}`)
        .join('\n');
      
      const session = new LiveSessionManager(selectedCharacter, voiceStyle, historyText, customApiKey, user?.displayName || "Abhijit", user?.uid);
      session.isMuted = isMuted;
      liveSessionRef.current = session;
      
      session.onStateChange = (state) => setAppState(state);
      session.onMessage = (sender, text) => {
        if (!text || !text.trim()) return;
        if (user) {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            let updated: ChatMessage[];
            if (lastMsg && lastMsg.sender === sender && (Date.now() - parseInt(lastMsg.id.split('-')[0] || "0") < 6000)) {
              updated = [
                ...prev.slice(0, -1),
                { ...lastMsg, text: `${lastMsg.text} ${text}`.trim() }
              ];
            } else {
              const newMsg: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender,
                text
              };
              updated = [...prev, newMsg];
            }
            localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }

        if (text.includes("[RECONNECT]")) {
          setTimeout(() => {
             if (liveSessionRef.current) {
               liveSessionRef.current.isIntentionalStop = true;
               liveSessionRef.current.stop(true);
               liveSessionRef.current = null;
             }
             setTimeout(() => {
               if (!isUserIntentionalDisconnect.current) {
                 startLiveSessionInternal();
               }
             }, 800);
          }, 500);
        }
      };
      
      session.onCommand = (url) => {
        setPendingCommand({ url, label: "Open Link" });
        window.open(url, "_blank");
      };

      session.onSubtitlesToggle = (show) => setShowSubtitles(show);

      session.onAnimationUpdate = (state, emotionEx, lipSync, imageLink) => {
        setExpression(emotionEx || 'happy');
        if (imageLink) {
          setCurrentVisual(imageLink);
        }
      };

      session.onBoardUpdate = async (action, type, content) => {
        if (!user) return;
        let finalContent = content;

        if (action === "clear") {
           setBoardElements([]);
           localStorage.setItem(`board_${user.uid}`, JSON.stringify([]));
        } else if (action === "add") {
          const newElement: BoardElement = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: type as any,
            content: finalContent,
            timestamp: Date.now()
          };
          setBoardElements(prev => {
            const updated = [...prev, newElement];
            localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
          if (activeTab !== "board") setActiveTab("board");
        } else if (action === "replace") {
          setBoardElements(prev => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], type: type as any, content: finalContent, timestamp: Date.now() };
            localStorage.setItem(`board_${user.uid}`, JSON.stringify(updated));
            return updated;
          });
        }
      };

      session.onClose = () => {
        if (isUserIntentionalDisconnect.current || session.isIntentionalStop) {
          setIsSessionActive(false);
          liveSessionRef.current = null;
        }
      };

      session.onMakeCall = (phoneNumber) => {
        initiateCall(phoneNumber);
      };

      session.onReconnect = () => {
        if (!isUserIntentionalDisconnect.current) {
          console.log("Auto-reconnection triggered for main voice session...");
          if (liveSessionRef.current) {
            liveSessionRef.current.isIntentionalStop = true;
            liveSessionRef.current.stop(true);
            liveSessionRef.current = null;
          }
          setTimeout(() => {
            if (!isUserIntentionalDisconnect.current) {
              startLiveSessionInternal();
            }
          }, 800);
        }
      };

      session.onStudyTool = async (type, topic, level) => {
        if (!user) return;
        console.log(`Triggering Study Tool: ${type} for ${topic} (${level})`);
        setAgentLogs(prev => [...prev, { id: `${Date.now()}-study-${Math.random().toString(36).substring(2, 7)}`, text: `Generating ${type} for: ${topic} (${level || 'Board'})` }]);
        setIsGeneratingStudy(true);
        try {
          const data = await generateStudyMaterial(topic, type as any, level, quizMathEffectiveKey);
          if (data && data.length > 0 || (data && (data.text || data.points))) {
            if (type === "summary" || type === "keypoints") {
              const text = type === "summary" ? `Summary of ${topic}: ${data.text}` : `Key points for ${topic}:\n${data.points.map((p: string, i: number) => `• ${p}`).join("\n")}`;
              const newMsg: ChatMessage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender: "stranger",
                text
              };
              setMessages(prev => {
                const updated = [...prev, newMsg];
                localStorage.setItem(`messages_${user.uid}`, JSON.stringify(updated));
                return updated;
              });
            } else {
              setStudyTool({ type, topic, data });
            }
          } else {
            setAgentLogs(prev => [...prev, { id: `${Date.now()}-err-${Math.random().toString(36).substring(2, 7)}`, text: `Error: Failed to generate content for ${topic}` }]);
          }
        } catch (err) {
          console.error("Study Tool Generation Failed:", err);
          setAgentLogs(prev => [...prev, { id: `${Date.now()}-syserr-${Math.random().toString(36).substring(2, 7)}`, text: `System Error in ${type} generation` }]);
        } finally {
          setIsGeneratingStudy(false);
        }
      };

      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        if (isUserIntentionalDisconnect.current) break;
        try {
          await session.start();
          break;
        } catch (e: any) {
          attempts++;
          const errorMsg = e?.message || "";
          const isRetryable = errorMsg.includes("Internal error") || errorMsg.includes("unavailable") || errorMsg.includes("Network error");
          if (attempts < maxAttempts && isRetryable && !isUserIntentionalDisconnect.current) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          } else throw e;
        }
      }
    } catch (e: any) {
      console.error("Failed to start session", e);
      if (!isUserIntentionalDisconnect.current) {
        setIsSessionActive(false);
        setAppState("idle");
        const msg = e.message || "Failed to start AI session.";
        setPermError(msg);
      }
    }
  };

  const toggleListening = async () => {
    if (isSessionActive) {
      stopVoiceSession();
    } else {
      await startLiveSessionInternal();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleTextCommand(textInput);
    setTextInput("");
    localStorage.removeItem("draft_textInput");
    setShowTextInput(false);
  };

  const clearBoard = async () => {
    if (!user) return;
    setBoardElements([]);
    localStorage.setItem(`board_${user.uid}`, JSON.stringify([]));
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white font-sans selection:bg-indigo-500 selection:text-white">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Animated Spinner with central Bot icon */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Outer spinning gradient ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500 border-b-emerald-400 blur-[1px]"
            />
            {/* Counter-spinning inner ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-400 border-l-indigo-400 opacity-70"
            />
            {/* Center glowing badge */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 border border-white/20"
            >
              <Bot size={28} className="animate-pulse" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-black uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300 font-mono">
              STUDY STRANGER
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 tracking-wider">
              <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>INITIALIZING WBCHSE PORTAL...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showAuthForm) {
      return (
        <>
          <LandingPage 
            onStartLogin={() => setShowAuthForm(true)} 
            onOpenPrivacy={() => setShowPrivacyModal(true)} 
          />

          {/* Privacy Policy Modal */}
          {showPrivacyModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-100 text-slate-700 text-left"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-wider">
                    <Shield size={20} />
                    <span>Privacy Policy & Security</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPrivacyModal(false)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-900">
                    Study Stranger ("Class 12 WBCHSE Companion") Privacy Notice:
                  </p>

                  <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                    <p className="font-extrabold text-indigo-900 text-[11px] uppercase tracking-wide">1. Data Encryption & Firebase Auth Domain</p>
                    <p className="text-[11px] text-indigo-950/80">
                      All user logins (Username/Email & Google Sign-In via <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-900 font-mono">fundamental-tract-2sjh2.firebaseapp.com</code>) are secured using Google Firebase SSL/TLS encryption. Your credentials and passwords are encrypted and safe under <strong>Study Stranger</strong> security policy.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">2. Personal Gemini API Key</p>
                    <p className="text-[11px]">
                      Your custom Gemini API Key (if provided) is stored directly in your encrypted user account or local storage to run AI Study Mentors and doubt solvers. It is never shared or sold.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">3. WBCHSE Exam Performance</p>
                    <p className="text-[11px]">
                      Your MCQ test scores, streak counts, and mistakes bank are saved securely to generate personal AI insights and keep track of your Semester 3 preparation.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">4. User Privacy Rights</p>
                    <p className="text-[11px]">
                      You have total control over your account. You can log out anytime or update your profile details in Hub Settings.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wide">5. App Developer & Ownership</p>
                    <p className="text-[11px]">
                      This application is developed and owned by <strong>Darkness</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                  I Understand & Agree
                </button>
              </motion.div>
            </div>
          )}
        </>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Back to Landing Page Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            type="button"
            onClick={() => setShowAuthForm(false)}
            className="px-4 py-2 bg-white border border-slate-200 shadow-md rounded-2xl text-slate-600 hover:text-indigo-600 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowRight size={14} className="rotate-180" />
            <span>Back to App Overview</span>
          </button>
        </div>

        {/* Dynamic Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-xl w-full space-y-8 relative z-10 my-8"
        >
          <div className="space-y-4">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto border border-white shadow-xl shadow-indigo-100"
            >
              <Bot className="text-indigo-600" size={40} />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {isRegistering ? "Student Registration" : "Stranger Study Sync"}
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {isRegistering ? "Join our WBCHSE Class 12 study portal" : "Sign in to access your AI mentor & exams"}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-[3.5rem] border border-white shadow-2xl shadow-indigo-100/50">
            {isRegistering ? (
              <div className="space-y-8">
                {/* Progress Header */}
                <div className="flex items-center justify-between mb-8 px-4">
                  {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 relative ${
                        regStep >= s.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "bg-slate-100 text-slate-300"
                      }`}>
                        {regStep > s.id ? <Check size={20} strokeWidth={3} /> : s.icon}
                        {regStep === s.id && (
                          <motion.div 
                            layoutId="ring"
                            className="absolute -inset-1 border-2 border-indigo-200 rounded-[1.4rem]"
                            initial={false}
                          />
                        )}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${regStep >= s.id ? "text-indigo-600" : "text-slate-300"}`}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={regStep}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -10 }}
                    className="space-y-8 min-h-[300px] flex flex-col justify-center"
                  >
                    <div className="text-center space-y-2">
                       <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">{steps[regStep-1].title}</h3>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{steps[regStep-1].sub}</p>
                    </div>

                    {regStep === 1 && (
                      <div className="space-y-6">
                        <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] border border-amber-100 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Sparkles size={64} /></div>
                          <div className="flex gap-6 items-center relative z-10">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-amber-500 shadow-xl shadow-amber-200/50 shrink-0"><BookOpen size={32} /></div>
                            <div className="text-left">
                              <p className="text-[11px] font-black text-amber-800/60 uppercase tracking-widest mb-1">Morning Motivation</p>
                              <p className="text-sm font-bold text-amber-900 leading-snug">"Education is the key to the future. Start your study sync today, {registrationForm.name || "Stranger"}!"</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-left">
                          <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Identify Yourself</label>
                          <input 
                            type="text" 
                            placeholder="YOUR FULL NAME"
                            value={registrationForm.name}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.8rem] px-8 py-5 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    )}

                    {regStep === 2 && (() => {
                      const pass = registrationForm.password || "";
                      const hasMinLen = pass.length >= 8;
                      const hasNumber = /\d/.test(pass);
                      const hasSpecial = /[^A-Za-z0-9]/.test(pass);
                      return (
                        <div className="space-y-5">
                          <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex items-center gap-6">
                            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30"><Shield size={28} /></div>
                            <div className="text-left">
                               <p className="text-xs font-bold text-slate-300">"Security starts with a strong key. Choose a handle you'll remember."</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <input 
                              type="text" 
                              placeholder="@USERNAME"
                              value={registrationForm.username}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, username: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 py-5 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black"
                            />
                            <div className="relative">
                              <input 
                                type={showRegPassword ? "text" : "password"} 
                                placeholder="SECRET PASSWORD"
                                value={registrationForm.password}
                                onChange={(e) => setRegistrationForm(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-8 pr-14 py-5 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-black"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>

                            <div className="mt-3 px-2 space-y-2 text-xs">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Password Strength Rules:</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div className={`flex items-center gap-2 font-bold transition-colors duration-200 ${hasMinLen ? "text-emerald-600" : "text-slate-400"}`}>
                                  {hasMinLen ? <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" /> : <XCircle size={14} className="text-rose-300" />}
                                  <span>8+ Characters</span>
                                </div>
                                <div className={`flex items-center gap-2 font-bold transition-colors duration-200 ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                                  {hasNumber ? <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" /> : <XCircle size={14} className="text-rose-300" />}
                                  <span>1+ Number</span>
                                </div>
                                <div className={`flex items-center gap-2 font-bold transition-colors duration-200 ${hasSpecial ? "text-emerald-600" : "text-slate-400"}`}>
                                  {hasSpecial ? <CheckCircle2 size={14} className="text-emerald-500 animate-pulse" /> : <XCircle size={14} className="text-rose-300" />}
                                  <span>1+ Special</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {regStep === 3 && (
                      <div className="space-y-5">
                        <div className="flex justify-center -space-x-4">
                           <div className="w-12 h-12 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center text-indigo-600"><Bot size={22} /></div>
                           <div className="w-12 h-12 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center text-amber-600"><Cpu size={22} /></div>
                        </div>

                        {/* Step-by-step English Guide Card */}
                        <div className="p-4 bg-slate-900 text-white rounded-[1.8rem] space-y-2.5 text-left shadow-xl border border-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                              <Key size={16} />
                              <span>How to Get Free Gemini API Key</span>
                            </div>
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0"
                            >
                              <span>Get Key</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <ol className="text-[11px] text-slate-300 space-y-1 list-decimal pl-4 font-sans leading-relaxed">
                            <li>Click <strong>"Get Key"</strong> button above to open Google AI Studio.</li>
                            <li>Sign in with your standard Google Account.</li>
                            <li>Click <strong>"Create API key"</strong> &rarr; <em>"Create API key in new project"</em>.</li>
                            <li>Copy your key (starts with <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded font-mono text-[10px]">AIzaSy...</code>) and paste it below.</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <input 
                            type="email" 
                            placeholder="PERSONAL EMAIL (Required)"
                            value={registrationForm.email}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                          />
                          <div className="relative font-sans">
                            <input 
                              type={showRegApiKey ? "text" : "password"} 
                              placeholder="GEMINI API KEY (Optional, starts with AIzaSy...)"
                              value={registrationForm.apiKey}
                              onChange={(e) => setRegistrationForm(prev => ({ ...prev, apiKey: e.target.value }))}
                              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] pl-6 pr-14 py-4 text-slate-600 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegApiKey(!showRegApiKey)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showRegApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {regStep === 4 && (
                      <div className="space-y-6">
                         <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto border-4 border-white shadow-xl shadow-indigo-100/50">
                            <Target size={36} />
                         </div>
                         <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Your Specialization</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'exam_prep', label: 'EXAM PREP', icon: '📝' },
                            { id: 'doubt_solving', label: 'DOUBTS', icon: '❓' },
                            { id: 'mcq_practice', label: 'MCQ RUN', icon: '⚡' },
                            { id: 'revision', label: 'REVISION', icon: '🔄' }
                          ].map(r => (
                            <button
                              key={r.id}
                              onClick={() => setRegistrationForm(prev => ({ ...prev, reason: r.id }))}
                              className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${
                                registrationForm.reason === r.id ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200" : "bg-white border-slate-100 text-slate-500 hover:border-indigo-200"
                              }`}
                            >
                              <span className="text-xl mb-2 block">{r.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest block">{r.label}</span>
                              {registrationForm.reason === r.id && (
                                <motion.div layoutId="check-goal" className="absolute top-4 right-4"><Check size={16} /></motion.div>
                              )}
                            </button>
                          ))}
                        </div>
                        {loginError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 py-3 rounded-full">{loginError}</p>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-4 pt-6">
                   {regStep > 1 && (
                     <button 
                        onClick={() => setRegStep(s => s - 1)}
                        className="p-6 rounded-3xl bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:text-slate-600 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
                     >
                       <ArrowLeft size={18} />
                       Back
                     </button>
                   )}
                   <button 
                      onClick={() => {
                        if (regStep < 4) {
                          // Basic validation per step
                          if (regStep === 1 && !registrationForm.name) return setLoginError("Name kothai? (Please enter name)");
                          if (regStep === 2) {
                            if (!registrationForm.username || !registrationForm.password) {
                              return setLoginError("Handle ar password dorkar! (Handle/pass required)");
                            }
                            const pass = registrationForm.password;
                            if (pass.length < 6) {
                              return setLoginError("Password must be at least 6 characters long!");
                            }
                          }
                          if (regStep === 3) {
                            if (!registrationForm.email) return setLoginError("Email address lagbe! (Email required)");
                            if (!registrationForm.email.includes("@")) return setLoginError("Valid email format koro! (e.g. user@gmail.com)");
                          }
                          setLoginError(null);
                          setRegStep(s => s + 1);
                        } else {
                          if (!registrationForm.reason) setRegistrationForm(prev => ({ ...prev, reason: "exam_prep" }));
                          handleRegister();
                        }
                      }}
                      disabled={isSyncing}
                      className="flex-1 py-6 bg-slate-900 text-white rounded-[2.2rem] font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_40px_-15px_rgba(15,23,42,0.4)] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                     {regStep === 4 ? (isSyncing ? "SYNCING..." : "ENTER STRANGER STUDY") : "NEXT PHASE"}
                     {regStep < 4 ? <ArrowRight size={18} /> : <Sparkles size={18} className="text-amber-400" />}
                   </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomLogin} className="space-y-6">
                <div className="space-y-4">
                   <div className="p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center gap-5 relative overflow-hidden group">
                      <div className="absolute -top-4 -right-4 bg-indigo-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
                      <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-100 shrink-0">
                        <GraduationCap size={28} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-base font-black text-slate-800 tracking-tight leading-none italic">Welcome Back</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stranger Study Sync v2.5</p>
                      </div>
                   </div>

                  <div className="space-y-4">
                    {/* Google Quick Sign-In Card (Primary Option) */}
                    <div className="p-5 bg-white border border-slate-200 shadow-md rounded-[2rem] space-y-3.5 text-left">
                      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md">
                          <Bot size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">STUDY STRANGER</h3>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                            WBCHSE Class 12 AI Companion
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isSyncing}
                        className="w-full py-4 px-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-2xl font-extrabold text-xs tracking-wide flex items-center justify-center gap-3 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                      >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                        <span>{isSyncing ? "Connecting Google..." : "Sign in with Google Account"}</span>
                      </button>

                      {/* Data & Account Privacy Notice */}
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 text-[10.5px] text-slate-700 font-sans">
                        <div className="flex items-center justify-between text-indigo-700 font-bold">
                          <span className="flex items-center gap-1.5 text-xs font-black">
                            <Shield size={14} className="text-indigo-600" />
                            Study Stranger App Policy & Privacy:
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            className="text-[10px] text-indigo-600 font-black underline hover:text-indigo-800"
                          >
                            Read Full Policy
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Sign-in uses official Google Firebase server domain (<code>fundamental-tract-2sjh2.firebaseapp.com</code>) for <strong>Study Stranger</strong>.
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[10px]">
                          <li><strong>Data Collected:</strong> Name & Email for student account identification.</li>
                          <li><strong>Study Progress:</strong> Quiz scores, WBCHSE notes & streaks backed up in Firebase.</li>
                          <li><strong>Privacy Guarantee:</strong> Zero third-party tracking or data sharing.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      <span className="h-px flex-1 bg-slate-200" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OR LOGIN WITH USERNAME</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest flex items-center gap-2">
                          <UserIcon size={12} className="text-slate-400" />
                          Username or Email
                        </label>
                        <input 
                          type="text" 
                          placeholder="USERNAME OR EMAIL"
                          name="username"
                          autoComplete="username"
                          value={loginInput.username}
                          onChange={(e) => setLoginInput(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest flex items-center gap-2">
                          <Lock size={12} className="text-slate-400" />
                          Secret Key (Password)
                        </label>
                        <div className="relative">
                          <input 
                            type={showLoginPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            name="password"
                            autoComplete="current-password"
                            value={loginInput.password}
                            onChange={(e) => setLoginInput(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-6 pr-14 py-4 text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-2 pt-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500/20"
                          />
                          <label htmlFor="rememberMe" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                            Remember Me
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={handleGuestSignIn}
                          disabled={isSyncing}
                          className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-wider"
                        >
                          Guest Entry &rarr;
                        </button>
                      </div>
                    </div>
                  </div>

                  {loginError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-black text-center uppercase tracking-widest">
                      {loginError}
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSyncing}
                    className="w-full group relative overflow-hidden px-8 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSyncing ? "SYNCING..." : "ENTER PORTAL WITH USERNAME"}
                      <Sparkles size={16} className="text-amber-400" />
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-2">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError(null);
                setRegStep(1);
              }}
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-indigo-400 transition-all"
            >
              {isRegistering ? "Wait, I already have a handle" : "New Stranger? Join the Study Sync"}
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-2 pt-4 relative z-10">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-white/10"></span>
            <button 
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.2em] underline transition-colors flex items-center gap-1.5"
            >
              <Shield size={12} className="text-indigo-400" />
              <span>Privacy Policy & Terms</span>
            </button>
            <span className="h-px w-8 bg-white/10"></span>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold tracking-wide">
            WBCHSE Class 12 • Developed by Darkness
          </p>
        </div>

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl text-slate-300 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-sm uppercase tracking-wider">
                  <Shield size={20} />
                  <span>Privacy Policy & Security</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p className="font-bold text-white">
                  Study Stranger ("Class 12 WBCHSE Companion") Privacy Notice:
                </p>

                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 space-y-1">
                  <p className="font-extrabold text-indigo-300 text-[11px] uppercase tracking-wide">1. Data Encryption & Firebase Auth Domain</p>
                  <p className="text-[11px] text-indigo-100/80">
                    All user logins (Username/Email & Google Sign-In via <code className="bg-white/10 px-1 py-0.5 rounded text-amber-300 font-mono">fundamental-tract-2sjh2.firebaseapp.com</code>) are secured using Google Firebase SSL/TLS encryption. Your credentials and passwords are encrypted and safe under <strong>Study Stranger</strong> security policy.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="font-extrabold text-white text-[11px] uppercase tracking-wide">2. Personal Gemini API Key</p>
                  <p className="text-[11px] text-slate-400">
                    Your custom Gemini API Key (if provided) is stored directly in your encrypted user account or local storage to run AI Study Mentors and doubt solvers. It is never shared or sold.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="font-extrabold text-white text-[11px] uppercase tracking-wide">3. WBCHSE Exam Performance</p>
                  <p className="text-[11px] text-slate-400">
                    Your MCQ test scores, streak counts, and mistakes bank are saved securely to generate personal AI insights and keep track of your Semester 3 preparation.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="font-extrabold text-white text-[11px] uppercase tracking-wide">4. User Privacy Rights</p>
                  <p className="text-[11px] text-slate-400">
                    You have total control over your account. You can log out anytime or update your profile details in Hub Settings.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <p className="font-extrabold text-white text-[11px] uppercase tracking-wide">5. App Developer & Ownership</p>
                  <p className="text-[11px] text-slate-400">
                    This application is developed and owned by <strong className="text-amber-400">Darkness</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-indigo-500/25"
              >
                I Understand & Agree
              </button>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative overflow-hidden m-0 p-0 ${
      interfaceType === "android" ? "md:bg-slate-950 md:p-6 md:items-center md:justify-center md:flex" : ""
    }`}>
      {interfaceType === "android" && (
        <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          <CinematicBackground character={selectedCharacter} state={appState} />
        </div>
      )}

      {/* Device frame wrapper inside */}
      <div className={`w-full h-full flex flex-col relative overflow-hidden ${
        interfaceType === "android"
          ? "md:max-w-[430px] md:h-[860px] md:rounded-[44px] md:border-[12px] md:border-stone-900 md:shadow-[0_30px_70px_rgba(0,0,0,0.8)] md:bg-[#f8fafc] md:relative md:z-10"
          : ""
      }`}>
        {/* Android system status bar mock */}
        {interfaceType === "android" && (
          <div className="hidden md:flex bg-white px-5 py-2 items-center justify-between text-[10px] font-mono text-zinc-500 font-bold select-none border-b border-slate-100 flex-shrink-0 relative z-50">
            <span className="flex items-center gap-1">
              Stranger Sim <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1 scale-90 font-sans">5G</span>
            </span>
            <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center text-[7px] gap-1 opacity-90 mx-auto -mt-1 mr-auto pointer-events-none">
              <span className="w-1.5 h-1.5 bg-sky-950 rounded-full border border-zinc-800" />
              <span className="w-1 h-1 bg-sky-900 rounded-full" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>100%</span>
              <div className="w-5 h-2.5 bg-slate-200 rounded-sm border border-slate-300 p-0.5 flex">
                <div className="h-full w-full bg-emerald-500 rounded-[2px]" />
              </div>
              <span className="font-sans font-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        )}

        <CinematicBackground character={selectedCharacter} state={appState} />
      
      {/* Header */}
      {/* Camera Preview */}
      <div className={`fixed bottom-32 right-6 z-50 transition-all duration-500 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white ${isCameraActive ? 'w-48 h-32 opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-50'}`}>
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <header className="relative z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-2xl border-b border-slate-100/50 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView("dashboard")}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-50 border border-slate-100 p-1 cursor-pointer transition-all hover:bg-slate-100 shrink-0"
            title="Study Stranger AI Hub"
          >
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 flex items-center justify-center font-black text-sm md:text-base text-indigo-600">
              {currentView === "dashboard" ? (
                <Bot size={20} className="text-indigo-600" />
              ) : (
                <span>{selectedCharacter[0].toUpperCase()}</span>
              )}
            </div>
          </motion.div>
          <div>
            <h1 className="text-[10px] md:text-xs font-black tracking-[0.2em] text-slate-900 uppercase font-mono italic leading-none">
              {currentView === "dashboard" ? "Study Stranger" : `Node: ${selectedCharacter}`}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSessionActive ? 'bg-emerald-500 glow-emerald animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  {isSessionActive ? 'Live' : 'Idle'}
                </span>
              </div>
              {appState !== 'idle' && (
                <>
                  <div className="w-[1px] h-2 bg-slate-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-indigo-600 uppercase font-bold animate-pulse">
                      {appState}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Interface view mode switcher */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 mr-1">
            <button
              onClick={() => {
                setInterfaceType("desktop");
                localStorage.setItem("pref_interface_type", "desktop");
                addGlobalAction("Switched workspace type to PC/Desktop format");
              }}
              className={`px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                interfaceType === "desktop" 
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Switch to PC Notebook/PC Layout"
            >
              <Monitor size={12} />
              <span>PC View</span>
            </button>
            <button
              onClick={() => {
                setInterfaceType("android");
                localStorage.setItem("pref_interface_type", "android");
                addGlobalAction("Switched workspace type to simulated Android App frame");
              }}
              className={`px-2.5 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                interfaceType === "android" 
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Switch to Android Mobile Device Layout"
            >
              <Smartphone size={12} />
              <span>Android App</span>
            </button>
          </div>

          {user && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdsCenter(true)} 
              className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 text-amber-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer mr-1 font-sans shadow-sm"
              title="Rewards Hub (পয়েন্ট এবং বিজ্ঞাপন)"
            >
              <Coins size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-mono">{user.points || 0} PTS</span>
              {user.premiumUnlocked && (
                <span className="text-[8px] bg-indigo-600 text-white rounded px-1.5 py-0.5 text-[7px] tracking-wide font-black">🌟 PRO</span>
              )}
            </motion.button>
          )}
          {user && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMemoryVault(true)} 
              className="p-2 md:p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all shadow-sm flex items-center gap-1.5"
              title="AI Memory Vault (এআই মেমোরি ব্যাংক)"
            >
              <Brain size={16} />
              <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">Memory</span>
            </motion.button>
          )}

          {user && (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => syncUserProfile({ lastActive: new Date().toISOString() })} 
              className="p-2 md:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all shadow-sm"
              title="User Account"
            >
              <UserIcon size={16} />
            </motion.button>
          )}

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)} 
            className="p-2 md:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all group shadow-sm"
            title="App Settings"
          >
            <Settings size={16} className="group-hover:rotate-45 transition-transform" />
          </motion.button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 h-full w-full relative flex flex-col md:flex-row overflow-hidden">
        {currentView === "dashboard" ? (
          <Dashboard 
            userName={user?.displayName || "Abhijit"} 
            userPhoto={user?.photoURL}
            userUid={user?.uid}
            onLogin={login}
            onLogout={logout}
            dailyGoals={dailyGoals}
            globalActions={globalActions}
            isAdmin={user?.isAdmin}
            onOpenBuildDocs={() => setShowBuildDocs(true)}
            toggleGoal={(id) => {
              const updated = dailyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
              setDailyGoals(updated);
              if (user) {
                localStorage.setItem(`goals_${user.uid}`, JSON.stringify(updated));
                if (updated.find(g => g.id === id)?.completed) {
                   addGlobalAction(`Completed goal: ${updated.find(g => g.id === id)?.text}`);
                }
              }
            }}
            onAction={(action) => {
              if (action.startsWith('search_topic:')) {
                const topic = action.split(':')[1];
                setExploredTopic(topic);
                return;
              }
              if (action === 'begin_sync') toggleListening();
              if (action === 'show_history') setShowHistoryModal(true);
              if (action === 'show_math') setShowMathSolver(true);
              if (action === 'show_mock') setShowMockTest(true);
              if (action === 'show_syllabus') setShowSyllabus(true);
              if (action === 'show_mistakes') setShowMistakeBank(true);
              if (action === 'show_doubt') setShowDoubtSolver(true);
              if (action === 'show_revision') setShowRevisionCards(true);
              if (action === 'show_insights') setShowPerformanceInsights(true);
              if (action === 'show_scanner') setShowScanner(true);
              if (action === 'show_speedblitz') setShowSpeedBlitz(true);
              if (action === 'show_leaderboard') setShowLeaderboard(true);
              if (action === 'show_resources') setShowResourceLibrary(true);
              if (action === 'show_mindmap') setShowMindMap(true);
              if (action === 'show_ads') setShowAdsCenter(true);
              if (action === 'show_study_advantage') setShowStudyAdvantage(true);
              if (action === 'show_memory') setShowMemoryVault(true);
            }} 
          />
        ) : (
          <>
            {/* Desktop Sidebar: Chat */}
            <aside className="hidden md:flex flex-col w-80 border-r border-slate-100 bg-slate-50/50 backdrop-blur-3xl p-4 gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
              <MessageSquare size={12} /> System_Logs
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={saveCurrentSession}
                title="Save & New Session"
                className="text-slate-300 hover:text-indigo-500 transition-colors"
              >
                <Sparkles size={12} />
              </button>
              <button onClick={() => setMessages([])} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={`msg-${msg.id}-${idx}`} className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[95%] p-3 rounded-xl text-[11px] leading-relaxed font-mono ${
                  msg.sender === 'user' ? 'bg-indigo-50 color-indigo-600 border border-indigo-100' : 'bg-white text-slate-600 border border-slate-200'
                }`}>
                  <div className="opacity-40 mb-1 flex justify-between gap-4">
                    <span>{msg.sender === 'user' ? 'ABHIJIT' : 'MENTOR'}</span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </aside>

        {/* Centre Content area */}
        <section className="flex-1 relative flex flex-col min-w-0">
          {/* Mobile Sub-Tabs (Mentor/Board/Tools) - Only shown in Active View on Mobile at the top */}
          {currentView === 'active' && (
            <div className="md:hidden w-full flex justify-center px-4 pt-3 pb-1 z-40 relative">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[340px] pointer-events-auto bg-stone-900/90 backdrop-blur-2xl border border-stone-800 rounded-[2rem] p-1 flex gap-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.4)]"
              >
                {[
                  { id: 'mentor', label: 'Mentor', icon: <UserIcon size={14} /> },
                  { id: 'board', label: 'Board', icon: <BoardIcon size={14} /> },
                  { id: 'tools', label: 'Tools', icon: <BookOpen size={14} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as MobileTab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[1.5rem] text-[9.5px] uppercase tracking-wider transition-all ${
                      activeTab === tab.id 
                        ? 'bg-[#EF6D2F] text-white shadow-lg shadow-[#EF6D2F]/30 font-black scale-[1.02]' 
                        : 'text-stone-400 hover:text-white hover:bg-stone-800/50 font-bold'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </motion.div>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Mentor Sync - Main View */}
              {activeTab === 'mentor' && (
                <motion.div
                  key="mentor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Visualizer state={appState} characterName={selectedCharacter} currentVisual={currentVisual} expression={expression} />
                </motion.div>
              )}

              {/* Learning Board */}
              {activeTab === 'board' && (
                <motion.div
                  key="board"
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 flex flex-col p-4 md:p-8"
                >
                  <LiveBoard 
                    elements={boardElements} 
                    isExpanded={isBoardExpanded} 
                    onToggleExpand={() => setIsBoardExpanded(!isBoardExpanded)} 
                    onClearBoard={clearBoard}
                  />
                </motion.div>
              )}

              {/* Study Tools Hub */}
              {activeTab === 'tools' && (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 p-6 md:p-12 overflow-y-auto"
                >
                  <div className="max-w-4xl mx-auto space-y-12 pb-60">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 leading-none">
                        <Sparkles className="text-indigo-500" />
                        Academic Hub
                      </h2>
                      <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Study stranger • Session Tools</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {[
                        { id: 'math', label: 'Math Solver', desc: 'AI Equation Resolver', icon: <Calculator size={24} />, action: () => setShowMathSolver(true), color: 'bg-indigo-50 text-indigo-600', shadow: 'shadow-indigo-100' },
                        { id: 'test', label: 'Mock Exam', desc: 'Syllabus Based Tests', icon: <Brain size={24} />, action: () => setShowMockTest(true), color: 'bg-rose-50 text-rose-600', shadow: 'shadow-rose-100' },
                        { id: 'syllabus', label: 'Syllabus', desc: 'WBCHSE Sem 3 Tracking', icon: <BookOpen size={24} />, action: () => setShowSyllabus(true), color: 'bg-emerald-50 text-emerald-600', shadow: 'shadow-emerald-100' },
                        { id: 'history', label: 'Session Hist', desc: 'Previous Interactions', icon: <Clock size={24} />, action: () => setShowHistoryModal(true), color: 'bg-amber-50 text-amber-600', shadow: 'shadow-amber-100' },
                      ].map((tool, i) => (
                        <motion.button
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={tool.action}
                          className="p-6 md:p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all flex items-start gap-6 text-left group"
                        >
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl ${tool.color} flex items-center justify-center transition-all group-hover:scale-110 ${tool.shadow}`}>
                            {tool.icon}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-base md:text-lg font-black text-slate-800">{tool.label}</span>
                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{tool.desc}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
          </>
        )}
      </main>

      {/* Nav Hub & Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 md:px-6 pb-2.5 md:pb-5 pt-2 flex flex-col items-center pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/20 to-transparent pointer-events-none" />

        {/* Global Navigation Hub */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px] pointer-events-auto"
        >
          <nav className="bg-stone-900/90 backdrop-blur-2xl border border-stone-800 rounded-[2.5rem] p-1.5 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between relative group/nav">
            {/* Home Button */}
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`group flex flex-col items-center gap-1 px-3 py-1 md:px-4 md:py-2 transition-all active:scale-95 ${currentView === 'dashboard' ? 'text-[#FF7A30]' : 'text-stone-400'}`}
            >
              <motion.div 
                whileHover={{ scale: 1.08 }}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${currentView === 'dashboard' ? 'bg-[#FF7A30] text-white shadow-lg shadow-[#FF7A30]/35' : 'bg-stone-800 border border-stone-700 hover:bg-stone-700 hover:text-white text-stone-300'}`}
              >
                <Layout size={currentView === 'dashboard' ? 20 : 18} />
              </motion.div>
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${currentView === 'dashboard' ? 'text-[#FF7A30]' : 'text-stone-500 group-hover:text-stone-400'}`}>Home</span>
            </button>

            {/* Mentor Button - Primary Action */}
            <button 
              onClick={toggleListening}
              className={`group flex flex-col items-center gap-1 transition-all active:scale-95 -mt-5 md:-mt-8`}
            >
              <motion.div 
                animate={isSessionActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative ${
                  isSessionActive ? 'bg-[#FF7A30] text-white shadow-[#FF7A30]/40' : 'bg-stone-100 text-stone-900 shadow-stone-950/40 hover:bg-white'
                }`}
              >
                <div className={`absolute inset-0 rounded-full animate-ping opacity-15 ${isSessionActive ? 'bg-[#FF7A30]' : 'bg-white'}`} />
                {isSessionActive ? <MicOff size={22} className="stroke-[2.5]" /> : <Mic size={22} className="stroke-[2.5]" />}
              </motion.div>
              <span className={`text-[9.5px] md:text-[11.5px] font-black uppercase tracking-[0.15em] transition-colors mt-0.5 ${isSessionActive ? 'text-[#FF7A30]' : 'text-stone-300 group-hover:text-stone-200'}`}>
                {isSessionActive ? 'Syncing' : 'Mentor'}
              </span>
            </button>

            {/* Hub Button */}
            <button 
              onClick={() => setShowSettings(true)}
              className="group flex flex-col items-center gap-1 px-3 py-1 md:px-4 md:py-2 transition-all active:scale-95 text-stone-400"
            >
              <motion.div 
                whileHover={{ scale: 1.08 }}
                className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-stone-800 flex items-center justify-center hover:bg-stone-700 hover:text-white transition-all duration-300 border border-stone-700 text-stone-300"
              >
                <Settings size={18} className="group-hover:rotate-45 transition-transform text-inherit" />
              </motion.div>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-colors text-stone-500 group-hover:text-stone-400">Hub</span>
            </button>
          </nav>
        </motion.div>

        <AnimatePresence>
          {permError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-lg bg-red-950/90 border border-red-500/40 text-red-200 p-5 rounded-3xl flex flex-col gap-3 shadow-2xl backdrop-blur-2xl mb-4 pointer-events-auto"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                  <MicOff size={16} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#EF6D2F]">
                  {permError.toLowerCase().includes("key") ? "Settings Required (সেটিংস প্রয়োজন)" : "System Error (সিস্টেম ত্রুটি)"}
                </p>
                <button onClick={() => setPermError(null)} className="ml-auto p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"><X size={14} /></button>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium leading-relaxed text-stone-200">{permError}</p>
                {permError.toLowerCase().includes("key") && (
                  <p className="text-[11px] text-orange-400/95 font-medium leading-relaxed">
                    {user?.displayName || "Stranger"}, হাবে (Settings) গিয়ে "Personal API Key" বক্সে তোমার Gemini API Key পেস্ট করে দাও, তারপর কথা বলো।
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5 mt-1">
                <button 
                  onClick={() => setPermError(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-stone-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Dismiss (বন্ধ করো)
                </button>
                {permError.toLowerCase().includes("key") ? (
                  <button 
                    onClick={() => { setPermError(null); setShowSettings(true); }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Open settings (সেটিংস খোলো)
                  </button>
                ) : (
                  <button 
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="px-4 py-2 bg-[#EF6D2F] hover:bg-[#EF6D2F]/80 shadow-lg shadow-[#EF6D2F]/25 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Open in New Tab (নতুন ট্যাবে খোলো)
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTextInput && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleTextSubmit}
              className="w-full max-w-[340px] flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 pl-4 shadow-xl pointer-events-auto mb-4"
            >
              <input 
                type="text"
                value={textInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextInput(val);
                  localStorage.setItem("draft_textInput", val);
                }}
                placeholder={`Type your message...`}
                className="flex-1 bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-300 text-xs py-2"
                autoFocus
              />
              <button type="submit" disabled={!textInput.trim()} className="p-2.5 rounded-xl bg-slate-900 text-white disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10">
                <Send size={16} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Camera Toggle Button floating beautifully on bottom left */}
        {currentView === "active" && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={toggleCamera}
            className={`absolute bottom-3 left-4 md:bottom-6 md:left-8 pointer-events-auto w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-[0_8px_30px_rgba(46,37,32,0.08)] ${
              isCameraActive 
                ? "bg-[#EF6D2F] border-[#EF6D2F] text-white shadow-[#EF6D2F]/25" 
                : "bg-white/95 backdrop-blur-md border-[#EFE5DC] text-[#2E2520] hover:text-[#EF6D2F]"
            }`}
          >
            {isCameraActive ? <CameraOff size={18} /> : <Camera size={18} />}
          </motion.button>
        )}
        
        {/* Keyboard/Text Chat Trigger floating beautifully on bottom right */}
        {currentView === "active" && !isSessionActive && (
          <motion.button 
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setShowTextInput(!showTextInput)} 
            className={`absolute bottom-3 right-4 md:bottom-6 md:right-8 pointer-events-auto w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-[0_8px_30px_rgba(46,37,32,0.08)] ${
              showTextInput 
                ? "bg-[#2E2520] border-[#2E2520] text-white shadow-stone-800/20" 
                : "bg-white/95 backdrop-blur-md border-[#EFE5DC] text-[#2E2520] hover:text-[#EF6D2F]"
            }`}
          >
            <Keyboard size={18} />
          </motion.button>
        )}
      </footer>

      {/* Ads Center Overlay */}
      <AdsCenter 
        isOpen={showAdsCenter}
        onClose={() => setShowAdsCenter(false)}
        userPoints={user?.points || 0}
        premiumUnlocked={!!user?.premiumUnlocked}
        onUpdatePoints={handleUpdatePoints}
        onUnlockPremium={handleUnlockPremium}
        userName={user?.displayName || "Abhijit"}
      />

      {/* Study Advantage Overlay */}
      <StudyAdvantage 
        isOpen={showStudyAdvantage}
        onClose={() => setShowStudyAdvantage(false)}
        userPoints={user?.points || 0}
        onUpdatePoints={handleUpdatePoints}
        userName={user?.displayName || "Abhijit"}
      />

      {/* Virtual Dialer & Active Outbound Call Screen Overlays */}
      <VirtualDialer 
        isOpen={showDialer}
        onClose={() => setShowDialer(false)}
        selectedCharacter={selectedCharacter}
        characterAvatars={characterAvatars}
        onInitiateCall={initiateCall}
      />

      <ActiveCallScreen 
        activeCall={activeCall}
        selectedCharacter={selectedCharacter}
        characterAvatars={characterAvatars}
        onDisconnect={endCall}
        callHistory={callHistory}
        onInitiateCall={initiateCall}
      />

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center p-6 overflow-y-auto pt-20">
            <div className="w-full max-w-md bg-zinc-900 rounded-[32px] border border-white/10 p-8 relative shadow-2xl h-fit">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-8">Settings</h2>
              
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Choose Your Mentor</label>
                    <p className="text-[11px] text-white/40 italic">{user?.displayName || "Stranger"}, এখানে তোমার পছন্দের মেন্টর বেছে নাও (Choose your preferred mentor here):</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    {(['stranger', 'anjali', 'zoya', 'khud', 'rohan', 'ishani', 'mahi'] as const).map(id => (
                      <button
                        key={id}
                        onClick={() => {
                          setSelectedCharacter(id);
                          syncUserProfile({ selectedCharacter: id });
                        }}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${
                          selectedCharacter === id 
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                        }`}
                      >
                        <div className="relative">
                           <img src={characterAvatars[id]} className={`w-12 h-12 rounded-full border-2 transition-all ${selectedCharacter === id ? 'border-indigo-400' : 'border-white/10 group-hover:border-white/30'}`} />
                           {selectedCharacter === id && (
                             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                             </div>
                           )}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-black uppercase tracking-wider">{id === 'stranger' ? 'The Stranger' : id}</span>
                          <span className="text-[9px] opacity-60 font-mono">{selectedCharacter === id ? 'ACTIVE' : 'SELECT'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Personal Gemini API Key</label>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400 font-black hover:underline flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 active:scale-95 transition-all"
                      >
                        Get Free Key <ExternalLink size={10} />
                      </a>
                    </div>
                    <p className="text-[10px] text-white/50 italic">Add your Gemini API Key to run your AI Study Mentor (তোমার নিজস্ব এপিআই কি ব্যবহার করতে পারো):</p>
                  </div>

                  {/* Step-by-step English Guide Card */}
                  <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-white/10 text-[11px] text-slate-300 space-y-2 font-sans leading-relaxed">
                    <div className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Key size={14} /> How to get a 100% Free Gemini API Key:
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[10.5px]">
                      <li>Click the <strong className="text-amber-300">"Get Free Key"</strong> button above to open Google AI Studio.</li>
                      <li>Sign in with your Google account.</li>
                      <li>Click <strong className="text-white">"Create API key"</strong> &rarr; <em className="text-indigo-300">"Create API key in new project"</em>.</li>
                      <li>Copy your key (starts with <code className="bg-white/10 text-amber-300 px-1 py-0.5 rounded font-mono text-[9px]">AIzaSy...</code>) and paste it below.</li>
                    </ol>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-emerald-400 transition-colors">
                      <Shield size={16} />
                    </div>
                    <input 
                      type="password"
                      value={customApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomApiKey(val);
                        syncUserProfile({ geminiApiKey: val });
                      }}
                      placeholder="Paste your GEMINI_API_KEY here (starts with AIzaSy)..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Quiz & Math API Key</label>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full"
                      >
                        Get Key (এপিআই কি নাও) <ChevronRight size={10} />
                      </a>
                    </div>
                    <p className="text-[10px] text-white/40 italic">
                      Dedicated key for Quizzes, Mock Tests, and Math Problems (কুইজ এবং গণিত সমাধানের জন্য আলাদা এপিআই কি ব্যবহার করতে পারো):
                    </p>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-white/20 group-focus-within:text-indigo-400 transition-colors">
                      <Shield size={16} />
                    </div>
                    <input 
                      type="password"
                      value={quizMathApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuizMathApiKey(val);
                        syncUserProfile({ quizMathApiKey: val });
                      }}
                      placeholder="Same as Mentor Key (ফাঁকা রাখলে মেন্টর কি-টি ব্যবহার হবে)..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-all font-mono"
                    />
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[11px] space-y-3.5 text-white/70">
                    <div className="font-bold text-white uppercase tracking-wider text-[9px] mb-1">Select Gemini Models (মডেল বেছে নাও):</div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-emerald-400 font-bold">🟢 Quizzes & Speed Blitz:</span>
                        <span className="font-mono text-white/40">{preferredQuizModel}</span>
                      </div>
                      <select 
                        value={preferredQuizModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreferredQuizModel(val);
                          localStorage.setItem("pref_quiz_model", val);
                          syncUserProfile({ preferredQuizModel: val });
                        }}
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50 cursor-pointer"
                      >
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Standard & Smart)</option>
                        <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast, Zero Overload)</option>
                        <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Extremely Intelligent)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-indigo-400 font-bold">🔵 Science & Math Solver:</span>
                        <span className="font-mono text-white/40">{preferredMathModel}</span>
                      </div>
                      <select 
                        value={preferredMathModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPreferredMathModel(val);
                          localStorage.setItem("pref_math_model", val);
                          syncUserProfile({ preferredMathModel: val });
                        }}
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50 cursor-pointer"
                      >
                        <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (High reasoning, default)</option>
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced & Highly available)</option>
                        <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Instant solve, bypasses High Demand)</option>
                      </select>
                    </div>
                    
                    <p className="text-[10px] text-white/40 italic pt-1">
                      ⚠️ Note: "High Demand" error ashle simple-vabe model dropdown theke **gemini-3.1-flash-lite** build select koro (Allows you to bypass model overload easily!).
                    </p>
                  </div>
                </div>

                {/* Your Memory Section */}
                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/20 text-amber-400">
                        <Brain size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-white tracking-wider">Your Memory (তোমার এআই মেমোরি ব্যাংক)</h4>
                        <p className="text-[10px] text-indigo-200/70 font-medium">Mentor, Math Solver & Tool Memories saved in Account</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowSettings(false);
                        setShowMemoryVault(true);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Brain size={12} /> Manage Memory
                    </button>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed italic">
                    💡 Account Memory Rule: Proti Account-er jonyo alada memory save thakbe. Same Account re-login korle purono memory auto-restore hoye jabe. User chile individual memory ba all memory delete korte parbe.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-white/40" />
                    <span className="text-sm font-medium">Mute Audio</span>
                  </div>
                  <button onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    syncUserProfile({ isMuted: next });
                  }} className={`w-12 h-6 rounded-full transition-all relative ${isMuted ? 'bg-indigo-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isMuted ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Voice Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['default', 'fast', 'slow', 'emotional'] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => {
                          setVoiceStyle(style);
                          syncUserProfile({ voiceStyle: style });
                        }}
                        className={`px-4 py-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                          voiceStyle === style ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/40'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <LogOut size={18} className="text-red-400" />
                        <span className="text-sm font-medium">Logout</span>
                      </div>
                      <button onClick={logout} className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/30 transition-all">
                        Sign Out
                      </button>
                    </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Access & Export</label>
                  
                  {/* Open in Browser Tab / New Tab Link */}
                  <a 
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 p-4 bg-[#EF6D2F]/20 border border-[#EF6D2F]/40 rounded-2xl text-[#EF6D2F] hover:bg-[#EF6D2F]/30 transition-all text-center filter drop-shadow-[0_0_8px_rgba(239,109,47,0.1)] active:scale-98"
                  >
                    <ExternalLink size={18} />
                    <span className="text-xs font-black uppercase tracking-wider">Open in New Tab (নতুন ট্যাবে খোলো)</span>
                  </a>
                  <p className="text-[10px] text-zinc-400 text-center px-4 leading-relaxed font-medium">
                    {user?.displayName || "Stranger"}, ফুল স্ক্রিনে সহজে ব্যবহারের জন্য উপরের বাটনে ক্লিক করে নতুন ব্রাউজার ট্যাবে খোলো।
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingCommand && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-emerald-400/50">
            <span className="text-sm font-bold">Open requested link?</span>
            <div className="flex gap-2">
              <button onClick={() => { window.open(pendingCommand.url, "_blank"); setPendingCommand(null); }} className="bg-white text-emerald-600 px-6 py-2 rounded-xl text-xs font-bold">Yes</button>
              <button onClick={() => setPendingCommand(null)} className="bg-black/20 text-white px-4 py-2 rounded-xl text-xs font-bold">No</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPermissionModal && <PermissionModal onClose={() => setShowPermissionModal(false)} />}
      
      <AnimatePresence>
        {showMockTest && (
          <MockTest 
            onClose={() => setShowMockTest(false)} 
            character={selectedCharacter} 
            onPointsAwarded={updatePoints} 
            onCompleted={(subject, score) => {
              addGlobalAction(`Achieved ${score}/10 in ${subject} Mock Test!`);
            }}
            apiKey={quizMathEffectiveKey} 
            userName={user?.displayName || "Abhijit"} 
            userId={user?.uid}
          />
        )}
        {showSyllabus && <Syllabus isOpen={showSyllabus} onClose={() => setShowSyllabus(false)} userName={user?.displayName || "Abhijit"} />}
        {showMathSolver && (
          <MathSolver 
            onClose={() => setShowMathSolver(false)} 
            onSolved={(prob) => {
              addGlobalAction(`Just solved a complex math problem: ${prob.slice(0, 30)}...`);
            }}
            apiKey={quizMathEffectiveKey} 
            userName={user?.displayName || "Abhijit"} 
            userId={user?.uid}
          />
        )}
        {showMistakeBank && <MistakeBank onClose={() => setShowMistakeBank(false)} userId={user?.uid} />}
        {showDoubtSolver && <DoubtSolver onClose={() => setShowDoubtSolver(false)} apiKey={quizMathEffectiveKey} userName={user?.displayName || "Abhijit"} userId={user?.uid} />}
        {showMemoryVault && (
          <AIMemoryVault
            isOpen={showMemoryVault}
            onClose={() => setShowMemoryVault(false)}
            userId={user?.uid}
            userName={user?.displayName || "Abhijit"}
          />
        )}
        {showRevisionCards && <RevisionCards onClose={() => setShowRevisionCards(false)} />}
        {showPerformanceInsights && <PerformanceInsights onClose={() => setShowPerformanceInsights(false)} userName={user?.displayName || "Abhijit"} userId={user?.uid} />}
        {showScanner && (
  <SmartScanner 
    onClose={() => setShowScanner(false)} 
    onScanned={() => {
      addGlobalAction(`Scanned new study notes and generated MCQs!`);
    }}
    apiKey={quizMathEffectiveKey} 
  />
)}
        {showResourceLibrary && (
          <ResourceLibrary 
            resources={resources} 
            onClose={() => setShowResourceLibrary(false)} 
            onRemove={(id) => {
              const updated = resources.filter(r => r.id !== id);
              setResources(updated);
              if (user) localStorage.setItem(`resources_${user.uid}`, JSON.stringify(updated));
            }}
          />
        )}
        {showMindMap && <MindMap onClose={() => setShowMindMap(false)} apiKey={quizMathEffectiveKey} />}
        {showSpeedBlitz && <SpeedBlitz onClose={() => setShowSpeedBlitz(false)} userName={user?.displayName || "Abhijit"} apiKey={quizMathEffectiveKey} />}
        {showLeaderboard && <StrangerLeaderboard onClose={() => setShowLeaderboard(false)} currentUserId={user?.uid} />}
        
        {/* Chat History Modal */}
        {showHistoryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Chat Archives</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review your past syncs</p>
                  </div>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatSessions.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Clock size={40} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No sessions archived yet. <br/>Start a sync to build history!</p>
                  </div>
                ) : (
                  chatSessions.map((session, idx) => (
                    <button 
                      key={`session-${session.id}-${idx}`}
                      onClick={() => loadSession(session)}
                      className="w-full p-6 text-left bg-white border border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all group flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-black text-slate-800 tracking-tight text-lg group-hover:text-indigo-600 transition-colors uppercase italic">{session.title}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Calendar size={10} /> {session.date}
                           </span>
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                              {session.messages.length} messages
                           </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowRight size={18} />
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                 <button 
                   onClick={() => {
                     setChatSessions([]);
                     localStorage.removeItem(`sessions_${user?.uid}`);
                   }}
                   className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-all flex items-center gap-2"
                 >
                   <Trash2 size={12} /> Clear Metadata Cache
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {exploredTopic && (
          <TopicExplorer 
            topic={exploredTopic} 
            apiKey={quizMathEffectiveKey}
            onClose={() => setExploredTopic(null)} 
            onStartQuiz={(topic, data) => {
              setExploredTopic(null);
              setStudyTool({ type: "quiz", topic, data });
            }}
          />
        )}
        {studyTool && (
          <StudyTools 
            type={studyTool.type} 
            topic={studyTool.topic} 
            data={studyTool.data} 
            onClose={() => setStudyTool(null)} 
          />
        )}

        <AppBuildDocsModal 
          isOpen={showBuildDocs} 
          onClose={() => setShowBuildDocs(false)} 
          userName={user?.displayName || "Abhijit (Admin)"} 
          isAdmin={!!user?.isAdmin} 
        />
      </AnimatePresence>

      <ActionLog logs={agentLogs} />

      {/* Global Expanded Board Overlay */}
      {isBoardExpanded && (
        <div className="fixed inset-0 z-[1000] bg-black">
          <LiveBoard 
            elements={boardElements} 
            isExpanded={true} 
            onToggleExpand={() => setIsBoardExpanded(false)} 
            onClearBoard={clearBoard}
          />
        </div>
      )}
      </div> {/* Simulated Phone Device wrapper close */}
    </div>
  );
}
