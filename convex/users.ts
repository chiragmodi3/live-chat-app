import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) return;

    await ctx.db.insert("users", args);
  },
});

export const getUserByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUsersExceptMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();

    return users
      .filter((u) => u.clerkId !== args.clerkId)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        image: u.image,
        clerkId: u.clerkId,
        isOnline: u.isOnline ?? false,
      }));
  },
});

export const setOnline = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isOnline: true,
    });
  },
});

export const setOffline = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      isOnline: false,
    });
  },
});