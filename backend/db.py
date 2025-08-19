from pymongo.server_api import ServerApi
from pymongo.mongo_client import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://developerrup:yAAlreMj9qeE080a@cluster0.ccwka.mongodb.net")
DATABASE_NAME = os.getenv("DATABASE_NAME", "online_mock_test")

# Sync client for initial setup
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

# Async client for FastAPI
async_client = AsyncIOMotorClient(MONGO_URI)

def get_sync_database():
    """Get synchronous database instance"""
    return client[DATABASE_NAME]

def get_database():
    """Get asynchronous database instance"""
    return async_client[DATABASE_NAME]

async def init_database():
    """Initialize database with sample data"""
    db = get_sync_database()
    
    # Create collections if they don't exist
    collections = ['test_configs', 'questions', 'test_results', 'analysis', 'users', 'test_sessions']
    for collection_name in collections:
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
    
    # Insert sample questions if none exist
    if db.questions.count_documents({}) == 0:
        sample_questions = [
            {
                "question_id": "q_001",
                "text": "A ball is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached by the ball? (g = 10 m/s²)",
                "options": {"A": "10 m", "B": "20 m", "C": "30 m", "D": "40 m"},
                "correct_answer": "B",
                "explanation": "Using kinematic equations: v² = u² + 2as, where v=0 at max height",
                "topic": "Mechanics",
                "difficulty": "medium",
                "subject": "Physics",
                "marks": 1
            },
            {
                "question_id": "q_002",
                "text": "Which of the following is a vector quantity?",
                "options": {"A": "Mass", "B": "Temperature", "C": "Force", "D": "Time"},
                "correct_answer": "C",
                "explanation": "Force has both magnitude and direction, making it a vector quantity",
                "topic": "Mechanics",
                "difficulty": "easy",
                "subject": "Physics",
                "marks": 1
            },
            {
                "question_id": "q_003",
                "text": "What is the chemical formula for water?",
                "options": {"A": "H2O", "B": "CO2", "C": "O2", "D": "N2"},
                "correct_answer": "A",
                "explanation": "Water consists of two hydrogen atoms and one oxygen atom",
                "topic": "Chemical Bonding",
                "difficulty": "easy",
                "subject": "Chemistry",
                "marks": 1
            },
            {
                "question_id": "q_004",
                "text": "What is the derivative of x²?",
                "options": {"A": "x", "B": "2x", "C": "x²", "D": "2x²"},
                "correct_answer": "B",
                "explanation": "Using power rule: d/dx(x^n) = nx^(n-1)",
                "topic": "Calculus",
                "difficulty": "medium",
                "subject": "Mathematics",
                "marks": 1
            },
            {
                "question_id": "q_005",
                "text": "What is the SI unit of electric current?",
                "options": {"A": "Volt", "B": "Ampere", "C": "Ohm", "D": "Watt"},
                "correct_answer": "B",
                "explanation": "The ampere (A) is the SI unit of electric current",
                "topic": "Electricity",
                "difficulty": "easy",
                "subject": "Physics",
                "marks": 1
            },
            {
                "question_id": "q_006",
                "text": "Which gas is responsible for the greenhouse effect?",
                "options": {"A": "Oxygen", "B": "Nitrogen", "C": "Carbon Dioxide", "D": "Hydrogen"},
                "correct_answer": "C",
                "explanation": "Carbon dioxide is a major greenhouse gas that traps heat in the atmosphere",
                "topic": "Environmental Chemistry",
                "difficulty": "easy",
                "subject": "Chemistry",
                "marks": 1
            },
            {
                "question_id": "q_007",
                "text": "What is the value of π (pi) to two decimal places?",
                "options": {"A": "3.12", "B": "3.14", "C": "3.16", "D": "3.18"},
                "correct_answer": "B",
                "explanation": "π is approximately 3.14159, so to two decimal places it's 3.14",
                "topic": "Geometry",
                "difficulty": "easy",
                "subject": "Mathematics",
                "marks": 1
            },
            {
                "question_id": "q_008",
                "text": "What is Newton's First Law also known as?",
                "options": {"A": "Law of Motion", "B": "Law of Inertia", "C": "Law of Action-Reaction", "D": "Law of Acceleration"},
                "correct_answer": "B",
                "explanation": "Newton's First Law is the Law of Inertia, which states that an object will remain at rest or in uniform motion unless acted upon by an external force",
                "topic": "Mechanics",
                "difficulty": "medium",
                "subject": "Physics",
                "marks": 1
            }
        ]
        
        db.questions.insert_many(sample_questions)
        print(f"Inserted {len(sample_questions)} sample questions")
    
    # Create indexes for better performance
    db.questions.create_index("subject")
    db.questions.create_index("topic")
    db.questions.create_index("difficulty")
    db.test_configs.create_index("test_id")
    db.test_results.create_index("test_id")
    
    print("Database initialized successfully")

# Initialize database when module is imported
if __name__ == "__main__":
    import asyncio
    asyncio.run(init_database())
else:
    # Initialize in background
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(init_database())
    loop.close()