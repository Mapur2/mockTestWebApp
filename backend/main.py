from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import httpx
import os
from dotenv import load_dotenv

from models.test import TestConfig, Question, TestSubmission, TestResults
from db import get_database

load_dotenv()

app = FastAPI(
    title="Mock Test Platform API",
    description="A comprehensive mock test platform with AI-powered analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# In-memory storage for demo (replace with database in production)
test_sessions = {}
test_results = {}

@app.get("/")
async def root():
    return {"message": "Mock Test Platform API", "status": "running"}

@app.post("/api/tests/create")
async def create_test(test_config: TestConfig):
    """Create a new mock test configuration"""
    try:
        db = get_database()
        
        # Generate test ID if not provided
        if not test_config.test_id:
            test_config.test_id = str(uuid.uuid4())
        
        # Store test configuration
        test_config_dict = test_config.dict()
        test_config_dict["created_at"] = datetime.utcnow()
        test_config_dict["status"] = "created"
        
        await db.test_configs.insert_one(test_config_dict)
        
        return {
            "success": True,
            "test_id": test_config.test_id,
            "message": "Test created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating test: {str(e)}")

@app.get("/api/tests/{test_id}/questions")
async def get_test_questions(test_id: str, subject: Optional[str] = None):
    """Retrieve questions for a specific test"""
    try:
        db = get_database()
        
        # Get test configuration
        test_config = await db.test_configs.find_one({"test_id": test_id})
        if not test_config:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Build query for questions
        query = {"subject": test_config["subject"]}
        if subject:
            query["subject"] = subject
        
        # Get questions from database (exclude Mongo _id for JSON safety)
        questions = []
        async for question in db.questions.find(query, {"_id": 0}).limit(test_config["total_questions"]):
            # Remove correct answer for test-taking
            question.pop("correct_answer", None)
            question.pop("explanation", None)
            questions.append(question)
        
        if not questions:
            # Generate sample questions if none exist
            questions = generate_sample_questions(test_config)
        
        return {
            "success": True,
            "test_id": test_id,
            "questions": questions,
            "total_questions": len(questions),
            "duration": test_config["duration"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving questions: {str(e)}")

@app.post("/api/tests/{test_id}/submit")
async def submit_test(test_id: str, submission: TestSubmission):
    """Submit test answers for evaluation"""
    try:
        db = get_database()
        
        # Get test configuration and questions
        test_config = await db.test_configs.find_one({"test_id": test_id})
        if not test_config:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get questions with correct answers for grading (exclude _id)
        questions = []
        async for question in db.questions.find({"subject": test_config["subject"]}, {"_id": 0}):
            questions.append(question)
        
        if not questions:
            questions = generate_sample_questions(test_config)
        
        # Grade the test
        results = grade_test(submission.answers, questions, submission.time_taken)
        
        # Store results
        results.test_id = test_id
        results.submitted_at = datetime.utcnow()
        
        # Ensure stored document is JSON-serializable (_id will be added by Mongo, but we won't return it)
        await db.test_results.insert_one(results.dict())
        
        return {
            "success": True,
            "test_id": test_id,
            "results": results.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting test: {str(e)}")

@app.get("/api/tests/{test_id}/results")
async def get_test_results(test_id: str):
    """Get test results and basic analytics"""
    try:
        db = get_database()
        
        # Exclude Mongo _id to avoid ObjectId serialization issues
        results = await db.test_results.find_one({"test_id": test_id}, {"_id": 0})
        if not results:
            raise HTTPException(status_code=404, detail="Results not found")
        
        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving results: {str(e)}")

@app.post("/api/analysis/generate")
async def generate_ai_analysis(test_id: str):
    """Generate detailed AI analysis of test performance"""
    try:
        db = get_database()
        
        # Get test results
        results = await db.test_results.find_one({"test_id": test_id})
        if not results:
            raise HTTPException(status_code=404, detail="Test results not found")
        
        # Generate AI analysis
        analysis = await generate_analysis_report(results)
        
        # Store analysis
        session_id = str(uuid.uuid4())
        analysis_data = {
            "session_id": session_id,
            "test_id": test_id,
            "analysis": analysis,
            "generated_at": datetime.utcnow()
        }
        
        await db.analysis.insert_one(analysis_data)
        
        return {
            "success": True,
            "analysis": analysis,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analysis: {str(e)}")

@app.get("/api/analysis/{session_id}")
async def get_analysis(session_id: str):
    """Retrieve generated analysis in markdown format"""
    try:
        db = get_database()
        
        analysis = await db.analysis.find_one({"session_id": session_id}, {"_id": 0})
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {
            "success": True,
            "analysis": analysis["analysis"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving analysis: {str(e)}")

def generate_sample_questions(test_config: dict) -> List[dict]:
    """Generate sample questions for demo purposes"""
    subjects = {
        "Physics": [
            {
                "question_id": "q_001",
                "text": "A ball is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached by the ball? (g = 10 m/s²)",
                "options": {"A": "10 m", "B": "20 m", "C": "30 m", "D": "40 m"},
                "correct_answer": "B",
                "explanation": "Using kinematic equations: v² = u² + 2as, where v=0 at max height",
                "topic": "Mechanics",
                "difficulty": "medium"
            },
            {
                "question_id": "q_002",
                "text": "Which of the following is a vector quantity?",
                "options": {"A": "Mass", "B": "Temperature", "C": "Force", "D": "Time"},
                "correct_answer": "C",
                "explanation": "Force has both magnitude and direction, making it a vector quantity",
                "topic": "Mechanics",
                "difficulty": "easy"
            }
        ],
        "Chemistry": [
            {
                "question_id": "q_003",
                "text": "What is the chemical formula for water?",
                "options": {"A": "H2O", "B": "CO2", "C": "O2", "D": "N2"},
                "correct_answer": "A",
                "explanation": "Water consists of two hydrogen atoms and one oxygen atom",
                "topic": "Chemical Bonding",
                "difficulty": "easy"
            }
        ],
        "Mathematics": [
            {
                "question_id": "q_004",
                "text": "What is the derivative of x²?",
                "options": {"A": "x", "B": "2x", "C": "x²", "D": "2x²"},
                "correct_answer": "B",
                "explanation": "Using power rule: d/dx(x^n) = nx^(n-1)",
                "topic": "Calculus",
                "difficulty": "medium"
            }
        ]
    }
    
    subject = test_config.get("subject", "Physics")
    return subjects.get(subject, subjects["Physics"])

def grade_test(answers: dict, questions: List[dict], time_taken: int) -> TestResults:
    """Grade the test and calculate results"""
    correct_count = 0
    total_questions = len(questions)
    
    for question in questions:
        question_id = question["question_id"]
        if answers.get(question_id) == question["correct_answer"]:
            correct_count += 1
    
    score = (correct_count / total_questions) * 100
    
    return TestResults(
        score=score,
        correct_answers=correct_count,
        total_questions=total_questions,
        time_taken=time_taken,
        percentage=score
    )

async def generate_analysis_report(results: dict) -> str:
    """Generate AI-powered analysis report"""
    try:
        # Use Groq API if available, otherwise use Gemini
        if GROQ_API_KEY:
            return await generate_groq_analysis(results)
        elif GEMINI_API_KEY:
            return await generate_gemini_analysis(results)
        else:
            return generate_basic_analysis(results)
    except Exception as e:
        return generate_basic_analysis(results)

async def generate_groq_analysis(results: dict) -> str:
    """Generate analysis using Groq API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama3-8b-8192",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert educational analyst. Generate a detailed analysis of test performance in markdown format."
                        },
                        {
                            "role": "user",
                            "content": f"Analyze this test result: {results}"
                        }
                    ]
                }
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return generate_basic_analysis(results)
    except:
        return generate_basic_analysis(results)

async def generate_gemini_analysis(results: dict) -> str:
    """Generate analysis using Google Gemini API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{
                            "text": f"Generate a detailed analysis of this test result in markdown format: {results}"
                        }]
                    }]
                }
            )
            
            if response.status_code == 200:
                return response.json()["candidates"][0]["content"]["parts"][0]["text"]
            else:
                return generate_basic_analysis(results)
    except:
        return generate_basic_analysis(results)

def generate_basic_analysis(results: dict) -> str:
    """Generate basic analysis without AI"""
    score = results.get("score", 0)
    percentage = results.get("percentage", 0)
    
    if percentage >= 90:
        performance = "Excellent"
        feedback = "Outstanding performance! You have a strong grasp of the material."
    elif percentage >= 80:
        performance = "Very Good"
        feedback = "Great work! You're well-prepared for this subject."
    elif percentage >= 70:
        performance = "Good"
        feedback = "Good performance. Focus on areas of improvement."
    elif percentage >= 60:
        performance = "Satisfactory"
        feedback = "You're on the right track. More practice needed."
    else:
        performance = "Needs Improvement"
        feedback = "Review the material and practice more questions."
    
    return f"""
# Test Performance Analysis

## Overall Performance
- **Score**: {score:.1f}/{results.get('total_questions', 0)}
- **Percentage**: {percentage:.1f}%
- **Performance Level**: {performance}

## Analysis
{feedback}

## Recommendations
- Review questions you answered incorrectly
- Practice similar problems to strengthen understanding
- Focus on time management if needed
- Consider additional study materials for weak areas

## Next Steps
- Identify specific topics for improvement
- Create a study plan focusing on weak areas
- Take more practice tests to build confidence
"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
