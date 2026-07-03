import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/achievements';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BADGE_IMAGES: Record<string, string> = {
  'street-foodie': '/manus-storage/badge-street-foodie_1482f47c.webp',
  'train-hopper': '/manus-storage/badge-train-hopper_c6f02622.webp',
  'budget-master': '/manus-storage/badge-budget-master_12e45518.webp',
  'accommodation-collector': '/manus-storage/badge-accommodation-collector_954344fa.webp',
  'food-lover': '/manus-storage/badge-food-lover_dc27d728.webp',
  'long-journey': '/manus-storage/badge-long-journey_fe89bd95.webp',
  'mixue-enthusiast': '/manus-storage/badge-mixue-enthusiast_ce899233.webp',
  'big-spender': '/manus-storage/badge-big-spender_f42e2f25.webp',
  'early-bird': '/manus-storage/badge-early-bird_57119333.webp',
  'night-owl': '/manus-storage/badge-night-owl_5ff886d7.webp',
  'city-explorer': '/manus-storage/badge-city-explorer_35de7028.webp',
  'weekend-warrior': '/manus-storage/badge-weekend-warrior_28be3f54.webp',
  'noodle-master': '/manus-storage/badge-noodle-master_4499bba7.webp',
  'cafe-hopper': '/manus-storage/badge-cafe-hopper_6f653bb1.webp',
  'spender-supreme': '/manus-storage/badge-spender-supreme_9dbcd274.webp',
  'frugal-traveler': '/manus-storage/badge-frugal-traveler_071ac3d9.webp',
  'activity-seeker': '/manus-storage/badge-activity-seeker_9b100e9c.webp',
  'consistent-spender': '/manus-storage/badge-consistent-spender_dd6bb8b9.webp',
};

export function AchievementsCard({ achievements }: { achievements: Achievement[] }) {
  const { ref, visible } = useScrollReveal();
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    setUnlockedCount(achievements.filter(a => a.unlocked).length);
  }, [achievements]);

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'spending', label: 'Spending', icon: '💰' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'food', label: 'Food', icon: '🍽️' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' }
  ];

  const getFilteredAchievements = () => {
    if (activeTab === 'all') return achievements;
    return achievements.filter((a: any) => a.category === activeTab);
  };

  const filteredAchievements = getFilteredAchievements();
  const filteredUnlockedCount = filteredAchievements.filter(a => a.unlocked).length;

  const toggleFlip = (id: string) => {
    const newFlipped = new Set(flipped);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlipped(newFlipped);
  };

  return (
    <div
      ref={ref}
      className={`reveal rounded-3xl overflow-hidden ${visible ? 'visible' : ''}`}
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d0f 100%)' }}
    >
      <div className="p-6 pb-4">
        <div className="text-sm font-semibold tracking-widest uppercase text-white/50 mb-1">Travel Achievements</div>
        <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          {unlockedCount} of {achievements.length} Unlocked
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-6 pb-6 max-h-[600px] overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/5 border border-white/10 p-1">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm py-1">
                <span className="mr-1">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                No achievements in this category yet
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {filteredAchievements.map((achievement: any, idx: number) => {
                  const badgeImage = BADGE_IMAGES[achievement.id];
                  return (
                    <div
                      key={achievement.id}
                      className="relative w-full aspect-square cursor-pointer group"
                      onClick={() => toggleFlip(achievement.id)}
                      style={{
                        perspective: '1000px',
                        animation: `slideIn 0.5s ease-out ${idx * 0.05}s both`
                      }}
                    >
                      <div
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: flipped.has(achievement.id) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          transition: 'transform 0.6s',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {/* Front - Badge Image */}
                        <div
                          className="absolute w-full h-full rounded-lg overflow-hidden"
                          style={{
                            backfaceVisibility: 'hidden',
                            background: 'transparent'
                          }}
                        >
                          {badgeImage ? (
                            <img
                              src={badgeImage}
                              alt={achievement.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">{achievement.icon}</div>
                          )}
                          {!achievement.unlocked && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <div className="text-2xl">🔒</div>
                            </div>
                          )}
                        </div>

                        {/* Back - Description */}
                        <div
                          className="absolute w-full h-full rounded-xl p-3 flex flex-col items-center justify-center text-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <div className="text-xs font-semibold text-white/80 mb-2">{achievement.name}</div>
                          <div className="text-xs text-white/60">{achievement.description}</div>
                          {achievement.unlocked && (
                            <div className="mt-2 text-yellow-400 text-xs font-bold">✓ UNLOCKED</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
