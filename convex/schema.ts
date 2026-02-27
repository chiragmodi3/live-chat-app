import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
  clerkId: v.string(),
  name: v.string(),
  image: v.string(),
  isOnline: v.optional(v.boolean()), 
}),

  conversations: defineTable({
    members: v.array(v.string()),
  }),

  messages: defineTable({
  conversationId: v.id("conversations"),
  senderId: v.string(),
  text: v.string(),
  readBy: v.array(v.string()),  
  createdAt: v.number(),
  isDeleted: v.optional(v.boolean()),
  reactions: v.optional(
  v.record(v.string(), v.array(v.string()))
),
}),

  typing: defineTable({
  conversationId: v.id("conversations"),
  clerkId: v.string(),
  updatedAt: v.number(),
}).index("by_conversation", ["conversationId"]),
});

