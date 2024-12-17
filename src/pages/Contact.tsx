import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import VideoBackground from '../components/VideoBackground';
import { VIDEOS, SERVICES } from '../constants';
import { apiService } from '../services/api';
import type { ContactFormData } from '../types/forms';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  service: 'yacht' | 'aviation' | 'vehicle' | 'general';
  preferredContact: 'email' | 'phone' | 'whatsapp';
}

interface FormError {
  field: keyof ContactForm;
  message: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What are your operating hours?",
    answer: "We are available Monday to Friday from 9:00 AM to 9:00 PM, Saturday from 10:00 AM to 6:00 PM, and Sunday from 12:00 PM to 5:00 PM (UAE Time)."
  },
  {
    question: "How quickly can you arrange a service?",
    answer: "For most services, we can arrange bookings within 24 hours. However, for specific requests or peak seasons, we recommend booking at least 48-72 hours in advance."
  },
  {
    question: "Do you offer customized packages?",
    answer: "Yes, we specialize in creating bespoke luxury experiences tailored to your preferences. Our team can customize any of our services to meet your specific requirements."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and cryptocurrency. For certain services, we may require a deposit to secure your booking."
  }
];

const socialLinks = [
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    url: 'https://wa.me/971501234567',
    color: 'hover:text-green-500'
  },
  {
    name: 'Instagram',
    icon: MessageCircle,
    url: 'https://instagram.com/dubailuxury',
    color: 'hover:text-pink-500'
  },
  {
    name: 'Facebook',
    icon: MessageCircle,
    url: 'https://facebook.com/dubailuxury',
    color: 'hover:text-blue-500'
  },
  {
    name: 'Twitter',
    icon: MessageCircle,
    url: 'https://twitter.com/dubailuxury',
    color: 'hover:text-sky-500'
  }
];

