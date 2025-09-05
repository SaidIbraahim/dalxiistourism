
import { brandClasses } from '@/styles/designSystem';
import { OurStory, MissionVisionValues, CoreValues, Achievements, TeamSection, CTASection } from '@/components/about';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold ${brandClasses.text.primary} mb-4`}>
            About Dalxiis Tourism
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Premier tourism and travel service provider based in Garowe, Somalia, 
            dedicated to showcasing the beauty and culture of Somalia and Puntland
          </p>
        </div>

        {/* Our Story */}
        <OurStory />

        {/* Mission, Vision, Values */}
        <MissionVisionValues />

        {/* Detailed Values Section */}
        <CoreValues />

        {/* Stats Section */}
        <Achievements />

        {/* Team Section */}
        <TeamSection />

        {/* CTA Section */}
        <CTASection />
        
        {/* Bottom Spacing */}
        <div className="pb-16"></div>
      </div>
    </div>
  );
};

export default AboutPage;