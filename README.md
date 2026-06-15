# VitalSync - Digital Wellness Tracker

A comprehensive health and fitness tracking platform with AI-powered meal analysis, BMI calculator, activity monitoring, and gamification features.

![VitalSync Logo](<img width="65" height="67" alt="image" src="https://github.com/user-attachments/assets/a9818de5-a647-46da-bfe4-71dbc22d0258" />


)
<img width="1321" height="913" alt="image" src="https://github.com/user-attachments/assets/99153c7c-2988-4a72-b22f-260fc0a82d7b" />
## Features

- **User Authentication** - Secure login and registration system
- **Dashboard** - Track daily progress, streaks, and goals at a glance
- **Meal Tracking** - Log meals manually or use AI-powered image analysis
- **Activity Tracking** - Record workouts with automatic calorie calculations
- **BMI Calculator** - Get personalized workout recommendations based on BMI
- **Health Quiz** - Test your wellness knowledge and earn XP
- **Gamification** - Level up, earn achievements, and maintain streaks
- **Weekly Reports** - View detailed analytics of your health journey

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui Components
- React Router
- React Query
- Recharts (for analytics)
- Framer Motion (animations)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI (meal analysis)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or a MongoDB Atlas connection
- (Optional) Google Gemini API key for AI meal analysis

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Vijaylaxmi-30/personal-wellness-tracker.git
cd personal-wellness-tracker
```

2. **Setup Backend**
```bash
cd my-health-journey/backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/health-journey
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key (optional)
```

Start the backend server:
```bash
npm run dev
```

3. **Setup Frontend**
```bash
cd my-health-journey/frontend
npm install
npm run dev
```

4. **Open in browser**
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/meals` | GET/POST | Get/Add meals |
| `/api/meals/analyze` | POST | AI meal analysis |
| `/api/activity` | GET/POST | Get/Log activities |
| `/api/bmi/calculate` | POST | Calculate BMI |
| `/api/quiz/questions` | GET | Get quiz questions |
| `/api/stats/today` | GET | Get daily stats |
| `/api/achievements` | GET | Get achievements |

## Project Structure

```
personal-wellness-tracker/
├── my-health-journey/
│   ├── backend/
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── server.js       # Express server
│   └── frontend/
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── context/    # Auth context
│       │   ├── hooks/      # Custom hooks
│       │   ├── lib/        # API utilities
│       │   └── pages/      # Page components
│       └── public/         # Static assets
```

## Screenshots
<img width="1057" height="489" alt="image" src="https://github.com/user-attachments/assets/020db96a-449d-42b7-946b-b4b4dfe6edae" />

<img width="1070" height="776" alt="image" src="https://github.com/user-attachments/assets/91339732-c308-42b3-a9f2-4a8f3a945a2f" />


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source.

## Author

**Vijaylaxmi**

---

⭐ Star this repo if you find it helpful!
