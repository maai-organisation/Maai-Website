import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Icon from "../shared/Icon";
import { getSocialLinks } from "../../services/api";

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Activities", href: "#activities" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Team", href: "#team" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "mailto:maai.organisation@gmail.com" },
];

export default function Footer() {
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getSocialLinks()
      .then((links) => setSocials(links.filter((link) => link.status === "published")))
      .catch(() => setSocials([]));
  }, []);

  return (
    <motion.footer
      className="site-footer"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a href="#top">Maai organisation</a>
          <p>Building healthier communities through awareness, action, and compassionate volunteering.</p>
        </div>

        <nav className="site-footer__group" aria-label="Footer quick links">
          <h3>Quick Links</h3>
          <div className="site-footer__links">
            {quickLinks.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="site-footer__group site-footer__contact">
          <h3>Contact</h3>
          <a href="mailto:maai.organisation@gmail.com">
            <Icon name="mail" />
            maai.organisation@gmail.com
          </a>
          <a href="https://wa.me/918828823441" target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" />
            +91 8828823441
          </a>
        </div>

        <div className="site-footer__group">
          <h3>Socials</h3>
          <div className="site-footer__socials">
            {socials.map((social) => (
              <motion.a
                className={`site-footer__social site-footer__social--${social.platform}`}
                href={social.url}
                key={social.id || social.platform}
                aria-label={social.name || social.platform}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Icon name={social.icon || social.platform} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>&copy; 2026 Maai organisation. All rights reserved.</p>
        <p>Built with purpose.</p>
      </div>
    </motion.footer>
  );
}
