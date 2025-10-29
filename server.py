#!/usr/bin/env python3
"""
Tiny filesystem server for SunoMaker
Handles only file operations - all API calls happen in the browser
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DATA_DIR = Path(__file__).parent / "data"
PROJECTS_DIR = DATA_DIR / "projects"
STYLES_DIR = DATA_DIR / "styles"
TEMPLATES_DIR = DATA_DIR / "templates"

# Ensure directories exist
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
STYLES_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)


@app.route('/api/fs/projects', methods=['GET'])
def list_projects():
    """List all projects"""
    projects = []
    for project_dir in PROJECTS_DIR.iterdir():
        if project_dir.is_dir():
            config_file = project_dir / "config.json"
            if config_file.exists():
                with open(config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    projects.append({
                        "id": project_dir.name,
                        **config
                    })
    return jsonify(projects)


@app.route('/api/fs/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get project details"""
    project_dir = PROJECTS_DIR / project_id
    if not project_dir.exists():
        return jsonify({"error": "Project not found"}), 404
    
    config_file = project_dir / "config.json"
    raw_lyrics_file = project_dir / "raw-lyrics.txt"
    enhanced_lyrics_file = project_dir / "enhanced-lyrics.txt"
    
    project_data = {}
    
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            project_data = json.load(f)
    
    if raw_lyrics_file.exists():
        with open(raw_lyrics_file, 'r', encoding='utf-8') as f:
            project_data['rawLyrics'] = f.read()
    
    if enhanced_lyrics_file.exists():
        with open(enhanced_lyrics_file, 'r', encoding='utf-8') as f:
            project_data['enhancedLyrics'] = f.read()
    
    # List generations
    generations_dir = project_dir / "generations"
    if generations_dir.exists():
        generations = []
        for gen_file in sorted(generations_dir.glob("*.json")):
            with open(gen_file, 'r', encoding='utf-8') as f:
                generations.append(json.load(f))
        project_data['generations'] = generations
    
    return jsonify(project_data)


@app.route('/api/fs/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.json
    project_id = data.get('id') or datetime.now().strftime("%Y%m%d_%H%M%S")
    project_dir = PROJECTS_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    (project_dir / "generations").mkdir(exist_ok=True)
    
    config = {
        "id": project_id,
        "name": data.get('name', 'Untitled Project'),
        "style": data.get('style', ''),
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    with open(project_dir / "config.json", 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    return jsonify(config)


@app.route('/api/fs/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    """Update project data"""
    project_dir = PROJECTS_DIR / project_id
    if not project_dir.exists():
        return jsonify({"error": "Project not found"}), 404
    
    data = request.json
    
    # Update config
    config_file = project_dir / "config.json"
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
    else:
        config = {"id": project_id}
    
    config.update({
        "name": data.get('name', config.get('name', 'Untitled')),
        "style": data.get('style', config.get('style', '')),
        "updatedAt": datetime.now().isoformat()
    })
    
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    # Save lyrics if provided
    if 'rawLyrics' in data:
        with open(project_dir / "raw-lyrics.txt", 'w', encoding='utf-8') as f:
            f.write(data['rawLyrics'])
    
    if 'enhancedLyrics' in data:
        with open(project_dir / "enhanced-lyrics.txt", 'w', encoding='utf-8') as f:
            f.write(data['enhancedLyrics'])
    
    return jsonify({"success": True})


@app.route('/api/fs/projects/<project_id>/generations', methods=['POST'])
def save_generation(project_id):
    """Save a generation attempt"""
    project_dir = PROJECTS_DIR / project_id
    if not project_dir.exists():
        return jsonify({"error": "Project not found"}), 404
    
    generations_dir = project_dir / "generations"
    generations_dir.mkdir(exist_ok=True)
    
    data = request.json
    attempt_num = len(list(generations_dir.glob("attempt-*.json"))) + 1
    
    generation_data = {
        "attempt": attempt_num,
        "timestamp": datetime.now().isoformat(),
        **data
    }
    
    with open(generations_dir / f"attempt-{attempt_num}.json", 'w', encoding='utf-8') as f:
        json.dump(generation_data, f, indent=2, ensure_ascii=False)
    
    return jsonify({"success": True, "attempt": attempt_num})


@app.route('/api/fs/styles', methods=['GET'])
def list_styles():
    """List all available styles"""
    styles = []
    for style_dir in STYLES_DIR.iterdir():
        if style_dir.is_dir():
            metadata_file = style_dir / "metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                    styles.append({
                        "id": style_dir.name,
                        **metadata
                    })
    return jsonify(styles)


@app.route('/api/fs/templates/gpt-prompt', methods=['GET'])
def get_gpt_prompt():
    """Get the GPT enhancement prompt"""
    prompt_file = TEMPLATES_DIR / "gpt-prompt.txt"
    if not prompt_file.exists():
        return jsonify({"error": "Prompt template not found"}), 404
    
    with open(prompt_file, 'r', encoding='utf-8') as f:
        return jsonify({"prompt": f.read()})


if __name__ == '__main__':
    print(f"🎵 SunoMaker Filesystem Server")
    print(f"📁 Data directory: {DATA_DIR}")
    print(f"🚀 Starting server on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
