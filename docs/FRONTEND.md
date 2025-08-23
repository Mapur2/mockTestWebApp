# Frontend Documentation

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── AutoSaveIndicator.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── TestStateManager.jsx
│   │   │   └── TopBar.jsx
│   │   ├── MockTestLander/      # Test creation interface
│   │   │   └── TestCreator.jsx
│   │   ├── MockTestQuestion/    # Test taking interface
│   │   │   ├── AnswerOptions.jsx
│   │   │   ├── NavigationPanel.jsx
│   │   │   ├── PaletteLegend.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── QuestionDisplay.jsx
│   │   │   ├── QuestionPalette.jsx
│   │   │   ├── SubjectTabs.jsx
│   │   │   └── Timer.jsx
│   │   └── MockTestAnswer/      # Results and analysis
│   │       ├── AnalysisReport.jsx
│   │       ├── PerformanceChart.jsx
│   │       └── ResultsSummary.jsx
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── TestContext.jsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAnalysis.js
│   │   ├── useTestSession.js
│   │   └── useTimer.js
│   ├── pages/                   # Route components
│   │   ├── CreatePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ResultsDashboard.jsx
│   │   ├── ResultsPage.jsx
│   │   └── TestPage.jsx
│   ├── services/                # API communication
│   │   └── api.js
│   └── utils/                   # Utility functions
│       └── formatters.js
├── package.json
└── tailwind.config.js
```

## State Management

### Context API Structure

#### AuthContext
Manages user authentication state and provides login/logout functionality.

**State:**
- `user`: Current user object
- `token`: JWT token
- `loading`: Authentication loading state

**Actions:**
- `login(username, password)`: Authenticate user
- `register(userData)`: Register new user
- `logout()`: Clear authentication state

**Usage:**
```javascript
import { useAuth } from '../context/AuthContext'

function MyComponent() {
  const { user, login, logout } = useAuth()
  
  if (!user) {
    return <LoginForm onSubmit={login} />
  }
  
  return <button onClick={logout}>Logout</button>
}
```

#### TestContext
Manages test session state including questions, answers, progress, and auto-save.

**State:**
- `testConfig`: Test configuration
- `questions`: Array of test questions
- `answers`: User's answers
- `currentIndex`: Current question index
- `progress`: Test progress object
- `autoSaveStatus`: Auto-save status

**Actions:**
- `createAndLoad(config)`: Create and load test
- `recordAnswer(questionId, answer)`: Record user answer
- `submit(timeTaken)`: Submit test
- `navigateToQuestion(index)`: Navigate to specific question

**Usage:**
```javascript
import { useTest } from '../context/TestContext'

function TestComponent() {
  const { 
    questions, 
    currentQuestion, 
    progress, 
    recordAnswer,
    navigateToQuestion 
  } = useTest()
  
  return (
    <div>
      <ProgressBar progress={progress} />
      <QuestionDisplay question={currentQuestion} />
    </div>
  )
}
```

## Custom Hooks

### useTimer
Manages countdown timer functionality.

**Parameters:**
- `initialSeconds`: Initial time in seconds
- `options`: Configuration object
  - `onExpire`: Callback when timer expires
  - `autoStart`: Whether to start timer automatically

**Returns:**
- `secondsLeft`: Remaining seconds
- `isRunning`: Timer running state
- `pause()`: Pause timer
- `resume()`: Resume timer
- `reset(seconds)`: Reset timer

**Usage:**
```javascript
import { useTimer } from '../hooks/useTimer'

function TimerComponent({ minutes, onExpire }) {
  const { secondsLeft, reset } = useTimer(minutes * 60, { onExpire })
  
  return <div>{formatTime(secondsLeft)}</div>
}
```

### useAnalysis
Manages AI analysis generation and caching.

**State:**
- `markdown`: Analysis content
- `loading`: Generation loading state
- `error`: Error state

**Actions:**
- `generate(testId)`: Generate analysis
- `clear()`: Clear analysis

**Usage:**
```javascript
import { useAnalysis } from '../hooks/useAnalysis'

