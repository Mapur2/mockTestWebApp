# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

### Test Management

#### Create Test
```http
POST /api/tests/create
```

**Request Body:**
```json
{
  "subjects": ["Physics", "Chemistry", "Mathematics"],
  "total_questions": 30,
  "duration": 60,
  "difficulty": "medium",
  "topics": ["Mechanics", "Thermodynamics"]
}
```

**Response:**
```json
{
  "test_id": "string",
  "message": "Test created successfully"
}
```

#### Get Test Questions
```http
GET /api/tests/{test_id}/questions
```

**Response:**
```json
{
  "questions": [
    {
      "question_id": "string",
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correct_answer": "string",
      "subject": "string",
      "difficulty": "string",
      "topic": "string"
    }
  ],
  "duration": 60,
  "subjects": ["Physics", "Chemistry", "Mathematics"]
}
```

#### Submit Test
```http
POST /api/tests/{test_id}/submit
```

**Request Body:**
```json
{
  "test_id": "string",
  "answers": {
    "question_id_1": "A",
    "question_id_2": "B"
  },
  "time_taken": 3600
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "test_id": "string",
    "total_questions": 30,
    "correct_answers": 25,
    "score_percentage": 83.33,
    "subject_wise_scores": {
      "Physics": 85.0,
      "Chemistry": 80.0,
      "Mathematics": 85.0
    },
    "time_analysis": {
      "total_time": 3600,
      "average_time_per_question": 120
    }
  }
}
```

#### Get Test Results
```http
GET /api/tests/{test_id}/results
```

**Response:**
```json
{
  "results": {
    "test_id": "string",
    "total_questions": 30,
    "correct_answers": 25,
    "score_percentage": 83.33,
    "subject_wise_scores": {
      "Physics": 85.0,
      "Chemistry": 80.0,
      "Mathematics": 85.0
    },
    "time_analysis": {
      "total_time": 3600,
      "average_time_per_question": 120
    },
    "detailed_answers": [
      {
        "question_id": "string",
        "user_answer": "A",
        "correct_answer": "A",
        "is_correct": true,
        "explanation": "string"
      }
    ]
  }
}
```

### User Management

#### Get User Results
```http
GET /api/users/me/results
```

**Response:**
```json
{
  "results": [
    {
      "test_id": "string",
      "created_at": "2024-01-01T00:00:00Z",
      "total_questions": 30,
      "correct_answers": 25,
      "score_percentage": 83.33,
      "subjects": ["Physics", "Chemistry", "Mathematics"]
    }
  ]
}
```

### AI Analysis

#### Generate Analysis
```http
POST /api/analysis/generate
```

**Request Body:**
```json
{
  "test_id": "string",
  "session_id": "string"
}
```

**Response:**
```json
{
  "session_id": "string",
  "markdown": "# Performance Analysis\n\n## Overall Performance\nYour overall score is 83.33%...",
  "status": "completed"
}
```

#### Get Analysis
```http
GET /api/analysis/{session_id}
```

**Response:**
```json
{
  "session_id": "string",
  "markdown": "# Performance Analysis\n\n## Overall Performance\nYour overall score is 83.33%...",
  "status": "completed"
}
```

#### Get Analysis by Test ID
```http
GET /api/analysis/test/{test_id}
```

**Response:**
```json
{
  "session_id": "string",
  "markdown": "# Performance Analysis\n\n## Overall Performance\nYour overall score is 83.33%...",
  "status": "completed"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting
- Authentication endpoints: 5 requests per minute
- Test creation: 10 requests per minute
- Other endpoints: 100 requests per minute

## CORS
The API supports CORS for the following origins:
- `http://localhost:3000`
- `http://localhost:5173`
- `https://yourdomain.com`

## WebSocket Support
Currently, the API does not support WebSocket connections. All communication is done via HTTP requests.
