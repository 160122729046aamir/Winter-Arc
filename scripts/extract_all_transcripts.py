import json
import os
import re
import time
from youtube_transcript_api import YouTubeTranscriptApi

OUTPUT_DIR = os.path.join(os.getcwd(), 'transcripts')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open('src/data/roadmapData.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the roadmap days
match = re.search(r'export const INITIAL_ROADMAP_DAYS = (\[[\s\S]*?\]);', content)
if not match:
    print("Could not find INITIAL_ROADMAP_DAYS in roadmapData.js")
    exit(1)

days = json.loads(match.group(1))
print(f"Loaded {len(days)} days from roadmapData.js")

api = YouTubeTranscriptApi()

success_count = 0
failed_days = []

for day_obj in days:
    day_num = day_obj['day']
    video = day_obj['videos'][0] if day_obj.get('videos') else None
    if not video:
        print(f"Day {day_num}: No video found")
        failed_days.append(day_num)
        continue
    
    vid_id = video['id']
    title = day_obj['title']
    target_json = os.path.join(OUTPUT_DIR, f"day_{day_num:02d}_{vid_id}.json")
    target_txt = os.path.join(OUTPUT_DIR, f"day_{day_num:02d}_{vid_id}.txt")
    
    if os.path.exists(target_json) and os.path.getsize(target_json) > 100:
        print(f"Day {day_num} ({vid_id}) already cached.")
        success_count += 1
        continue
        
    print(f"Extracting Day {day_num}/{len(days)}: {title} (ID: {vid_id})...")
    
    try:
        t_list = api.list(vid_id)
        chosen = None
        for t in t_list:
            chosen = t
            if not t.is_generated:
                break
                
        if not chosen:
            print(f"  -> No transcript found for {vid_id}")
            failed_days.append(day_num)
            continue
            
        snippets = chosen.fetch()
        full_text = " ".join([s.text.replace("\n", " ") for s in snippets])
        
        record = {
            "day": day_num,
            "title": title,
            "videoId": vid_id,
            "videoUrl": f"https://www.youtube.com/watch?v=vid_id",
            "language": chosen.language,
            "languageCode": chosen.language_code,
            "isGenerated": chosen.is_generated,
            "totalSnippets": len(snippets),
            "fullTranscript": full_text,
            "snippets": [{"start": s.start, "duration": s.duration, "text": s.text} for s in snippets]
        }
        
        with open(target_json, 'w', encoding='utf-8') as fj:
            json.dump(record, fj, ensure_ascii=False, indent=2)
            
        with open(target_txt, 'w', encoding='utf-8') as ft:
            ft.write(f"DAY {day_num}: {title}\n")
            ft.write(f"YouTube Video ID: {vid_id}\n")
            ft.write(f"Language: {chosen.language} ({chosen.language_code}) | Auto-generated: {chosen.is_generated}\n")
            ft.write("="*70 + "\n\n")
            ft.write(full_text)
            
        print(f"  -> Saved {len(snippets)} snippets ({len(full_text)} chars).")
        success_count += 1
        time.sleep(0.3) # gentle throttling
    except Exception as e:
        print(f"  -> Failed to fetch transcript for {vid_id}: {type(e).__name__} - {e}")
        failed_days.append(day_num)
        time.sleep(1)

print("\n" + "="*50)
print(f"Extraction Summary: {success_count}/{len(days)} succeeded.")
if failed_days:
    print(f"Failed days: {failed_days}")
