#!/usr/bin/env python3
import sys
import json
import re

def clean_transcript(transcript):
    cleaned = re.sub(r'\[\d{2}:\d{2}\]', '', transcript)
    cleaned = ' '.join(cleaned.split())
    return cleaned.strip()

def generate_ai_answer(transcript, question):
    clean_text = clean_transcript(transcript).lower()
    question_lower = question.lower()
    
    # Extract sentences from transcript
    sentences = [s.strip() for s in clean_text.split('.') if len(s.strip()) > 10]
    
    # Find relevant content based on question keywords
    question_words = [w for w in question_lower.split() if len(w) > 3]
    
    relevant_sentences = []
    for sentence in sentences:
        score = sum(1 for word in question_words if word in sentence)
        if score > 0:
            relevant_sentences.append((sentence, score))
    
    # Sort by relevance
    relevant_sentences.sort(key=lambda x: x[1], reverse=True)
    
    # Generate contextual answer
    if 'what' in question_lower and 'about' in question_lower:
        if relevant_sentences:
            return f"Based on the video content, {relevant_sentences[0][0].capitalize()}."
        return "The video discusses various topics and concepts related to the subject matter."
    
    elif 'how' in question_lower:
        if relevant_sentences:
            return f"According to the presentation, {relevant_sentences[0][0].capitalize()}."
        return "The video explains the process and methodology in detail."
    
    elif 'why' in question_lower:
        if relevant_sentences:
            return f"The video explains that {relevant_sentences[0][0].capitalize()}."
        return "The reasoning and rationale are covered in the video content."
    
    elif 'who' in question_lower:
        # Look for names or roles
        for sentence in sentences:
            if any(word in sentence for word in ['team', 'presenter', 'speaker', 'instructor']):
                return f"Based on the video, {sentence.capitalize()}."
        return "The video features the presenter and their team discussing the topic."
    
    elif 'summary' in question_lower or 'summarize' in question_lower:
        key_points = [s[0] for s in relevant_sentences[:2]]
        if key_points:
            return f"The main points covered include: {'. '.join(key_points).capitalize()}."
        return "The video covers important concepts and provides valuable insights on the discussed topics."
    
    else:
        # General question - find most relevant content
        if relevant_sentences:
            return f"Regarding your question, the video mentions that {relevant_sentences[0][0].capitalize()}."
        return "The video provides comprehensive information about this topic. Please refer to the specific sections for detailed explanations."

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python ai_chat.py '<transcript>' '<question>'")
        sys.exit(1)
    
    transcript = sys.argv[1]
    question = sys.argv[2]
    answer = generate_ai_answer(transcript, question)
    print(answer)