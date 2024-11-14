// app/(main)/TagData.tsx

import prisma from "@/lib/prisma"; // Adjust the import path based on your project structure
import type { TagData as TagDataType } from "@/lib/types"; // Use a type-only import for TagData
import { getPostDataInclude } from "@/lib/types";
import { cache } from "react";

interface TagDataProps {
  id: string; // The tag ID to fetch
}

const fetchTagData = cache(async (id: string, loggedInUserId: string) => {
  const defaultIdValue = "nasxqbucpxxdehna"; // Set your default ID value here

  const tag = await prisma.tag.findUnique({
    where: { id: String(id) },
    include: {
      posts: {
        include: getPostDataInclude(loggedInUserId), // Pass the default ID value instead of null
      },
    },
  });

  return tag;
});

export default fetchTagData; // Export the renamed function
