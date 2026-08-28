"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { reviewSchema, type ReviewFormData } from "@/lib/validations/review";

export type PublicReview = {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export async function getPublishedReviews(): Promise<PublicReview[]> {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return reviews.map((review) => ({
      id: review.id,
      authorName: review.authorName,
      message: review.message,
      createdAt: review.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

type SubmitReviewResult =
  | { success: true; review: PublicReview }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitReview(data: ReviewFormData): Promise<SubmitReviewResult> {
  const parsed = reviewSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Controlla i campi e riprova.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const session = await auth();
  const authorName = session?.user?.name?.trim() || parsed.data.authorName;

  const review = await prisma.review.create({
    data: {
      authorName,
      message: parsed.data.message,
      userId: session?.user?.id ?? null,
    },
  });

  revalidatePath("/");

  return {
    success: true,
    review: {
      id: review.id,
      authorName: review.authorName,
      message: review.message,
      createdAt: review.createdAt.toISOString(),
    },
  };
}
