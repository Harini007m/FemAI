import datetime
import statistics

def parse_date(date_str):
    if not date_str:
        return None
    for fmt in ('%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%d %H:%M:%S'):
        try:
            return datetime.datetime.strptime(date_str.split('T')[0], '%Y-%m-%d').date()
        except ValueError:
            pass
    return None

def predict_cycles(period_records):
    """
    Given a list of menstrual period records (sorted by date ascending), 
    calculate average cycle duration, average bleeding duration, and predict:
    - Next period start date
    - Ovulation date
    - Fertility window
    - Irregular cycle detection flag
    """
    if not period_records:
        # Default predictions for average woman
        today = datetime.date.today()
        next_period = today + datetime.timedelta(days=14) # Mock baseline
        ovulation = next_period - datetime.timedelta(days=14)
        fertility_start = ovulation - datetime.timedelta(days=5)
        fertility_end = ovulation + datetime.timedelta(days=1)
        return {
            'avg_cycle_length': 28,
            'avg_period_length': 5,
            'next_period_date': next_period.isoformat(),
            'ovulation_date': ovulation.isoformat(),
            'fertility_start': fertility_start.isoformat(),
            'fertility_end': fertility_end.isoformat(),
            'irregular_detected': False,
            'message': "Please log at least 2 period dates for personalized AI predictions."
        }

    # Sort records chronologically
    records = sorted(period_records, key=lambda x: parse_date(x.get('start_date')) or datetime.date.min)
    
    # Calculate period lengths (bleeding days)
    period_lengths = []
    for r in records:
        start = parse_date(r.get('start_date'))
        end = parse_date(r.get('end_date'))
        if start and end:
            len_days = (end - start).days
            if 1 <= len_days <= 10:
                period_lengths.append(len_days)
                
    avg_period_len = round(statistics.mean(period_lengths)) if period_lengths else 5
    
    # Calculate cycle lengths (days between consecutive starts)
    cycle_lengths = []
    for i in range(len(records) - 1):
        curr_start = parse_date(records[i].get('start_date'))
        next_start = parse_date(records[i+1].get('start_date'))
        if curr_start and next_start:
            cycle_len = (next_start - curr_start).days
            if 15 <= cycle_len <= 45: # Filter unreasonable logs
                cycle_lengths.append(cycle_len)
                
    avg_cycle_len = round(statistics.mean(cycle_lengths)) if cycle_lengths else 28
    
    # Cycle irregularity flag
    irregular = False
    if len(cycle_lengths) >= 2:
        stdev = statistics.stdev(cycle_lengths)
        if stdev > 5.0: # Deviation of > 5 days indicates irregularity
            irregular = True
            
    # Predict next period start
    last_start = parse_date(records[-1].get('start_date'))
    if not last_start:
        last_start = datetime.date.today()
        
    next_period = last_start + datetime.timedelta(days=avg_cycle_len)
    
    # Ovulation calculation (typically 14 days before next period start)
    ovulation = next_period - datetime.timedelta(days=14)
    
    # Fertile window: 5 days before ovulation plus the day of ovulation
    fertility_start = ovulation - datetime.timedelta(days=5)
    fertility_end = ovulation + datetime.timedelta(days=1)
    
    return {
        'avg_cycle_length': avg_cycle_len,
        'avg_period_length': avg_period_len,
        'next_period_date': next_period.isoformat(),
        'ovulation_date': ovulation.isoformat(),
        'fertility_start': fertility_start.isoformat(),
        'fertility_end': fertility_end.isoformat(),
        'irregular_detected': irregular,
        'message': "Predictions generated using personalized menstrual history." if len(records) >= 2 else "Log another cycle to refine intelligence parameters."
    }

