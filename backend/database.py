import os
import json
import uuid
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

class JSONCollection:
    def __init__(self, filepath):
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            with open(self.filepath, 'w') as f:
                json.dump([], f)

    def _read(self):
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except Exception:
            return []

    def _write(self, data):
        with open(self.filepath, 'w') as f:
            json.dump(data, f, indent=4, default=str)

    def find_one(self, query):
        data = self._read()
        for doc in data:
            if self._match(doc, query):
                return doc
        return None

    def find(self, query=None):
        if query is None:
            query = {}
        data = self._read()
        return [doc for doc in data if self._match(doc, query)]

    def insert_one(self, doc):
        data = self._read()
        if '_id' not in doc:
            doc['_id'] = str(uuid.uuid4())
        data.append(doc)
        self._write(data)
        return doc

    def update_one(self, query, update_data, upsert=False):
        data = self._read()
        found = False
        
        # Extract $set key if present
        set_data = update_data.get('$set', update_data) if isinstance(update_data, dict) else update_data
        
        for idx, doc in enumerate(data):
            if self._match(doc, query):
                for k, v in set_data.items():
                    doc[k] = v
                data[idx] = doc
                found = True
                break
                
        if not found and upsert:
            new_doc = query.copy()
            for k, v in set_data.items():
                new_doc[k] = v
            if '_id' not in new_doc:
                new_doc['_id'] = str(uuid.uuid4())
            data.append(new_doc)
            self._write(data)
            return new_doc
            
        if found:
            self._write(data)
        return found

    def delete_one(self, query):
        data = self._read()
        initial_len = len(data)
        data = [doc for doc in data if not self._match(doc, query)]
        if len(data) < initial_len:
            self._write(data)
            return True
        return False

    def count_documents(self, query):
        return len(self.find(query))

    def _match(self, doc, query):
        for k, v in query.items():
            if k not in doc:
                return False
            # Basic nested query matching or exact matching
            if doc[k] != v:
                return False
        return True


class DualDatabase:
    def __init__(self, mongo_uri="mongodb://localhost:27017/", db_name="herbuddy"):
        self.fallback = False
        self.client = None
        self.db = None
        self.data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
        
        try:
            # Short timeout to fail quickly if Mongo is not running
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            # Trigger a connection test
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            print("MongoDB connected successfully.")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            print(f"MongoDB connection failed: {e}. Falling back to local JSON files.")
            self.fallback = True
            os.makedirs(self.data_dir, exist_ok=True)

    def _get_collection(self, name):
        if not self.fallback:
            return self.db[name]
        else:
            filepath = os.path.join(self.data_dir, f"{name}.json")
            return JSONCollection(filepath)

    def find_one(self, collection_name, query):
        col = self._get_collection(collection_name)
        if not self.fallback:
            from bson import ObjectId
            if query and '_id' in query and isinstance(query['_id'], str):
                try:
                    query['_id'] = ObjectId(query['_id'])
                except Exception:
                    pass
            res = col.find_one(query)
            if res and '_id' in res:
                res['_id'] = str(res['_id'])
            return res
        else:
            return col.find_one(query)

    def find(self, collection_name, query=None):
        if query is None:
            query = {}
        col = self._get_collection(collection_name)
        if not self.fallback:
            from bson import ObjectId
            if query and '_id' in query and isinstance(query['_id'], str):
                try:
                    query['_id'] = ObjectId(query['_id'])
                except Exception:
                    pass
            res = list(col.find(query))
            for doc in res:
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
            return res
        else:
            return col.find(query)

    def insert_one(self, collection_name, document):
        col = self._get_collection(collection_name)
        if not self.fallback:
            result = col.insert_one(document)
            document['_id'] = str(result.inserted_id)
            return document
        else:
            return col.insert_one(document)

    def update_one(self, collection_name, query, update_data, upsert=False):
        col = self._get_collection(collection_name)
        if not self.fallback:
            from bson import ObjectId
            if query and '_id' in query and isinstance(query['_id'], str):
                try:
                    query['_id'] = ObjectId(query['_id'])
                except Exception:
                    pass
            return col.update_one(query, update_data, upsert=upsert)
        else:
            return col.update_one(query, update_data, upsert=upsert)

    def delete_one(self, collection_name, query):
        col = self._get_collection(collection_name)
        if not self.fallback:
            from bson import ObjectId
            if query and '_id' in query and isinstance(query['_id'], str):
                try:
                    query['_id'] = ObjectId(query['_id'])
                except Exception:
                    pass
            result = col.delete_one(query)
            return result.deleted_count > 0
        else:
            return col.delete_one(query)

    def count_documents(self, collection_name, query):
        col = self._get_collection(collection_name)
        if not self.fallback:
            return col.count_documents(query)
        else:
            return col.count_documents(query)

# Global DB Instance
db = DualDatabase()
