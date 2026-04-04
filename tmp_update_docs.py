import os

docs_to_update = [
    "README.md",
    "STUDYHIVE_MASTER_CONTEXT.md",
    "docs/AI_SYSTEM.md",
    "docs/HACKATHON_PITCH.md"
]

ai_features_text = """
## 🌟 Advanced AI Features (BiT AI Hackathon 2026)

StudyHive brings educational platforming to the next level by natively integrating deep AI capabilities aimed at completely reimagining how users consume and retain knowledge:

- **AI Assistant (Honey Hub)**: A context-aware chatbot and AI Swiss knife that supports document Q&A, quiz generation, automated course summarizations, and generating dynamic explanations based on uploaded material.
- **Honey Teacher (Virtual Tutor)**: A highly interactive, visually animated teaching assistant. It takes any topic and fully autonomously synthesizes a complete slide deck and animated "masterclass" presenting the content with different expert personas, utilizing Speech Synthesis and visually stunning Framer Motion workflows.
- **Honey Interviewer**: A mock-interview simulator tailored for software engineers and professionals. Conducts live voice-to-text behavioral and technical interviews, grading the user's responses, offering corrective explanations, and tracking metrics.
- **Honey Exit Indicator**: A rich dashboard dedicated to providing analytical probability on exit exam readiness, powered by AI extrapolation of the student's historical quiz, interview, and lesson performances.
"""

for path in docs_to_update:
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "Advanced AI Features" not in content and "BiT AI Hackathon 2026" not in content:
        with open(path, 'a', encoding='utf-8') as f:
            f.write("\n" + ai_features_text + "\n")
            print(f"Updated {path}")
    else:
        print(f"Skipped {path} (already contains AI feature block)")

