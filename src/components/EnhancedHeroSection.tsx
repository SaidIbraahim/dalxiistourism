import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, MapPin, Sparkles } from 'lucide-react';

const EnhancedHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const slides = [
    {
      image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      title: 'Discover the Hidden Paradise of Puntland',
      subtitle: 'Experience pristine beaches, rich culture, and breathtaking landscapes in Somalia\'s most beautiful region',
      cta: 'Explore Premium Packages',
      accent: 'Luxury Travel Experience'
    },
    {
      image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      title: 'Unforgettable Coastal Adventures Await',
      subtitle: 'From Bosaso\'s vibrant markets to Eyl\'s tranquil beaches, create memories that last forever',
      cta: 'Book Your Adventure',
      accent: 'Authentic Experiences'
    },
    {
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
      title: 'Immerse in Authentic Somali Culture',
      subtitle: 'Connect with welcoming communities and discover traditions that have thrived for centuries',
      cta: 'Cultural Journeys',
      accent: 'Local Connections'
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images with Enhanced Transitions */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Stars */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-pulse ${
              i % 2 === 0 ? 'animation-delay-1000' : 'animation-delay-2000'
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDuration: `${3 + i}s`,
            }}
          >
            <Sparkles className="h-4 w-4 text-[#f29520] opacity-70" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-5xl">
            {/* Premium Badge */}
            <div className={`mb-8 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center bg-gradient-to-r from-[#f29520] to-[#e08420] text-white px-6 py-3 rounded-full shadow-2xl border border-white/20 backdrop-blur-sm">
                <Star className="h-5 w-5 mr-2" />
                <span className="font-semibold uppercase tracking-wider text-sm">
                  {slides[currentSlide].accent}
                </span>
                <div className="ml-3 h-4 w-px bg-white/30"></div>
                <span className="ml-3 text-sm opacity-90">Since 2020</span>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight transform transition-all duration-1200 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-xl md:text-3xl text-gray-200 mb-10 max-w-4xl leading-relaxed font-light transform transition-all duration-1200 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {slides[currentSlide].subtitle}
            </p>
            
            {/* Trust Indicators */}
            <div className={`flex flex-wrap items-center gap-6 mb-10 transform transition-all duration-1200 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {[
                { icon: Star, text: '4.9 Rating', subtext: '2,500+ Reviews' },
                { icon: MapPin, text: '15+ Destinations', subtext: 'Across Puntland' }
              ].map((item, index) => (
                <div key={index} className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                  <item.icon className="h-5 w-5 text-[#f29520] mr-2" />
                  <div>
                    <div className="text-white font-semibold text-sm">{item.text}</div>
                    <div className="text-gray-300 text-xs">{item.subtext}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Buttons - Fixed spacing and positioning */}
            <div className={`flex flex-col sm:flex-row gap-6 items-start relative z-20 transform transition-all duration-1200 delay-800 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link
                to="/packages"
                className="group bg-gradient-to-r from-[#f29520] to-[#e08420] text-white px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-[#f29520]/50 transition-all duration-500 inline-flex items-center justify-center transform hover:scale-105 hover:-translate-y-1 relative"
              >
                {slides[currentSlide].cta}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
              </Link>
              
              <button className="group border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-[#1c2c54] transition-all duration-500 inline-flex items-center justify-center backdrop-blur-sm transform hover:scale-105 hover:-translate-y-1 relative">
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                Watch Our Story
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative transition-all duration-500 ${
                index === currentSlide 
                  ? 'w-12 h-3 bg-[#f29520] rounded-full' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75 rounded-full'
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-[#f29520] rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
          <div className="ml-4 text-white text-sm font-medium opacity-80">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce z-20">
        <div className="w-8 h-16 border-2 border-white rounded-full flex justify-center backdrop-blur-sm bg-white/10">
          <div className="w-1 h-4 bg-white rounded-full mt-3 animate-pulse"></div>
        </div>
        <div className="text-white text-xs text-center mt-2 font-medium opacity-80">Scroll</div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;