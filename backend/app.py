import os
import uuid
import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# Import local backend files
from database import db
from auth import auth_bp, token_required
from ml_models import predict_pcos, analyze_uterine_health, detect_deficiencies
from twin import predict_cycles, calculate_health_score
from chatbot import generate_personalized_response
from reports import generate_pdf_report

app = Flask(__name__)
# Enable CORS for all routes (important for React frontend connecting to Flask)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register Authentication Blueprint
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Ensure directories exist
REPORTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static_reports')
os.makedirs(REPORTS_DIR, exist_ok=True)

# ----------------- PERIOD / CYCLE ENGINE ENDPOINTS -----------------
@app.route('/api/periods', methods=['GET', 'POST'])
@token_required
def periods_route(current_user):
    user_id = current_user['_id']
    if request.method == 'GET':
        records = db.find('periods', {'user_id': user_id})
        return jsonify(records), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('start_date') or not data.get('end_date'):
            return jsonify({'message': 'Start and End dates are required.'}), 400
            
        record = {
            'user_id': user_id,
            'start_date': data['start_date'],
            'end_date': data['end_date'],
            'pain_level': data.get('pain_level', 'Mild'), # Mild, Moderate, Severe
            'flow_intensity': data.get('flow_intensity', 'Normal'), # Light, Normal, Heavy
            'pms_symptoms': data.get('pms_symptoms', []), # list of strings
            'logged_at': datetime.datetime.utcnow().isoformat()
        }
        
        inserted = db.insert_one('periods', record)
        
        # Recalculate health score and predictions to update the User Digital Twin
        all_periods = db.find('periods', {'user_id': user_id})
        all_logs = db.find('wellness_logs', {'user_id': user_id})
        
        pred_res = predict_cycles(all_periods)
        score_res = calculate_health_score(current_user, all_periods, all_logs)
        
        # Update user digital twin stats in DB
        db.update_one('users', {'_id': user_id}, {
            '$set': {
                'health_score': score_res['total_score'],
                'health_score_breakdown': score_res['breakdown'],
                'cycle_predictions': pred_res
            }
        })
        
        # Check and send period/ovulation warnings/alerts
        check_and_create_alerts(user_id, pred_res)
        
        return jsonify({
            'message': 'Cycle log recorded!',
            'record': inserted,
            'predictions': pred_res,
            'health_score': score_res['total_score']
        }), 201

@app.route('/api/periods/prediction', methods=['GET'])
@token_required
def get_cycle_prediction(current_user):
    user_id = current_user['_id']
    records = db.find('periods', {'user_id': user_id})
    predictions = predict_cycles(records)
    return jsonify(predictions), 200


# ----------------- DIAGNOSTIC PREDICTIONS -----------------
@app.route('/api/predictions/pcos', methods=['POST'])
@token_required
def pcos_predict_route(current_user):
    user_id = current_user['_id']
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Missing prediction survey answers.'}), 400
        
    age = data.get('age', current_user.get('profile', {}).get('age', 25))
    weight = data.get('weight', current_user.get('profile', {}).get('weight', 55))
    height = data.get('height', current_user.get('profile', {}).get('height', 160))
    
    # Calculate BMI
    bmi = round(float(weight) / ((float(height)/100) ** 2), 1)
    
    # Extract features
    weight_gain = data.get('weight_gain', False)
    acne = data.get('acne', False)
    hair_growth = data.get('hair_growth', False)
    cycle_irregularity = data.get('cycle_irregularity', False)
    sedentary = data.get('sedentary', False)
    
    prediction = predict_pcos(age, bmi, weight_gain, acne, hair_growth, cycle_irregularity, sedentary)
    
    # Store prediction history
    pred_record = {
        'user_id': user_id,
        'type': 'pcos',
        'input_data': data,
        'result': prediction,
        'date': datetime.datetime.utcnow().isoformat()
    }
    db.insert_one('predictions', pred_record)
    
    # Create alert if risk is High
    if prediction['risk_level'] == 'High Risk':
        db.insert_one('notifications', {
            'user_id': user_id,
            'title': 'High PCOS Risk Alert',
            'message': 'Our ML Engine identified potential risk flags for PCOS. Consider sharing your report with Dr. Sarah Connor.',
            'type': 'warning',
            'date': datetime.datetime.utcnow().isoformat(),
            'read': False
        })
        
    return jsonify(prediction), 200

