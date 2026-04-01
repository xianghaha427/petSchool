export interface CampusArea {
  id: string;
  name: string;
  description: string;
  // 位置标识在图片上的百分比位置
  position: { x: number; y: number };
  // 详情图片
  detailImage?: string;
}

export const campusAreas: CampusArea[] = [
  {
    id: 'reception',
    name: '前台',
    description: '校园接待中心，提供咨询、登记、入住办理等服务。我们的工作人员随时为您和您的宠物提供热情的帮助。',
    position: { x: 42, y: 47 },
  },
  {
    id: 'swimming',
    name: '游泳池',
    description: '宠物游泳训练中心，恒温泳池适合各年龄段宠物。水深可调节，配有专业宠物游泳教练，是夏日消暑的好去处。',
    position: { x: 69, y: 35 },
  },
  {
    id: 'resort',
    name: '宠物度假酒店',
    description: '宠物专属度假酒店，提供舒适的住宿环境。配备空调、暖气、软垫等设施，让宠物学员住得安心舒适。',
    position: { x: 82, y: 56 },
  },
  {
    id: 'rest',
    name: '休息区',
    description: '校园内的休闲休息区，提供舒适的座椅和遮阳设施。主人可以在这里放松休息，看着宠物在草地上玩耍。',
    position: { x: 28, y: 57 },
  },
  {
    id: 'restroom',
    name: '厕所',
    description: '宠物友好厕所，配备宠物清洁设施。定期消毒清洁，保持环境整洁卫生。',
    position: { x: 62, y: 73 },
  },
  {
    id: 'waterbar',
    name: '水吧',
    description: '宠物专属水吧，提供各种宠物饮品和零食。矿泉水、狗狗奶茶、猫咪甜品等应有尽有。',
    position: { x: 46, y: 67 },
  },
  {
    id: 'water-station',
    name: '自助补水站',
    description: '自助饮水设施，提供干净的饮用水。配有宠物饮水盆和主人用水杯，方便随时补充水分。',
    position: { x: 36, y: 38 },
  },
  {
    id: 'small-dog-area',
    name: '小型犬活动区',
    description: '专为小型犬设计的安全活动区域。有围栏防护，避免大型犬干扰，让小狗狗也能安全快乐地玩耍。',
    position: { x: 18, y: 72 },
  },
  {
    id: 'bbq',
    name: '烧烤区',
    description: '户外烧烤区域，提供烤架和用餐设施。主人可以和宠物一起享受美食，度过愉快的周末时光。',
    position: { x: 84, y: 75 },
  },
  {
    id: 'kindergarten',
    name: '宠物幼儿园操场',
    description: '宠物幼儿园的活动场所，开设各类幼犬培训课程。专业训导师带领，让幼犬学会社交和基础技能。',
    position: { x: 54, y: 41 },
  },
];
