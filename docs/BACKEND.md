# Backend Documentation

## Project Structure

```
backend/
├── main.py                   # FastAPI application and routes
├── models/
│   └── test.py              # Pydantic data models
├── db.py                     # Database initialization and seeding
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables
```

## FastAPI Application

### Main Application (`main.py`)

The main FastAPI application handles all API endpoints and business logic.

#### Configuration
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="VibePrep Mock Test API",
    description="API for mock test platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Environment Variables
```python
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "mocktest_db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
```

## Database Models

### Pydantic Models (`models/test.py`)

#### TestConfig
```python
from pydantic import BaseModel
from typing import List, Optional

class TestConfig(BaseModel):
    subjects: List[str]
    total_questions: int
    duration: int  # minutes
    difficulty: str  # easy, medium, hard
    topics: Optional[List[str]] = None
    user_id: Optional[str] = None
```

#### Question
```python
class Question(BaseModel):
    question_id: str
    question: str
    options: dict  # {"A": "option1", "B": "option2", ...}
    correct_answer: str
    subject: str
    difficulty: str
    topic: Optional[str] = None
```

#### TestSubmission
```python
class TestSubmission(BaseModel):
    test_id: str
    answers: dict  # {question_id: answer}
    time_taken: int  # seconds
```

#### TestResults
```python
class TestResults(BaseModel):
    test_id: str
    total_questions: int
    correct_answers: int
    score_percentage: float
    subject_wise_scores: dict
    time_analysis: dict
    user_id: Optional[str] = None
```

#### User Models
```python
class User(BaseModel):
    id: str
    username: str
    email: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User
```

## Database Operations

### MongoDB Connection (`db.py`)

#### Database Initialization
```python
import motor.motor_asyncio
from bson import ObjectId

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
tests_collection = db.tests
questions_collection = db.questions
submissions_collection = db.submissions
results_collection = db.results
analysis_collection = db.analysis
```

#### Database Seeding
```python
async def seed_database():
    """Initialize database with sample questions"""
    
    # Check if questions already exist
    existing_questions = await questions_collection.count_documents({})
    if existing_questions > 0:
        print("Database already seeded")
        return
    
    # Sample questions for different subjects
    questions = [
        {
            "question_id": "phy_001",
            "question": "What is the SI unit of force?",
            "options": {
                "A": "Newton",
                "B": "Joule",
                "C": "Watt",
                "D": "Pascal"
            },
            "correct_answer": "A",
            "subject": "Physics",
            "difficulty": "easy",
            "topic": "Mechanics"
        },
        # Add more questions...
    ]
    
    await questions_collection.insert_many(questions)
    print(f"Seeded {len(questions)} questions")
```

## API Endpoints

### Authentication Endpoints

#### Register User
```python
@app.post("/api/auth/register", response_model=TokenResponse)
async def register_user(request: RegisterRequest):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = await users_collection.find_one({
        "$or": [
            {"username": request.username},
            {"email": request.email}
        ]
    })
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Hash password
    hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user_data = {
        "username": request.username,
        "email": request.email,
        "hashed_password": hashed_password.decode('utf-8'),
        "created_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_data)
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=str(result.inserted_id),
            username=request.username,
            email=request.email
        )
    )
```

#### Login User
```python
@app.post("/api/auth/login", response_model=TokenResponse)
async def login_user(request: LoginRequest):
    """Authenticate user and return JWT token"""
    
    # Find user
    user = await users_collection.find_one({"username": request.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(request.password.encode('utf-8'), user["hashed_password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"]
        )
    )
```

### Test Management Endpoints

#### Create Test
```python
@app.post("/api/tests/create")
async def create_test(config: TestConfig, current_user: User = Depends(get_current_user)):
    """Create a new test with specified configuration"""
    
    # Generate test ID
    test_id = str(ObjectId())
    
    # Store test configuration
    test_data = {
        "test_id": test_id,
        "user_id": current_user.id,
        "config": config.dict(),
        "created_at": datetime.utcnow()
    }
    
    await tests_collection.insert_one(test_data)
    
    return {"test_id": test_id, "message": "Test created successfully"}
```

