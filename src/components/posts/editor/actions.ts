"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  tagIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds, tagIds } = createPostSchema.parse(input);

  // Step 1: Find existing tags in the database
  const existingTags = await prisma.tag.findMany({
    where: {
      name: { in: tagIds }, // Use tagIds from input to check against the database
    },
  });

  // Step 2: Extract existing tag IDs
  const existingTagIds = existingTags.map(tag => tag.id);

  // Step 3: Check for tags that do not exist and create them if needed
  const nonExistentTags = tagIds.filter(tag => 
    !existingTags.some(existingTag => existingTag.name === tag)
  );

  const createdTags = await Promise.all(nonExistentTags.map(name => 
    prisma.tag.create({ data: { name } })
  ));

  // Step 4: Combine all tag IDs (existing and newly created)
  const allTagIds = [...existingTagIds, ...createdTags.map(tag => tag.id)];

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
      tags: {
        connect: allTagIds.map((id) => ({ id })),
      }
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
