import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PetCard } from '@/components/petCard/PetCard';
import { usePets } from '@/hooks/usePets';

export function FeaturedPets() {
  const navigate = useNavigate();
  const { pets } = usePets({ limit: 4 });

  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-gray-50 to-transparent">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-4"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            明星学员
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
            style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
          >
            校园明星宠物
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            每一位宠物学员都有独特的个性，快来认识一下这些可爱的校园明星吧
          </p>
        </motion.div>

        {/* Pet Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 px-4">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
            >
              <PetCard pet={pet} />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/pets')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>查看全部宠物</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
