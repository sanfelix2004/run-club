import { About } from "@/components/About";
import { Booking } from "@/components/Booking";
import { Events } from "@/components/Events";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
import { Navbar } from "@/components/Navbar";
import { Partners } from "@/components/Partners";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { getUpcomingEvents } from "@/app/actions/events";
import { getPublishedReviews } from "@/app/actions/reviews";
import { auth } from "@/auth";
import { EventRegistrationProvider } from "@/components/EventRegistrationProvider";

export default async function Home() {
  const [events, reviews, session] = await Promise.all([
    getUpcomingEvents(),
    getPublishedReviews(),
    auth(),
  ]);

  const user = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      }
    : null;

  return (
    <EventRegistrationProvider user={user}>
      <Navbar />
      <main>
        <Hero />
        <Events events={events} />
        <About />
        <Partners />
        <Pricing />
        <Testimonials initialReviews={reviews} />
        <Booking />
        <Location />
      </main>
      <Footer />
    </EventRegistrationProvider>
  );
}
