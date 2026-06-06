import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# File path for serialized PCOS models
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
PCOS_MODEL_PATH = os.path.join(MODEL_DIR, "pcos_rf_model.pkl")
PCOS_NN_MODEL_PATH = os.path.join(MODEL_DIR, "pcos_nn_model.pkl")

def generate_synthetic_pcos_data(n_samples=800):
    """Generate synthetic clinical survey samples for PCOS training."""
    np.random.seed(42)
    age = np.random.randint(15, 46, n_samples)
    bmi = np.random.uniform(16, 38, n_samples)
    weight_gain = np.random.choice([0, 1], size=n_samples, p=[0.6, 0.4])
    acne = np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3])
    hair_growth = np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2])
    cycle_irregularity = np.random.choice([0, 1], size=n_samples, p=[0.65, 0.35])
    sedentary = np.random.choice([0, 1], size=n_samples, p=[0.5, 0.5])
    
    # Calculate target based on medical indicators weight
    score = (
        0.30 * cycle_irregularity + 
        0.25 * hair_growth + 
        0.15 * (bmi > 25).astype(int) + 
        0.15 * weight_gain + 
        0.10 * acne + 
        0.05 * sedentary
    )
    
    y = []
    for s in score:
        if s >= 0.55:
            y.append(2)  # High Risk
        elif s >= 0.25:
            y.append(1)  # Medium Risk
        else:
            y.append(0)  # Low Risk
            
    X = pd.DataFrame({
        'age': age,
        'bmi': bmi,
        'weight_gain': weight_gain,
        'acne': acne,
        'hair_growth': hair_growth,
        'cycle_irregularity': cycle_irregularity,
        'sedentary': sedentary
    })
    return X, y

def get_pcos_model():
    """Load the PCOS Random Forest model from disk or train a new one."""
    if os.path.exists(PCOS_MODEL_PATH):
        try:
            with open(PCOS_MODEL_PATH, 'rb') as f:
                return pickle.load(f)
        except Exception:
            pass

    print("Training PCOS Random Forest Classifier on synthetic clinical samples...")
    X, y = generate_synthetic_pcos_data()
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    with open(PCOS_MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)
        
    return clf

def get_pcos_nn_model():
    """Load the PCOS Neural Network (MLP) model from disk or train a new one."""
    if os.path.exists(PCOS_NN_MODEL_PATH):
        try:
            with open(PCOS_NN_MODEL_PATH, 'rb') as f:
                return pickle.load(f)
        except Exception:
            pass

    print("Training PCOS MLP Neural Network on synthetic clinical samples...")
    X, y = generate_synthetic_pcos_data()
    
    # MLP Classifier inside a Pipeline to ensure proper feature scaling
    mlp_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('mlp', MLPClassifier(hidden_layer_sizes=(16, 8), max_iter=800, random_state=42))
    ])
    mlp_pipeline.fit(X, y)
    
    with open(PCOS_NN_MODEL_PATH, 'wb') as f:
        pickle.dump(mlp_pipeline, f)
        
    return mlp_pipeline

# Initialize models
pcos_model = get_pcos_model()
pcos_nn_model = get_pcos_nn_model()

