"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatMessageTime } from "../lib/formatTime";
import { Trash2 } from "lucide-react";

function formatDateDivider(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ChatWindow({ conversationId, onBack }: any) {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [tick, setTick] = useState(0);

  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const setTyping = useMutation(api.typing.setTyping);
  const markAsRead = useMutation(api.messages.markAsRead);
  const sendMessage = useMutation(api.messages.sendMessage);

  const typingUsers = useQuery(
    api.typing.getTyping,
    conversationId ? { conversationId } : "skip",
  );

  const messages = useQuery(
    api.conversations.getConversationMessages,
    conversationId ? { conversationId } : "skip",
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showNewBtn, setShowNewBtn] = useState(false);

  const EMOJIS = [
    { type: "like", emoji: "👍" },
    { type: "love", emoji: "❤️" },
    { type: "laugh", emoji: "😂" },
    { type: "wow", emoji: "😮" },
    { type: "sad", emoji: "😢" },
  ];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;

      setIsNearBottom(nearBottom);

      if (nearBottom) {
        setShowNewBtn(false);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const prevMsgCount = useRef(0);

  const messageCount = messages?.length ?? 0;

  useEffect(() => {
    if (!messages || !user) return;

    const isNewMessage = messageCount > prevMsgCount.current;
    prevMsgCount.current = messageCount;

    if (!isNewMessage) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage.senderId === user.id;

    if (!isNearBottom && !isMyMessage) {
      setShowNewBtn(true);
    }
  }, [messageCount, isNearBottom, user?.id]);

  useEffect(() => {
    if (isNearBottom && conversationId && user) {
      markAsRead({
        conversationId,
        clerkId: user.id,
      });
    }
  }, [isNearBottom, messageCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!conversationId)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user to start chatting
      </div>
    );

  const activeTypingUsers =
    typingUsers?.filter(
      (t) => t.clerkId !== user?.id && Date.now() - t.updatedAt < 2000,
    ) || [];

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="p-4 border-b flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden text-sm px-2 py-1 border rounded"
        >
          ← Back
        </button>

        <span className="font-semibold">Chat</span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
      >
        {messages?.map((m, index) => {
          const isMe = m.senderId === user?.id;

          const showDateDivider =
            index === 0 ||
            new Date(messages[index - 1].createdAt).toDateString() !==
              new Date(m.createdAt).toDateString();

          return (
            <div key={m._id}>
              {showDateDivider && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDateDivider(m.createdAt)}
                  </span>
                </div>
              )}

              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  onMouseEnter={() => setHoveredMsg(m._id)}
                  onMouseLeave={() => setHoveredMsg(null)}
                  className={`relative px-3 py-2 rounded-lg text-sm max-w-xs ${
                    m.isDeleted
                      ? "bg-gray-100 text-gray-500 italic"
                      : isMe
                        ? "bg-black text-white"
                        : "bg-gray-200"
                  }`}
                >
                  <div>{m.text}</div>

                  <div className="text-[10px] mt-1 opacity-70 text-right">
                    {formatMessageTime(m.createdAt)}
                  </div>
                  {!m.isDeleted && (
                    <div className="flex gap-2 mt-2 text-sm">
                      {EMOJIS.map(({ type, emoji }) => {
                        const users = m.reactions?.[type] ?? [];
                        const hasReacted = user?.id
                          ? users.includes(user.id)
                          : false;

                        return (
                          <button
                            key={type}
                            onClick={() =>
                              toggleReaction({
                                messageId: m._id,
                                type,
                                clerkId: user!.id,
                              })
                            }
                            className={`px-2 py-1 rounded-full border text-xs flex items-center gap-1 ${
                              hasReacted ? "bg-black text-white" : "bg-gray-100"
                            }`}
                          >
                            {emoji}
                            {users.length > 0 && <span>{users.length}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {isMe && !m.isDeleted && hoveredMsg === m._id && (
                    <button
                      onClick={() =>
                        deleteMessage({
                          messageId: m._id,
                          clerkId: user!.id,
                        })
                      }
                      className="absolute -top-2 -right-2 bg-white text-black p-1 rounded-full shadow hover:bg-gray-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {showNewBtn && (
          <button
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setShowNewBtn(false);
            }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full shadow-lg animate-bounce"
          >
            ↓ New messages
          </button>
        )}
        {activeTypingUsers
          .filter((t) => t.clerkId !== user?.id)
          .map((t) => (
            <div key={t.clerkId} className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 italic animate-pulse">
                {t.name} is typing...
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            if (conversationId && user) {
              setTyping({
                conversationId,
                clerkId: user.id,
              });
            }
          }}
          className="flex-1 border rounded px-3 py-2"
        />

        <button
          onClick={() => {
            if (!text.trim() || !user) return;

            sendMessage({
              senderId: user.id,
              text,
              conversationId,
            });

            setText("");
          }}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