@app.route('/api/predictions/uterine', methods=['POST'])
@token_required
def uterine_predict_route(current_user):
    user_id = current_user['_id']
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({'message': 'Symptoms array is required.'}), 400
        
    symptoms = data.get('symptoms', [])
    analysis = analyze_uterine_health(symptoms)
    
    pred_record = {
        'user_id': user_id,
        'type': 'uterine',
        'symptoms_analyzed': symptoms,
        'result': analysis,
        'date': datetime.datetime.utcnow().isoformat()
    }
    db.insert_one('predictions', pred_record)
    
    if analysis['risk_score'] >= 50:
        db.insert_one('notifications', {
            'user_id': user_id,
            'title': 'Elevated Uterine Health Risk',
            'message': f"A pelvic health score of {analysis['risk_score']}/100 was flagged. Check doctor portal suggestions.",
            'type': 'warning',
            'date': datetime.datetime.utcnow().isoformat(),
            'read': False
        })
        
    return jsonify(analysis), 200

@app.route('/api/predictions/deficiencies', methods=['POST'])
@token_required
def deficiency_predict_route(current_user):
    user_id = current_user['_id']
    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({'message': 'Symptoms array is required.'}), 400
        
    symptoms = data.get('symptoms', [])
    diet = current_user.get('profile', {}).get('lifestyle_info', {}).get('diet', 'Balanced')
    
    analysis = detect_deficiencies(symptoms, diet)
    
    pred_record = {
        'user_id': user_id,
        'type': 'deficiencies',
        'symptoms_analyzed': symptoms,
        'result': analysis,
        'date': datetime.datetime.utcnow().isoformat()
    }
    db.insert_one('predictions', pred_record)
    
    # Check for deficiencies flags
    for item, metrics in analysis.items():
        if metrics['risk'] == 'High Risk':
            db.insert_one('notifications', {
                'user_id': user_id,
                'title': f'Deficiency Alert: {item.replace("_", " ").title()}',
                'message': f"High likelihood of {item.replace('_', ' ').title()} deficiency. Recommended foods: {', '.join(metrics['foods'][:3])}.",
                'type': 'deficiency',
                'date': datetime.datetime.utcnow().isoformat(),
                'read': False
            })
            
    return jsonify(analysis), 200


# ----------------- AI HEALTH CHATBOT -----------------
@app.route('/api/chat/ask', methods=['POST'])
@token_required
def chatbot_route(current_user):
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'message': 'Message is required.'}), 400
        
    user_message = data['message']
    ai_response = generate_personalized_response(current_user, user_message)
    
    chat_log = {
        'user_id': current_user['_id'],
        'sender': 'user',
        'message': user_message,
        'response': ai_response,
        'timestamp': datetime.datetime.utcnow().isoformat()
    }
    db.insert_one('chat_history', chat_log)
    
    return jsonify({
        'reply': ai_response
    }), 200

@app.route('/api/chat/history', methods=['GET'])
@token_required
def chat_history_route(current_user):
    user_id = current_user['_id']
    history = db.find('chat_history', {'user_id': user_id})
    return jsonify(history), 200


# ----------------- WELLNESS & HEALTH METRICS LOGGING -----------------
@app.route('/api/wellness/log', methods=['POST'])
@token_required
def log_wellness(current_user):
    user_id = current_user['_id']
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Logging fields are required.'}), 400
        
    log_record = {
        'user_id': user_id,
        'date': data.get('date', datetime.date.today().isoformat()),
        'mood': data.get('mood', 'Neutral'),
        'stress_level': data.get('stress_level', 'Medium'),
        'anxiety_level': data.get('anxiety_level', 'Low'),
        'sleep_hours': float(data.get('sleep_hours', 7.5)),
        'water_intake': float(data.get('water_intake', 2.0)),
        'exercise_minutes': int(data.get('exercise_minutes', 0)),
        'logged_at': datetime.datetime.utcnow().isoformat()
    }
    
    # Save log
    db.insert_one('wellness_logs', log_record)
    
    # Recalculate Health Score
    all_periods = db.find('periods', {'user_id': user_id})
    all_logs = db.find('wellness_logs', {'user_id': user_id})
    score_res = calculate_health_score(current_user, all_periods, all_logs)
    
    # Sync with profile settings
    profile = current_user.get('profile', {})
    lifestyle = profile.get('lifestyle_info', {})
    lifestyle['water_intake'] = log_record['water_intake']
    lifestyle['sleep_hours'] = log_record['sleep_hours']
    lifestyle['stress_level'] = log_record['stress_level']
    profile['lifestyle_info'] = lifestyle
    
    db.update_one('users', {'_id': user_id}, {
        '$set': {
            'health_score': score_res['total_score'],
            'health_score_breakdown': score_res['breakdown'],
            'profile': profile
        }
    })
    
    return jsonify({
        'message': 'Daily wellness metrics updated!',
        'health_score': score_res['total_score'],
        'breakdown': score_res['breakdown']
    }), 200

