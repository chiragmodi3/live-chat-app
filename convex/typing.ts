import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        clerkId: args.clerkId,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getTyping = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
  const typingUsers = await ctx.db
    .query("typing")
    .filter(q =>
      q.eq(q.field("conversationId"), args.conversationId)
    )
    .collect();

  const now = Date.now();

  const active = typingUsers.filter(
    t => now - t.updatedAt < 1000
  );

  const users = await ctx.db.query("users").collect();

  return active.map(t => {
    const user = users.find(u => u.clerkId === t.clerkId);

    return {
      clerkId: t.clerkId,
      name: user?.name || "User",
      updatedAt: t.updatedAt,
    };
  });
},
});