export const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    service: 'general',
    preferredContact: 'email'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);

  const validateForm = (): FormError | null => {
    if (formData.name.length < 2) {
      return { field: 'name', message: 'Name must be at least 2 characters long' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return { field: 'email', message: 'Please enter a valid email address' };
    }
    if (formData.phone && !/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
      return { field: 'phone', message: 'Please enter a valid phone number' };
    }
    if (formData.message.length < 10) {
      return { field: 'message', message: 'Message must be at least 10 characters long' };
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error?.field === name) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit contact form
      const response = await apiService.submitContactForm(formData);
      
      if (response.success && response.data) {
        setTicketId(response.data.ticketId);
        setIsSubmitted(true);
        
        // Send confirmation email
        await apiService.sendEmail({
          to: formData.email,
          templateId: 'contact-form-confirmation',
          data: {
            name: formData.name,
            ticketId: response.data.ticketId,
            estimatedResponse: response.data.estimatedResponse,
          },
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          service: 'general',
          preferredContact: 'email'
        });

        // Reset success message after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setTicketId(null);
        }, 3000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError({ field: 'submit', message: err.message });
      } else {
        setError({ field: 'submit', message: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh]">
        <VideoBackground
          videoUrl={VIDEOS.CONTACT.url}
          posterImage={SERVICES.AVIATION.main}
          overlayOpacity={0.7}
        />
        
        <div className="relative h-full flex items-center justify-center text-center z-10">
          <div className="max-w-4xl mx-auto px-4 bg-black/30 backdrop-blur-sm p-8 rounded-lg">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-white font-medium drop-shadow-lg"
            >
              Let us help you plan your perfect luxury experience
            </motion.p>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-12 bg-gradient-to-b from-black via-black/95 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center space-x-2 ${social.color} transition-colors bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg`}
              >
                <social.icon className="h-6 w-6" />
                <span className="hidden md:inline font-medium">{social.name}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-sm p-8 rounded-lg"
            >
              <h2 className="text-3xl font-bold mb-8 text-white drop-shadow-lg">Get in Touch</h2>
              <p className="text-lg text-white mb-12 drop-shadow">
                Have questions about our services or need custom arrangements? Our team is here to help you plan your perfect Dubai luxury experience.
              </p>

              <div className="space-y-8">
                {/* Contact Info Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start group"
                >
                  <div className="bg-white/20 p-3 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white drop-shadow">Phone</h3>
                    <a 
                      href="tel:+97141234567" 
                      className="text-white hover:text-white/80 transition-colors drop-shadow"
                    >
                      +971 4 123 4567
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-start group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">WhatsApp</h3>
                    <a 
                      href="https://wa.me/971501234567" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      +971 50 123 4567
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex items-start group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Email</h3>
                    <a 
                      href="mailto:info@dubai-luxury.com" 
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      info@dubai-luxury.com
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-start group"
                >
                  <div className="bg-white/10 p-3 rounded-lg group-hover:bg-white/20 transition-colors">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Location</h3>
                    <a 
                      href="https://goo.gl/maps/dubai-marina" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Dubai Marina Walk, Dubai, UAE
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Map Component */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="mt-12 h-64 bg-gray-900 rounded-lg overflow-hidden"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.8899800000003!2d55.1367!3d25.0657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDAzJzU2LjUiTiA1NcKwMDgnMTIuMSJF!5e0!3m2!1sen!2sae!4v1629789045693!5m2!1sen!2sae"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </motion.div>

              {/* Operating Hours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-12 p-6 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10"
              >
                <h3 className="text-xl font-semibold mb-4 text-white drop-shadow">Operating Hours</h3>
                <div className="space-y-2">
                  <p className="text-white drop-shadow">Monday - Friday: 9:00 AM - 9:00 PM</p>
                  <p className="text-white drop-shadow">Saturday: 10:00 AM - 6:00 PM</p>
                  <p className="text-white drop-shadow">Sunday: 12:00 PM - 5:00 PM</p>
                  <p className="text-sm text-white/80 mt-4 drop-shadow">All times in Gulf Standard Time (GST)</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Contact Form */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                <h2 className="text-3xl font-bold mb-8 text-white drop-shadow">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 rounded-lg bg-black border ${
                        error?.field === 'name' ? 'border-red-500' : 'border-white/20'
                      } text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors`}
                      placeholder="Enter your name"
                    />
                    {error?.field === 'name' && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {error.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-lg bg-black border ${
                          error?.field === 'email' ? 'border-red-500' : 'border-white/20'
                        } text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors`}
                        placeholder="Enter your email"
                      />
                      {error?.field === 'email' && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {error.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-lg bg-black border ${
                          error?.field === 'phone' ? 'border-red-500' : 'border-white/20'
                        } text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors`}
                        placeholder="Enter your phone number"
                      />
                      {error?.field === 'phone' && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {error.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                      Service Interest
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="yacht">Yacht Charter</option>
                      <option value="aviation">Private Aviation</option>
                      <option value="vehicle">Luxury Vehicles</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Contact Method
                    </label>
                    <select
                      id="preferredContact"
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-white/20 text-white focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg bg-black border ${
                        error?.field === 'message' ? 'border-red-500' : 'border-white/20'
                      } text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors`}
                      placeholder="How can we help you?"
                    ></textarea>
                    {error?.field === 'message' && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {error.message}
                      </p>
                    )}
                  </div>

                  {error?.field === 'submit' && (
                    <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {error.message}
                      </p>
                    </div>
                  )}

                  {ticketId && (
                    <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                      <p className="text-sm text-green-500 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        Your ticket ID is: {ticketId}
                      </p>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-white text-black px-8 py-4 rounded-lg text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors relative overflow-hidden ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center"
                      >
                        Sending...
                      </motion.span>
                    ) : isSubmitted ? (
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Message Sent
                      </motion.span>
                    ) : (
                      'Send Message'
                    )}
                  </motion.button>
                </form>
              </div>

              {/* FAQ Section */}
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                <h2 className="text-3xl font-bold mb-8 text-white drop-shadow">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-b border-white/10 last:border-0 pb-4 last:pb-0"
                    >
                      <button
                        onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                        className="w-full flex justify-between items-center text-left"
                        title={`Toggle answer for: ${faq.question}`}
                        aria-expanded={selectedFaq === index ? true : false}
                        aria-controls={`faq-answer-${index}`}
                      >
                        <span className="font-medium">{faq.question}</span>
                        <HelpCircle
                          className={`w-5 h-5 transform transition-transform ${
                            selectedFaq === index ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {selectedFaq === index && (
                        <motion.div
                          id={`faq-answer-${index}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 text-gray-300"
                          role="region"
                          aria-labelledby={`faq-question-${index}`}
                        >
                          <p>{faq.answer}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Chat Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        title="Open live chat"
        aria-label="Open live chat"
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </motion.button>

      {/* Live Chat Widget */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-8 w-96 bg-gray-900 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-4 bg-black flex justify-between items-center">
            <h3 className="font-semibold">Live Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white"
              title="Close live chat"
              aria-label="Close live chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="h-96 p-4 overflow-y-auto">
            <div className="text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Our team is here to help! Send us a message and we'll respond as soon as possible.</p>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg bg-black border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};