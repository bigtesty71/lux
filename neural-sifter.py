
from sqlalchemy import create_engine, text
import json
from bs4 import BeautifulSoup

DATABASE_URL = "mysql+pymysql://u649168233_lux:Revolution_100@82.197.82.158/u649168233_revolution"

def clean_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    # Remove script and style elements
    for script_or_style in soup(["script", "style"]):
        script_or_style.decompose()
    # Get text
    text_content = soup.get_text(separator=' ')
    # Break into lines and remove leading and trailing whitespace on each
    lines = (line.strip() for line in text_content.splitlines())
    # Break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # Drop blank lines
    return '\n'.join(chunk for chunk in chunks if chunk)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("--- Neural Sifting Process Started ---")
        
        # 1. Fetch all blog posts
        posts = conn.execute(text("SELECT id, value, structured_data FROM domain_memory WHERE category = 'blog_post'")).fetchall()
        
        for post_id, title, structured_data in posts:
            if not structured_data:
                continue
            
            try:
                data = json.loads(structured_data)
                html_content = data.get('content', '')
                
                if html_content:
                    clean_text = clean_html(html_content)
                    
                    # 2. Save cleaned version to experience_memory
                    sql = text("""
                        INSERT INTO experience_memory (member_id, memory_type, content, confidence, category, created_at, last_recalled)
                        VALUES (999, 'insight', :content, 0.95, 'transmission_digest', NOW(), NOW())
                    """)
                    conn.execute(sql, {"content": f"LUX TRANSMISSION DIGEST: '{title}'\n\n{clean_text[:5000]}"}) # Limit to 5k chars for prompt safety
                    print(f"✅ Sifted: {title}")
                    conn.commit()
            except Exception as inner_e:
                print(f"❌ Error sifting {title}: {inner_e}")
                
        print("--- Neural Sifting Complete ---")

except Exception as e:
    print(f"❌ Critical Error: {e}")
