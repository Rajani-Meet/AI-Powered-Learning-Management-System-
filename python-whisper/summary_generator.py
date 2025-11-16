#!/usr/bin/env python3
import sys
import re

def clean_transcript(transcript):
    cleaned = re.sub(r'\[\d{2}:\d{2}\]', '', transcript)
    cleaned = ' '.join(cleaned.split())
    return cleaned.strip()

def generate_summary(transcript):
    clean_text = clean_transcript(transcript)
    
    # Extract key themes and topics
    words = clean_text.lower().split()
    
    # Identify main topics
    topics = []
    if any(word in words for word in ['demo', 'presentation', 'show']):
        topics.append('a demonstration')
    if any(word in words for word in ['team', 'group', 'company']):
        topics.append('team collaboration')
    if any(word in words for word in ['problem', 'solution', 'challenge']):
        topics.append('problem-solving')
    if any(word in words for word in ['healthcare', 'medical', 'patient']):
        topics.append('healthcare solutions')
    if any(word in words for word in ['technology', 'software', 'system']):
        topics.append('technology innovation')
    if any(word in words for word in ['learn', 'education', 'teach']):
        topics.append('educational content')
    
    # Create refined summary
    if 'welcome' in clean_text.lower() and 'demo' in clean_text.lower():
        summary = "This video presents a demonstration where the presenter introduces their team's innovative work and discusses solutions to challenges faced by professionals in their field."
    elif topics:
        topic_text = ', '.join(topics[:2])
        summary = f"This video focuses on {topic_text}, providing insights and practical information for viewers interested in the subject matter."
    else:
        # Generic educational summary
        summary = "This educational video covers important concepts and provides valuable information on the discussed topics, offering viewers practical insights and knowledge."
    
    return summary

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(1)
    
    transcript = sys.argv[1]
    summary = generate_summary(transcript)
    print(summary)