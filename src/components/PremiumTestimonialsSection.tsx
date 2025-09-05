import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const PremiumTestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: 'Ayaan Warsame',
      location: 'Minneapolis, USA',
      role: 'Diaspora Parent',
      rating: 5,
      text: 'As a Somali living in the US, returning home with Dalxiis Tourism was a dream come true. The team made me feel safe and welcomed everywhere. I finally got to show my kids the beauty of our homeland!',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      packageUsed: 'VIP Bosaso Adventure',
      videoThumbnail: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Abdi Farah',
      location: 'London, UK',
      role: 'Diaspora Professional',
      rating: 5,
      text: 'I grew up in the UK and always wanted to reconnect with my Somali roots. Dalxiis Tourism organized an amazing cultural tour for my family. Highly recommended for the diaspora!',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
      packageUsed: 'Cultural Immersion Package',
      videoThumbnail: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Hodan Ahmed',
      location: 'Toronto, Canada',
      role: 'Diaspora Student',
      rating: 5,
      text: 'Visiting Somalia after so many years abroad was emotional. Dalxiis made it easy and memorable. The guides understood the diaspora perspective and made us feel at home.',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
      packageUsed: 'Family Explorer Package',
      videoThumbnail: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      name: 'Yusuf Mohamed',
      location: 'Stockholm, Sweden',
      role: 'Diaspora Youth',
      rating: 5,
      text: 'I brought my Swedish friends to Somalia and Dalxiis Tourism exceeded all expectations. They showed us the real culture and natural beauty. Perfect for diaspora and their guests!',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300',
      packageUsed: 'Heritage & Culture Tour',
      videoThumbnail: 'https://images.pexels.com/photos/2049422/pexels-photo-2049422.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      name: 'Fatima Ali',
      location: 'Mogadishu, Somalia',
      role: 'Local Guide',
      rating: 5,
      text: 'As a local, I was proud to see how Dalxiis Tourism represents our country to visitors and diaspora. Their service is top-notch and truly authentic.',
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=300',
      packageUsed: 'Puntland Explorer VIP',
      videoThumbnail: 'https://images.pexels.com/photos/1574477/pexels-photo-1574477.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const currentReview = testimonials[currentTestimonial];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-[#f29520]/10 text-[#f29520] px-6 py-2 rounded-full mb-6">
            <Star className="h-5 w-5 mr-2" />
            <span className="font-semibold uppercase tracking-wide text-sm">Client Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1c2c54] mb-6">
            What Our Travelers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers about their 
            extraordinary experiences with Dalxiis Tourism
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="relative">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Video/Image Side */}
              <div className="relative h-96 lg:h-full">
                <img
                  src={currentReview.videoThumbnail}
                  alt={`${currentReview.name} experience`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button className="group bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-6 hover:bg-opacity-100 transition-all duration-300 transform hover:scale-110">
                    <Play className="h-8 w-8 text-[#f29520] group-hover:text-[#e08420] ml-1" />
                  </button>
                </div>
                <div className="absolute top-6 left-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-[#1c2c54] font-semibold text-sm">{currentReview.packageUsed}</span>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-6">
                  <Quote className="h-12 w-12 text-[#f29520] mb-4" />
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed italic mb-6">
                    "{currentReview.text}"
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(currentReview.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-3 text-[#f29520] font-semibold">
                    {currentReview.rating}.0 Rating
                  </span>
                </div>

                {/* Author Info */}
                <div className="flex items-center">
                  <img
                    src={currentReview.image}
                    alt={currentReview.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#f29520]/20"
                  />
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-[#1c2c54]">{currentReview.name}</h4>
                    <p className="text-[#f29520] font-semibold">{currentReview.role}</p>
                    <p className="text-gray-600">{currentReview.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white shadow-xl rounded-full p-3 hover:bg-[#f29520] hover:text-white transition-all duration-300 group"
          >
            <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white shadow-xl rounded-full p-3 hover:bg-[#f29520] hover:text-white transition-all duration-300 group"
          >
            <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Testimonial Thumbnails */}
        <div className="flex justify-center mt-12 space-x-4">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => {
                setCurrentTestimonial(index);
                setIsAutoPlaying(false);
              }}
              className={`relative transition-all duration-300 ${
                index === currentTestimonial 
                  ? 'scale-110 ring-4 ring-[#f29520] ring-opacity-50' 
                  : 'hover:scale-105 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              {index === currentTestimonial && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-[#f29520] rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16 p-8 bg-gradient-to-r from-[#1c2c54] to-[#2f67b5] rounded-2xl text-white text-center">
          {[
            { number: '2,500+', label: 'Happy Clients' },
            { number: '4.9/5', label: 'Average Rating' },
            { number: '98%', label: 'Satisfaction Rate' },
            { number: '15+', label: 'Destinations' }
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-[#f29520] mb-2">{stat.number}</div>
              <div className="text-sm opacity-90 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="https://wa.me/252907797695?text=Hi! I'd like to share my experience with Dalxiis Tourism and possibly book another trip."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-[#f29520] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#e08420] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-[#f29520]/50"
          >
            Share Your Experience
            <Star className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonialsSection;