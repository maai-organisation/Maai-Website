import ActivitiesSection from "../components/activities/ActivitiesSection";
import CareersSection from "../components/careers/CareersSection";
import HeroSection from "../components/hero/HeroSection";
import FindInitiativesSection from "../components/initiatives/FindInitiativesSection";
import InitiativesSection from "../components/initiatives/InitiativesSection";
import JourneyTimeline from "../components/journey/JourneyTimeline";
import WhoCanJoin from "../components/journey/WhoCanJoin";
import LeadershipSection from "../components/leadership/LeadershipSection";
import MentorsSection from "../components/mentors/MentorsSection";
import ReelsSection from "../components/reels/ReelsSection";
import SocialsSection from "../components/socials/SocialsSection";
import StatsSection from "../components/stats/StatsSection";
import TestimonialsSection from "../components/testimonials/TestimonialsSection";
import WhyVolunteer from "../components/sections/WhyVolunteer";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="home-page">
      <main>
        <HeroSection />
        <WhyVolunteer />
        <ActivitiesSection />
        <InitiativesSection />
        <StatsSection />
        <MentorsSection />
        <LeadershipSection />
        <WhoCanJoin />
        <JourneyTimeline />
        <ReelsSection />
        <TestimonialsSection />
        <FindInitiativesSection />
        <CareersSection />
        <SocialsSection />
      </main>
    </div>
  );
}
