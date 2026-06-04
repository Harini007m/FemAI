import os
import json
from pymongo import MongoClient

def load_dotenv():
    # .env is located at the project root
    root_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(root_dir, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    key = key.strip()
                    val = val.strip().strip("'").strip('"')
                    os.environ[key] = val

load_dotenv()

mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
db_name = os.environ.get("DB_NAME", "herbuddy_new")

client = MongoClient(mongo_uri)
db = client[db_name]

data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'data')
if not os.path.exists(data_dir):
    print("No local data directory found.")
    exit(0)

print(f"Starting migration to MongoDB (DB: {db_name})...")
for filename in os.listdir(data_dir):
    if filename.endswith('.json'):
        collection_name = filename[:-5]
        filepath = os.path.join(data_dir, filename)
        
        try:
            with open(filepath, 'r') as f:
                docs = json.load(f)
        except Exception as e:
            print(f"Failed to read {filename}: {e}")
            continue
            
        if not docs:
            print(f"Collection '{collection_name}' is empty. Skipping.")
            continue
            
        print(f"Migrating {len(docs)} documents to collection '{collection_name}'...")
        col = db[collection_name]
        
        inserted_count = 0
        updated_count = 0
        for doc in docs:
            if '_id' in doc:
                existing = col.find_one({'_id': doc['_id']})
                if existing:
                    col.replace_one({'_id': doc['_id']}, doc)
                    updated_count += 1
                else:
                    col.insert_one(doc)
                    inserted_count += 1
            else:
                col.insert_one(doc)
                inserted_count += 1
                
        print(f"Successfully migrated '{collection_name}': {inserted_count} inserted, {updated_count} updated.")

print("\nMigration completed successfully!")
