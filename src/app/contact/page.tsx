"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="bg-black px-6 py-20 pt-28 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl">
            Helping you define
            <br />
            your personal style
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-300">
            We create tailored solutions through current style guidance and personal consulting.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="rounded-full bg-white px-8 py-3 font-medium text-black transition hover:bg-neutral-200">
              Get in touch
            </button>
            <button className="rounded-full border border-white px-8 py-3 font-medium text-white transition hover:bg-white hover:text-black">
              Services
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
              <Mail className="text-white" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Instagram.com</h3>
            <p className="text-neutral-600">Send us an email</p>
          </div>

          <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
              <Phone className="text-white" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold">+90 234 567 890</h3>
            <p className="text-neutral-600">Phone number</p>
          </div>

          <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black">
              <MapPin className="text-white" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Istanbul, London</h3>
            <p className="text-neutral-600">Our locations</p>
          </div>
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2">
          <div className="relative min-h-[600px] overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-200 to-neutral-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg">
                  <Send size={48} className="text-black" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-neutral-800">Reach out to us</h3>
                <p className="text-neutral-600">Fill out the form and we will get back to you.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm md:p-10">
            {isSubmitted ? (
              <div className="py-16 text-center">
                <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
                <h3 className="mb-2 text-2xl font-bold">Your message has been sent.</h3>
                <p className="text-neutral-600">We will get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Phone number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+90 555 123 45 67"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Enquiry</option>
                    <option value="style-consulting">Style consulting</option>
                    <option value="personal-shopping">Personal shopping</option>
                    <option value="wardrobe">Wardrobe editing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className="mb-2 block text-sm font-medium text-neutral-700">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message here..."
                    rows={5}
                    required
                    className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 font-semibold text-white shadow-lg transition hover:bg-neutral-800 hover:shadow-xl"
                >
                  Send message
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
