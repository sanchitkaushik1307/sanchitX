import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import sxSymbol from "./assets/sx-symbol.svg";
import { API_BASE_URL } from "./config.js";

function ChatWindow() {
    const {
        prompt, 
        setPrompt, 
        setReply, 
        currThreadId, 
        setPrevChats, 
        setNewChat, 
        setAllThreads,
        loading, 
        setLoading,
        user,
        token,
        logout,
        activeModel,
        setActiveModel,
        availableModels,
        setAvailableModels,
        setIsMobileSidebarOpen
    } = useContext(MyContext);
    
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Fetch Available Groq Models on Mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/models`);
                const data = await response.json();
                if (data.models) {
                    setAvailableModels(data.models);
                    if (!activeModel && data.activeModel) {
                        setActiveModel(data.activeModel);
                    }
                }
            } catch (err) {
                console.error("Failed to load models:", err);
            }
        };
        fetchModels();
    }, []);

    const refreshThreads = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (Array.isArray(res)) {
                setAllThreads(res);
            }
        } catch(err) {
            console.error("Error refreshing threads:", err);
        }
    };

    const getReply = async () => {
        if (!prompt || !prompt.trim() || loading || !token) return;

        const userMessageText = prompt.trim();
        
        // 1. Immediately show user question in chat window
        setPrevChats(prev => [...prev, { role: "user", content: userMessageText }]);
        setPrompt("");
        setNewChat(false);
        setLoading(true);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                message: userMessageText,
                threadId: currThreadId,
                model: activeModel
            })
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, options);
            const res = await response.json();
            
            const replyText = res.reply || res.error || "⚠️ No response received from server.";
            
            // 2. Append assistant reply to chat window
            setPrevChats(prev => [...prev, { role: "assistant", content: replyText }]);
            setReply(replyText);
            
            // 3. Refresh thread history in sidebar
            refreshThreads();
        } catch(err) {
            console.error("Chat API error:", err);
            setPrevChats(prev => [
                ...prev, 
                { role: "assistant", content: "⚠️ Could not connect to backend server. Make sure node server is running on port 8080." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const currentModelName = availableModels.find(m => m.id === activeModel)?.name || "SanchitX AI";
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navbarLeft">
                    <button className="mobileMenuBtn" onClick={() => setIsMobileSidebarOpen(true)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    
                    {/* Model Selector Dropdown */}
                    <div className="modelSelectorWrapper">
                        <button 
                            className="modelSelectorBtn"
                            onClick={() => {
                                setIsModelDropdownOpen(!isModelDropdownOpen);
                                setIsProfileDropdownOpen(false);
                            }}
                        >
                            <span className="brandTitle">sanchit<span className="brandX">X</span></span>
                            <span className="modelBadge">{currentModelName}</span>
                            <i className="fa-solid fa-chevron-down dropdownChevron"></i>
                        </button>

                        {isModelDropdownOpen && (
                            <div className="modelDropdownMenu">
                                <div className="dropdownHeader">Available AI Models (Groq)</div>
                                {availableModels.map((m) => (
                                    <div 
                                        key={m.id} 
                                        className={`modelOptionItem ${m.id === activeModel ? "selected" : ""}`}
                                        onClick={() => {
                                            setActiveModel(m.id);
                                            setIsModelDropdownOpen(false);
                                        }}
                                    >
                                        <div className="modelOptionInfo">
                                            <span className="modelOptionName">{m.name}</span>
                                            <span className="modelOptionId">{m.id}</span>
                                        </div>
                                        {m.id === activeModel && <i className="fa-solid fa-check checkIcon"></i>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="navbarRight">
                    {/* User Profile Badge */}
                    <div 
                        className="userProfileIcon" 
                        onClick={() => {
                            setIsProfileDropdownOpen(!isProfileDropdownOpen);
                            setIsModelDropdownOpen(false);
                        }}
                    >
                        <span>{userInitial}</span>
                    </div>

                    {isProfileDropdownOpen && (
                        <div className="profileDropdownMenu">
                            <div className="profileMenuHeader">
                                <p className="profileMenuName">{user?.name}</p>
                                <p className="profileMenuEmail">{user?.email}</p>
                            </div>
                            <hr />
                            <div className="profileMenuItem" onClick={logout}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Chat />

            <div className="chatInput">
                <div className="inputBox">
                    <input 
                        placeholder="Ask anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : null}
                    />
                    <div id="submit" className={prompt.trim() ? "active" : ""} onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    SanchitX can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;