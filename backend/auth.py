import jwt
import datetime
import bcrypt
from flask import Blueprint, request, jsonify
from functools import wraps
from database import db

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = "herbuddy2.0_secret_key_wellness_guardian_platform"

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            # Load user from db
            current_user = db.find_one('users', {'_id': data['user_id']})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields!'}), 400
        
    email = data.get('email').strip().lower()
    name = data.get('name').strip()
    password = data.get('password')
    role = data.get('role', 'patient')  # patient, doctor, admin
    
    # Check if user already exists
    existing = db.find_one('users', {'email': email})
    if existing:
        return jsonify({'message': 'User already exists!'}), 400
        
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user_doc = {
        'email': email,
        'name': name,
        'password': hashed_password,
        'role': role,
        'created_at': datetime.datetime.utcnow().isoformat(),
        # Health profile fields
        'profile': {
            'age': data.get('age', 25),
            'height': data.get('height', 160), # in cm
            'weight': data.get('weight', 55),  # in kg
            'bmi': round(data.get('weight', 55) / ((data.get('height', 160) / 100) ** 2), 1) if data.get('height') and data.get('weight') else 21.5,
            'blood_group': data.get('blood_group', 'O+'),
            'medical_history': data.get('medical_history', ''),
            'family_history': data.get('family_history', ''),
            'lifestyle_info': {
                'exercise': data.get('exercise', 'Sedentary'), # Sedentary, Moderate, Active
                'diet': data.get('diet', 'Balanced'),
                'water_intake': data.get('water_intake', 2.0), # L/day
                'sleep_hours': data.get('sleep_hours', 7.5),
                'stress_level': data.get('stress_level', 'Medium') # Low, Medium, High
            }
        }
    }
    
    created_user = db.insert_one('users', user_doc)
    # Remove password from response
    created_user.pop('password', None)
    
    return jsonify({
        'message': 'User registered successfully!',
        'user': created_user
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Invalid login credentials!'}), 400
        
    email = data.get('email').strip().lower()
    password = data.get('password')
    
    user = db.find_one('users', {'email': email})
    if not user:
        return jsonify({'message': 'Invalid email or password!'}), 401
        
    if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        
        user.pop('password', None)
        return jsonify({
            'token': token,
            'user': user
        }), 200
        
    return jsonify({'message': 'Invalid email or password!'}), 401

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@token_required
def profile(current_user):
    if request.method == 'GET':
        current_user.pop('password', None)
        return jsonify(current_user), 200
        
    elif request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        # Update name if provided
        if 'name' in data:
            db.update_one('users', {'_id': current_user['_id']}, {'$set': {'name': data['name']}})
            
        profile_update = current_user.get('profile', {})
        for field in ['age', 'height', 'weight', 'blood_group', 'medical_history', 'family_history']:
            if field in data:
                profile_update[field] = data[field]
                
        # Handle BMI calculation
        if 'height' in data or 'weight' in data:
            h = float(profile_update.get('height', 160)) / 100
            w = float(profile_update.get('weight', 55))
            profile_update['bmi'] = round(w / (h ** 2), 1)
            
        if 'lifestyle_info' in data:
            lifestyle = profile_update.get('lifestyle_info', {})
            for key, val in data['lifestyle_info'].items():
                lifestyle[key] = val
            profile_update['lifestyle_info'] = lifestyle
            
        db.update_one('users', {'_id': current_user['_id']}, {'$set': {'profile': profile_update}})
        
        updated_user = db.find_one('users', {'_id': current_user['_id']})
        updated_user.pop('password', None)
        return jsonify({
            'message': 'Profile updated successfully!',
            'user': updated_user
        }), 200

@auth_bp.route('/doctors', methods=['GET'])
def get_doctors():
    # Return users that are registered as doctors
    doctors = db.find('users', {'role': 'doctor'})
    clean_doctors = []
    for doc in doctors:
        doc.pop('password', None)
        clean_doctors.append(doc)
    
    # If no doctors exist, return a few default ones
    if not clean_doctors:
        clean_doctors = [
            {
                '_id': 'doc-1',
                'name': 'Dr. Sarah Connor',
                'email': 'sarah@herbuddy.org',
                'role': 'doctor',
                'specialty': 'Gynecology & PCOS Specialist',
                'experience': '12 years'
            },
            {
                '_id': 'doc-2',
                'name': 'Dr. Emily Vance',
                'email': 'emily@herbuddy.org',
                'role': 'doctor',
                'specialty': 'Obstetrics & Hormonal Health Specialist',
                'experience': '8 years'
            }
        ]
    return jsonify(clean_doctors), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'message': 'Email is required'}), 400
    email = data.get('email').strip().lower()
    user = db.find_one('users', {'email': email})
    if not user:
        return jsonify({'message': 'If the email exists in our records, a code will be sent.'}), 200
    # Simulate sending reset code
    return jsonify({
        'message': 'Verification code sent to email!',
        'reset_code': 'HB-88392' # Static code for testing
    }), 200
