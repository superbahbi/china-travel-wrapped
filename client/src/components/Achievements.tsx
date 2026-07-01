// Achievements Gallery Component
import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/achievements';
import { WrappedCard } from '@/components/WrappedCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function AchievementsCard({ achievements }: { achievements: Achievement[] }) {
  const { ref, visible } = useScrollReveal();
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    setUnlockedCount(achievements.filter(a => a.unlocked).length);
  }, [achievements]);

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
            className="bg-gradient-to-r from-[#f953c6] to-[#8360c3] h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {achievements.map((achievement, idx) => (
            <div
              key={achievement.id}
              onClick={() => toggleFlip(achievement.id)}
              className="h-32 cursor-pointer perspective"
              style={{
                perspective: '1000px',
                animation: achievement.unlocked ? `slideIn 0.5s ease-out ${idx * 0.1}s both` : 'none'
              }}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped.has(achievement.id) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div
                  className={`absolute w-full h-full rounded-xl p-4 flex flex-col items-center justify-center text-center ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/40'
                      : 'bg-white/5 border border-white/10'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-xs font-semibold text-white/80 line-clamp-2">{achievement.name}</div>
                  {!achievement.unlocked && (
                    <div className="text-xs text-white/40 mt-1">🔒 Locked</div>
                  )}
                </div>

                {/* Back */}
                <div
                  className="absolute w-full h-full rounded-xl p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/40"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="text-xs text-white/80 leading-tight">{achievement.description}</div>
                  {achievement.unlocked && (
                    <div className="text-xs text-yellow-300 mt-2 font-semibold">✓ Unlocked!</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
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
