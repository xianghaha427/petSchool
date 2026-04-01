import { campusAreas, CampusArea } from '@/data/campusAreas';

interface Props {
  onAreaClick: (area: CampusArea) => void;
}

export function CampusSVGMap({ onAreaClick }: Props) {
  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      {/* 校园地图背景图片 */}
      <img
        src="/images/carousel/campusMap.jpg"
        alt="校园地图"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />
    </div>
  );
}
