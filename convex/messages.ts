import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    text: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
  conversationId: args.conversationId,
  senderId: args.senderId,
  text: args.text,
  readBy: [args.senderId], 
  createdAt: Date.now(),
});
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter(q =>
        q.eq(q.field("conversationId"), args.conversationId)
      )
      .collect();

    for (const m of messages) {
      if (!m.readBy.includes(args.clerkId)) {
        await ctx.db.patch(m._id, {
          readBy: [...m.readBy, args.clerkId],
        });
      }
    }
  },
});

export const getUnreadCount = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query("messages").collect();

    const counts: Record<string, number> = {};

    for (const m of messages) {
      if (m.senderId === args.clerkId) continue;

      if (!m.readBy.includes(args.clerkId)) {
        counts[m.conversationId] =
          (counts[m.conversationId] || 0) + 1;
      }
    }

    return counts;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) return;

    if (message.senderId !== args.clerkId) {
      throw new Error("Not allowed");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      text: "This message was deleted",
    });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    type: v.string(), 
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) return;

    const reactions = msg.reactions ?? {};
    const users = reactions[args.type] ?? [];

    let updatedUsers;

    if (users.includes(args.clerkId)) {
      updatedUsers = users.filter(id => id !== args.clerkId);
    } else {
      updatedUsers = [...users, args.clerkId];
    }

    await ctx.db.patch(args.messageId, {
      reactions: {
        ...reactions,
        [args.type]: updatedUsers,
      },
    });
  },
});