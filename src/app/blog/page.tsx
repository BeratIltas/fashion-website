"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, User } from 'lucide-react';
import blogData from '@/data/blogData.json';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All Blogs");

  const filteredPosts = activeCategory === "All Blogs" 
    ? blogData.posts 
    : blogData.posts.filter(post => post.category === activeCategory);

  const featuredPost = blogData.posts.find(post => post.featured);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea1c8e9d?w=1920&q=80"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Premium Articles
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The craft behind
            <br />
            every single stitch
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-8">
            Discover how minimalist fashion and sustainable practices create timeless garments from sustainable materials.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-neutral-200 transition">
              Explore Articles
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-neutral-200 sticky top-24 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {blogData.categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition ${
                  activeCategory === category
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden bg-neutral-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-neutral-600 transition line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readTime}
                    </span>
                  </div>
                  
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border border-neutral-300 rounded-full font-medium hover:bg-neutral-100 transition">
            Load More Articles
          </button>
        </div>
      </div>

      {/* Featured Article Section */}
      {featuredPost && (
        <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-black text-white px-4 py-1.5 rounded-full text-xs font-medium mb-4">
                  Featured Article
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                  Elevate everyday outfits using modern minimalist styling
                </h2>
                
                <p className="text-lg text-neutral-600 mb-6">
                  Use curated minimalist fashion pieces and app-style outfit matching tools to effortlessly style yourself with clothes you already own. Embrace your personal style with expert styling tips.
                </p>

                <div className="flex items-center gap-4 text-sm text-neutral-600 mb-8">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    Dec 15, 2024
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    12 min read
                  </span>
                </div>

                <Link
                  href="/blog/1"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-neutral-800 transition"
                >
                  Read Full Article
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-72 rounded-3xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                    alt="Style 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-72 rounded-3xl overflow-hidden mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80"
                    alt="Style 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}