#### Get Test Questions
```python
@app.get("/api/tests/{test_id}/questions")
async def get_test_questions(test_id: str):
    """Get questions for a specific test"""
    
    # Get test configuration
    test = await tests_collection.find_one({"test_id": test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    config = test["config"]
    subjects = config.get("subjects", [])
    total_questions = config.get("total_questions", 30)
    
    # Calculate questions per subject
    questions_per_subject = total_questions // len(subjects) if subjects else total_questions
    
    all_questions = []
    
    for subject in subjects:
        # Get questions for this subject
        subject_questions = await questions_collection.find(
            {"subject": subject},
            {"_id": 0}
        ).limit(questions_per_subject).to_list(length=questions_per_subject)
        
        all_questions.extend(subject_questions)
    
    return {
        "questions": all_questions,
        "duration": config.get("duration", 30),
        "subjects": subjects
    }
```

#### Submit Test
```python
@app.post("/api/tests/{test_id}/submit")
async def submit_test(
    test_id: str,
    submission: TestSubmission,
    current_user: User = Depends(get_current_user)
):
    """Submit test answers and calculate results"""
    
    # Get test questions
    questions_response = await get_test_questions(test_id)
    questions = questions_response["questions"]
    
    # Calculate results
    correct_answers = 0
    subject_scores = {}
    
    for question in questions:
        question_id = question["question_id"]
        user_answer = submission.answers.get(question_id)
        correct_answer = question["correct_answer"]
        
        if user_answer == correct_answer:
            correct_answers += 1
        
        # Track subject-wise scores
        subject = question["subject"]
        if subject not in subject_scores:
            subject_scores[subject] = {"correct": 0, "total": 0}
        
        subject_scores[subject]["total"] += 1
        if user_answer == correct_answer:
            subject_scores[subject]["correct"] += 1
    
    # Calculate percentages
    total_questions = len(questions)
    score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    subject_wise_scores = {}
    for subject, scores in subject_scores.items():
        percentage = (scores["correct"] / scores["total"]) * 100 if scores["total"] > 0 else 0
        subject_wise_scores[subject] = round(percentage, 2)
    
    # Store results
    results_data = {
        "test_id": test_id,
        "user_id": current_user.id,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "score_percentage": round(score_percentage, 2),
        "subject_wise_scores": subject_wise_scores,
        "time_analysis": {
            "total_time": submission.time_taken,
            "average_time_per_question": submission.time_taken // total_questions if total_questions > 0 else 0
        },
        "created_at": datetime.utcnow()
    }
    
    await results_collection.insert_one(results_data)
    
    return {
        "success": True,
        "results": results_data
    }
```

### AI Analysis Endpoints