function AnalysisComponent({ testId }) {
  const { markdown, loading, generate } = useAnalysis()
  
  useEffect(() => {
    generate(testId)
  }, [testId])
  
  return <AnalysisReport markdown={markdown} />
}
```

## Component Architecture

### Common Components

#### AutoSaveIndicator
Displays auto-save status with visual feedback.

**Props:**
- `status`: 'idle' | 'saving' | 'saved' | 'error'

**Features:**
- Auto-hide after status change
- Color-coded status indicators
- Timestamp display for saved state

#### ProgressBar
Visual progress indicator for test completion.

**Props:**
- `progress`: Object with `answered`, `total`, `percentage`
- `className`: Additional CSS classes

#### TopBar
Main navigation bar with timer and user info.

**Props:**
- `username`: Current user's username
- `minutes`: Test duration in minutes
- `onExpire`: Timer expiration callback
- `onTick`: Timer tick callback
- `progress`: Test progress object
- `showProgress`: Whether to show progress bar

### Test Components

#### TestCreator
Test configuration interface.

**Props:**
- `onCreate`: Callback when test is created

**Features:**
- Subject selection
- Difficulty configuration
- Question count and duration
- Topic filtering

#### QuestionDisplay
Renders individual test questions.

**Props:**
- `question`: Question object
- `index`: Question index
- `total`: Total question count

#### QuestionPalette
Visual question navigation grid.

**Props:**
- `questions`: Array of questions
- `currentQuestionId`: Currently selected question
- `answers`: User's answers
- `onJump`: Navigation callback

**Features:**
- Color-coded question states
- Subject filtering
- Visual progress indication

#### Timer
Countdown timer component.

**Props:**
- `minutes`: Duration in minutes
- `onExpire`: Expiration callback
- `onTick`: Tick callback

**Features:**
- Real-time countdown
- Auto-submission on expiry
- Visual warning states

## Routing

### Route Structure
```javascript
const router = createBrowserRouter([
  { path: '/', element: <CreatePage /> },
  { path: '/test/:testId', element: <TestPage /> },
  { path: '/results/:testId', element: <ResultsPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/my/results', element: <ResultsDashboard /> },
])
```

### Protected Routes
Routes that require authentication are handled by checking the auth context:
```javascript
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
```

## Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with a custom dark theme.

**Color Palette:**
- Primary: Purple/Indigo gradients
- Background: Slate 900/950
- Text: Slate 200/300
- Accents: Purple 600, Indigo 500

**Custom Classes:**
```css
/* Gradient text */
.gradient-text {
  @apply bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent;
}

/* Card styling */
.card {
  @apply rounded-xl border border-slate-800 bg-slate-900/60 p-6;
}

/* Button styling */
.btn-primary {
  @apply rounded-xl bg-purple-600 px-6 py-2 font-semibold text-white;
}
```

### Responsive Design
Components are designed to be mobile-first with responsive breakpoints:
- `sm:` (640px+)
- `md:` (768px+)
- `lg:` (1024px+)
- `xl:` (1280px+)

## Auto-Save Implementation

### Storage Strategy
- Uses `localStorage` for client-side persistence
- Test-specific storage keys: `mocktest_autosave:${testId}`
- Automatic cleanup after test submission

### Data Structure
```javascript
{
  testId: string,
  answers: { [questionId]: answer },
  timeElapsed: number,
  currentIndex: number,
  activeSubject: string,
  timestamp: number
}
```

### Recovery Logic
- Automatic restoration on page load
- Validation of saved data
- Graceful fallback for corrupted data

## Performance Optimization

### React Optimizations
- `React.memo` for expensive components
- `useCallback` for event handlers
- `useMemo` for computed values
- Code splitting with `React.lazy`

### State Management
- Efficient context updates
- Debounced auto-save
- Optimistic UI updates

### Bundle Optimization
- Tree shaking for unused imports
- Dynamic imports for large components
- Image optimization

## Error Handling

### API Error Handling
```javascript
try {
  const response = await api.createTest(config)
  // Handle success
} catch (error) {
  const message = error?.response?.data?.detail || error.message
  setError(message)
}
```

### Component Error Boundaries
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    
    return this.props.children
  }
}
```

## Testing

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { TestProvider } from '../context/TestContext'

test('renders question correctly', () => {
  render(
    <TestProvider>
      <QuestionDisplay question={mockQuestion} />
    </TestProvider>
  )
  
  expect(screen.getByText(mockQuestion.question)).toBeInTheDocument()
})
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react-hooks'
import { useTimer } from '../hooks/useTimer'

test('timer counts down correctly', () => {
  const { result } = renderHook(() => useTimer(60))
  
  act(() => {
    jest.advanceTimersByTime(1000)
  })
  
  expect(result.current.secondsLeft).toBe(59)
})
```

## Development Guidelines

### Code Style
- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript for type safety (recommended)
- Follow ESLint and Prettier configurations

### Component Guidelines
- Keep components small and focused
- Use prop validation with PropTypes
- Implement proper error boundaries
- Write comprehensive tests

### State Management
- Use Context API for global state
- Keep local state minimal
- Avoid prop drilling
- Use custom hooks for complex logic

### Performance Guidelines
- Optimize re-renders with memoization
- Use lazy loading for large components
- Implement proper cleanup in useEffect
- Monitor bundle size

## Build and Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Environment Variables
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=VibePrep Mock Test
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
