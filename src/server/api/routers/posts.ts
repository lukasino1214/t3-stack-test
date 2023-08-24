import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return { id: user.id, name: user.username, profilePicture: user.profileImageUrl };
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100
    });

    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100
    })).map(filterUserForClient);

    return posts.map(post => {
        const author = users.find((user) => user.id == post.authorId);
        if(!author) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "author for post not found"});

        return {
            post,
            author
        };
    });
  }),
});
