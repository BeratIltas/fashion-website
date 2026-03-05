"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e:any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e:any ) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Helping you define
            <br />
            your personal style
          </h1>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto mb-8">
            Güncel stil tavsiyeleri ve kişisel danışmanlık hizmetlerimizle size özel çözümler üretiyoruz
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-neutral-200 transition">
              İletişim Kurun
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-black transition">
              Hizmetler
            </button>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Instagram.com</h3>
            <p className="text-neutral-600">Send us an Email</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">+90 234 567 890</h3>
            <p className="text-neutral-600">Phone Number</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">İstanbul, Londra</h3>
            <p className="text-neutral-600">Our Locations</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <div className="bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-3xl overflow-hidden h-full min-h-[600px] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Send size={48} className="text-black" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">Bize Ulaşın</h3>
                <p className="text-neutral-600">Formu doldurun, sizinle iletişime geçelim</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-16">
                <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                <h3 className="text-2xl font-bold mb-2">Mesajınız Gönderildi!</h3>
                <p className="text-neutral-600">En kısa sürede size dönüş yapacağız.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone No
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+90 555 123 45 67"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition appearance-none bg-white"
                  >
                    <option value="">Enquiry</option>
                    <option value="style-consulting">Stil Danışmanlığı</option>
                    <option value="personal-shopping">Kişisel Alışveriş</option>
                    <option value="wardrobe">Gardırop Düzenleme</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter message here..."
                    rows={5}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}