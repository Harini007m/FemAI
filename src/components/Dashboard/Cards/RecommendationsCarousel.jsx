import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, Apple, Droplets, Dumbbell, Moon, Brain } from 'lucide-react';

export default function RecommendationsCarousel({ recommendations = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultRecommendations = recommendations.length > 0 ? recommendations : [
    {
      category: 'Nutrition',
      icon: Apple,
      title: 'Iron-Rich Diet',
      description: 'During your menstrual phase, increase iron intake with spinach, lentils, and red meat to maintain healthy hemoglobin levels.',
      color: 'from-orange-500 to-red-500'
    },
    {
      category: 'Hydration',
      icon: Droplets,
      title: 'Boost Hydration',
      description: 'You logged 2.0L today. Increase to 2.5-3L daily. Add electrolytes during intense exercise for optimal absorption.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      category: 'Exercise',
      icon: Dumbbell,
      title: 'Strength Training',
      description: 'You\'re in your high-energy phase! This is perfect for strength training. Aim for 30-45 min of resistance exercises.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      category: 'Sleep',
      icon: Moon,
      title: 'Sleep Optimization',
      description: 'Maintain 8-hour sleep cycles. Your current 7.5 hours is good, but consistency matters most for hormone regulation.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      category: 'Stress Management',
      icon: Brain,
      title: 'Mindfulness Practice',
      description: 'Practice 10 minutes of meditation daily. Your stress levels are elevated - try guided breathing exercises.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      category: 'Recovery',
      icon: Lightbulb,
      title: 'Active Recovery',
      description: 'Schedule 1-2 gentle yoga sessions this week. Focus on hip openers and pelvic floor strengthening.',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % defaultRecommendations.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + defaultRecommendations.length) % defaultRecommendations.length);
  };

  const current = defaultRecommendations[currentIndex];
  const Icon = current.icon;

  return (
    <div className="glass-card rounded-3xl p-8 border border-indigo-100 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-indigo-200 to-purple-100 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <span>Personalized Recommendations</span>
          </h3>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {currentIndex + 1} / {defaultRecommendations.length}
          </span>
        </div>

        {/* Carousel Card */}
        <div className={`rounded-3xl p-8 bg-gradient-to-br ${current.color} text-white mb-6 min-h-48 flex flex-col justify-between shadow-xl`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-white/30 rounded-full text-xs font-bold backdrop-blur-sm">{current.category}</span>
              <Icon className="h-6 w-6" />
            </div>
            <h4 className="text-2xl font-black mb-3">{current.title}</h4>
            <p className="text-white/90 leading-relaxed text-sm">{current.description}</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Progress Dots */}
          <div className="flex gap-1.5">
            {defaultRecommendations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-indigo-600 w-8' : 'bg-gray-300 w-2'
                }`}
              ></button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Apply Button */}
        <button className="w-full mt-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition">
          Apply This Recommendation
        </button>
      </div>
    </div>
  );
}
