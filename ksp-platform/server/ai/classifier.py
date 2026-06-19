import json
import os
import spacy

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback to downloading if not present
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Load IPC mapping
mapping_path = os.path.join(os.path.dirname(__file__), "..", "data", "ipc_mapping.json")
try:
    with open(mapping_path, "r", encoding="utf-8") as f:
        IPC_MAPPING = json.load(f)
except Exception:
    IPC_MAPPING = {}

KEYWORDS = {
    "Cybercrime": ["hack", "phish", "online", "cyber", "internet", "bitcoin", "upi", "bank"],
    "Fraud": ["fraud", "cheat", "money", "scam", "scheme", "fake"],
    "Theft": ["steal", "stole", "theft", "snatch", "stolen"],
    "Robbery": ["rob", "robbery", "weapon", "gun", "knife", "threat"],
    "Assault": ["hit", "punch", "slap", "beat", "assault"],
    "Murder": ["kill", "murder", "dead", "body"],
    "Kidnapping": ["kidnap", "abduct", "ransom", "missing"],
    "Drug offences": ["drug", "weed", "cocaine", "heroin", "smuggle", "ganja"],
    "Sexual offences": ["rape", "molest", "harass", "sexual"],
    "Property damage": ["break", "smash", "destroy", "vandal", "damage"],
    "Domestic violence": ["dowry", "husband", "wife", "domestic", "in-laws"]
}

def classify_fir(text: str) -> dict:
    doc = nlp(text)
    
    # 1. Extract entities
    persons = list(set([ent.text for ent in doc.ents if ent.label_ == "PERSON"]))
    locations = list(set([ent.text for ent in doc.ents if ent.label_ in ("GPE", "LOC", "FAC")]))
    
    # 2. Keyword matching for crime type
    text_lower = text.lower()
    detected_type = "Other"
    max_matches = 0
    
    for c_type, keywords in KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text_lower)
        if matches > max_matches:
            max_matches = matches
            detected_type = c_type
            
    # Get IPC sections based on detected type
    sections = IPC_MAPPING.get(detected_type, [])
    ipc_section = ", ".join(sections) if sections else "Unknown"
    
    return {
        "crime_type": detected_type,
        "ipc_section": ipc_section,
        "entities": {
            "persons": persons,
            "locations": locations
        }
    }