def predict_pcos(age, bmi, weight_gain, acne, hair_growth, cycle_irregularity, sedentary):
    """Predict PCOS risk using the Trained RF and MLP Neural Network Models."""
    wg = 1 if weight_gain else 0
    ac = 1 if acne else 0
    hg = 1 if hair_growth else 0
    ci = 1 if cycle_irregularity else 0
    sd = 1 if sedentary else 0
    
    X_input = pd.DataFrame([{
        'age': int(age),
        'bmi': float(bmi),
        'weight_gain': wg,
        'acne': ac,
        'hair_growth': hg,
        'cycle_irregularity': ci,
        'sedentary': sd
    }])
    
    # 1. RF Prediction
    rf_prob = pcos_model.predict_proba(X_input)[0]
    rf_pct = round((rf_prob[1] * 0.4 + rf_prob[2] * 1.0) * 100)
    
    # 2. NN Prediction
    nn_prob = pcos_nn_model.predict_proba(X_input)[0]
    nn_pct = round((nn_prob[1] * 0.4 + nn_prob[2] * 1.0) * 100)
    
    # 3. Blended Ensemble (Average probability vector)
    ensemble_prob = (rf_prob + nn_prob) / 2.0
    pred_class = int(np.argmax(ensemble_prob))
    
    # Class map
    risk_labels = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}
    risk_level = risk_labels[pred_class]
    
    # Blended risk percentage
    risk_pct = round((ensemble_prob[1] * 0.4 + ensemble_prob[2] * 1.0) * 100)
    
    # Baseline logic overrides based on clinical indicators
    if ci and hg:
        risk_pct = max(risk_pct, 75)
        risk_level = "High Risk"
    elif ci or hg:
        risk_pct = max(risk_pct, 40)
        risk_level = "Medium Risk" if risk_level == "Low Risk" else risk_level

    # Explanation and recommendations based on clinical guidelines
    explanation = (
        f"Based on our consensus machine learning analysis (Random Forest and MLP Neural Network), "
        f"your overall risk is categorized as {risk_level} ({risk_pct}% blended score). "
        f"The Random Forest model estimated risk at {rf_pct}%, and the Multi-Layer Perceptron Neural Network "
        f"estimated risk at {nn_pct}%."
    )
    
    recommendations = []
    if risk_level == "High Risk":
        explanation += " You show key indicators like cycle irregularity and hirsutism, which are strongly correlated with PCOS (Polycystic Ovary Syndrome)."
        recommendations = [
            "Schedule a clinical evaluation with a Gynecologist / Endocrinologist.",
            "Ask about pelvic ultrasounds to check for ovarian cysts and blood tests for hormone panels (free testosterone, LH/FSH ratio).",
            "Transition to a low-glycemic index (GI) diet to improve insulin sensitivity.",
            "Incorporate 150 minutes of moderate-intensity cardio or strength training weekly.",
            "Track cycle data and report anomalies immediately."
        ]
    elif risk_level == "Medium Risk":
        explanation += " You show some mild symptoms. Changes in lifestyle and hormone balance checks are recommended to prevent progression."
        recommendations = [
            "Monitor cycle lengths closely using the HERBUDDY Menstrual Intelligence engine.",
            "Switch to a whole-foods diet, cutting processed sugars and saturated fats.",
            "Prioritize sleep hygiene to regulate cortisol (stress hormone) levels.",
            "Perform light yoga or resistance training 3-4 days a week.",
            "Consult a clinical dietitian to optimize nutritional profiles."
        ]
    else:
        explanation += " Your health indicators are within typical baseline ranges. No prominent signs of PCOS detected."
        recommendations = [
            "Maintain a balanced, nutritious diet with leafy greens, lean proteins, and fiber.",
            "Stay hydrated (2-3 liters of water daily).",
            "Continue regular screening checkups and maintain active exercise habits.",
            "Track symptoms monthly to note any sudden hormonal changes."
        ]
        
    return {
        'risk_level': risk_level,
        'risk_percentage': risk_pct,
        'rf_percentage': rf_pct,
        'nn_percentage': nn_pct,
        'explanation': explanation,
        'recommended_actions': recommendations
    }


def analyze_uterine_health(symptoms):
    """
    Analyze user symptoms for indicators of:
    - Fibroids
    - Endometriosis
    - Hormonal imbalance
    - Cervical abnormalities
    
    symptoms: list of strings (e.g. ['heavy_bleeding', 'pelvic_pain', 'painful_intercourse', 'irregular_spotting'])
    """
    detected_symptoms = [s.replace('_', ' ').title() for s in symptoms]
    score = 0
    risks_detected = []
    recommendations = []
    
    # 1. Endometriosis Indicators
    endo_markers = {'severe_cramping', 'chronic_pelvic_pain', 'painful_intercourse', 'lower_back_pain'}
    endo_matches = set(symptoms).intersection(endo_markers)
    if endo_matches:
        score += len(endo_matches) * 20
        risks_detected.append("Endometriosis Indicators")
        recommendations.append("Discuss severe cramps/pelvic pain with a doctor to evaluate for potential Endometriosis (uterine lining growing outside the uterus).")
        
    # 2. Fibroids Indicators
    fibroid_markers = {'heavy_bleeding', 'prolonged_periods', 'frequent_urination', 'pelvic_pressure', 'constipation'}
    fibroid_matches = set(symptoms).intersection(fibroid_markers)
    if fibroid_matches:
        score += len(fibroid_matches) * 15
        risks_detected.append("Uterine Fibroids Indicators")
        recommendations.append("Heavy flow or pelvic pressure can indicate Fibroids (benign muscle tumors). Ask your doctor about a pelvic ultrasound scan.")
        
    # 3. Hormonal Imbalance Indicators
    hormone_markers = {'irregular_spotting', 'mood_swings', 'unexplained_weight_gain', 'cystic_acne', 'night_sweats'}
    hormone_matches = set(symptoms).intersection(hormone_markers)
    if hormone_matches:
        score += len(hormone_matches) * 15
        risks_detected.append("Hormonal Imbalance Indicators")
        recommendations.append("Spotting and thermal swings suggest estrogen/progesterone fluctuations. Check thyroid panels (TSH, Free T3/T4).")
        
    # 4. Cervical Abnormalities Indicators
    cervical_markers = {'spotting_after_intercourse', 'abnormal_discharge', 'foul_odor'}
    cervical_matches = set(symptoms).intersection(cervical_markers)
    if cervical_matches:
        score += len(cervical_matches) * 25
        risks_detected.append("Cervical Health Warnings")
        recommendations.append("Spotting after intercourse or abnormal discharge demands a Pap smear screening and HPV test.")
        
    score = min(score, 100)
    
    # Default recommendations
    if score > 40:
        recommendations.append("WARNING: High/Moderate risk flags raised. We strongly recommend scheduling a clinical consult with your primary gynecologist.")
    else:
        recommendations.append("Continue tracking cycles and undergo annual wellness checks.")
        
    return {
        'risk_score': score,
        'risks_detected': risks_detected if risks_detected else ["None Detected"],
        'symptoms_analyzed': detected_symptoms,
        'recommendations': recommendations
    }

