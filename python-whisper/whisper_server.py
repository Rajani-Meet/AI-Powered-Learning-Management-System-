#!/usr/bin/env python3
"""
Local Whisper Server for LMS Transcription
Easy to install and connect to Node.js
"""

import os
import sys
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global model variable
model = None

def load_whisper_model():
    """Load Whisper model on startup"""
    global model
    try:
        logger.info("Loading Whisper model (tiny.en)...")
        model = whisper.load_model("tiny.en")
        logger.info("Whisper model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'whisper_version': whisper.__version__ if hasattr(whisper, '__version__') else 'unknown'
    })

@app.route('/transcribe-file', methods=['POST'])
def transcribe_file_path():
    """Transcribe audio file by file path"""
    global model
    
    if model is None:
        return jsonify({'error': 'Whisper model not loaded'}), 500
    
    try:
        data = request.get_json()
        if not data or 'file_path' not in data:
            return jsonify({'error': 'No file path provided'}), 400
        
        file_path = os.path.abspath(data['file_path'])
        logger.info(f"Received file path: {data['file_path']}")
        logger.info(f"Absolute file path: {file_path}")
        
        if not os.path.exists(file_path):
            logger.error(f"File not found at: {file_path}")
            return jsonify({'error': f'File not found: {file_path}'}), 404
        
        logger.info(f"Transcribing file: {file_path}")
        logger.info(f"File size: {os.path.getsize(file_path)} bytes")
        
        # Transcribe with Whisper
        result = model.transcribe(file_path)
        transcript = result['text'].strip()
        
        logger.info(f"Transcription completed: {len(transcript)} characters")
        
        return jsonify({
            'success': True,
            'transcript': transcript,
            'language': result.get('language', 'en'),
            'segments': len(result.get('segments', []))
        })
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return jsonify({'error': f'Transcription failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting Local Whisper Server...")
    
    # Load model on startup
    if load_whisper_model():
        print("Whisper model loaded successfully!")
        print("Server starting on http://localhost:5000")
        print("Endpoints:")
        print("   GET  /health - Health check")
        print("   POST /transcribe-file - Transcribe by file path")
        
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("Failed to load Whisper model")
        print("Try: pip install openai-whisper flask flask-cors")
        sys.exit(1)