import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Auth from "./Auth.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";
import { ScaleLoader } from "react-spinners";
import { API_BASE_URL } from './config.js';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sanchitx_token") || "");
  const [authLoading, setAuthLoading] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeModel, setActiveModel] = useState("openai/gpt-oss-120b");
  const [availableModels, setAvailableModels] = useState([]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Restore authenticated session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("sanchitx_token");
      if (!savedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { "Authorization": `Bearer ${savedToken}` }
        });
        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
          setToken(savedToken);
        } else {
          localStorage.removeItem("sanchitx_token");
          setToken("");
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem("sanchitx_token");
    setUser(null);
    setToken("");
    setAllThreads([]);
    setPrevChats([]);
    setCurrThreadId(uuidv1());
    setNewChat(true);
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    loading, setLoading,
    user, setUser,
    token, setToken,
    logout,
    activeModel, setActiveModel,
    availableModels, setAvailableModels,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isMobileSidebarOpen, setIsMobileSidebarOpen
  };

  if (authLoading) {
    return (
      <div className="authLoadingScreen">
        <ScaleLoader color="#00d2ff" height={35} width={4} radius={2} />
        <p>Loading SanchitX...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;
