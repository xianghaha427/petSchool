import { HeroCarousel } from '@/components/carousel/HeroCarousel';
import FeatureSection from '@/components/feature/FeatureSection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <FeatureSection />
    </div>
  );
}
