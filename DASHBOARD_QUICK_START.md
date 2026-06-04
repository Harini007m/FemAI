# HERBUDDY Dashboard Redesign - Quick Start Guide

## 🚀 Getting Started

### Installation & Setup
```bash
# Navigate to project directory
cd d:\IPS\FemAI

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 What's New

### Component Locations
All new dashboard components are organized in:
```
src/components/Dashboard/
├── Cards/          (11 reusable card components)
├── Sections/       (Layout sections like FloatingActionMenu)
└── index.js        (Unified exports)
```

### Main Dashboard File
```
src/pages/Dashboard.jsx  (Complete redesigned dashboard)
```

### Enhanced Chat
```
src/pages/Chatbot.jsx    (Now with full Markdown support)
```

## 🎯 Key Features Overview

### 1. Health Score Card
**Location**: `src/components/Dashboard/Cards/HealthScoreCard.jsx`

Shows comprehensive health overview:
- Overall score (0-100) with animated indicator
- 5-metric breakdown (Cycle, Nutrition, Hydration, Sleep, Wellness)
- Color-coded status

```jsx
<HealthScoreCard 
  score={85} 
  breakdown={{
    cycle_health: 85,
    nutrition: 80,
    hydration: 75,
    sleep: 80,
    wellness: 80
  }}
/>
```

### 2. Cycle Overview
**Location**: `src/components/Dashboard/Cards/CycleOverviewCard.jsx`

Displays menstrual cycle information:
- Current cycle day and phase
- Next period prediction
- Ovulation window
- Fertility status

```jsx
<CycleOverviewCard 
  cycleData={{ current_day: 8, cycle_length: 28 }}
  predictions={user?.cycle_predictions || {}}
/>
```

### 3. Wellness Tracker
**Location**: `src/components/Dashboard/Cards/WellnessTrackerCard.jsx`

Track daily wellness metrics:
- Water intake with goal progress
- Sleep hours tracked
- Physical activity minutes
- Mood status
- Weight and BMI

```jsx
<WellnessTrackerCard 
  wellnessData={{
    water_intake: 2.0,
    sleep_hours: 7.5,
    mood: 'Happy'
  }}
/>
```

### 4. Risk Assessment
**Location**: `src/components/Dashboard/Cards/RiskAssessmentCard.jsx`

Health risk indicators:
- PCOS/PCOD risk
- Iron deficiency risk
- Anemia risk
- Hormonal imbalance
- Uterine health

```jsx
<RiskAssessmentCard risks={{
  pcos: { score: 28, level: 'Low', explanation: 'Low risk' },
  // ... other risks
}}/>
```

### 5. AI Daily Summary
**Location**: `src/components/Dashboard/Cards/AIDailySummaryCard.jsx`

AI-generated daily insights:
- Personalized health message
- Phase-specific recommendations
- Actionable insights

```jsx
<AIDailySummaryCard 
  user={user}
  cyclePhase="Follicular"
  summary="" // Auto-generated if empty
/>
```

### 6. Symptom Snapshot
**Location**: `src/components/Dashboard/Cards/SymptomSnapshotCard.jsx`

Recent symptoms tracking:
- Recently logged symptoms with severity
- Symptom trends over time
- Quick logging button

```jsx
<SymptomSnapshotCard 
  symptoms={{
    recent: [
      { name: 'Cramps', severity: 3, date: 'Today', trend: 'stable' }
    ]
  }}
/>
```

### 7. Recommendations
**Location**: `src/components/Dashboard/Cards/RecommendationsCarousel.jsx`

Personalized health recommendations:
- Nutrition suggestions
- Exercise recommendations
- Sleep optimization
- Stress management
- And more...

```jsx
<RecommendationsCarousel recommendations={[]} />
```

### 8. Health Trends
**Location**: `src/components/Dashboard/Cards/HealthTrendsChart.jsx`

Interactive analytics charts:
- Health score trends
- Pain level trends
- Hydration history
- Multiple 7-day trend views

```jsx
<HealthTrendsChart trendData={{}} />
```

### 9. Achievements
**Location**: `src/components/Dashboard/Cards/AchievementBadgeSection.jsx`

Gamification features:
- Logging streak tracking
- Hydration streak
- Sleep streak
- Activity streak
- Badges and milestones

```jsx
<AchievementBadgeSection achievements={{}} />
```

### 10. Reports & Doctor Access
**Location**: `src/components/Dashboard/Cards/ReportsAndDoctorAccessCard.jsx`

Healthcare professional features:
- Recent reports with download options
- Consultation history
- Doctor notes
- Report generation

```jsx
<ReportsAndDoctorAccessCard 
  reports={{}}
  consultations={[]}
/>
```

### 11. Floating Action Menu
**Location**: `src/components/Dashboard/Sections/FloatingActionMenu.jsx`

Quick access menu with 5 actions:
- Log Symptoms
- Add Cycle Data
- Chat with AI
- Update Metrics
- Generate Report

```jsx
<FloatingActionMenu
  actions={{
    onLogSymptoms: () => {},
    onAddCycleData: () => {},
    onChatAI: () => {},
    onUpdateMetrics: () => {},
    onGenerateReport: () => {}
  }}
/>
```

### 12. Enhanced Chat with Markdown
**Location**: `src/pages/Chatbot.jsx`

Full Markdown support:
- **Bold**: `**text**`
- *Italic*: `*text*`
- Headings: `# ## ###`
- Lists: `- item` or `1. item`
- Code: `` `code` `` or ` ```code``` `
- Links: `[text](url)`
- Quotes: `> quote`

