"use client";

import { useState, type FormEvent } from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/FadeIn";
import { SESSIONS } from "@/lib/constants";

export function Booking() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="booking" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
              Booking
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              Reserve your spot
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-forest/70">
              Pick a session, fill in your details, and you&apos;re in. We&apos;ll
              send a confirmation with the meeting point and what to bring.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Free for your first session",
                "Confirmation within 24 hours",
                "Cancel anytime — no stress",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-forest/70">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-forest">
                    You&apos;re booked!
                  </h3>
                  <p className="mt-2 max-w-sm text-forest/60">
                    Check your inbox for confirmation. See you at the starting
                    line — lace up and let&apos;s run.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-8 rounded-full border-emerald-200"
                    onClick={() => setSubmitted(false)}
                  >
                    Book another session
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 text-forest">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold">Session booking</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Marco Rossi"
                      className="rounded-xl border-emerald-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="marco@example.com"
                      className="rounded-xl border-emerald-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+39 333 123 4567"
                      className="rounded-xl border-emerald-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session">Choose a session</Label>
                    <select
                      id="session"
                      name="session"
                      required
                      className="flex h-9 w-full rounded-xl border border-emerald-100 bg-transparent px-3 py-1 text-sm text-forest shadow-xs outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30"
                    >
                      <option value="">Select a session...</option>
                      {SESSIONS.map((s) => (
                        <option key={s.title} value={s.title}>
                          {s.title} — {s.time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Running experience</Label>
                    <select
                      id="experience"
                      name="experience"
                      required
                      className="flex h-9 w-full rounded-xl border border-emerald-100 bg-transparent px-3 py-1 text-sm text-forest shadow-xs outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30"
                    >
                      <option value="">Select your level...</option>
                      <option value="beginner">Beginner — just starting out</option>
                      <option value="intermediate">Intermediate — regular runner</option>
                      <option value="advanced">Advanced — training for races</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
                  >
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
