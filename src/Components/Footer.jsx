import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 shadow-md py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Logo and Tagline */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-white">
              Sleek Stream <span className="text-amber-300">Media</span>
            </h1>
            <p className="text-sm mt-1">
              Elevate your brand with innovative social media strategies.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="text-center md:text-right">
            <h2 className="text-lg font-semibold mb-2 text-white">Follow Us</h2>
            <div className="flex justify-center md:justify-end space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-amber-300 hover:text-black transition duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-amber-300 hover:text-black transition duration-300"
                aria-label="Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-amber-300 hover:text-black transition duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-amber-300 hover:text-black transition duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 mt-2">
              <li>
                <a
                  href="#services"
                  className="text-amber-300 hover:underline"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#portfolio"
                  className="text-amber-300 hover:underline"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-amber-300 hover:underline"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <p className="mt-2 text-sm">
              Email:{" "}
              <a
                href="mailto:support@viralvisionagency.com"
                className="text-amber-300 hover:underline"
              >
                support@viralvisionagency.com
              </a>
            </p>
            <p className="mt-1 text-sm">
              Phone:{" "}
              <a
                href="tel:+260975492822"
                className="text-amber-300 hover:underline"
              >
                +260975492822
              </a>
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>&copy; 2024 Sleek Stream Media. All rights reserved.</p>
          <p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.google.com/document/d/1VyZXY1c9juHkgw2_HEeSr4fCFyRfTAuBIiYlKGQLYbM/edit?tab=t.0#heading=h.ived98ez15kr"
              className="text-amber-300 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            |{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.google.com/document/d/1gnbjZnx3M3jFOCTvJjt64G9gG9uLd_xOkAelAfycLkU/edit?tab=t.0"
              className="text-amber-300 hover:underline"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
