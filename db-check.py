from sqlalchemy import create_engine

db_url = "mysql+pymysql://u649168233_lux:Revolution_100@82.197.82.158/u649168233_revolution"
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        print("✅ Success: SQLAlchemy connected!")
except Exception as e:
    print(f"❌ Failed: {e}")