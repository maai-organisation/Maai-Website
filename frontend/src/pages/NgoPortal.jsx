import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/shared/Icon";
import MotionSection from "../components/shared/MotionSection";
import SocialCard from "../components/ui/SocialCard";
import StatCard from "../components/ui/StatCard";
import { revealContainer, revealItem } from "../utils/animations";
import { getCareers, getInitiatives, getMentors, getReels, getSocialLinks, getTeam, getTestimonials, submitCampRegistration } from "../services/api";
import "../styles/home.css";

const heroImage =
  "https://i.postimg.cc/Zq9K4FPh/NGOpag-Bg.png";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Benefits", href: "#benefits" },
  { label: "Process", href: "#process" },
  { label: "Impact", href: "#impact" },
  { label: "Register", href: "#register" },
];

const whyFeatures = [
  {
    title: "Execution Support",
    description: "Coordinate camps, awareness sessions, and local outreach with a clearer operating rhythm.",
    icon: "activity",
  },
  {
    title: "Medical Network",
    description: "Access healthcare professionals and field-ready volunteers for practical community programs.",
    icon: "medical",
  },
  {
    title: "Partner Visibility",
    description: "Turn field outcomes into credible stories, reports, and public trust signals.",
    icon: "award",
  },
  {
    title: "Scalable Outreach",
    description: "Repeat successful collaboration formats across locations without rebuilding from scratch.",
    icon: "network",
  },
];

const benefits = [
  {
    title: "Extended Medical Network",
    description: "Access healthcare professionals and field-ready volunteers for practical community programs.",
    icon: "medical",
  },
  {
    title: "Resource Optimization",
    description: "Coordinate camps, awareness sessions, and outreach with clearer roles, timing, and support.",
    icon: "network",
  },
  {
    title: "Verified Impact Data",
    description: "Build cleaner records that help partners report outcomes and unlock future support.",
    icon: "impact",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Share your NGO profile",
    description: "Tell us your focus area, region, and the kind of outreach partnership you want to build.",
  },
  {
    number: "02",
    title: "Map the collaboration",
    description: "Maai aligns your goals with available medical support, volunteers, and field capacity.",
  },
  {
    number: "03",
    title: "Prepare the program",
    description: "We define roles, timelines, logistics, and communication so execution feels calm.",
  },
  {
    number: "04",
    title: "Launch and scale",
    description: "Run the initiative, document outcomes, and convert the model into repeatable outreach.",
  },
];

const impactStats = [
  { value: 22, label: "PARTNER CAMPS", tone: "teal" },
  { value: 800, label: "BENEFICIARIES REACHED", tone: "coral" },
  { value: 500, label: "FIELD HOURS ENABLED", tone: "amber" },
  { value: 17, label: "AWARENESS SESSIONS", tone: "teal" },
];

const campRegistrationInitialState = {
  fullName: "",
  email: "",
  whatsapp: "",
  organizationName: "",
  organizationType: "",
  website: "",
  campTitle: "",
  campType: "",
  location: "",
  beneficiaries: "",
  proposedDate: "",
  description: "",
  additionalNotes: "",
};

const registrationFields = [
  {
    title: "Personal Details",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "whatsapp", label: "WhatsApp Number", type: "tel", required: true },
    ],
  },
  {
    title: "Organization Details",
    fields: [
      { name: "organizationName", label: "NGO / Organization Name", type: "text", required: true },
      { name: "organizationType", label: "Organization Type", type: "text", required: true },
      { name: "website", label: "Website / Social Link", type: "url" },
    ],
  },
  {
    title: "Camp Details",
    fields: [
      { name: "campTitle", label: "Title of Camp", type: "text", required: true },
      { name: "campType", label: "Type of Camp", type: "text", required: true },
      { name: "location", label: "Location", type: "text", required: true },
      { name: "beneficiaries", label: "Expected Beneficiaries", type: "text", required: true },
      { name: "proposedDate", label: "Proposed Date", type: "date", required: true },
      { name: "description", label: "Short Description", textarea: true, required: true, wide: true },
      { name: "additionalNotes", label: "Additional Notes", textarea: true, wide: true },
    ],
  },
];

function NgoNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 18);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <motion.header
      className={`site-navbar ${scrolled ? "site-navbar--scrolled" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="site-navbar__bar">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link className="site-navbar__logo" to="/" aria-label="Maai organisation home">
            <img src="/Favicon.ico" alt="" aria-hidden="true" />
            <span>Maai organisation</span>
          </Link>
        </motion.div>

        <nav className="site-navbar__links" aria-label="NGO partnership navigation">
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-navbar__actions">
          <a className="site-navbar__cta" href="#register">
            Partner Now
          </a>
        </div>

        <button
          className="site-navbar__menu"
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {navLinks.map((link) => (
              <a href={link.href} key={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
            <a className="mobile-drawer__cta" href="#register" onClick={closeMenu}>
              Partner Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function HeroSection() {
  return (
    <section className="hero-section ngo-match-hero" id="top" aria-labelledby="ngo-hero-title">
      <motion.img
        className="hero-section__background"
        src={heroImage}
        alt="NGO volunteers and healthcare workers coordinating community outreach"
        loading="eager"
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="hero-section__overlay" />

      <motion.div
        className="hero-section__content"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
        }}
      >
        <motion.p className="section-eyebrow" variants={revealItem}>
          NGO partnership platform
        </motion.p>
        <motion.h1 id="ngo-hero-title" variants={revealItem}>
          Partner for <span>Scalable Impact.</span>
        </motion.h1>
        <motion.p className="hero-section__subtitle" variants={revealItem}>
          Collaborate with Maai organisation to execute healthcare camps, outreach programs, and awareness
          initiatives with professional coordination and community-first care.
        </motion.p>
        <motion.div className="hero-section__actions" variants={revealItem}>
          <motion.a
            className="button button--primary"
            href="#register"
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Register Your NGO
          </motion.a>
          <motion.a
            className="button button--secondary"
            href="#benefits"
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Partnerships
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function WhyPartnerSection() {
  return (
    <motion.section
      id="about"
      className="ngo-editorial-partner"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      <div className="ngo-editorial-partner__grid">
        <motion.div className="ngo-editorial-partner__copy" variants={revealItem}>
          <span className="ngo-editorial-partner__badge">Why Partner With MAAI</span>
          <h2>
            Empowering Your
            <span>Vision &amp; Reach</span>
          </h2>
          <p>
            Maai helps NGOs transform ambitious healthcare outreach into coordinated programs that are easier to
            launch, manage, and scale across communities.
          </p>
        </motion.div>

        <motion.div className="ngo-editorial-partner__support" variants={revealItem}>
          <p>
            Bring your mission, local trust, and field knowledge. We add the collaboration layer: medical support,
            volunteer mobilisation, execution systems, and credible impact documentation.
          </p>
        </motion.div>

        <motion.div
          className="ngo-editorial-partner__features"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
        >
          {whyFeatures.map((feature) => (
            <motion.article
              className="ngo-editorial-feature"
              key={feature.title}
              variants={revealItem}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <span>
                <Icon name={feature.icon} />
              </span>
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function BenefitsSection() {
  return (
    <motion.section
      id="benefits"
      className="ngo-perks-section"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      <motion.div className="ngo-perks-header" variants={revealItem}>
        <span>Partnership Perks</span>
        <h2>
          Why Collaborate <span>With Us?</span>
        </h2>
        <p>
          A partnership system for NGOs that need reliable execution, stronger outreach, and credible impact
          reporting.
        </p>
      </motion.div>

      <motion.div
        className="ngo-perks-grid"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
      >
        {benefits.map((benefit) => (
          <motion.article
            className="ngo-perk-card"
            key={benefit.title}
            variants={revealItem}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <span>
              <Icon name={benefit.icon} />
            </span>
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}

function ProcessSection() {
  return (
    <motion.section
      id="process"
      className="ngo-onboarding-section"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      <motion.div className="ngo-onboarding-header" variants={revealItem}>
        <span>Registration Process</span>
        <h2>
          Seamless <span>Step-by-Step</span> Onboarding
        </h2>
        <p>Four structured steps to move your NGO partnership from alignment to measurable execution.</p>
      </motion.div>

      <motion.div
        className="ngo-onboarding-timeline"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
      >
        <div className="ngo-onboarding-line" />
        {processSteps.map((step) => (
          <motion.article
            className="ngo-onboarding-card"
            key={step.title}
            variants={revealItem}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
          >
            <motion.div
              className={`ngo-onboarding-orb ngo-onboarding-orb--${Number(step.number) % 2 === 0 ? "pink" : "cyan"}`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              {step.number}
            </motion.div>
            <p>STEP {step.number}</p>
            <h3>{step.title}</h3>
            <small>{step.description}</small>
          </motion.article>
        ))}
      </motion.div>
    </motion.section>
  );
}

function ImpactSection() {
  return (
    <MotionSection id="impact" className="stats-section ngo-impact-refined">
      <motion.div className="stats-header" variants={revealItem}>
        <div className="stats-header__glow" />
        <p className="stats-header__badge">Our Impact</p>
        <h2>
          Numbers That <span>Matter</span>
        </h2>
        <p>Real communities reached through collaborative healthcare initiatives.</p>
      </motion.div>

      <motion.div
        className="stats-shell ngo-impact-stats-panel"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.28 }}
      >
        <div className="stats-shell__glow" />
        <div className="stats-grid">
          {impactStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </motion.div>
    </MotionSection>
  );
}

function InitiativesSection() {
  const [initiatives, setInitiatives] = useState([]);
  const hasInitiatives = initiatives.length > 0;

  useEffect(() => {
    getInitiatives()
      .then((items) => setInitiatives(items.filter((initiative) => initiative.status === "published")))
      .catch(() => setInitiatives([]));
  }, []);

  return (
    <motion.section
      id="initiatives"
      className="ngo-flagship-section"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      <motion.div className="ngo-flagship-header" variants={revealItem}>
        <span>Our Projects</span>
        <h2>
          Our Major Flagship <span>Initiatives</span>
        </h2>
        <p>
          Discover the core projects and collaborative healthcare initiatives currently being driven across
          communities.
        </p>
      </motion.div>

      {hasInitiatives ? (
        <motion.div
          className="ngo-flagship-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {initiatives.map((initiative) => (
            <InitiativeCard initiative={initiative} key={initiative.id || initiative.title} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="ngo-flagship-empty"
          variants={revealItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
        >
          <div className="ngo-flagship-empty__glow" />
          <motion.span
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="activity" />
          </motion.span>
          <h3>No initiatives added yet.</h3>
          <p>Projects added from the admin dashboard will appear here.</p>
        </motion.div>
      )}
    </motion.section>
  );
}

function InitiativeCard({ initiative }) {
  const metadata = [initiative.category, initiative.beneficiaries, initiative.location].filter(Boolean);
  const imageUrl = initiative.imageUrl || initiative.image_url || initiative.image;
  const description = initiative.shortDescription || initiative.short_description || initiative.description;

  return (
    <motion.article
      className="ngo-flagship-card"
      variants={revealItem}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      {imageUrl && (
        <div className="ngo-flagship-card__image">
          <motion.img
            src={imageUrl}
            alt={initiative.title || "Maai organisation initiative"}
            loading="lazy"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
      <div className="ngo-flagship-card__body">
        {metadata.length > 0 && (
          <div className="ngo-flagship-card__meta">
            {metadata.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
        <h3>{initiative.title}</h3>
        {description && <p>{description}</p>}
      </div>
    </motion.article>
  );
}

function LeadershipSection() {
  const [mentors, setMentors] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const hasMentors = mentors.length > 0;
  const hasTeamMembers = teamMembers.length > 0;

  useEffect(() => {
    getMentors()
      .then((items) => setMentors(items.filter((mentor) => mentor.status === "published")))
      .catch(() => setMentors([]));
  }, []);

  useEffect(() => {
    getTeam()
      .then((members) => setTeamMembers(members.filter((member) => member.status === "published")))
      .catch(() => setTeamMembers([]));
  }, []);

  return (
    <MotionSection id="leadership" className="people-section ngo-match-section">
      <motion.section
        className="ngo-mentors-dynamic"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.16 }}
      >
        <motion.div className="ngo-mentors-header" variants={revealItem}>
          <span>Guiding Lights</span>
          <h2>
            Our <span>Mentors</span>
          </h2>
          <p>
            The experienced professionals and visionaries guiding Maai organisation's mission and long-term strategy.
          </p>
        </motion.div>

        {hasMentors ? (
          <motion.div
            className="ngo-mentors-grid"
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
          >
            {mentors.map((mentor) => (
              <MentorProfileCard mentor={mentor} key={mentor.id || mentor.name} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="ngo-mentors-empty"
            variants={revealItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.28 }}
          >
            <div className="ngo-mentors-empty__glow" />
            <motion.span
              animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name="graduation" />
            </motion.span>
            <h3>No mentors added yet</h3>
            <p>Mentor profiles added through the admin dashboard will appear here.</p>
          </motion.div>
        )}
      </motion.section>

      <motion.section
        className="ngo-team-dynamic"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.16 }}
      >
        <motion.div className="ngo-team-header" variants={revealItem}>
          <span>Our Leadership</span>
          <h2>
            Meet the <span>Team</span>
          </h2>
          <p>The dedicated minds guiding Maai organisation's mission to transform community healthcare.</p>
        </motion.div>

        {hasTeamMembers ? (
          <motion.div
            className="ngo-team-dynamic-grid"
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
          >
            {teamMembers.map((member) => (
              <TeamProfileCard member={member} key={member.id || member.name} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="ngo-team-empty"
            variants={revealItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.28 }}
          >
            <div className="ngo-team-empty__glow" />
            <motion.span
              animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name="people" />
            </motion.span>
            <h3>No team members added yet</h3>
            <p>Profiles added from the admin dashboard will appear here.</p>
          </motion.div>
        )}

        <motion.a
          className="ngo-team-cta"
          href="/team"
          variants={revealItem}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Meet Our Full Team
        </motion.a>
      </motion.section>
    </MotionSection>
  );
}

function TeamProfileCard({ member }) {
  const imageUrl = member.imageUrl || member.image;
  const initials = String(member.name || "Maai Team")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.article
      className="ngo-team-profile-card"
      variants={revealItem}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <div className="ngo-team-profile-card__avatar">
        {imageUrl ? (
          <img src={imageUrl} alt={member.name || "Maai organisation team member"} loading="lazy" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <h3>{member.name}</h3>
      {(member.role || member.designation || member.title) && (
        <p className="ngo-team-profile-card__role">{member.role || member.designation || member.title}</p>
      )}
      {member.bio && <p className="ngo-team-profile-card__bio">{member.bio}</p>}
      {(member.linkedin || member.email) && (
        <div className="ngo-team-profile-card__socials">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`}>
              <Icon name="linkedin" />
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`} aria-label={`Email ${member.name}`}>
              <Icon name="mail" />
            </a>
          )}
        </div>
      )}
    </motion.article>
  );
}

function MentorProfileCard({ mentor }) {
  const name = mentor.fullName || mentor.full_name || mentor.name;
  const imageUrl = mentor.imageUrl || mentor.image_url || mentor.image;
  const linkedin = mentor.linkedinUrl || mentor.linkedin_url || mentor.linkedin;
  const initials = String(name || "Maai Mentor")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.article
      className="ngo-mentor-profile-card"
      variants={revealItem}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <div className="ngo-mentor-profile-card__avatar">
        {imageUrl ? (
          <img src={imageUrl} alt={name || "Maai organisation mentor"} loading="lazy" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <h3>{name}</h3>
      {(mentor.role || mentor.designation || mentor.title) && (
        <p className="ngo-mentor-profile-card__role">{mentor.role || mentor.designation || mentor.title}</p>
      )}
      {mentor.bio && <p className="ngo-mentor-profile-card__bio">{mentor.bio}</p>}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noreferrer" aria-label={`${name} on LinkedIn`}>
          <Icon name="linkedin" />
        </a>
      )}
    </motion.article>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const hasTestimonials = testimonials.length > 0;

  useEffect(() => {
    getTestimonials()
      .then((items) => setTestimonials(items.filter((testimonial) => testimonial.status === "published")))
      .catch(() => setTestimonials([]));
  }, []);

  return (
    <motion.section
      id="testimonials"
      className="ngo-testimonials-dynamic"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      <motion.div className="ngo-testimonials-header" variants={revealItem}>
        <span>Testimonials</span>
        <h2>
          What <span>Partners</span> Say
        </h2>
        <p>Experiences shared by organizations, volunteers, and healthcare collaborators.</p>
      </motion.div>

      {hasTestimonials ? (
        <motion.div
          className="ngo-testimonials-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {testimonials.map((testimonial) => (
            <PartnerTestimonialCard testimonial={testimonial} key={testimonial.id || testimonial.name} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="ngo-testimonials-empty"
          variants={revealItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
        >
          <div className="ngo-testimonials-empty__glow" />
          <motion.span
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="quote" />
          </motion.span>
          <h3>No testimonials added yet</h3>
          <p>Testimonials added from the admin dashboard will appear here.</p>
        </motion.div>
      )}
    </motion.section>
  );
}

function PartnerTestimonialCard({ testimonial }) {
  const name = testimonial.fullName || testimonial.full_name || testimonial.name;
  const designation = testimonial.designation || testimonial.role;
  const quote = testimonial.testimonial || testimonial.quote;
  const imageUrl = testimonial.imageUrl || testimonial.image_url || testimonial.image;
  const initials = String(name || "Partner")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <motion.figure
      className="ngo-testimonial-card-dynamic"
      variants={revealItem}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <span className="ngo-testimonial-card-dynamic__quote">
        <Icon name="quote" />
      </span>
      <blockquote>{quote}</blockquote>
      <figcaption>
        <div>
          {imageUrl ? (
            <img src={imageUrl} alt={name || "Partner testimonial"} loading="lazy" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <p>
          <strong>{name}</strong>
          {(designation || testimonial.organization) && (
            <small>{designation || testimonial.organization}</small>
          )}
        </p>
      </figcaption>
    </motion.figure>
  );
}

function ReelsSection() {
  const [reels, setReels] = useState([]);
  const hasReels = reels.length > 0;

  useEffect(() => {
    getReels()
      .then((items) => setReels(items.filter((reel) => reel.status === "published")))
      .catch(() => setReels([]));
  }, []);

  return (
    <motion.section
      id="reels"
      className="ngo-reels-dynamic"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      <motion.div className="ngo-reels-header" variants={revealItem}>
        <span>Camp Reels</span>
        <h2>
          Watch Us in <span>Action</span>
        </h2>
        <p>Glimpses of our on-ground impact through camp reels.</p>
      </motion.div>

      {hasReels ? (
        <>
          <motion.div
            className="ngo-reels-dynamic-grid"
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
          >
            {reels.map((reel) => (
              <ReelPreviewCard reel={reel} key={reel.id || reel.title} />
            ))}
          </motion.div>
          <motion.a
            className="ngo-reels-cta"
            href="#reels"
            variants={revealItem}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Reels
          </motion.a>
        </>
      ) : (
        <motion.div
          className="ngo-reels-empty"
          variants={revealItem}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.28 }}
        >
          <div className="ngo-reels-empty__glow" />
          <motion.span
            animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="play" />
          </motion.span>
          <h3>No reels uploaded yet</h3>
          <p>Camp reels added from the admin dashboard will appear here.</p>
        </motion.div>
      )}
    </motion.section>
  );
}

function ReelPreviewCard({ reel }) {
  const metadata = [reel.platform, reel.publishedAt || reel.published_at || reel.uploadDate].filter(Boolean);
  const thumbnailUrl = reel.thumbnailUrl || reel.thumbnail_url || reel.thumbnail;

  return (
    <motion.article
      className="ngo-reel-preview-card"
      variants={revealItem}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <div className="ngo-reel-preview-card__media">
        {thumbnailUrl && <img src={thumbnailUrl} alt={reel.title || "Maai camp reel"} loading="lazy" />}
        <div className="ngo-reel-preview-card__shade" />
        <motion.button
          type="button"
          aria-label={`Play ${reel.title || "camp reel"}`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
        >
          <Icon name="play" />
        </motion.button>
      </div>
      <div className="ngo-reel-preview-card__body">
        <h3>{reel.title}</h3>
        {metadata.length > 0 && (
          <div>
            {metadata.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}

function RegisterSection() {
  const [formData, setFormData] = useState(campRegistrationInitialState);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState({ status: "idle", message: "" });

  function updateField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function validateForm() {
    const nextErrors = {};
    registrationFields.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.required && !String(formData[field.name] || "").trim()) {
          nextErrors[field.name] = `${field.label} is required.`;
        }
      });
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitState({ status: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setSubmitState({ status: "loading", message: "" });

    try {
      await submitCampRegistration(formData);
      setFormData(campRegistrationInitialState);
      setErrors({});
      setSubmitState({
        status: "success",
        message: "Your proposal has been submitted successfully.",
      });
    } catch (error) {
      const responseErrors = error?.response?.data?.errors;
      setErrors(responseErrors || {});
      setSubmitState({
        status: "error",
        message:
          error?.response?.data?.message ||
          "We could not submit your proposal right now. Please try again shortly.",
      });
    }
  }

  return (
    <motion.section
      id="register"
      className="ngo-camp-register-section"
      variants={revealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
    >
      <motion.div className="ngo-camp-register-header" variants={revealItem}>
        <span>Partner With Us</span>
        <h2>
          Register <span>Your Camp</span>
        </h2>
        <p>
          Fill out the details below to propose a camp or medical drive. Our team will review and get back to you
          shortly.
        </p>
      </motion.div>

      <motion.form className="ngo-camp-form" variants={revealContainer} onSubmit={handleSubmit} noValidate>
        {registrationFields.map((group) => (
          <motion.fieldset className="ngo-camp-form__group" key={group.title} variants={revealItem}>
            <legend>{group.title}</legend>
            <div className="ngo-camp-form__grid">
              {group.fields.map((field) => (
                <label className={field.wide ? "is-wide" : ""} key={field.name}>
                  <span>
                    {field.label}
                    {field.required && <em>*</em>}
                  </span>
                  {field.textarea ? (
                    <textarea
                      value={formData[field.name]}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      aria-invalid={Boolean(errors[field.name])}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name]}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      aria-invalid={Boolean(errors[field.name])}
                    />
                  )}
                  {errors[field.name] && <small>{errors[field.name]}</small>}
                </label>
              ))}
            </div>
          </motion.fieldset>
        ))}

        {submitState.message && (
          <motion.p
            className={`ngo-camp-form__notice ngo-camp-form__notice--${submitState.status}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {submitState.message}
          </motion.p>
        )}

        <motion.div className="ngo-camp-form__actions" variants={revealItem}>
          <motion.button
            type="submit"
            disabled={submitState.status === "loading"}
            whileHover={{ scale: submitState.status === "loading" ? 1 : 1.05, y: -2 }}
            whileTap={{ scale: submitState.status === "loading" ? 1 : 0.98 }}
          >
            {submitState.status === "loading" && <span aria-hidden="true" />}
            {submitState.status === "loading" ? "Submitting..." : "Submit Proposal"}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.section>
  );
}

