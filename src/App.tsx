/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Menu, 
  X,
  MessageSquare,
  ChevronRight,
  Target,
  Users
} from 'lucide-react';
import { NAV_LINKS, SERVICES, PORTFOLIO, TESTIMONIALS } from './constants';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#home" className="text-2xl font-display font-bold text-brand-black">
            ELLEVATE<span className="text-brand-orange">DIGITAL</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium hover:text-brand-orange transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#contact" 
              className="bg-brand-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-orange transition-all duration-300"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-brand-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white border-t border-gray-100 p-6 md:hidden shadow-xl"
            >
              <div className="flex flex-col space-y-4">
                {NAV_LINKS.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <a 
                  href="#contact" 
                  className="bg-brand-orange text-white px-6 py-3 rounded-xl text-center font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-brand-orange/5 rounded-bl-[100px]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full mb-6">
                <span className="text-xs font-bold uppercase tracking-wider">Top Agency in Kenya</span>
              </div>
              <h1 className="text-5xl md:text-7xl mb-6 leading-[1.1]">
                We Help Brands Grow Online & Get <span className="text-brand-orange italic">Real Customers</span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-lg">
                Results-driven digital marketing agency in Kenya. We don't just market — we bring customers through strategic growth and influencer power.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <a 
                  href="#contact" 
                  className="bg-brand-orange text-white px-8 py-4 rounded-full font-bold flex items-center justify-center hover:shadow-lg hover:shadow-brand-orange/30 transition-all"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a 
                  href="#portfolio" 
                  className="border-2 border-brand-black text-brand-black px-8 py-4 rounded-full font-bold flex items-center justify-center hover:bg-brand-black hover:text-white transition-all"
                >
                  View Our Work
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/agency-hero/800/1000" 
                  alt="Marketing Team" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden sm:block">
                <p className="text-3xl font-bold text-brand-orange">500K+</p>
                <p className="text-xs text-gray-500 font-bold uppercase">Audience Reach</p>
              </div>
              <div className="absolute -top-6 -right-6 bg-brand-black text-white p-6 rounded-2xl shadow-xl z-20 hidden sm:block">
                <p className="text-3xl font-bold">150+</p>
                <p className="text-xs text-gray-400 font-bold uppercase">Successful Campaigns</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Our Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a comprehensive suite of digital marketing services tailored to help your business thrive in the modern landscape.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center text-xs font-semibold text-gray-500">
                      <CheckCircle2 className="w-4 h-4 text-brand-orange mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-full bg-brand-orange/5 absolute -top-10 -left-10 w-full h-full -z-10" />
              <img 
                src="https://picsum.photos/seed/mcjj/800/800" 
                alt="MC JJ Influencer" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl mb-6">Built on Influence & Results</h2>
              <p className="text-lg text-gray-600 mb-6">
                Ellevate Digital isn't just another agency. Founded by MC JJ, we leverage a unique influencer advantage to bridge the gap between brands and real consumers.
              </p>
              <div className="space-y-6 mb-10">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center shrink-0">
                    <Target className="text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Our Mission</h4>
                    <p className="text-gray-500 text-sm">To empower Kenyan brands with digital strategies that convert attention into revenue.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center shrink-0">
                    <Users className="text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">The MC JJ Advantage</h4>
                    <p className="text-gray-500 text-sm">Direct access to a massive, engaged audience on TikTok and Facebook for instant brand visibility.</p>
                  </div>
                </div>
              </div>
              <a href="#contact" className="inline-flex items-center font-bold text-brand-orange hover:underline">
                Learn more about our story <ChevronRight className="ml-1 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4">Featured Work</h2>
              <p className="text-gray-400 max-w-xl">
                Take a look at some of the brands we've helped elevate through creative strategy and execution.
              </p>
            </div>
            <a href="#contact" className="mt-6 md:mt-0 text-brand-orange font-bold flex items-center hover:underline">
              View all projects <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PORTFOLIO.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5]"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-brand-orange text-xs font-bold uppercase mb-1">{item.category}</p>
                  <h4 className="text-xl font-bold">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-orange rounded-[40px] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl mb-8">Why Ellevate Digital?</h2>
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Results-Focused</h4>
                      <p className="text-white/80">We don't care about vanity metrics. We care about your bottom line and real customer growth.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Experienced Team</h4>
                      <p className="text-white/80">Our experts have years of experience in the Kenyan market and global digital trends.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">Influencer Power</h4>
                      <p className="text-white/80">Unique access to massive audiences that other agencies simply can't provide.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <blockquote className="text-2xl font-display italic mb-6">
                  "We don't just market — we bring customers. That's the Ellevate promise."
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                  <div>
                    <p className="font-bold">MC JJ</p>
                    <p className="text-sm text-white/60">Founder & CEO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">What Our Clients Say</h2>
            <p className="text-gray-600">Real feedback from brands we've helped grow.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <p className="text-brand-orange text-sm">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic text-lg leading-relaxed">"{t.content}"</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 flex items-center space-x-2">
              <MessageSquare className="text-brand-orange w-5 h-5" />
              <span className="text-sm font-bold">50+ WhatsApp Testimonials Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl md:text-5xl mb-6">Let's Grow Your Business Today</h2>
              <p className="text-lg text-gray-600 mb-10">
                Ready to take your brand to the next level? Fill out the form or reach out directly to start the conversation.
              </p>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                    <Phone />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Call Us</p>
                    <p className="text-lg font-bold">+254 700 000 000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                    <Mail />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Email Us</p>
                    <p className="text-lg font-bold">hello@ellevatedigital.co.ke</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                    <MapPin />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Visit Us</p>
                    <p className="text-lg font-bold">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <a 
                  href="https://wa.me/254700000000" 
                  className="inline-flex items-center bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all"
                >
                  <MessageSquare className="mr-2" /> Chat on WhatsApp
                </a>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 md:p-12 rounded-[40px]">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl border-none bg-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <input type="email" className="w-full px-6 py-4 rounded-2xl border-none bg-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Service Interested In</label>
                  <select className="w-full px-6 py-4 rounded-2xl border-none bg-white focus:ring-2 focus:ring-brand-orange outline-none appearance-none">
                    <option>Social Media Management</option>
                    <option>Influencer Marketing</option>
                    <option>Branding</option>
                    <option>Web Design</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Message</label>
                  <textarea rows={4} className="w-full px-6 py-4 rounded-2xl border-none bg-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Tell us about your project..."></textarea>
                </div>
                <button className="w-full bg-brand-black text-white py-5 rounded-2xl font-bold hover:bg-brand-orange transition-all duration-300">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <a href="#home" className="text-3xl font-display font-bold mb-6 block">
                ELLEVATE<span className="text-brand-orange">DIGITAL</span>
              </a>
              <p className="text-gray-400 max-w-sm mb-8">
                Kenya's leading digital marketing agency focused on real growth and measurable results. We bring customers to your brand.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-orange transition-all"><Twitter size={20} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-400">
                {NAV_LINKS.map(link => (
                  <li key={link.name}><a href={link.href} className="hover:text-white transition-colors">{link.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Services</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Social Media</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Influencer Marketing</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Web Design</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Branding</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>© 2026 Ellevate Digital. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
