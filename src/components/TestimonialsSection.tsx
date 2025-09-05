import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Ayaan Warsame',
      location: 'Minneapolis, USA',
      rating: 5,
      text: 'As a Somali living in the US, returning home with Dalxiis Tourism was a dream come true. The team made me feel safe and welcomed everywhere. I finally got to show my kids the beauty of our homeland!',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Abdi Farah',
      location: 'London, UK',
      rating: 5,
      text: 'I grew up in the UK and always wanted to reconnect with my Somali roots. Dalxiis Tourism organized an amazing cultural tour for my family. Highly recommended for the diaspora!',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Hodan Ahmed',
      location: 'Toronto, Canada',
      rating: 5,
      text: 'Visiting Somalia after so many years abroad was emotional. Dalxiis made it easy and memorable. The guides understood the diaspora perspective and made us feel at home.',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Yusuf Mohamed',
      location: 'Stockholm, Sweden',
      rating: 5,
      text: 'I brought my Swedish friends to Somalia and Dalxiis Tourism exceeded all expectations. They showed us the real culture and natural beauty. Perfect for diaspora and their guests!',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Fatima Ali',
      location: 'Mogadishu, Somalia',
      rating: 5,
      text: 'As a local, I was proud to see how Dalxiis Tourism represents our country to visitors and diaspora. Their service is top-notch and truly authentic.',
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1c2c54] mb-4">What Our Travelers Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers about their experiences with Dalxiis Tourism
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-shadow duration-300">
              <Quote className="h-8 w-8 text-[#f29520] mb-4" />
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-[#1c2c54]">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="absolute top-6 right-6">
                <div className="w-16 h-16 bg-[#f29520] bg-opacity-10 rounded-full flex items-center justify-center">
                  <Quote className="h-6 w-6 text-[#f29520]" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a
            href="https://wa.me/252907797695"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-[#e08420] transition-colors"
          >
            Share Your Experience
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;