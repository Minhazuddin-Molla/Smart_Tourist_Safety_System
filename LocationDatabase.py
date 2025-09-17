import  pymongo
if __name__ == "__main__":
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["location_database"]
    collection = db["locations"]
    dictionary={"location": "40.7128,-74.0060", "timestamp": 1, "time_of_day": "morning", "previous_location": "None", "popular_spots_nearby": ["Statue of Liberty", "Central Park"]}
    collection.insert_one(dictionary)
    print("Data inserted successfully.")