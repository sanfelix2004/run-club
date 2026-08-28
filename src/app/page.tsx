import { About } from "@/components/About";
import { Booking } from "@/components/Booking";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { Sessions } from "@/components/Sessions";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { getUpcomingEvent } from "@/app/actions/registration";

export default async function Home() {
  const upcomingEvent = await getUpcomingEvent();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Sessions />
        <Stats />
        <Pricing />
        <Testimonials />
        <Booking upcomingEvent={upcomingEvent} />
        <Location />
      </main>
      <Footer />
    </>
  );
}
