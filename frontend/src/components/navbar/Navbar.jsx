import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../shared/Icon";
import { getSocialLinks } from "../../services/api";

const links = [
  { label: "About", href: "#about" },
  { label: "Activities", href: "#activities" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Team", href: "#team" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "mailto:maai.organisation@gmail.com" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 18);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getSocialLinks()
      .then((links) => setSocials(links.filter((link) => link.status === "published")))
      .catch(() => setSocials([]));
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
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Link className="site-navbar__logo" to="/" aria-label="Maai organisation home">
            <img src="/Favicon.ico" alt="" aria-hidden="true" />
            <span>Maai organisation</span>
          </Link>
        </motion.div>

        <nav className="site-navbar__links" aria-label="Primary navigation">
          {links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-navbar__actions">
          {socials.slice(0, 3).map((social) => (
            <a
              className="site-navbar__social"
              href={social.url}
              key={social.id || social.platform}
              aria-label={social.name || social.platform}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name={social.icon || social.platform} />
            </a>
          ))}
          <Link className="site-navbar__login" to="/auth?mode=login">
            Login
          </Link>
          <Link className="site-navbar__cta" to="/auth?mode=signup">
            Join Now
          </Link>
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
            {links.map((link) => (
              <a href={link.href} key={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
            <Link to="/auth?mode=login" onClick={closeMenu}>
              Login
            </Link>
            <Link className="mobile-drawer__cta" to="/auth?mode=signup" onClick={closeMenu}>
              Join Now
            </Link>
            {socials.length > 0 ? (
              <div className="mobile-drawer__socials">
                {socials.map((social) => (
                  <a href={social.url} key={social.id || social.platform} aria-label={social.name || social.platform} target="_blank" rel="noopener noreferrer">
                    <Icon name={social.icon || social.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
