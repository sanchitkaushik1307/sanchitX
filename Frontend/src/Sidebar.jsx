import "./Sidebar.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import sxLogo from "./assets/sx-logo.svg";
import sxSymbol from "./assets/sx-symbol.svg";
import { API_BASE_URL } from "./config.js";

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setCurrThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setPrevChats,
        user,
        logout,
        token,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen
    } = useContext(MyContext);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [renamingThread, setRenamingThread] = useState(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [deletingThreadId, setDeletingThreadId] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const getAllThreads = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (Array.isArray(res)) {
                setAllThreads(res);
            }
        } catch (err) {
            console.error("Failed to fetch threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, token]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setOpenMenuId(null);
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
    };

    const changeThread = async (thread) => {
        setCurrThreadId(thread.threadId);
        setOpenMenuId(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${thread.threadId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (Array.isArray(res)) {
                setPrevChats(res);
                setNewChat(false);
                setReply(null);
            }
        } catch (err) {
            console.error("Failed to fetch chat messages:", err);
        }

        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
    };

    const handleOpenRenameModal = (thread, e) => {
        e.stopPropagation();
        setRenamingThread(thread);
        setRenameTitle(thread.title || "");
        setOpenMenuId(null);
    };

    const handleConfirmRename = async (e) => {
        e.preventDefault();
        if (!renamingThread || !renameTitle.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${renamingThread.threadId}/rename`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ title: renameTitle.trim() })
            });

            if (response.ok) {
                setAllThreads(prev =>
                    prev.map(t => t.threadId === renamingThread.threadId ? { ...t, title: renameTitle.trim() } : t)
                );
            }
        } catch (err) {
            console.error("Error renaming thread:", err);
        } finally {
            setRenamingThread(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingThreadId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/thread/${deletingThreadId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setAllThreads(prev => prev.filter(t => t.threadId !== deletingThreadId));
                if (deletingThreadId === currThreadId) {
                    createNewChat();
                }
            }
        } catch (err) {
            console.error("Error deleting thread:", err);
        } finally {
            setDeletingThreadId(null);
            setOpenMenuId(null);
        }
    };

    // Timeframe grouping helper
    const groupThreads = (threads) => {
        const today = [];
        const yesterday = [];
        const prev7Days = [];
        const older = [];

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 86400000;
        const startOf7Days = startOfToday - 6 * 86400000;

        threads.forEach(t => {
            const updatedTime = new Date(t.updatedAt || t.createdAt || Date.now()).getTime();

            if (updatedTime >= startOfToday) {
                today.push(t);
            } else if (updatedTime >= startOfYesterday) {
                yesterday.push(t);
            } else if (updatedTime >= startOf7Days) {
                prev7Days.push(t);
            } else {
                older.push(t);
            }
        });

        return { today, yesterday, prev7Days, older };
    };

    const grouped = groupThreads(allThreads || []);

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <>
            <section className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileSidebarOpen ? "mobileOpen" : ""}`}>
                <div className="sidebarHeader">
                    <div className="logoContainer" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                        <img 
                            src={isSidebarCollapsed ? sxSymbol : sxLogo} 
                            alt="SanchitX" 
                            className={isSidebarCollapsed ? "sxSymbol" : "sxLogo"} 
                        />
                    </div>
                    <button className="collapseToggleBtn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Toggle Sidebar">
                        <i className={`fa-solid ${isSidebarCollapsed ? "fa-angles-right" : "fa-angles-left"}`}></i>
                    </button>
                </div>

                <button className="newChatBtn" onClick={createNewChat} title="New Chat">
                    <i className="fa-solid fa-plus"></i>
                    {!isSidebarCollapsed && <span>New Chat</span>}
                </button>

                <div className="historyContainer">
                    {!isSidebarCollapsed ? (
                        <>
                            {grouped.today.length > 0 && (
                                <div className="historyGroup">
                                    <p className="groupTitle">Today</p>
                                    {renderThreadList(grouped.today)}
                                </div>
                            )}
                            {grouped.yesterday.length > 0 && (
                                <div className="historyGroup">
                                    <p className="groupTitle">Yesterday</p>
                                    {renderThreadList(grouped.yesterday)}
                                </div>
                            )}
                            {grouped.prev7Days.length > 0 && (
                                <div className="historyGroup">
                                    <p className="groupTitle">Previous 7 Days</p>
                                    {renderThreadList(grouped.prev7Days)}
                                </div>
                            )}
                            {grouped.older.length > 0 && (
                                <div className="historyGroup">
                                    <p className="groupTitle">Older</p>
                                    {renderThreadList(grouped.older)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="collapsedThreadList">
                            {allThreads.map((thread) => (
                                <button
                                    key={thread.threadId}
                                    className={`collapsedThreadBtn ${thread.threadId === currThreadId ? "active" : ""}`}
                                    onClick={() => changeThread(thread)}
                                    title={thread.title}
                                >
                                    <i className="fa-regular fa-message"></i>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {user && (
                    <div className="sidebarFooter">
                        <div className="userProfileBadge" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="userAvatar">{userInitial}</div>
                            {!isSidebarCollapsed && (
                                <div className="userInfo">
                                    <span className="userName">{user.name}</span>
                                    <span className="userEmail">{user.email}</span>
                                </div>
                            )}
                        </div>

                        {showProfileMenu && (
                            <div className="userProfileMenu">
                                <div className="menuHeader">
                                    <p className="menuName">{user.name}</p>
                                    <p className="menuEmail">{user.email}</p>
                                </div>
                                <hr />
                                <div className="menuItem" onClick={logout}>
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Mobile Backdrop Overlay */}
            {isMobileSidebarOpen && (
                <div className="mobileBackdrop" onClick={() => setIsMobileSidebarOpen(false)} />
            )}

            {/* Rename Modal */}
            {renamingThread && (
                <div className="modalBackdrop">
                    <div className="modalCard">
                        <h3>Rename Conversation</h3>
                        <form onSubmit={handleConfirmRename}>
                            <input
                                type="text"
                                value={renameTitle}
                                onChange={(e) => setRenameTitle(e.target.value)}
                                autoFocus
                                required
                            />
                            <div className="modalActions">
                                <button type="button" className="cancelBtn" onClick={() => setRenamingThread(null)}>Cancel</button>
                                <button type="submit" className="saveBtn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingThreadId && (
                <div className="modalBackdrop">
                    <div className="modalCard">
                        <h3>Delete Conversation</h3>
                        <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
                        <div className="modalActions">
                            <button className="cancelBtn" onClick={() => setDeletingThreadId(null)}>Cancel</button>
                            <button className="deleteBtn" onClick={handleConfirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    function renderThreadList(threads) {
        return (
            <ul className="history">
                {threads.map((thread) => (
                    <li
                        key={thread.threadId}
                        onClick={() => changeThread(thread)}
                        className={thread.threadId === currThreadId ? "highlighted" : ""}
                    >
                        <span className="threadTitleText"><i className="fa-regular fa-message threadIcon"></i> {thread.title}</span>
                        
                        <div className="optionsMenuWrapper" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="optionsThreeDotsBtn"
                                onClick={() => setOpenMenuId(openMenuId === thread.threadId ? null : thread.threadId)}
                            >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>

                            {openMenuId === thread.threadId && (
                                <div className="optionsDropdown">
                                    <div className="dropdownItem" onClick={(e) => handleOpenRenameModal(thread, e)}>
                                        <i className="fa-solid fa-pen"></i> Rename
                                    </div>
                                    <div className="dropdownItem danger" onClick={(e) => { e.stopPropagation(); setDeletingThreadId(thread.threadId); }}>
                                        <i className="fa-solid fa-trash"></i> Delete
                                    </div>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        );
    }
}

export default Sidebar;