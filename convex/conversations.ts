import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    userA: v.string(),
    userB: v.string(),
  },
  handler: async (ctx, args) => {
    const members = [args.userA, args.userB].sort();

    const existing = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("members"), members))
      .first();

    if (existing) return existing._id;

    const id = await ctx.db.insert("conversations", {
      members,
    });

    return id;
  },
});

export const getConversationMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) =>
        q.eq(q.field("conversationId"), args.conversationId)
      )
      .collect();
  },
});
