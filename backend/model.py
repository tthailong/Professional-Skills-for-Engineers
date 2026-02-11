from transformers import pipeline

THRESHOLD = 0.95

print("Loading spoiler detection model...")

spoiler_classifier = pipeline(
    "text-classification",
    model="bhavyagiri/roberta-base-finetuned-imdb-spoilers",
    tokenizer="bhavyagiri/roberta-base-finetuned-imdb-spoilers",
    truncation=True
)

print("Spoiler model loaded ✅")

def is_non_spoiler_comment(text_comment: str) -> bool:
    result = spoiler_classifier(text_comment)[0]

    label = result["label"].lower()
    score = result["score"]

    if "spoiler" in label or score < THRESHOLD:
        return False

    return True