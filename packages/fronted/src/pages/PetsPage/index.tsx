import { PetGrid } from '@/components/petList/PetGrid';

export default function PetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 页面标题 */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            宠物学员列表
          </h1>
          <p className="text-gray-600 text-lg">
            认识一下我们可爱的宠物学员们
          </p>
        </div>
      </section>

      {/* 宠物网格 */}
      <section className="container mx-auto px-4 py-16">
        <PetGrid />
      </section>
    </div>
  );
}