@app.route('/api/wellness/history', methods=['GET'])
@token_required
def get_wellness_history(current_user):
    user_id = current_user['_id']
    logs = db.find('wellness_logs', {'user_id': user_id})
    # Sort chronological
    logs = sorted(logs, key=lambda x: x.get('date', ''))
    return jsonify(logs), 200


# ----------------- APPOINTMENTS & CONSULTATION PORTAL -----------------
@app.route('/api/appointments', methods=['GET', 'POST'])
@token_required
def appointments_route(current_user):
    user_id = current_user['_id']
    if request.method == 'GET':
        if current_user['role'] == 'doctor':
            # Doctors see all consultations booked with them
            # For demonstration, map based on doctorName or doctorId
            appts = db.find('appointments', {'doctor_id': user_id})
            return jsonify(appts), 200
        else:
            appts = db.find('appointments', {'user_id': user_id})
            return jsonify(appts), 200
            
    elif request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('doctor_id') or not data.get('appointment_date'):
            return jsonify({'message': 'Doctor and Date are required.'}), 400
            
        doctor_id = data.get('doctor_id')
        # Look up doctor details
        doctor = db.find_one('users', {
            '_id': doctor_id,
            'role': 'doctor'
        })

        if not doctor:
            return jsonify({
                'message': 'Doctor not found'
            }), 404

        doctor_name = doctor['name']
            
        appt = {
            'user_id': user_id,
            'patient_name': current_user.get('name', 'Patient'),

            'doctor_id': doctor_id,
            'doctor_name': doctor_name,

            'appointment_date': data['appointment_date'],

            'appointment_time': data.get('appointment_time', ''),

            'reason': data.get('reason', 'General Health Check'),

            'status': 'Pending',

            'doctor_notes': '',

            # NEW FIELDS
            'health_score': current_user.get('health_score', 0),

            'pcos_risk': current_user.get('latest_pcos_risk', 'Unknown'),

            'cycle_status': current_user.get('cycle_status', 'Normal'),

            'consultation_report': {
                'diagnosis': '',
                'prescription': '',
                'recommendations': '',
                'follow_up_date': ''
            },

            'created_at': datetime.datetime.utcnow().isoformat()
        }
        
        inserted = db.insert_one('appointments', appt)
        
        # Generate Alert
        db.insert_one('notifications', {
            'user_id': user_id,
            'title': 'Consultation Scheduled',
            'message': f"Appointment booked with {doctor_name} for {data['appointment_date']}.",
            'type': 'appointment',
            'date': datetime.datetime.utcnow().isoformat(),
            'read': False
        })
        
        return jsonify({
            'message': 'Appointment booked successfully!',
            'appointment': inserted
        }), 201

@app.route('/api/appointments/<appt_id>/notes', methods=['POST'])
@token_required
def add_consultation_notes(current_user, appt_id):
    if current_user['role'] != 'doctor':
        return jsonify({'message': 'Only registered medical doctors can update clinical notes.'}), 403
        
    data = request.get_json()
    notes = data.get('notes', '')
    diagnosis = data.get('diagnosis', '')
    prescription = data.get('prescription', '')
    recommendations = data.get('recommendations', '')
    follow_up_date = data.get('follow_up_date', '')
    
    # Update appointment notes
    success = db.update_one(
        'appointments',
        {'_id': appt_id},
        {
            '$set': {
                'doctor_notes': notes,
                'status': 'Completed',

                'consultation_report': {
                    'diagnosis': diagnosis,
                    'prescription': prescription,
                    'recommendations': recommendations,
                    'follow_up_date': follow_up_date
                },

                'completed_at': datetime.datetime.utcnow().isoformat()
                  }
             }
        )
    if not success:
        return jsonify({'message': 'Failed to update consultation notes. Appointment not found.'}), 404
        
    # Get the appointment to send alert to patient
    appt = db.find_one('appointments', {'_id': appt_id})
    if appt:
        db.insert_one('notifications', {
            'user_id': appt['user_id'],
            'title': 'Doctor Consultation Notes Available',
            'message': f"{current_user['name']} has left clinical checkup notes. Click to review.",
            'type': 'medical_notes',
            'date': datetime.datetime.utcnow().isoformat(),
            'read': False
        })
        
    return jsonify({'message': 'Prescriptions and consultation notes updated!', 'success': bool(success)}), 200


