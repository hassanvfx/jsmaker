#!/usr/bin/env python3
"""
Generate catalog.json from MP3 files in data/styles/
Parses filenames to infer style, artist, and other metadata
"""

import os
import json
from pathlib import Path

# Base GitHub Pages URL
GITHUB_PAGES_URL = "https://hassanvfx.github.io/jsmaker"

def parse_filename(filename):
    """Parse filename to extract metadata"""
    # Remove .mp3 extension
    name = filename.replace('.mp3', '')
    
    # Split by underscore
    parts = name.split('_')
    
    # Determine category and extract info
    category = 'other'
    style = name
    artist = None
    subgenre = None
    
    if len(parts) > 0:
        first_part = parts[0].lower()
        
        # Categorize based on prefix
        if first_part in ['norteno', 'norteño', 'noteno']:
            category = 'norteno'
            style = 'Norteño'
            if len(parts) > 1:
                subgenre = parts[1] if parts[1] in ['belico', 'clasico', 'romantico'] else None
                artist_start = 2 if subgenre else 1
                artist = ' '.join(parts[artist_start:]).replace('_', ' ').title()
        
        elif first_part == 'banda':
            category = 'banda'
            style = 'Banda'
            if len(parts) > 1:
                subgenre = parts[1] if parts[1] in ['sinaloense', 'epico'] else None
                artist_start = 2 if subgenre else 1
                artist = ' '.join(parts[artist_start:]).replace('_', ' ').title()
        
        elif first_part == 'tumbado':
            category = 'tumbado'
            style = 'Corrido Tumbado'
            if len(parts) > 1:
                subgenre = parts[1] if parts[1] in ['belico', 'sentimental'] else None
                artist_start = 2 if subgenre else 1
                artist = ' '.join(parts[artist_start:]).replace('_', ' ').title()
        
        elif first_part == 'trap':
            category = 'trap'
            style = 'Trap Corrido'
            if len(parts) > 1:
                artist = ' '.join(parts[1:]).replace('_', ' ').title()
        
        elif first_part == 'estilo':
            category = 'norteno'
            style = 'Norteño'
            if len(parts) > 1:
                artist = ' '.join(parts[1:]).replace('_', ' ').title()
        
        elif first_part == 'rap':
            category = 'rap'
            style = 'Rap Mexicano'
            if len(parts) > 1:
                subgenre = parts[1] if parts[1] in ['dark', 'romantic', 'hiph'] else None
                artist_start = 2 if subgenre else 1
                if artist_start < len(parts):
                    artist = ' '.join(parts[artist_start:]).replace('_', ' ').title()
    
    # Generate title
    title_parts = []
    if subgenre:
        title_parts.append(subgenre.title())
    if artist:
        title_parts.append(f"- {artist}")
    else:
        # Use cleaned filename as fallback
        title_parts.append(name.replace('_', ' ').title())
    
    title = ' '.join(title_parts) if title_parts else name.replace('_', ' ').title()
    
    return {
        'category': category,
        'style': style,
        'artist': artist,
        'subgenre': subgenre,
        'title': title
    }

def scan_directory(base_dir):
    """Scan directories for MP3 files"""
    catalog = {
        'version': '1.0.0',
        'totalTracks': 0,
        'categories': {
            'norteno': {
                'name': 'Norteño',
                'emoji': '🎸',
                'description': 'Traditional norteño style with accordion and bajo sexto',
                'tracks': []
            },
            'banda': {
                'name': 'Banda',
                'emoji': '🎺',
                'description': 'Brass-heavy banda sinaloense style',
                'tracks': []
            },
            'tumbado': {
                'name': 'Corrido Tumbado',
                'emoji': '🔥',
                'description': 'Modern corrido tumbado with trap influences',
                'tracks': []
            },
            'trap': {
                'name': 'Trap Corrido',
                'emoji': '💀',
                'description': 'Heavy trap beats with corrido lyrics',
                'tracks': []
            },
            'rap': {
                'name': 'Rap Mexicano',
                'emoji': '🎤',
                'description': 'Mexican hip-hop and rap',
                'tracks': []
            }
        }
    }
    
    # Walk through all style directories
    styles_path = Path(base_dir) / 'data' / 'styles'
    
    for style_dir in styles_path.iterdir():
        if not style_dir.is_dir():
            continue
        
        # Skip hidden directories
        if style_dir.name.startswith('.'):
            continue
        
        # Find all MP3 files
        mp3_files = sorted(style_dir.glob('*.mp3'))
        
        for mp3_file in mp3_files:
            filename = mp3_file.name
            
            # Parse filename
            metadata = parse_filename(filename)
            
            # Build track object
            track = {
                'id': filename.replace('.mp3', ''),
                'filename': filename,
                'title': metadata['title'],
                'style': metadata['style'],
                'artist': metadata['artist'],
                'subgenre': metadata['subgenre'],
                'url': f"{GITHUB_PAGES_URL}/data/styles/{style_dir.name}/{filename}"
            }
            
            # Add to appropriate category
            category = metadata['category']
            if category in catalog['categories']:
                catalog['categories'][category]['tracks'].append(track)
                catalog['totalTracks'] += 1
    
    return catalog

def main():
    # Get repo root (parent of scripts directory)
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    
    print("🔍 Scanning MP3 files...")
    catalog = scan_directory(repo_root)
    
    # Print summary
    print(f"\n✅ Found {catalog['totalTracks']} tracks:")
    for cat_id, cat_data in catalog['categories'].items():
        count = len(cat_data['tracks'])
        emoji = cat_data['emoji']
        name = cat_data['name']
        print(f"   {emoji} {name}: {count} tracks")
    
    # Write catalog.json
    output_path = repo_root / 'data' / 'styles' / 'catalog.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    print(f"\n📝 Wrote catalog to: {output_path}")
    print(f"📊 Total: {catalog['totalTracks']} tracks")

if __name__ == '__main__':
    main()
