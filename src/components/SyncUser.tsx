"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SyncUser() {
  const { user } = useUser();
  const createUser = useMutation(api.users.createUser);
  const setOnline = useMutation(api.users.setOnline);
  const setOffline = useMutation(api.users.setOffline);

  useEffect(() => {
    if (!user) return;

    createUser({
      clerkId: user.id,
      name: user.fullName || "User",
      image: user.imageUrl || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setOnline({ clerkId: user.id });

    const handleUnload = () => {
      setOffline({ clerkId: user.id });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user]);

  return null;
}
