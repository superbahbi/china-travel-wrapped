import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/achievements';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BADGE_IMAGES: Record<string, string> = {
  'street-foodie': '/badges/badge-street-foodie.webp',
  'train-hopper': '/badges/badge-train-hopper.webp',
  'budget-master': '/badges/badge-budget-master.webp',
  'accommodation-collector': '/badges/badge-accommodation-collector.webp',
  'food-lover': '/badges/badge-food-lover.webp',
  'long-journey': '/badges/badge-long-journey.webp',
  'mixue-enthusiast': '/badges/badge-mixue-enthusiast.webp',
  'big-spender': '/badges/badge-big-spender.webp',
  'early-bird': '/badges/badge-early-bird.webp',
  'night-owl': '/badges/badge-night-owl.webp',
  'city-explorer': '/badges/badge-city-explorer.webp',
  'weekend-warrior': '/badges/badge-weekend-warrior.webp',
  'noodle-master': '/badges/badge-noodle-master.webp',
  'cafe-hopper': '/badges/badge-cafe-hopper.webp',
  'spender-supreme': '/badges/badge-spender-supreme.webp',
  'frugal-traveler': '/badges/badge-frugal-traveler.webp',
  'activity-seeker': '/badges/badge-activity-seeker.webp',
  'consistent-spender': '/badges/badge-consistent-spender.webp',
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
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d0f 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
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

      <div className="px-6 pb-6">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement: any, idx: number) => {
                  const badgeImage = BADGE_IMAGES[achievement.id];
                  return (
                    <div
                      key={achievement.id}
                      className="relative w-full aspect-square cursor-pointer"
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
                          transition: 'transform 0.6s'
                        }}
                      >
                        {/* Front - Badge Image */}
                        <div
                          className="absolute w-full h-full rounded-xl p-2 flex flex-col items-center justify-center text-center overflow-hidden"
                          style={{
                            backfaceVisibility: 'hidden',
                            background: 'transparent'
                          }}
                        >
                          {badgeImage ? (
                            <img
                              src={badgeImage}
                              alt={achievement.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-4xl">{achievement.icon}</div>
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
