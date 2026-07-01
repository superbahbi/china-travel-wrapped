// Achievement detection helper
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export function getAchievements(transactions: any[], stats: any): Achievement[] {
  const achievements: Achievement[] = [];

  // Street Foodie - spent >5 times on street food
  const streetFoodCount = transactions.filter(t => 
    t.merchant?.toLowerCase().includes('street') || 
    t.merchant?.toLowerCase().includes('food stall') ||
    t.notes?.toLowerCase().includes('street')
  ).length;
  achievements.push({
    id: 'street-foodie',
    name: 'Street Foodie',
    description: 'Enjoyed street food 5+ times',
    icon: '🍜',
    unlocked: streetFoodCount >= 5
  });

  // Train Hopper - used trains for >50% of transport
  const trainTransactions = transactions.filter(t => 
    t.category === 'Transport' && 
    (t.merchant?.toLowerCase().includes('train') || 
     t.merchant?.toLowerCase().includes('rail') ||
     t.merchant?.toLowerCase().includes('railway'))
  ).length;
  const totalTransport = transactions.filter(t => t.category === 'Transport').length;
  const trainPercentage = totalTransport > 0 ? (trainTransactions / totalTransport) * 100 : 0;
  achievements.push({
    id: 'train-hopper',
    name: 'Train Hopper',
    description: 'Used trains for 50%+ of transport',
    icon: '🚂',
    unlocked: trainPercentage >= 50
  });

  // Budget Master - average daily spend below $30
  const budgetThreshold = 30;
  achievements.push({
    id: 'budget-master',
    name: 'Budget Master',
    description: `Average daily spend below $${budgetThreshold}`,
    icon: '💰',
    unlocked: stats.dailyAverage < budgetThreshold
  });

  // Accommodation Collector - stayed in 6+ different places
  const uniqueCities = new Set(transactions.map(t => t.city)).size;
  achievements.push({
    id: 'accommodation-collector',
    name: 'Accommodation Collector',
    description: 'Stayed in 6+ different cities',
    icon: '🏨',
    unlocked: uniqueCities >= 6
  });

  // Food Lover - spent >30% on food
  const foodTotal = transactions
    .filter(t => t.category === 'Food')
    .reduce((sum, t) => sum + Math.abs(t.usd), 0);
  const foodPercentage = stats.grandTotal > 0 ? (foodTotal / stats.grandTotal) * 100 : 0;
  achievements.push({
    id: 'food-lover',
    name: 'Food Lover',
    description: 'Spent 30%+ on food',
    icon: '🍱',
    unlocked: foodPercentage >= 30
  });

  // Long Journey - traveled 25+ days
  achievements.push({
    id: 'long-journey',
    name: 'Long Journey',
    description: 'Traveled 25+ days',
    icon: '✈️',
    unlocked: stats.daysTracked >= 25
  });

  // Mixue Enthusiast - visited Mixue 5+ times
  const mixueCount = transactions.filter(t => 
    t.merchant?.toLowerCase().includes('mixue')
  ).length;
  achievements.push({
    id: 'mixue-enthusiast',
    name: 'Mixue Enthusiast',
    description: 'Visited Mixue 5+ times',
    icon: '🧋',
    unlocked: mixueCount >= 5
  });

  // Spender - spent >$1000 total
  achievements.push({
    id: 'big-spender',
    name: 'Big Spender',
    description: 'Spent $1000+ total',
    icon: '💸',
    unlocked: stats.grandTotal >= 1000
  });

  // Early Bird - made purchases before 8am
  const earlyBirdCount = transactions.filter(t => {
    const hour = new Date(t.date).getHours();
    return hour < 8 && hour >= 0;
  }).length;
  achievements.push({
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Made 3+ purchases before 8am',
    icon: '🌅',
    unlocked: earlyBirdCount >= 3
  });

  // Night Owl - made purchases after 10pm
  const nightOwlCount = transactions.filter(t => {
    const hour = new Date(t.date).getHours();
    return hour >= 22;
  }).length;
  achievements.push({
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Made 3+ purchases after 10pm',
    icon: '🌙',
    unlocked: nightOwlCount >= 3
  });

  return achievements;
}
