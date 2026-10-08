import { HeroCarousel } from '@/components/carousel/HeroCarousel';
import { AnimatedBanner } from '@/components/animatedBanner/AnimatedBanner';
import FeatureSection from '@/components/feature/FeatureSection';
import { StatsBar } from '@/components/home/StatsBar';
import { FeaturedPets } from '@/components/home/FeaturedPets';
import { AboutSchool } from '@/components/home/AboutSchool';
import { Activities } from '@/components/home/Activities';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="-mt-16 relative z-0">
        <AnimatedBanner />
      </div>
      <div className="relative z-10 -mt-16">
        <HeroCarousel />
        <StatsBar />
        <FeaturedPets />
        <AboutSchool />
        <Activities />
        <FeatureSection />
      </div>
    </div>
  );
}
