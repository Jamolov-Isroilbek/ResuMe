import traceback
import openai
import os
import json
from django.conf import settings

BASE_DIR = settings.BASE_DIR
PROMPT_PATH = os.path.join(BASE_DIR, "nlp/prompts.json")

with open(PROMPT_PATH, "r", encoding="utf-8") as f:
    prompts = json.load(f)

def call_openai(prompt):
    try:
        print("📡 Calling OpenAI...")
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=700,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("🔥 OpenAI call failed!")
        traceback.print_exc() 
        return f"Error: {str(e)}"

def generate_resume_suggestions(resume_data, job_description=""):
    try:
        print("📥 Incoming Resume Data:", resume_data)

        suggestions = []
        prompt_template = prompts["ai_suggestion_with_job"] if job_description else prompts["ai_suggestion_intro"]

        fields_to_check = {
            "work_experience": ["description"],
            "education": ["description"],
            "skills": ["skill_name"],
            "awards": ["description"]
        }

        for section, fields in fields_to_check.items():
            items = resume_data.get(section, [])
            print(f"🔍 Checking section: {section} ({len(items)} entries)")

            for i, entry in enumerate(items):
                if not isinstance(entry, dict):
                    print(f"⚠️ Skipping non-dict in {section}[{i}]: {entry}")
                    continue

                modifiable_parts = []
                for field in fields:
                    value = entry.get(field)
                    if value:
                        modifiable_parts.append(f"{field.capitalize()}: {value}")

                if not modifiable_parts:
                    continue

                resume_text = "\n".join(modifiable_parts)
                prompt = f"{prompt_template}\n\nSection: {section.title()}\n\n📝 Original:\n{resume_text}"

                if job_description:
                    prompt += f"\n\n📄 Based on the following job description:\n{job_description.strip()}"

                print("📡 Calling OpenAI...")
                feedback = call_openai(prompt)

                suggestions.append({
                    "section": section,
                    "original": entry,
                    "ai_feedback": feedback.strip()
                })

        return suggestions

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to generate suggestions: {str(e)}"}
