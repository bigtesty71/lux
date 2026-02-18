
from sqlalchemy import create_engine, text

DATABASE_URL = "mysql+pymysql://u649168233_lux:Revolution_100@82.197.82.158/u649168233_revolution"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("--- Detailed Memory Status ---")
        
        # Check blog posts for member 999
        blog_count = conn.execute(text("SELECT COUNT(*) FROM domain_memory WHERE member_id = 999 AND category = 'blog_post'")).scalar()
        print(f"Blog posts in domain_memory (Member 999): {blog_count}")
        
        # Check other categories
        categories = conn.execute(text("SELECT category, COUNT(*) FROM domain_memory GROUP BY category")).fetchall()
        print("\nDomain Memory by Category:")
        for cat, count in categories:
            print(f"- {cat}: {count}")
            
        # Check experience memory for member 999
        exp_count = conn.execute(text("SELECT COUNT(*) FROM experience_memory WHERE member_id = 999")).scalar()
        print(f"\nExperience Memory (Member 999): {exp_count}")

except Exception as e:
    print(f"❌ Error: {e}")
