import React from 'react';
import { Users, Target, Eye, Heart, Award, Shield, Leaf, Star } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Shield,
      title: 'Safety and Trust',
      description: 'Your safety is our top priority. We maintain the highest standards of security and reliability in all our services.'
    },
    {
      icon: Leaf,
      title: 'Environmental Responsibility',
      description: 'We are committed to sustainable tourism practices that protect and preserve Puntland\'s natural beauty for future generations.'
    },
    {
      icon: Users,
      title: 'Cultural Learning',
      description: 'We facilitate meaningful cultural exchanges that benefit both visitors and local communities.'
    },
    {
      icon: Heart,
      title: 'Client-First Customization',
      description: 'Every traveler is unique, and we tailor our services to meet your specific needs and preferences.'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Happy Travelers', icon: Users },
    { number: '15+', label: 'Destinations', icon: Target },
    { number: '4.9', label: 'Average Rating', icon: Star },
    { number: '5+', label: 'Years Experience', icon: Award }
  ];

  const team = [
    {
      name: 'Mohamed Ahmed',
      position: 'Founder & CEO',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Born and raised in Garowe, Mohamed has over 10 years of experience in the tourism industry and deep knowledge of Puntland\'s hidden gems.'
    },
    {
      name: 'Amina Hassan',
      position: 'Operations Director',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Expert in tour operations and customer service, Amina ensures every trip runs smoothly and exceeds expectations.'
    },
    {
      name: 'Omar Said',
      position: 'Lead Tour Guide',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Cultural expert and storyteller, Omar brings Puntland\'s history and traditions to life for every visitor.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1c2c54] mb-4">
            About Dalxiis Tourism
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Premier tourism and travel service provider based in Garowe, Somalia, 
            dedicated to showcasing the beauty and culture of Puntland
          </p>
        </div>

        {/* Company Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Puntland coastline"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#1c2c54] mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Founded in 2020, Dalxiis Tourism was born from a passion to share the untold beauty 
                of Puntland with the world. Our founders, native to this magnificent region, recognized 
                the need for professional tourism services that could showcase Puntland's pristine 
                coastlines, rich cultural heritage, and warm hospitality.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                What started as a small local tour operation has grown into Puntland's premier 
                tourism company, serving both local and international travelers. We've built our 
                reputation on authenticity, safety, and creating unforgettable experiences that 
                connect visitors with the true essence of Somali culture and natural beauty.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Today, we're proud to be the leading tourism provider in the region, offering 
                comprehensive travel solutions while contributing to sustainable tourism development 
                that benefits local communities.
              </p>
            </div>
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-gradient-to-br from-[#f29520] to-[#e08420] text-white rounded-2xl p-8 text-center">
            <Target className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-lg leading-relaxed opacity-95">
              To deliver unforgettable and educational travel experiences while promoting 
              a sustainable tourism model that benefits both the environment and local communities.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-[#2f67b5] to-[#1c2c54] text-white rounded-2xl p-8 text-center">
            <Eye className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-lg leading-relaxed opacity-95">
              To become a globally recognized tourism company renowned for exceptional 
              customer experiences and authentic cultural immersion.
            </p>
          </div>

          {/* Values Preview */}
          <div className="bg-gradient-to-br from-[#1c2c54] to-[#2f67b5] text-white rounded-2xl p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">Our Values</h3>
            <p className="text-lg leading-relaxed opacity-95">
              Safety, cultural learning, environmental responsibility, and client-first customization 
              guide everything we do.
            </p>
          </div>
        </div>

        {/* Detailed Values Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-[#1c2c54] mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="flex items-start p-6 rounded-xl bg-gray-50 hover:bg-[#e0dddf] transition-colors">
                <div className="w-12 h-12 bg-[#f29520] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#1c2c54] mb-2">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#1c2c54] text-white rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-[#f29520]" />
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-[#1c2c54] mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg"
                />
                <h3 className="text-xl font-semibold text-[#1c2c54] mb-2">{member.name}</h3>
                <p className="text-[#f29520] font-medium mb-3">{member.position}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Section */}
        <div className="bg-gradient-to-br from-[#f29520] to-[#2f67b5] text-white rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center mb-8">
            <Leaf className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Committed to Sustainability</h2>
            <p className="text-xl opacity-95 max-w-3xl mx-auto">
              We believe in responsible tourism that preserves Puntland's natural beauty 
              and supports local communities for generations to come.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Environmental protection programs',
              'Local community employment',
              'Cultural preservation initiatives',
              'Sustainable transportation options',
              'Eco-friendly accommodation partnerships',
              'Educational tourism experiences'
            ].map((initiative, index) => (
              <div key={index} className="flex items-center bg-white bg-opacity-20 rounded-lg p-4">
                <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <span>{initiative}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
          <h2 className="text-3xl font-bold text-[#1c2c54] mb-4">Join Our Journey</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Become part of the Dalxiis Tourism family and experience the authentic beauty 
            of Puntland with guides who truly know and love their homeland.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://wa.me/252905345879?text=Hi! I would like to learn more about Dalxiis Tourism and plan a trip to Puntland.', '_blank')}
              className="bg-[#f29520] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e08420] transition-colors"
            >
              Plan Your Adventure
            </button>
            <button
              onClick={() => window.open('mailto:dalxiistta@gmail.com?subject=Partnership Inquiry', '_blank')}
              className="border-2 border-[#2f67b5] text-[#2f67b5] px-8 py-3 rounded-full font-semibold hover:bg-[#2f67b5] hover:text-white transition-colors"
            >
              Partner With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;