#### Generate Analysis
```python
@app.post("/api/analysis/generate")
async def generate_ai_analysis(request: dict):
    """Generate AI-powered analysis for test results"""
    
    test_id = request.get("test_id")
    session_id = request.get("session_id")
    
    # Check if analysis already exists
    existing_analysis = await analysis_collection.find_one({"test_id": test_id})
    if existing_analysis:
        return {
            "session_id": existing_analysis["session_id"],
            "markdown": existing_analysis["markdown"],
            "status": "completed"
        }
    
    # Get test results
    results = await results_collection.find_one({"test_id": test_id}, {"_id": 0})
    if not results:
        raise HTTPException(status_code=404, detail="Test results not found")
    
    # Generate analysis using AI
    analysis_prompt = f"""
    Analyze the following test results and provide detailed insights:
    
    Overall Score: {results['score_percentage']}%
    Total Questions: {results['total_questions']}
    Correct Answers: {results['correct_answers']}
    
    Subject-wise Performance:
    {json.dumps(results['subject_wise_scores'], indent=2)}
    
    Time Analysis:
    Total Time: {results['time_analysis']['total_time']} seconds
    Average Time per Question: {results['time_analysis']['average_time_per_question']} seconds
    
    Please provide:
    1. Overall performance assessment
    2. Subject-wise strengths and weaknesses
    3. Time management analysis
    4. Specific recommendations for improvement
    5. Study suggestions for weak areas
    """
    
    try:
        # Use Groq API or Gemini API
        if GROQ_API_KEY:
            analysis_text = await generate_with_groq(analysis_prompt)
        elif GEMINI_API_KEY:
            analysis_text = await generate_with_gemini(analysis_prompt)
        else:
            analysis_text = "AI analysis not available"
        
        # Store analysis
        analysis_data = {
            "session_id": session_id,
            "test_id": test_id,
            "markdown": analysis_text,
            "created_at": datetime.utcnow()
        }
        
        await analysis_collection.insert_one(analysis_data)
        
        return {
            "session_id": session_id,
            "markdown": analysis_text,
            "status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate analysis: {str(e)}")
```

## Authentication & Security

### JWT Token Management
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current authenticated user"""
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(
        id=user_id,
        username=user["username"],
        email=user["email"]
    )
```

## Error Handling

### Custom Exception Handlers
```python
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

## Database Indexing

### Performance Optimization
```python
async def create_indexes():
    """Create database indexes for better performance"""
    
    # Users collection indexes
    await users_collection.create_index("username", unique=True)
    await users_collection.create_index("email", unique=True)
    
    # Tests collection indexes
    await tests_collection.create_index("test_id", unique=True)
    await tests_collection.create_index("user_id")
    
    # Questions collection indexes
    await questions_collection.create_index("subject")
    await questions_collection.create_index("difficulty")
    await questions_collection.create_index("topic")
    
    # Results collection indexes
    await results_collection.create_index("test_id", unique=True)
    await results_collection.create_index("user_id")
    
    # Analysis collection indexes
    await analysis_collection.create_index("test_id", unique=True)
    await analysis_collection.create_index("session_id")
```

## Testing

### Unit Tests
```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register_user():
    """Test user registration"""
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "testuser"

def test_create_test():
    """Test test creation"""
    # First register and login
    client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    login_response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "password123"
    })
    
    token = login_response.json()["access_token"]
    
    # Create test
    response = client.post("/api/tests/create", 
        json={
            "subjects": ["Physics"],
            "total_questions": 10,
            "duration": 30,
            "difficulty": "easy"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "test_id" in data
```

## Deployment

### Docker Configuration
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Configuration
```env
# Production environment variables
MONGODB_URL=mongodb://mongodb:27017
DATABASE_NAME=mocktest_db
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
      - DATABASE_NAME=mocktest_db
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app

  mongodb:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Monitoring & Logging

### Logging Configuration
```python
import logging
from fastapi import Request
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} "
        f"Status: {response.status_code} "
        f"Time: {process_time:.3f}s"
    )
    
    return response
```

### Health Check Endpoint
```python
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

## Performance Optimization

### Database Connection Pooling
```python
# Configure connection pool
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGODB_URL,
    maxPoolSize=10,
    minPoolSize=1,
    maxIdleTimeMS=30000
)
```

### Response Caching
```python
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

@app.on_event("startup")
async def startup():
    """Initialize cache on startup"""
    redis = aioredis.from_url("redis://localhost", encoding="utf8")
    FastAPICache.init(RedisBackend(redis), prefix="mocktest-cache")

@app.get("/api/tests/{test_id}/questions")
@cache(expire=300)  # Cache for 5 minutes
async def get_test_questions(test_id: str):
    """Get questions with caching"""
    # Implementation...
```

This comprehensive backend documentation covers all aspects of the FastAPI application, from setup and configuration to deployment and monitoring.
