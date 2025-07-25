import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Users, Award, Shield, Sparkles } from 'lucide-react';
import EnhancedHeroSection from '../components/EnhancedHeroSection';
import FeaturedPackages from '../components/FeaturedPackages';
import ServicesOverview from '../components/ServicesOverview';
import PremiumTestimonialsSection from '../components/PremiumTestimonialsSection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <EnhancedHeroSection />
      
      {/* Enhanced Stats Section */}
      <section className="py-8 bg-gradient-to-r from-[#2f67b5] via-[#1c2c54] to-[#2f67b5] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0), radial-gradient(circle at 75px 75px, white 2px, transparent 0)`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-[#f29520]/20 text-[#f29520] px-4 py-2 rounded-full mb-3 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-semibold uppercase tracking-wide">Our Achievements</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Trusted by Thousands
            </h2>
            <p className="text-base text-gray-300 max-w-2xl mx-auto">
              Experience the difference that expertise and dedication make
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                icon: Users, 
                number: '2,500+', 
                label: 'Happy Travelers',
                description: 'Satisfied customers from around the world'
              },
              { 
                icon: MapPin, 
                number: '15+', 
                label: 'Destinations',
                description: 'Unique locations across Puntland'
              },
              { 
                icon: Star, 
                number: '4.9', 
                label: 'Average Rating',
                description: 'Based on verified customer reviews'
              },
              { 
                icon: Award, 
                number: '5+', 
                label: 'Years Experience',
                description: 'Leading tourism in the region'
              }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl border border-white/20">
                  <div className="w-12 h-12 bg-[#f29520] rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-base font-semibold text-[#f29520] mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-300">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedPackages />
      <ServicesOverview />

      {/* Enhanced Why Choose Us Section */}
      <section className="py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-[#f29520]/10 text-[#f29520] px-4 py-2 rounded-full mb-3">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-semibold uppercase tracking-wide">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c2c54] mb-2">
              The Dalxiis Difference
            </h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              We're not just a tourism company - we're your gateway to authentic Puntland experiences, 
              crafted with passion, expertise, and unwavering commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                title: 'Uncompromising Safety',
                description: 'Your security is our absolute priority. We maintain the highest safety standards with experienced local guides, vetted accommodations, and 24/7 emergency support.',
                color: 'from-blue-500 to-blue-600',
                features: ['24/7 Emergency Support', 'Vetted Local Partners', 'Comprehensive Insurance']
              },
              {
                icon: Users,
                title: 'Authentic Cultural Immersion',
                description: 'Connect with the real Puntland through meaningful interactions with local communities, traditional experiences, and stories passed down through generations.',
                color: 'from-green-500 to-green-600',
                features: ['Local Community Partnerships', 'Traditional Experiences', 'Cultural Education']
              },
              {
                icon: MapPin,
                title: 'Unmatched Local Expertise',
                description: 'Born and raised in this beautiful region, our team knows every hidden gem, secret spot, and cultural nuance that makes Puntland truly special.',
                color: 'from-purple-500 to-purple-600',
                features: ['Native Local Guides', 'Insider Knowledge', 'Hidden Destinations']
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-[#f29520]/20">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1c2c54] mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-2 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-1">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <div className="w-2 h-2 bg-[#f29520] rounded-full mr-2"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PremiumTestimonialsSection />

      {/* Enhanced CTA Section */}
      <section className="py-8 bg-gradient-to-r from-[#1c2c54] via-[#2f67b5] to-[#1c2c54] text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#f29520] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#f29520] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl opacity-5"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center bg-[#f29520]/20 text-[#f29520] px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-semibold uppercase tracking-wide">Start Your Journey</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Your Puntland Adventure
              <span className="block text-[#f29520]">Awaits</span>
            </h2>
            
            <p className="text-base md:text-lg mb-4 opacity-90 max-w-3xl mx-auto">
              Don't just dream about the perfect getaway - make it a reality. Discover the untouched beauty 
              of Puntland with our expertly crafted experiences that will create memories for a lifetime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/packages"
                className="group bg-gradient-to-r from-[#f29520] to-[#e08420] text-white px-6 py-3 rounded-full font-bold text-base hover:shadow-2xl hover:shadow-[#f29520]/50 transition-all duration-500 inline-flex items-center justify-center transform hover:scale-105 hover:-translate-y-1"
              >
                Explore Packages
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a
                href="https://wa.me/252905345879?text=Hi! I'm interested in planning a trip to Puntland. Can you help me get started?"
                target="_blank"
                rel="noopener noreferrer"
                className="group border-2 border-[#f29520] text-[#f29520] px-6 py-3 rounded-full font-bold text-base hover:bg-[#f29520] hover:text-white transition-all duration-500 inline-flex items-center justify-center transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm"
              >
                Start Planning Now
              </a>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center items-center gap-4 opacity-80">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-[#f29520]" />
                <span className="text-xs">100% Safe & Secure</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-[#f29520]" />
                <span className="text-xs">4.9/5 Customer Rating</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-[#f29520]" />
                <span className="text-xs">2,500+ Happy Travelers</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;