"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";

export default function Home() {
  const [conversationId, setConversationId] = useState<any>(null);
  const { user } = useUser();
  const createConversation = useMutation(
    api.conversations.createOrGetConversation,
  );

  const handleSelectUser = async (selected: any) => {
    if (!user) return;

    const id = await createConversation({
      userA: user.id,
      userB: selected.clerkId,
    });

    setConversationId(id);
  };
  return (
    <div className="flex h-screen">
      <SignedOut>
        <div className="p-10">
          <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        <>
          <div className={`${conversationId ? "hidden md:block" : "block"}`}>
            <UserList onSelectUser={handleSelectUser} />
          </div>

          <div
            className={`flex-1 ${!conversationId ? "hidden md:flex" : "flex"}`}
          >
            <ChatWindow
              conversationId={conversationId}
              onBack={() => setConversationId(null)}
            />
          </div>
        </>
      </SignedIn>
    </div>
  );
}
