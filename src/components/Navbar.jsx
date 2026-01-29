import { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faShoppingCart, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const navLinks = [
    { label: "Home", path: "/" },
    { label: "Product", path: "/collection" },
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
];

const Navbar = () => {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const { getCartCount, token, handleLogout } = useContext(AppContext);
    const profileRef = useRef(null);
    const sidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (sidebarVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [sidebarVisible]);


    const cartItemCount = getCartCount();

    return (
        <nav className="fixed top-0 left-0 w-full z-50 navbar-fleur print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo with Image */}
                    <div className="flex-shrink-0">
                        <Link to="/" onClick={() => setSidebarVisible(false)} className="flex items-center gap-3">
                            <img
                                src="/historich-fleur-logo.png"
                                alt="Historich Fleur Logo"
                                className="h-14 w-auto animate-flower"
                            />
                            <span className="text-2xl font-bold tracking-wide text-white uppercase select-none hidden sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Historich Fleur
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === '/'}
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                        ? "text-white bg-rose-800/80"
                                        : "text-white/90 hover:text-white hover:bg-rose-700/50"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Profile, Cart & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={profileRef}>
                            {token ? (
                                <>
                                    <button
                                        onClick={() => setShowProfileDropdown((prev) => !prev)}
                                        className="text-white focus:outline-none"
                                        aria-label="Profil Pengguna"
                                        aria-haspopup="true"
                                        aria-expanded={showProfileDropdown}
                                    >
                                        <FontAwesomeIcon icon={faUser} className="text-xl" />
                                    </button>
                                    {/* Dropdown Menu */}
                                    {showProfileDropdown && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                                <Link
                                                    to="/dashboard/orders"
                                                    onClick={() => setShowProfileDropdown(false)}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        handleLogout("Anda telah keluar.");
                                                        setShowProfileDropdown(false);
                                                    }}
                                                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Keluar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link to="/login" className="text-sm font-medium text-white hover:text-gray-300">
                                    Masuk
                                </Link>
                            )}
                        </div>

                        {/* Cart Icon */}
                        <Link
                            to="/cart"
                            className="relative p-1 text-white hover:text-gray-300"
                            aria-label={`Keranjang belanja, ${cartItemCount} item`}
                        >
                            <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs text-white">
                                    {cartItemCount > 9 ? '9+' : cartItemCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden ml-2">
                            <button
                                id="mobile-menu-button"
                                onClick={() => setSidebarVisible(true)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white hover:bg-rose-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                aria-controls="mobile-menu"
                                aria-expanded={sidebarVisible}
                                aria-label="Buka menu utama"
                            >
                                <span className="sr-only">Buka menu utama</span>
                                <FontAwesomeIcon icon={faBars} className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar (Off-canvas Menu) */}
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out md:hidden ${sidebarVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarVisible(false)}
                aria-hidden="true"
            ></div>
            <div
                ref={sidebarRef}
                className={`fixed top-0 right-0 h-full w-64 navbar-fleur shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${sidebarVisible ? "translate-x-0" : "translate-x-full"
                    }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sidebar-title"
            >
                <div className="p-4">
                    {/* Tombol Close Sidebar */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 id="sidebar-title" className="text-lg font-semibold text-white">Menu</h2>
                        <button
                            onClick={() => setSidebarVisible(false)}
                            className="text-white/80 hover:text-white focus:outline-none"
                            aria-label="Tutup menu"
                        >
                            <FontAwesomeIcon icon={faTimes} className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Navigasi Mobile */}
                    <nav className="space-y-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.path === '/'}
                                onClick={() => setSidebarVisible(false)}
                                className={({ isActive }) =>
                                    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive
                                        ? "text-white bg-rose-800/80"
                                        : "text-white/90 hover:text-white hover:bg-rose-700/50"
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;