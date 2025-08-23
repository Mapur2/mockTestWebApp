# 🎓 VibePrep Mock Test Platform

A comprehensive full-stack mock test platform built with React.js, FastAPI, and MongoDB. Features intelligent test creation, real-time auto-save, AI-powered analysis, and multi-subject support.

## 🚀 Features

### Core Functionality
- **📝 Mock Test Creation**: Create customized tests with multiple subjects, difficulty levels, and time limits
- **⏱️ Real-time Timer**: Accurate countdown timer with auto-submission
- **💾 Auto-Save**: Automatic progress saving with session recovery
- **📊 Results Analytics**: Detailed performance analysis with charts and insights
- **🤖 AI Analysis**: Intelligent performance recommendations using Groq API/Gemini
- **👤 User Authentication**: Secure login/registration with JWT tokens
- **📚 Multi-Subject Support**: Physics, Chemistry, Mathematics with subject filtering
- **📱 Responsive Design**: Mobile-friendly interface with dark theme

### Advanced Features
- **🔄 Session Recovery**: Resume interrupted tests automatically
- **📈 Progress Tracking**: Real-time progress indicators and statistics
- **🎨 Modern UI**: Dark theme with purple/blue accents
- **⚡ Performance Optimized**: Efficient state management and caching
- **🔒 Secure**: JWT authentication and data validation

## 🏗️ Architecture

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── MockTestLander/   # Test creation interface
│   │   ├── MockTestQuestion/ # Test taking interface
│   │   └── MockTestAnswer/   # Results and analysis
│   ├── context/              # React Context for state management
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Route components
│   ├── services/             # API communication
│   └── utils/                # Utility functions
```

### Backend (FastAPI)
```
backend/
├── main.py                   # FastAPI application and routes
├── models/                   # Pydantic data models
├── db.py                     # Database initialization
└── requirements.txt          # Python dependencies
```

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering
- **Context API** - State management

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Groq API/Gemini** - AI analysis

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- Groq API key or Google Gemini API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onlineMockTest
   ```

2. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=mocktest_db
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   SECRET_KEY=your_jwt_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. **Initialize the database**
   ```bash
   python db.py
   ```

5. **Start the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 🎯 Usage Guide

### For Students

#### Creating a Test
1. **Login/Register**: Create an account or sign in
2. **Configure Test**: Select subjects, difficulty, number of questions, and duration
3. **Start Test**: Click "Create Test" to begin

#### Taking a Test
1. **Navigation**: Use Previous/Next buttons or question palette
2. **Subject Filtering**: Click subject tabs to filter questions
3. **Auto-Save**: Progress is automatically saved every second
4. **Timer**: Monitor remaining time in the top bar
5. **Submit**: Complete all questions and submit

#### Viewing Results
1. **Score Overview**: See overall performance and subject-wise scores
2. **Detailed Analysis**: Review correct/incorrect answers with explanations
3. **AI Insights**: Get personalized recommendations for improvement
4. **History**: Access all previous test results

### For Administrators

#### Database Management
- **Questions**: Add/edit questions in MongoDB
- **Users**: Monitor user activity and results
- **Analytics**: Track platform usage and performance

#### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/tests/create` - Create new test
- `GET /api/tests/{test_id}/questions` - Get test questions
- `POST /api/tests/{test_id}/submit` - Submit test answers
- `GET /api/tests/{test_id}/results` - Get test results
- `POST /api/analysis/generate` - Generate AI analysis

## 🔧 Configuration

### Test Configuration Options
```javascript
{
  "subjects": ["Physics", "Chemistry", "Mathematics"],
  "total_questions": 30,
  "duration": 60, // minutes
  "difficulty": "medium", // easy, medium, hard
  "topics": ["Mechanics", "Thermodynamics"] // optional
}
```

### Auto-Save Configuration
- **Save Interval**: 1 second after changes
- **Storage**: localStorage with test-specific keys
- **Recovery**: Automatic session restoration
- **Cleanup**: Automatic cleanup after submission

### AI Analysis Configuration
- **Provider**: Groq API or Google Gemini
- **Caching**: Results cached to prevent regeneration
- **Format**: Markdown with structured insights
- **Content**: Performance analysis and recommendations

## 📊 Database Schema

### Collections

#### Users
```javascript
{
  "_id": ObjectId,
  "username": String,
  "email": String,
  "hashed_password": String,
  "created_at": Date
}
```

#### Tests
```javascript
{
  "_id": ObjectId,
  "test_id": String,
  "user_id": String,
  "config": {
    "subjects": [String],
    "total_questions": Number,
    "duration": Number,
    "difficulty": String
  },
  "created_at": Date
}
```

#### Submissions
```javascript
{
  "_id": ObjectId,
  "test_id": String,
  "user_id": String,
  "answers": Object,
  "time_taken": Number,
  "submitted_at": Date
}
```

#### Results
```javascript
{
  "_id": ObjectId,
  "test_id": String,
  "user_id": String,
  "total_questions": Number,
  "correct_answers": Number,
  "score_percentage": Number,
  "subject_wise_scores": Object,
  "time_analysis": Object
}
```

## 🎨 UI Components

### Core Components
- **TestCreator**: Test configuration interface
- **QuestionDisplay**: Question rendering with options
- **QuestionPalette**: Visual question navigation
- **Timer**: Countdown timer with auto-submission
- **ProgressBar**: Visual progress indicator
- **AutoSaveIndicator**: Auto-save status display
- **ResultsSummary**: Test results overview
- **AnalysisReport**: AI-generated insights

### State Management
- **AuthContext**: User authentication state
- **TestContext**: Test session and progress state
- **useTimer**: Custom timer hook
- **useAnalysis**: AI analysis management

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Token expiration and refresh
- Secure cookie handling

### Data Validation
- Pydantic models for request/response validation
- Input sanitization and validation
- SQL injection prevention
- XSS protection

### API Security
- CORS configuration
- Rate limiting
- Request validation
- Error handling

## 🚀 Deployment

### Backend Deployment
1. **Docker Setup**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Environment Variables**
   - Set production database URL
   - Configure API keys
   - Set JWT secret key

### Frontend Deployment
1. **Build Production**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   - Use nginx or similar web server
   - Configure API proxy
   - Set up HTTPS

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
pytest
```

### API Testing
```bash
# Test endpoints with curl or Postman
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

## 📈 Performance Optimization

### Frontend Optimizations
- React.memo for component memoization
- useCallback and useMemo for expensive operations
- Code splitting with React.lazy
- Image optimization and lazy loading

### Backend Optimizations
- Database indexing for frequent queries
- Connection pooling for MongoDB
- Response caching for static data
- Async/await for non-blocking operations

## 🐛 Troubleshooting

### Common Issues

#### Timer Not Working
- Check if test configuration is loaded properly
- Verify timer duration in test config
- Ensure useTimer hook is properly initialized

#### Auto-Save Not Working
- Check localStorage permissions
- Verify TestContext is properly set up
- Ensure auto-save status is being tracked

#### AI Analysis Not Generating
- Verify API keys are configured
- Check network connectivity
- Ensure test results are available

#### Database Connection Issues
- Verify MongoDB is running
- Check connection string format
- Ensure database permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core test functionality
- Auto-save feature
- AI analysis integration
- User authentication
- Multi-subject support

### Planned Features
- Offline mode support
- Advanced analytics dashboard
- Question bank management
- Real-time collaboration
- Mobile app development

---

**Built with ❤️ for better education**