# ----------------- REPORT GENERATION -----------------
@app.route('/api/reports/generate', methods=['GET'])
@token_required
def generate_report_route(current_user):
    user_id = current_user['_id']
    
    # Collect all user records to build a comprehensive view
    periods = db.find('periods', {'user_id': user_id})
    symptom_logs = db.find('symptoms', {'user_id': user_id})
    
    # Load latest diagnostic predictions
    pcos = db.find('predictions', {'user_id': user_id, 'type': 'pcos'})
    uterine = db.find('predictions', {'user_id': user_id, 'type': 'uterine'})
    defs = db.find('predictions', {'user_id': user_id, 'type': 'deficiencies'})
    
    latest_pcos = pcos[-1]['result'] if pcos else {'risk_level': 'Low Risk', 'risk_percentage': 12, 'explanation': 'No major indicators present.'}
    latest_uterine = uterine[-1]['result'] if uterine else {'risk_score': 10, 'risks_detected': ['None']}
    latest_defs = defs[-1]['result'] if defs else {
        'iron': {'risk': 'Low Risk'}, 'vitamin_d': {'risk': 'Low Risk'}, 'vitamin_b12': {'risk': 'Low Risk'}
    }
    
    combined_predictions = {
        'pcos': latest_pcos,
        'uterine': latest_uterine,
        'deficiencies': latest_defs
    }
    
    filename = f"Herbuddy_Report_{user_id}_{datetime.date.today().isoformat()}.pdf"
    file_path = os.path.join(REPORTS_DIR, filename)
    
    try:
        generate_pdf_report(current_user, periods, symptom_logs, combined_predictions, file_path)
    except Exception as e:
        return jsonify({'message': f"PDF generation failed: {str(e)}"}), 500
        
    # Record report down inside DB
    report_record = {
        'user_id': user_id,
        'title': f"Monthly Summary - {datetime.date.today().strftime('%B %Y')}",
        'filename': filename,
        'date': datetime.datetime.utcnow().isoformat()
    }
    db.insert_one('reports', report_record)
    
    return jsonify({
        'message': 'PDF health report compiled successfully!',
        'download_url': f"/api/reports/download/{filename}"
    }), 200

@app.route('/api/reports/list', methods=['GET'])
@token_required
def list_reports(current_user):
    user_id = current_user['_id']
    records = db.find('reports', {'user_id': user_id})
    # Add download_url key to entries
    for r in records:
        r['download_url'] = f"/api/reports/download/{r['filename']}"
    return jsonify(records), 200

@app.route('/api/reports/download/<filename>', methods=['GET'])
def download_pdf(filename):
    file_path = os.path.join(REPORTS_DIR, filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True, download_name=filename)
    return jsonify({'message': 'Report not found.'}), 404


# ----------------- SMART ALERTS / NOTIFICATIONS -----------------
@app.route('/api/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    user_id = current_user['_id']
    alerts = db.find('notifications', {'user_id': user_id})
    
    # Generate some default guides if empty
    if not alerts:
        alerts = [
            {
                '_id': 'n-1',
                'user_id': user_id,
                'title': 'Welcome to HERBUDDY 2.0',
                'message': 'Log your menstrual starts on the interactive cycle tab to customize your Digital Twin.',
                'type': 'info',
                'date': datetime.datetime.utcnow().isoformat(),
                'read': False
            }
        ]
    return jsonify(alerts), 200

@app.route('/api/alerts/<alert_id>/read', methods=['POST'])
@token_required
def mark_alert_read(current_user, alert_id):
    success = db.update_one('notifications', {'_id': alert_id}, {'$set': {'read': True}})
    return jsonify({'success': bool(success)}), 200


# ----------------- INTERNAL HELPERS -----------------
def check_and_create_alerts(user_id, predictions):
    """Proactively populate alarms for predicted next periods or ovulation dates."""
    next_p = predictions.get('next_period_date')
    ov = predictions.get('ovulation_date')
    
    # Remove older predicted alerts to avoid spam
    # Inject predicted period alarm
    if next_p:
        db.insert_one('notifications', {
            'user_id': user_id,
            'title': 'Menstruation Forecast Alert',
            'message': f"Your digital twin forecasts your next period to begin on or around {next_p}.",
            'type': 'forecast',
            'date': datetime.datetime.utcnow().isoformat(),
            'read': False
        })
        
    if ov:
        db.insert_one('notifications', {
            'user_id': user_id,
            'title': 'Fertile Window Forecast',
            'message': f"Your peak fertility window opens around {ov}. Plan hydration and exercise accordingly.",
            'type': 'ovulation',
            'date': datetime.datetime.utcnow().isoformat(),
            'read': False
        })


if __name__ == '__main__':
    # Run backend server on local network port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
