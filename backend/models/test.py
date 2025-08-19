from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class TestConfig(BaseModel):
    test_id: Optional[str] = None
    subject: Optional[str] = None
    subjects: Optional[List[str]] = None
    duration: int = Field(..., gt=0, description="Duration in minutes")
    total_questions: int = Field(..., gt=0, le=100, description="Number of questions")
    topics: List[str] = Field(default_factory=list)
    difficulty: str = Field(..., pattern="^(easy|medium|hard|intermediate)$")
    created_at: Optional[datetime] = None
    status: Optional[str] = "created"

class Question(BaseModel):
    question_id: str
    text: str
    options: Dict[str, str] = Field(..., min_items=2, max_items=6)
    correct_answer: Optional[str] = None  # Hidden during test-taking
    explanation: Optional[str] = None     # Hidden during test-taking
    topic: str
    difficulty: str
    subject: str
    marks: Optional[int] = 1

class TestSubmission(BaseModel):
    test_id: str
    answers: Dict[str, str] = Field(..., description="question_id: selected_answer")
    time_taken: int = Field(..., description="Time taken in seconds")
    submitted_at: Optional[datetime] = None

class TestResults(BaseModel):
    test_id: Optional[str] = None
    score: float = Field(..., ge=0, le=100)
    correct_answers: int = Field(..., ge=0)
    total_questions: int = Field(..., gt=0)
    time_taken: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0, le=100)
    submitted_at: Optional[datetime] = None
    performance_level: Optional[str] = None
    subject_breakdown: Optional[Dict[str, float]] = None
    topic_breakdown: Optional[Dict[str, float]] = None

class AnalysisRequest(BaseModel):
    test_id: str
    include_recommendations: bool = True
    include_topic_analysis: bool = True

class AnalysisResponse(BaseModel):
    session_id: str
    test_id: str
    analysis: str
    generated_at: datetime
    ai_provider: Optional[str] = None

class User(BaseModel):
    user_id: str
    username: str
    email: str
    created_at: datetime
    test_history: List[str] = Field(default_factory=list)

class TestSession(BaseModel):
    session_id: str
    test_id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    current_question: int = 0
    answers: Dict[str, str] = Field(default_factory=dict)
    time_remaining: int
    status: str = "active"  # active, paused, completed, expired
