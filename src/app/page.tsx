import { About } from "@/components/About";
import { Booking } from "@/components/Booking";
import { Events } from "@/components/Events";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Location } from "@/components/Location";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { Sessions } from "@/components/Sessions";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { getUpcomingEvents } from "@/app/actions/events";

export default async function Home() {
  const events = await getUpcomingEvents();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Events events={events} />
        <About />
        <Sessions />
        <Stats />
        <Pricing />
        <Testimonials />
        <Booking events={events} />
        <Location />
      </main>
      <Footer />
    </>
  );
}
