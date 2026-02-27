"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { useState } from "react";

export default function UserList({ onSelectUser }: any) {
  const { user } = useUser();
  const [search, setSearch] = useState("");

  const users = useQuery(
    api.users.getUsersExceptMe,
    user ? { clerkId: user.id } : "skip",
  );

  const unread = useQuery(
    api.messages.getUnreadCount,
    user ? { clerkId: user.id } : "skip",
  );

  console.log("UNREAD:", unread);

  if (!users) return <div className="p-4">Loading users...</div>;

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-72 border-r flex flex-col">
      <div className="p-4 font-bold text-lg border-b">Users</div>

      <div className="p-3">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 && (
          <div className="p-4 text-gray-500 text-sm">No users found</div>
        )}

        {filteredUsers.map((u) => {
          const count = unread ? (Object.values(unread)[0] as number) : 0;

          return (
            <div
              key={u._id}
              onClick={() => onSelectUser(u)}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
            >
              <div className="relative">
                <Image
                  src={u.image}
                  alt="avatar"
                  width={36}
                  height={36}
                  className="rounded-full"
                />

                {u.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex items-center justify-between flex-1">
                <span className="text-sm font-medium">{u.name}</span>

                {count && count > 0 ? (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
