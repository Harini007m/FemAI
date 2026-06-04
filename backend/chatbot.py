import re
from database import db
from twin import predict_cycles

def generate_personalized_response(current_user, user_query):
    query = user_query.lower().strip()
    
    # Load profile details
    name = current_user.get('name', 'there')
    profile = current_user.get('profile', {})
    age = profile.get('age', 25)
    bmi = profile.get('bmi', 21.5)
    blood_group = profile.get('blood_group', 'O+')
    lifestyle = profile.get('lifestyle_info', {})
    diet = lifestyle.get('diet', 'Balanced')
    water = lifestyle.get('water_intake', 2.0)
    
    # Load latest period info
    user_id = current_user['_id']
    periods = db.find('periods', {'user_id': user_id})
    cycle_info = predict_cycles(periods)
    
    # Load recent symptom log
    symptom_logs = db.find('symptoms', {'user_id': user_id})
    latest_symptoms = []
    if symptom_logs:
        latest_log = sorted(symptom_logs, key=lambda x: x.get('date', ''))[-1]
        latest_symptoms = latest_log.get('symptoms', [])
        
    symptoms_str = ", ".join(latest_symptoms) if latest_symptoms else "none logged recently"
    
    # Base introduction context
    context_prefix = f"### HERBUDDY Health Companion (Profile Analyzed: {name}, Age {age}, BMI {bmi})\n\n"
    
    # Keyword routing
    # 1. PCOS topics
    if re.search(r'(pcos|pcod|polycystic|cyst|ovary|facial hair|hirsutism|acne)', query):
        response = (
            f"Regarding PCOS and hormonal health: Based on your current profile (BMI: {bmi}), it is important to monitor menstrual regularity. "
            f"Your current predictions indicate your next cycle is expected around **{cycle_info['next_period_date']}**. "
            "PCOS is closely tied to insulin resistance. Here is personalized advice:\n\n"
            "- **Dietary Shift**: Focus on complex carbohydrates (oats, quinoa) and lean proteins to avoid blood sugar spikes. "
            "Since you follow a **" + diet + "** diet, ensure you are getting enough fiber and healthy fats (avocados, seeds).\n"
            "- **Activity**: Regular physical activity helps lower insulin levels. Aim for 30 minutes of brisk walking or strength exercises.\n"
            "- **What to track**: Keep logging your flow intensity and skin flare-ups. If cycles are consistently longer than 35 days, we recommend a gynecological evaluation."
        )
        
    # 2. Pain, cramps, PMS
    elif re.search(r'(pain|cramp|pms|ache|sore|bloat|headache)', query):
        # Check if they have logged severe symptoms
        pain_detail = "We noticed you track cycle variables regularly."
        if periods:
            last_p = sorted(periods, key=lambda x: x.get('start_date', ''))[-1]
            last_pain = last_p.get('pain_level', 'Mild')
            pain_detail = f"In your last logged cycle, you reported **{last_pain}** cramping."
            
        response = (
            f"{pain_detail} Pain during or before periods (dysmenorrhea) is often triggered by prostaglandins. "
            "To manage this discomfort effectively, HERBUDDY recommends:\n\n"
            "- **Heat Therapy**: Applying a heating pad to your lower abdomen relaxes uterine muscles and enhances blood flow.\n"
            "- **Hydration & Herbal Support**: You currently log **{water}L/day** of water. Increasing this to 2.5L during your period can reduce bloating. "
            "Warm ginger or chamomile tea acts as a natural anti-inflammatory.\n"
            "- **Nutrient Intake**: Magnesium and Vitamin B1 help mitigate uterine muscle contractions. Try adding bananas, almonds, and dark chocolate to your meals.\n"
            "- **Clinical Caution**: If your pain is debilitating or prevents daily activities, please let Dr. Sarah Connor or Dr. Emily Vance know during your consultation, as it may warrant looking into endometriosis."
        )
        
    # 3. Nutrition, diet, food, meals
    elif re.search(r'(diet|nutrition|food|meal|eat|vitamin|deficiency|iron|b12|water)', query):
        response = (
            f"Let's look at your nutritional parameters. You are currently on a **{diet}** diet and drink **{water}L** of water daily.\n\n"
            "Here is your customized nutrition plan based on menstrual health guidelines:\n\n"
            "- **Menstrual Phase Support**: Depending on where you are in your cycle, focus on phase-specific nutrition. "
            "For example, during the Bleeding phase, focus on **Iron-rich foods** (lentils, spinach, seeds) paired with Vitamin C to offset blood loss. "
            "During the Luteal phase, add complex carbs to boost serotonin.\n"
            "- **Hydration target**: Boost your target water intake to **2.5 Liters** to support circulation and clear skin.\n"
            "- **Deficiencies**: If you experience persistent fatigue or cold hands, check if you're getting enough Iron, Vitamin D, and B12. "
            "You can log these in the Deficiency Detection Engine to get customized meal plates."
        )
        
    # 4. Period, cycle length, irregularity, fertility
    elif re.search(r'(period|cycle|ovulation|fertile|window|pregnant|conceive|irregular|date)', query):
        irr_status = "irregular" if cycle_info['irregular_detected'] else "regular"
        response = (
            f"Reviewing your cycle analytics: Your cycles are classified as generally **{irr_status}**. "
            f"Your next expected period starts on **{cycle_info['next_period_date']}**, with your **Ovulation Window** opening around **{cycle_info['ovulation_date']}**.\n\n"
            "Key physiological insights:\n"
            "- **Fertile Window**: Your peak fertility occurs from **{cycle_info['fertility_start']}** to **{cycle_info['fertility_end']}**. "
            "This is when tracking cervical mucus (wet, egg-white consistency) is highly useful.\n"
            "- **Irregular Cycles**: Cycle lengths between 21 and 35 days are normal. If you notice cycles exceeding 40 days or skipping months, "
            "it could indicate hormone variations (e.g. high thyroid metrics or insulin levels).\n"
            "- **Next Action**: Continue logging period start and end dates on the calendar page to train the digital twin predictor."
        )
        
    # 5. Default/General Health Query
    else:
        response = (
            f"Hello {name}! I am your HERBUDDY Health Companion. I analyze your profile and daily logs to support your wellness journey.\n\n"
            f"Currently, your **Smart Health Score is {db.find_one('users', {'_id': user_id}).get('health_score', 82)}/100**. "
            f"Your latest logged symptoms are: *{symptoms_str}*.\n\n"
            "You can ask me questions about:\n"
            "1. **Menstrual Health & Flow**: Predictions, irregular cycles, or tracking.\n"
            "2. **Hormonal Health & PCOS**: Symptoms, risks, and clinical evaluations.\n"
            "3. **Wellness & Pain**: Cramp relief, sleep hygiene, and managing stress.\n"
            "4. **Nutrition & Deficiencies**: Meal guides and vitamin plans.\n\n"
            "What health topic would you like to explore today?"
        )
        
    return context_prefix + response
