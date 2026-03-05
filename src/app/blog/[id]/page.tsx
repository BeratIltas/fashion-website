"use client";

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, ArrowRight, User, Share2, Bookmark } from 'lucide-react';
import blogData from '@/data/blogData.json';

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = blogData.posts.find(p => p.id === parseInt(id));
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            Return to blog
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = blogData.posts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? blogData.posts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogData.posts.length - 1 ? blogData.posts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image */}
      <div className="relative h-[60vh] md:h-[70vh] bg-neutral-900">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Link
          href="/blog"
          className="absolute top-28 left-6 md:left-12 flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/20 transition"
        >
          <ArrowLeft size={18} />
          <span className="hidden md:inline">Back to Blog</span>
        </Link>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-neutral-900 mb-4">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <span className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-neutral-200">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-50 transition text-sm">
              <Share2 size={16} />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-50 transition text-sm">
              <Bookmark size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-ol:text-neutral-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Author Section */}
      <div className="bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-6 bg-white rounded-3xl p-8 shadow-sm">
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-neutral-200">
              <Image
                src={post.authorImage}
                alt={post.author}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{post.author}</h3>
              <p className="text-neutral-600 text-sm mb-3">
                {post.authorBio}
              </p>
              <div className="flex gap-3">
                {post.authorSocial?.twitter && (
                  <a href={post.authorSocial.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-black">Twitter</a>
                )}
                {post.authorSocial?.instagram && (
                  <a href={post.authorSocial.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-black">Instagram</a>
                )}
                {post.authorSocial?.website && (
                  <a href={post.authorSocial.website} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-black">Website</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {prevPost && (
              <Link
                href={`/blog/${prevPost.id}`}
                className="group flex items-center gap-4 p-6 rounded-3xl border border-neutral-200 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <ArrowLeft size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-neutral-500 mb-1">Previous Blog</div>
                  <div className="font-semibold text-neutral-900 truncate group-hover:text-neutral-600 transition">
                    {prevPost.title}
                  </div>
                </div>
              </Link>
            )}
            
            {nextPost && (
              <Link
                href={`/blog/${nextPost.id}`}
                className="group flex items-center gap-4 p-6 rounded-3xl border border-neutral-200 hover:shadow-lg transition md:ml-auto"
              >
                <div className="min-w-0 text-right">
                  <div className="text-xs text-neutral-500 mb-1">Next Blog</div>
                  <div className="font-semibold text-neutral-900 truncate group-hover:text-neutral-600 transition">
                    {nextPost.title}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={20} className="text-white" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {blogData.posts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3).map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition"
              >
                <div className="relative h-48 bg-neutral-100">
                  <Image
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-neutral-600 transition">
                    {relatedPost.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock size={14} />
                    {relatedPost.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}