def calculate_health_score(user_profile, period_records, health_logs):
    """
    Calculate the proprietary Smart Health Score (0-100).
    Aggregates:
    - Cycle Health (25%)
    - Nutrition & Diet (25%)
    - Hydration Status (20%)
    - Sleep Quality (15%)
    - Mental Wellness & Stress (15%)
    """
    # 1. Cycle Health Score (default 85 if no logs)
    cycle_score = 85
    if period_records:
        pain_penalty = 0
        flow_penalty = 0
        
        # Take last 3 logs to average
        recent_records = sorted(period_records, key=lambda x: parse_date(x.get('start_date')) or datetime.date.min)[-3:]
        for r in recent_records:
            pain = r.get('pain_level', 'Mild') # Mild, Moderate, Severe
            if pain == 'Severe':
                pain_penalty += 20
            elif pain == 'Moderate':
                pain_penalty += 10
                
            flow = r.get('flow_intensity', 'Normal') # Light, Normal, Heavy
            if flow == 'Heavy':
                flow_penalty += 15
                
        avg_pain_penalty = pain_penalty / len(recent_records)
        avg_flow_penalty = flow_penalty / len(recent_records)
        
        # Calculate irregularity prediction
        pred = predict_cycles(period_records)
        irregular_penalty = 15 if pred['irregular_detected'] else 0
        
        cycle_score = max(30, 100 - avg_pain_penalty - avg_flow_penalty - irregular_penalty)

    # Latest lifestyle information
    lifestyle = user_profile.get('profile', {}).get('lifestyle_info', {})
    
    # 2. Nutrition Score (25%)
    # Evaluates diet type and average intake patterns
    diet = lifestyle.get('diet', 'Balanced')
    nutrition_score = 90 if diet in ('Balanced', 'High Protein') else 75
    
    # 3. Hydration Score (20%)
    # Target: 2.5L. Scaled accordingly.
    water_intake = float(lifestyle.get('water_intake', 2.0))
    hydration_score = min(100, int((water_intake / 2.5) * 100))
    
    # 4. Sleep Score (15%)
    # Target: 7.5 hours
    sleep_hours = float(lifestyle.get('sleep_hours', 7.5))
    if 7.0 <= sleep_hours <= 9.0:
        sleep_score = 100
    elif 6.0 <= sleep_hours < 7.0 or 9.0 < sleep_hours <= 10.0:
        sleep_score = 80
    else:
        sleep_score = 50
        
    # 5. Wellness Score (15%)
    stress = lifestyle.get('stress_level', 'Medium')
    if stress == 'Low':
        wellness_score = 100
    elif stress == 'Medium':
        wellness_score = 80
    else:
        wellness_score = 50
        
    # If daily logs exist, refine sleep/wellness/hydration scores using latest entries
    if health_logs:
        # Sort logs descending
        latest_logs = sorted(health_logs, key=lambda x: x.get('date', '') or '')[-3:]
        if latest_logs:
            sleep_avg = sum(float(l.get('sleep_hours', 7.5)) for l in latest_logs) / len(latest_logs)
            water_avg = sum(float(l.get('water_intake', 2.0)) for l in latest_logs) / len(latest_logs)
            
            # Recalculate based on recent logs
            hydration_score = min(100, int((water_avg / 2.5) * 100))
            if 7.0 <= sleep_avg <= 9.0:
                sleep_score = 100
            elif 6.0 <= sleep_avg < 7.0 or 9.0 < sleep_avg <= 10.0:
                sleep_score = 82
            else:
                sleep_score = 55
                
            # Stress scoring from logs
            stress_avg = sum(100 if l.get('stress_level') == 'Low' else 75 if l.get('stress_level') == 'Medium' else 40 for l in latest_logs) / len(latest_logs)
            wellness_score = stress_avg

    # Aggregate total score
    total_score = round(
        (0.25 * cycle_score) +
        (0.25 * nutrition_score) +
        (0.20 * hydration_score) +
        (0.15 * sleep_score) +
        (0.15 * wellness_score)
    )
    
    return {
        'total_score': total_score,
        'breakdown': {
            'cycle_health': int(cycle_score),
            'nutrition': int(nutrition_score),
            'hydration': int(hydration_score),
            'sleep': int(sleep_score),
            'wellness': int(wellness_score)
        }
    }
