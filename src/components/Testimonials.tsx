"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/FadeIn";
import Link from "next/link";
import { submitReview, type PublicReview } from "@/app/actions/reviews";

type TestimonialsProps = {
  initialReviews: PublicReview[];
};

function formatReviewDate(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function Testimonials({ initialReviews }: TestimonialsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    if (reviews.length === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prev = useCallback(() => {
    if (reviews.length === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, reviews.length]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await submitReview({
      authorName: (formData.get("authorName") as string) || session?.user?.name || "",
      message: formData.get("message") as string,
    });

    setLoading(false);

    if (!result.success) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
      return;
    }

    setReviews((prev) => [result.review, ...prev]);
    setCurrent(0);
    e.currentTarget.reset();
    toast.success("Grazie! La tua recensione è stata pubblicata.");
  };

  const review = reviews[current];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section id="reviews" className="bg-emerald-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Dicono di noi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Cosa dicono i nostri runner
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Recensioni vere lasciate da chi ha corso con noi. Anche tu puoi condividere
            la tua esperienza qui sotto.
          </p>
        </FadeIn>

        <FadeIn className="relative mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm sm:p-12">
            <Quote className="h-8 w-8 text-emerald-200" />

            {reviews.length === 0 ? (
              <p className="mt-6 text-center text-forest/60">
                Ancora nessuna recensione. Sii il primo a raccontare la tua corsa con noi!
              </p>
            ) : (
              <>
                <div className="relative mt-6 min-h-[160px]">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={review.id}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      <blockquote className="text-lg leading-relaxed text-forest/80 sm:text-xl">
                        &ldquo;{review.message}&rdquo;
                      </blockquote>
                      <div className="mt-8">
                        <p className="font-semibold text-forest">{review.authorName}</p>
                        <p className="text-sm text-forest/50">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {reviews.length > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex gap-2">
                      {reviews.map((item, i) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => goTo(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === current
                              ? "w-6 bg-emerald-500"
                              : "w-2 bg-emerald-200 hover:bg-emerald-300"
                          }`}
                          aria-label={`Vai alla recensione ${i + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-emerald-200"
                        onClick={prev}
                        aria-label="Recensione precedente"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-emerald-200"
                        onClick={next}
                        aria-label="Recensione successiva"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </FadeIn>

        <FadeIn className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-semibold text-forest">Lascia la tua recensione</h3>
            <p className="mt-1 text-sm text-forest/60">
              Racconta com&apos;è stata la tua corsa. La pubblicheremo subito sul sito.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!session?.user?.name && (
                <div className="space-y-2">
                  <Label htmlFor="review-name">Il tuo nome</Label>
                  <Input
                    id="review-name"
                    name="authorName"
                    required
                    className="rounded-xl border-emerald-100"
                    placeholder="Marco R."
                  />
                  {fieldErrors.authorName && (
                    <p className="text-xs text-red-500">{fieldErrors.authorName[0]}</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="review-message">La tua recensione</Label>
                <textarea
                  id="review-message"
                  name="message"
                  required
                  rows={4}
                  className="w-full rounded-xl border border-emerald-100 bg-transparent px-3 py-2 text-sm text-forest shadow-xs outline-none transition-[color,box-shadow] placeholder:text-forest/40 focus-visible:border-emerald-400 focus-visible:ring-[3px] focus-visible:ring-emerald-400/30"
                  placeholder="Cosa ti è piaciuto della corsa, del percorso, dell'atmosfera..."
                />
                {fieldErrors.message && (
                  <p className="text-xs text-red-500">{fieldErrors.message[0]}</p>
                )}
              </div>
              <p className="text-xs text-forest/50">
                Pubblicando accetti la nostra{" "}
                <Link href="/privacy" className="text-emerald-600 hover:underline">
                  privacy policy
                </Link>
                .
              </p>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Invio..." : "Pubblica recensione"}
              </Button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
