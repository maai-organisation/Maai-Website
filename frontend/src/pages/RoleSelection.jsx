import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "../components/shared/Icon";
import "../styles/home.css";

const options = [
  {
    title: "Are you a Volunteer?",
    description: "Explore camps, initiatives, and ways to contribute your time to community impact.",
    href: "/volunteer",
    icon: "heart",
    action: "Enter Volunteer Portal",
  },
  {
    title: "Are you an NGO?",
    description: "Access the organisation side for partnerships, coordination, and impact workflows.",
    href: "/ngo",
    icon: "people",
    action: "Enter NGO Portal",
  },
];

export default function RoleSelection() {
  return (
    <main className="role-selection-page">
      <motion.section
        className="role-selection"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="role-selection__brand">
          <img src="/Favicon.ico" alt="" aria-hidden="true" />
          <span>Maai organisation</span>
        </div>

        <div className="role-selection__header">
          <p>Choose your path</p>
          <h1>Welcome to Maai organisation</h1>
          <span>Select how you want to continue.</span>
        </div>

        <div className="role-selection__grid">
          {options.map((option, index) => (
            <motion.div
              key={option.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link className="role-selection__card" to={option.href}>
                <span className="role-selection__icon">
                  <Icon name={option.icon} />
                </span>
                <h2>{option.title}</h2>
                <p>{option.description}</p>
                <strong>
                  {option.action}
                  <Icon name="arrow" />
                </strong>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
