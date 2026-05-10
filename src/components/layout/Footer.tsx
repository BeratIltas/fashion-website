"use client";

import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { playfair } from '@/app/fonts';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Subscription logic here
    console.log('Subscribed:', email);
    setEmail('');
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      {/* <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to</h3>
              <p className="text-lg font-bold">our newsletter</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3 rounded-full bg-neutral-800 border border-neutral-700 focus:outline-none focus:border-neutral-500 transition text-white placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-neutral-200 transition whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div>
            <h4 className={`text-2xl font-bold mb-4 ${playfair.className}`}>Miragé</h4>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              A sophisticated menswear accessories designed for modern men with individual sense.
            </p>
            <Link href="/shop">
              <button className="px-6 py-2.5 border border-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition">
                Shop now
              </button>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-neutral-400 hover:text-white transition text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow us */}
          <div>
            <h4 className="font-bold mb-6">Follow us</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition text-sm">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition text-sm">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition text-sm">
                  Pinterest
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition text-sm">
                  Youtube
                </a>
              </li>
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h4 className="font-bold mb-6">Get in touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+902164442569" className="text-neutral-400 hover:text-white transition text-sm">
                  +90 216 444 25 69
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:Miragé.y@gmail.com" className="text-neutral-400 hover:text-white transition text-sm">
                  Mirage@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">
                  Beykoz University, Istanbul
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Large Brand Name */}
        {/* <div className="text-center mb-8">
          <h2 className={`text-[80px] md:text-[120px] lg:text-[160px] font-bold leading-none tracking-tight ${playfair.className}`}>
            Miragé
          </h2>
        </div> */}

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-neutral-800">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} <span className={playfair.className}>Miragé</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