```jsx
// Chat messages now render as:
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {message}
</ReactMarkdown>
```

## 🔌 API Integration

### Required Backend Endpoints
```
GET  /api/auth/profile           - Get user profile
GET  /api/alerts                 - Get health alerts
GET  /api/wellness/history       - Get wellness logs
POST /api/wellness/log           - Log wellness data
GET  /api/periods                - Get cycle data
GET  /api/cycle_predictions      - Get predictions
POST /api/chat/ask               - Chat with AI
GET  /api/reports                - Get health reports
GET  /api/consultations          - Get doctor consultations
```

### Example API Call
```jsx
const fetchAlerts = async () => {
  const res = await fetch('/api/alerts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) {
    const data = await res.json();
    setAlerts(data);
  }
};
```

## 🎨 Customization

### Styling
Edit `src/index.css` to customize:
```css
@theme {
  --color-primary: #ec4899;      /* Change primary color */
  --color-secondary: #8b5cf6;    /* Change secondary color */
  --color-accent: #f472b6;       /* Change accent color */
}
```

### Component Colors
Each card component has its own color scheme:
- HealthScore: Pink & Purple
- Cycle: Purple & Pink
- Wellness: Blue & Indigo
- Risk: Amber & Orange
- Alerts: Red/Amber/Blue based on severity

### Animations
Modify transition timing in components:
```jsx
style={{ transitionDuration: '500ms' }}  // Change from 300ms
```

## 🧪 Testing Components

### Test a Component in Isolation
```jsx
// Create a test page to render just one component
import HealthScoreCard from '../components/Dashboard/Cards/HealthScoreCard';

export default function TestPage() {
  return (
    <HealthScoreCard 
      score={82}
      breakdown={{
        cycle_health: 85,
        nutrition: 80,
        hydration: 75,
        sleep: 80,
        wellness: 80
      }}
    />
  );
}
```

## 📱 Responsive Design

### Breakpoints (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Components automatically adapt:
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 1 column on mobile, 3 columns on desktop */}
</div>
```

## 🔍 Debugging Tips

### Check Component Props
```jsx
console.log('User data:', user);
console.log('Health score:', score);
console.log('Alerts:', alerts);
```

### Verify API Calls
Open DevTools → Network tab:
1. Look for `/api/` requests
2. Check response status (should be 200)
3. Inspect response data

### CSS Issues
1. Check if Tailwind classes are applied
2. Verify z-index stacking context
3. Use browser DevTools element inspector
4. Check for CSS conflicts

## 🚨 Common Issues & Solutions

### Chart Not Displaying
- Ensure Chart.js is registered in the component
- Check that data array has values
- Verify canvas height is sufficient (h-56)

### Markdown Not Rendering
- Check react-markdown is imported
- Verify remarkGfm plugin is used
- Ensure message is not plain text

### Styling Not Applied
- Clear browser cache (Ctrl+Shift+R)
- Rebuild project (npm run build)
- Check Tailwind configuration
- Verify CSS file is imported

### API Errors
- Check backend server is running
- Verify token is valid
- Check CORS configuration
- Look at browser console for details

## 📖 Component Documentation

Each component file includes:
- Props interface (with defaults)
- Usage example
- Feature description
- Styling approach

## 🎓 Learning Resources

### Tailwind CSS
- https://tailwindcss.com/docs

### React
- https://react.dev/learn

### Material Design 3
- https://m3.material.io/

### Markdown Rendering
- https://github.com/remarkjs/react-markdown

## 💡 Tips & Tricks

### Pro Tips
1. Use the index.js file for cleaner imports
2. Leverage the glass-card class for consistency
3. Use Tailwind's grid system for layouts
4. Test on mobile early and often

### Performance Tips
1. Memoize expensive components
2. Use lazy loading for charts
3. Optimize API calls
4. Cache frequently used data

## 🔄 Data Flow

```
App.jsx
  ↓
Dashboard.jsx (Main container)
  ├→ HealthScoreCard (reads: user.health_score)
  ├→ CycleOverviewCard (reads: user.cycle_predictions)
  ├→ WellnessTrackerCard (reads: user.profile.lifestyle_info)
  ├→ RiskAssessmentCard (reads: AI predictions)
  ├→ AlertNotificationsBanner (reads: alerts[])
  ├→ AIDailySummaryCard (reads: user, cycle phase)
  ├→ SymptomSnapshotCard (reads: symptoms[])
  ├→ RecommendationsCarousel (reads: recommendations[])
  ├→ HealthTrendsChart (reads: wellness_logs[])
  ├→ AchievementBadgeSection (reads: achievements)
  ├→ ReportsAndDoctorAccessCard (reads: reports[])
  └→ FloatingActionMenu (calls: setCurrentPage)
```

## 📞 Support

### If Something Breaks:
1. Check console for error messages
2. Verify all dependencies are installed
3. Rebuild the project
4. Check backend API responses
5. Review component props

### Documentation Files:
- `DASHBOARD_REDESIGN_DOCUMENTATION.md` - Comprehensive guide
- Component files have inline comments
- `src/components/Dashboard/index.js` - Export reference

---

**Happy Building! 🚀**

For questions or issues, check the main documentation or inspect the component source code.
