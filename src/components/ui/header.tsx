"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <Image src="/assets/logo-pulse.svg" alt="Pulse" width={100} height={40}/>
        </Link>
        
        {/* Navigation */}
        <nav
          className={`hidden md:flex gap-6 font-medium transition ${
            scrolled ? "text-gray-800" : "text-white"
          }`}
        >
          <Link href="/artistes" className="hover:text-violet-600 transition">
            Artistes
          </Link>
          <Link href="/programme" className="hover:text-violet-600 transition">
            Programme
          </Link>
          <a href="#faq" className="hover:text-violet-600 transition">
            FAQ
          </a>
          <Link href="/carte" className="hover:text-violet-600 transition">
            Carte
          </Link>
        </nav>

        {/* Auth & CTA */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/my-events"
                className={`px-3 py-1 rounded-lg transition ${
                  scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/20"
                }`}
              >
                Mes événements
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`px-3 py-1 rounded-lg transition ${
                    scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/20"
                  }`}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className={`px-3 py-1 rounded-lg transition ${
                  scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/20"
                }`}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`px-3 py-1 rounded-lg transition ${
                  scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/20"
                }`}
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className={`px-4 py-2 rounded-xl shadow transition ${
                  scrolled
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "bg-white text-violet-600 hover:bg-gray-200"
                }`}
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