function CareerOpeningCard({ career, index }) {
  const employmentType = career.roleType || career.role_type || career.employmentType || career.type;
  const description = career.description || career.shortDescription;
  const applyLink = career.applicationFormUrl || career.application_form_url || career.applyLink || career.applyUrl;

  return (
    <motion.article
      className="ngo-career-card"
      variants={revealItem}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      custom={index}
    >
      <div className="ngo-career-card__top">
        <div className="ngo-career-card__icon">
          <Icon name="briefcase" />
        </div>
        <span>{career.department || career.category || "Community Health"}</span>
      </div>
      <h3>{career.title}</h3>
      <div className="ngo-career-card__meta">
        {employmentType && <span>{employmentType}</span>}
        {career.location && <span>{career.location}</span>}
      </div>
      {description && <p>{description}</p>}
      {applyLink && (
        <motion.a
          href={applyLink}
          target="_blank"
          rel="noreferrer"
          className="ngo-career-card__cta"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          Apply Now
        </motion.a>
      )}
    </motion.article>
  );
}

function CareersSection() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCareers() {
      try {
        const data = await getCareers();
        if (!cancelled) setCareers(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setCareers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCareers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MotionSection id="careers" className="ngo-careers-section">
      <div className="ngo-careers-section__glow ngo-careers-section__glow--cyan" />
      <div className="ngo-careers-section__glow ngo-careers-section__glow--pink" />

      <motion.div className="ngo-careers-header" variants={revealItem}>
        <p>Join Our Team</p>
        <h2>
          Open <span>Careers</span>
        </h2>
        <div>Explore meaningful opportunities to contribute to community healthcare and social impact.</div>
      </motion.div>

      {loading ? (
        <motion.div className="ngo-careers-empty" variants={revealItem}>
          <div className="ngo-careers-empty__icon">
            <Icon name="briefcase" />
          </div>
          <h3>Loading open positions...</h3>
          <p>We are checking the latest opportunities from the admin dashboard.</p>
        </motion.div>
      ) : careers.length > 0 ? (
        <motion.div
          className="ngo-careers-grid"
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
        >
          {careers.map((career, index) => (
            <CareerOpeningCard career={career} index={index} key={career.id || career.title} />
          ))}
        </motion.div>
      ) : (
        <motion.div className="ngo-careers-empty" variants={revealItem}>
          <motion.div
            className="ngo-careers-empty__icon"
            animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon name="briefcase" />
          </motion.div>
          <h3>No open positions currently</h3>
          <p>Career opportunities added from the admin dashboard will appear here.</p>
        </motion.div>
      )}
    </MotionSection>
  );
}

function SocialsSection() {
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getSocialLinks()
      .then((links) => setSocials(links.filter((link) => link.status === "published")))
      .catch(() => setSocials([]));
  }, []);

  return (
    <MotionSection id="socials" className="socials-section ngo-match-section">
      <motion.div className="socials-header" variants={revealItem}>
        <div className="socials-header__glow" />
        <p className="socials-header__badge">Connect With Us</p>
        <h2>
          Partnership <span>Socials</span>
        </h2>
        <p>Follow Maai organisation for outreach updates, camp stories, partner moments, and community proof.</p>
      </motion.div>

      <motion.div
        className="social-grid"
        variants={revealContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
      >
        {socials.map((social) => (
          <SocialCard social={social} key={social.id || social.platform} />
        ))}
      </motion.div>
    </MotionSection>
  );
}

export default function NgoPortal() {
  return (
    <div className="home-page ngo-match-page">
      <NgoNavbar />
      <main>
        <HeroSection />
        <WhyPartnerSection />
        <BenefitsSection />
        <ProcessSection />
        <ImpactSection />
        <InitiativesSection />
        <LeadershipSection />
        <ReelsSection />
        <TestimonialsSection />
        <RegisterSection />
        <CareersSection />
        <SocialsSection />
      </main>
    </div>
  );
}