def detect_deficiencies(symptoms, diet_type="Balanced"):
    """
    Evaluate symptoms for potential Vitamin D, B12, and Iron deficiencies.
    """
    symptoms = [s.lower().strip() for s in symptoms]
    
    # 1. Iron Deficiency (Anemia)
    iron_markers = {'fatigue', 'pale_skin', 'cold_hands_feet', 'brittle_nails', 'shortness_of_breath', 'dizziness'}
    iron_score = len(iron_markers.intersection(symptoms)) * 20
    if diet_type == "Vegetarian" or diet_type == "Vegan":
        iron_score += 15 # Vegans/Vegetarians have lower non-heme iron absorption
    iron_score = min(iron_score, 100)
    
    # 2. Vitamin D
    vitd_markers = {'bone_pain', 'muscle_weakness', 'fatigue', 'joint_stiffness', 'depressed_mood'}
    vitd_score = len(vitd_markers.intersection(symptoms)) * 20
    vitd_score = min(vitd_score, 100)
    
    # 3. Vitamin B12
    vitb12_markers = {'tingling_hands_feet', 'numbness', 'mouth_ulcers', 'memory_lapses', 'fatigue', 'muscle_cramps'}
    vitb12_score = len(vitb12_markers.intersection(symptoms)) * 20
    if diet_type == "Vegetarian" or diet_type == "Vegan":
        vitb12_score += 25 # B12 is mostly in animal products
    vitb12_score = min(vitb12_score, 100)

    # Determine risk classes
    def get_risk_label(score):
        if score >= 60: return "High Risk"
        elif score >= 30: return "Moderate Risk"
        return "Low Risk"
        
    results = {
        'iron': {
            'risk': get_risk_label(iron_score),
            'percentage': iron_score,
            'foods': ["Spinach", "Lentils", "Red meat / Poultry", "Pumpkin seeds", "Quinoa", "Fortified cereals"],
            'lifestyle': "Pair iron-rich foods with Vitamin C (lemon juice, oranges) to double absorption. Avoid drinking tea/coffee with meals."
        },
        'vitamin_d': {
            'risk': get_risk_label(vitd_score),
            'percentage': vitd_score,
            'foods': ["Egg yolks", "Mushrooms (UV exposed)", "Fortified milk/orange juice", "Salmon/Mackerel"],
            'lifestyle': "Get 15-20 minutes of midday sunlight exposure. Consider a D3 supplement of 1000-2000 IU under doctor guidance."
        },
        'vitamin_b12': {
            'risk': get_risk_label(vitb12_score),
            'percentage': vitb12_score,
            'foods': ["Milk", "Cheese", "Yogurt", "Eggs", "Nutritional yeast", "Fortified plant-based milks"],
            'lifestyle': "Since B12 is critical for red blood cell formation, request a Serum B12 level test. Consider daily B12 supplements if following a vegan lifestyle."
        }
    }
    
    return results
