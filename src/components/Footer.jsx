import { assets } from "../assets/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="navbar-fleur mt-20 text-white">
      <div className="container mx-auto px-4 py-10 text-sm sm:text-base">
        <div className="flex flex-col sm:grid sm:grid-cols-[3fr_1fr_1fr] gap-10 sm:gap-14">
          {/* Branding Text */}
          <div>
            <Link to="/">
              <span className="mb-5 block text-3xl font-extrabold tracking-wide text-white uppercase select-none">Historich Fleur</span>
            </Link>
          </div>

          {/* Layanan Pelanggan */}
          <div>
            <p className="text-lg font-semibold mb-4 text-white">Layanan Pelanggan</p>
            <ul className="flex flex-col gap-2 text-white/90">
              <li>
                <Link
                  to="/"
                  className="hover:text-white transition duration-300 hover:translate-x-1 inline-block"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition duration-300 hover:translate-x-1 inline-block"
                >
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <p className="text-lg font-semibold mb-4 text-white">Kontak</p>
            <ul className="flex flex-col gap-2 text-white/90">
              <li>
                <a
                  href="https://wa.me/6289505657899"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-white transition duration-300"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  +62 895 0565 7899
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/historich.fleur?igsh=MTM3MWszbjBrdnRpdw=="
                  className="flex items-center hover:text-white transition duration-300"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  ig : historich.fleur
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bawah */}
        <div className="mt-10 border-t border-white/20 pt-4 text-center text-white/80 text-sm">
          <p>
            &copy; 2026 -{" "}
            <span className="text-white font-medium">Historich Fleur</span> - All
            Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
