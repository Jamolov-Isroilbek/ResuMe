import re
import traceback
import openai
import os
import json
from django.conf import settings

BASE_DIR = settings.BASE_DIR
PROMPT_PATH = os.path.join(BASE_DIR, "nlp/prompts.json")

with open(PROMPT_PATH, "r", encoding="utf-8") as f:
    prompts = json.load(f)

def call_openai(prompt: str) -> str:
    try:
        print("📡 Calling OpenAI...")
        resp = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=700,
        )
        result = resp.choices[0].message.content.strip()
        print(f"✅ OpenAI Response: {result[:100]}…")
        return result
    except Exception as e:
        print("🔥 OpenAI call failed!")
        traceback.print_exc()
        return ""

ENTRY_LABELS = prompts.get("entry_label_map", {})

def _extract_entry_name(section: str, entry: dict) -> str:
    if section == "work_experience":
        company = entry.get("company_name") or entry.get("employer")
        title   = entry.get("job_title")    or entry.get("role")
        if company and title:
            return f"{company} ({title})"
    for key in ENTRY_LABELS.get(section, []):
        val = entry.get(key)
        if val:
            return val
    return f"{section.capitalize()} Entry"

def generate_resume_suggestions(resume_data: dict, job_description: str = "") -> list:
    suggestions = []
    templates = prompts.get("templates", {})

    fields_by_section = {
        "work_experience": ["description"],
        "projects":        ["description", "technologies"],
        "skills":          ["skill_name", "proficiency", "skill_type"],
        "awards":          ["description"]
    }
    
    resume_context = []
    for we in resume_data.get("work_experience", []):
        if isinstance(we, dict):
            resume_context.append(str(we.get("description", "")))
    for proj in resume_data.get("projects", []):
        if isinstance(proj, dict):
            resume_context.append(str(proj.get("description", "")))
    resume_context = " | ".join(resume_context)[:600]   # keep prompt short

    for section, fields in fields_by_section.items():
        entries = resume_data.get(section, [])
        print(f"Processing {len(entries)} entries for section '{section}'")
        template = templates.get(section)
        if not template:
            print(f"⚠️ No template for section: {section}")
            continue

        for entry in entries:
            if not isinstance(entry, dict):
                continue

            # build original text
            parts = [str(entry.get(f)) for f in fields if entry.get(f)]
            if not parts:
                continue
            original_text = " | ".join(parts)

            # fill in template
            prompt = (
                template
                    .replace("{{global_instruction}}", prompts.get("global_instruction", ""))
                    .replace("{{ORIGINAL_TEXT}}", original_text)
            )
            if section == "projects":
                if entry.get("technologies"):
                    prompt = (
                        prompt
                            .replace("{{#if TECH_STACK}}", "")
                            .replace("{{/if}}", "")
                            .replace("{{TECH_STACK}}", entry["technologies"])
                    )
                else:
                    prompt = re.sub(r"{{#if TECH_STACK}}.*?{{/if}}", "", prompt, flags=re.S)

            if section == "skills":
                _s = lambda v: str(v or "")

                prompt = (
                    prompt
                      .replace("{{ORIGINAL_TEXT.skill_name}}",  _s(entry.get("skill_name")))
                      .replace("{{ORIGINAL_TEXT.proficiency}}", _s(entry.get("proficiency")))
                      .replace("{{ORIGINAL_TEXT.skill_type}}",  _s(entry.get("skill_type")))
                      .replace("{{RESUME_CONTEXT}}", resume_context)
                )
            
            if job_description:
                prompt = (
                    prompt
                        .replace("{{#if JOB_DESCRIPTION}}", "")
                        .replace("{{/if}}", "")
                        .replace("{{JOB_DESCRIPTION}}", job_description.strip()[:250])
                )   
            else:
                prompt = re.sub(r"{{#if JOB_DESCRIPTION}}.*?{{/if}}", "", prompt, flags=re.S)

            if job_description:
                score_prompt = (
        f"{prompts['global_instruction']}\n\n"
        "Rate how WELL the following resume snippet matches the job "
        "description on a 1‑4 scale, where 4=Excellent, 3=Good, 2=Fair, 1=Poor.\n\n"
        f"Snippet:\n{original_text}\n\n"
        f"Job description:\n{job_description[:500]}\n\n"
        "Respond with ONLY the number."
    )
                score_raw = call_openai(score_prompt).strip()
                try:
                    score_int = int(re.findall(r"[1-4]", score_raw)[0])
                except (IndexError, ValueError):
                    score_int = 2   # default to Fair
                match_map = {4: "Excellent", 3: "Good", 2: "Fair", 1: "Poor"}
                match_level = match_map[score_int]
            else:
                match_level = None
           
            raw = call_openai(prompt)

            clean = raw.strip()
            if clean.startswith("```"):
                clean = re.sub(r"^```(?:json)?\s*", "", clean)
                clean = re.sub(r"```$", "", clean)
            parsed = json.loads(clean)

            # parse & unwrap
            try:
                parsed = json.loads(raw)
            except (json.JSONDecodeError, ValueError):
                print(f"⚠️ Failed to parse JSON for {section}, raw:\n{raw[:200]}")
                parsed = {}
                parse_failed = True
            else:
                parse_failed = False

            if section in parsed and isinstance(parsed[section], dict):
                parsed = parsed[section]
                print(f"⤷ unwrapped section '{section}': {parsed}")



            issues = parsed.get("issues", [])
            suggestion_text = (
                parsed.get("suggestion")
                or parsed.get("replacement")
                or parsed.get("improved_text")
                or parsed.get("text")
                or ""
            )

            if section == "work_experience" and suggestion_text:
                # 1) normalise existing single newlines to spaces
                suggestion_text = re.sub(r"\s*\n\s*", " ", suggestion_text.strip())
                # 2) insert TWO newlines after each period that heralds next sentence
                suggestion_text = re.sub(r"\.\s+(?=[A-Z])", ".\n\n", suggestion_text)
                # 3) trim accidental triple newlines
                suggestion_text = re.sub(r"\n{3,}", "\n\n", suggestion_text)
                

            

            # ─── Fallback: if issues exist but suggestion is blank ──────────
            if issues and not suggestion_text:
                retry_prompt = (
                    prompts.get("global_instruction", "") +
                    "\n\nRewrite the text below, fixing each issue. "
                    "Return ONLY the rewritten text.\n\n"
                    f"Original:\n{original_text}\n\nIssues:\n- " + "\n- ".join(issues)
                )
                retry_raw = call_openai(retry_prompt)
                suggestion_text = retry_raw.strip()[:600]

            if parse_failed:
                issues = ["Failed to parse AI response"]
                suggestion_text = raw[:200]

            suggestions.append({
                "section":    section,
                "entry_name": _extract_entry_name(section, entry),
                "original":   original_text,
                "issues":     issues,
                "suggestion": suggestion_text,
                "match": match_level,
            })

    print(f"Generated {len(suggestions)} suggestions")
    return suggestions
