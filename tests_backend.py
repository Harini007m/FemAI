import time
import requests
import subprocess
import os
import sys

def run_tests():
    base_url = "http://127.0.0.1:5000"
    print("\n==========================================")
    print("      HERBUDDY 2.0 BACKEND TEST SUITE     ")
    print("==========================================\n")
    
    # 1. Test registration
    print("[TEST 1] Registering a test patient account...")
    reg_url = f"{base_url}/api/auth/register"
    reg_payload = {
        "email": "test_patient@herbuddy.org",
        "name": "Jane Doe Tester",
        "password": "SecurePassword123",
        "age": 28,
        "height": 165,
        "weight": 60,
        "blood_group": "A+",
        "exercise": "Moderate",
        "diet": "Balanced"
    }
    
    try:
        res = requests.post(reg_url, json=reg_payload)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}\n")
        assert res.status_code in (201, 400), f"Registration failed with code {res.status_code}"
    except Exception as e:
        print(f"Connection error: {e}")
        return False

    # 2. Test Login
    print("[TEST 2] Logging in to generate session JWT token...")
    login_url = f"{base_url}/api/auth/login"
    login_payload = {
        "email": "test_patient@herbuddy.org",
        "password": "SecurePassword123"
    }
    res = requests.post(login_url, json=login_payload)
    print(f"Status: {res.status_code}")
    data = res.json()
    print(f"Response data token preview: {data.get('token')[:30]}...\n")
    assert res.status_code == 200, "Login failed"
    token = data['token']
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Profile Update
    print("[TEST 3] Updating Health Twin profile (Weight, Medical history, Lifestyle inputs)...")
    profile_url = f"{base_url}/api/auth/profile"
    profile_payload = {
        "weight": 62, # Weight gain logged
        "lifestyle_info": {
            "exercise": "Sedentary",
            "diet": "Vegan",
            "water_intake": 1.8,
            "sleep_hours": 6.5
        },
        "medical_history": "Mild iron deficiency logs"
    }
    res = requests.put(profile_url, json=profile_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Calculated BMI: {res.json()['user']['profile']['bmi']}")
    print(f"New Health Score: {res.json()['user'].get('health_score')}\n")
    assert res.status_code == 200, "Profile update failed"

    # 4. Test Period Logs & Calculations
    print("[TEST 4] Logging period flows (Start and End dates)...")
    period_url = f"{base_url}/api/periods"
    period_payload = {
        "start_date": "2026-05-01",
        "end_date": "2026-05-05",
        "pain_level": "Moderate",
        "flow_intensity": "Heavy",
        "pms_symptoms": ["Bloating", "Cramping"]
    }
    res = requests.post(period_url, json=period_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Predicted next period: {res.json()['predictions']['next_period_date']}")
    print(f"Predicted ovulation: {res.json()['predictions']['ovulation_date']}\n")
    assert res.status_code == 201, "Period logging failed"

    # 5. Test PCOS Machine Learning prediction
    print("[TEST 5] Testing PCOS Risk Prediction Engine...")
    pcos_url = f"{base_url}/api/predictions/pcos"
    pcos_payload = {
        "weight_gain": True,
        "acne": True,
        "hair_growth": True,
        "cycle_irregularity": True,
        "sedentary": True
    }
    res = requests.post(pcos_url, json=pcos_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"PCOS Risk Level: {res.json()['risk_level']} ({res.json()['risk_percentage']}% likelihood)")
    print(f"Recommendations: {res.json()['recommended_actions'][:2]}\n")
    assert res.status_code == 200, "PCOS prediction failed"

    # 6. Test AI Chatbot
    print("[TEST 6] Promting the AI health chatbot...")
    chat_url = f"{base_url}/api/chat/ask"
    chat_payload = {
        "message": "What diet should I eat if I have PCOS risks?"
    }
    res = requests.post(chat_url, json=chat_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Bot response preview: {res.json()['reply'][:150]}...\n")
    assert res.status_code == 200, "Chatbot failed"

    # 7. Test PDF Report compiler
    print("[TEST 7] Compiling monthly PDF summary report...")
    report_url = f"{base_url}/api/reports/generate"
    res = requests.get(report_url, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Download URL: {res.json()['download_url']}\n")
    assert res.status_code == 200, "PDF report compiler failed"

    print("==========================================")
    print("     ALL BACKEND ENDPOINTS VERIFIED OK    ")
    print("==========================================\n")
    return True

if __name__ == "__main__":
    # If server is not running, we try to run it temporarily
    run_tests()
