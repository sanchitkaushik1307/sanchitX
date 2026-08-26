import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { ScaleLoader } from "react-spinners";
import sxLogo from "./assets/sx-logo.svg";

function Chat() {
    const { newChat, prevChats, reply, loading, setPrompt } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom whenever messages or loading state changes
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, loading, latestReply]);

    // Typing effect for the latest assistant message
    useEffect(() => {
        if (!reply || !prevChats || prevChats.length === 0) {
            setLatestReply(null);
            return;
        }

        const lastChat = prevChats[prevChats.length - 1];
        if (lastChat.role !== "assistant") return;

        const words = lastChat.content.split(" ");
        let idx = 0;

        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) {
                clearInterval(interval);
                setLatestReply(null);
            }
        }, 20);

        return () => clearInterval(interval);
    }, [reply, prevChats]);

    const samplePrompts = [
        { icon: "fa-lightbulb", title: "Explain quantum computing", subtitle: "in simple everyday terms" },
        { icon: "fa-code", title: "Write a clean Python script", subtitle: "to parse and validate JSON data" },
        { icon: "fa-envelope", title: "Draft a professional email", subtitle: "requesting project status feedback" },
        { icon: "fa-dumbbell", title: "Design a 7-day workout plan", subtitle: "for strength and conditioning" }
    ];

    const handlePromptClick = (promptText) => {
        setPrompt(promptText);
    };

    return (
        <div className="chatContainer">
            {newChat && prevChats.length === 0 && (
                <div className="emptyStateContainer">
                    <div className="emptyStateBranding">
                        <img src={sxLogo} alt="SanchitX" className="emptyStateLogo" />
                    </div>
                    <h2 className="emptyStateGreeting">How can I help you today?</h2>

                    <div className="samplePromptsGrid">
                        {samplePrompts.map((sample, i) => (
                            <div 
                                key={i} 
                                className="samplePromptCard" 
                                onClick={() => handlePromptClick(`${sample.title} ${sample.subtitle}`)}
                            >
                                <i className={`fa-solid ${sample.icon} sampleIcon`}></i>
                                <div className="samplePromptText">
                                    <span className="sampleTitle">{sample.title}</span>
                                    <span className="sampleSubtitle">{sample.subtitle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="chats">
                {prevChats?.map((chat, idx) => {
                    const isLastAssistant = 
                        idx === prevChats.length - 1 && 
                        chat.role === "assistant" && 
                        latestReply !== null;

                    return (
                        <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                            {chat.role === "user" ? (
                                <p className="userMessage">{chat.content}</p>
                            ) : (
                                <div className="gptMessage">
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                        {isLastAssistant ? latestReply : chat.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className="gptDiv loadingDiv">
                        <ScaleLoader color="#00d2ff" height={18} width={3} radius={2} />
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>
        </div>
    );
}

export default Chat;