import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(user_profile, periods, symptoms_logs, predictions, file_path):
    """
    Generate a formatted medical health summary report for the user.
    """
    doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    styles = getSampleStyleSheet()
    
    # Custom colors
    primary_color = colors.HexColor('#EC4899') # Pink
    secondary_color = colors.HexColor('#8B5CF6') # Purple
    dark_gray = colors.HexColor('#374151')
    light_pink = colors.HexColor('#FDF2F8')
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=primary_color,
        spaceAfter=15,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=secondary_color,
        spaceAfter=25,
        alignment=1 # Center
    )
    
    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=8,
        borderPadding=2
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=dark_gray,
        leading=14
    )
    
    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    # 1. Header Section
    story.append(Paragraph("HERBUDDY 2.0 HEALTH INTELLIGENCE SUMMARY", title_style))
    story.append(Paragraph(f"AI-Powered Women's Health Digital Twin Platform — Generated on {datetime_str()}", subtitle_style))
    story.append(Spacer(1, 10))
    
    # 2. Patient Profile Table
    story.append(Paragraph("Patient Profile Details", section_heading))
    profile = user_profile.get('profile', {})
    
    profile_data = [
        [Paragraph("Name:", bold_body_style), Paragraph(user_profile.get('name', 'N/A'), body_style),
         Paragraph("Age:", bold_body_style), Paragraph(str(profile.get('age', 'N/A')), body_style)],
        [Paragraph("Height (cm):", bold_body_style), Paragraph(str(profile.get('height', 'N/A')), body_style),
         Paragraph("Weight (kg):", bold_body_style), Paragraph(str(profile.get('weight', 'N/A')), body_style)],
        [Paragraph("BMI Rating:", bold_body_style), Paragraph(str(profile.get('bmi', 'N/A')), body_style),
         Paragraph("Blood Group:", bold_body_style), Paragraph(profile.get('blood_group', 'N/A'), body_style)],
        [Paragraph("Medical History:", bold_body_style), Paragraph(profile.get('medical_history', 'None reported'), body_style),
         Paragraph("Family History:", bold_body_style), Paragraph(profile.get('family_history', 'None reported'), body_style)]
    ]
    
    t1 = Table(profile_data, colWidths=[100, 160, 100, 160])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_pink),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F472B6')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t1)
    story.append(Spacer(1, 15))
    
    # 3. Smart Health Score Section
    story.append(Paragraph("Smart Health Score™ Analysis", section_heading))
    h_score = user_profile.get('health_score', 82)
    h_breakdown = user_profile.get('health_score_breakdown', {
        'cycle_health': 85, 'nutrition': 80, 'hydration': 75, 'sleep': 80, 'wellness': 80
    })
    
    score_desc = f"Your overall proprietary HERBUDDY Health Score is <b>{h_score}/100</b>."
    story.append(Paragraph(score_desc, body_style))
    story.append(Spacer(1, 8))
    
    score_data = [
        [Paragraph("Metric", bold_body_style), Paragraph("Score (0-100)", bold_body_style), Paragraph("Evaluation Status", bold_body_style)],
        [Paragraph("Menstrual Cycle Health", body_style), Paragraph(str(h_breakdown.get('cycle_health')), body_style), Paragraph("Good / Regular" if h_breakdown.get('cycle_health', 80) >= 80 else "Requires Attention", body_style)],
        [Paragraph("Nutrition & Diet Plan", body_style), Paragraph(str(h_breakdown.get('nutrition')), body_style), Paragraph("Optimal" if h_breakdown.get('nutrition', 80) >= 80 else "Sub-optimal", body_style)],
        [Paragraph("Hydration Levels", body_style), Paragraph(str(h_breakdown.get('hydration')), body_style), Paragraph("Optimal" if h_breakdown.get('hydration', 75) >= 80 else "Needs hydration boost", body_style)],
        [Paragraph("Sleep Hygiene Quality", body_style), Paragraph(str(h_breakdown.get('sleep')), body_style), Paragraph("Good" if h_breakdown.get('sleep', 80) >= 80 else "Slight Sleep Debt", body_style)],
        [Paragraph("Mental Stress Management", body_style), Paragraph(str(h_breakdown.get('wellness')), body_style), Paragraph("Balanced" if h_breakdown.get('wellness', 80) >= 80 else "Elevated Cortisol Risk", body_style)]
    ]
    t2 = Table(score_data, colWidths=[200, 120, 200])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 15))
    
    # 4. Diagnostics & Predictions
    story.append(Paragraph("AI Diagnostics & Risk Predictions", section_heading))
    pcos_risk = predictions.get('pcos', {}).get('risk_level', 'Low Risk')
    pcos_pct = predictions.get('pcos', {}).get('risk_percentage', 10)
    uterine_score = predictions.get('uterine', {}).get('risk_score', 0)
    uterine_symptoms = ", ".join(predictions.get('uterine', {}).get('risks_detected', ["None"]))
    
    diag_data = [
        [Paragraph("Predictive Module", bold_body_style), Paragraph("Score / Level", bold_body_style), Paragraph("Findings & Insights", bold_body_style)],
        [Paragraph("PCOS Prediction Engine", body_style), Paragraph(f"{pcos_risk} ({pcos_pct}%)", body_style), Paragraph(predictions.get('pcos', {}).get('explanation', 'No major symptoms detected.'), body_style)],
        [Paragraph("Uterine Health Analysis", body_style), Paragraph(f"Score: {uterine_score}/100", body_style), Paragraph(f"Flags detected: {uterine_symptoms}", body_style)],
        [Paragraph("Deficiency Defect Indicators", body_style), Paragraph("Calculated Risk", body_style), Paragraph("Iron: {}, Vit D: {}, Vit B12: {}".format(
            predictions.get('deficiencies', {}).get('iron', {}).get('risk', 'Low'),
            predictions.get('deficiencies', {}).get('vitamin_d', {}).get('risk', 'Low'),
            predictions.get('deficiencies', {}).get('vitamin_b12', {}).get('risk', 'Low')
        ), body_style)]
    ]
    t3 = Table(diag_data, colWidths=[150, 100, 270])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t3)
    story.append(Spacer(1, 15))
    
    # 5. Clinical Recommendations
    story.append(Paragraph("Preventive Health Recommendations", section_heading))
    pcos_actions = predictions.get('pcos', {}).get('recommended_actions', [])
    uterine_actions = predictions.get('uterine', {}).get('recommendations', [])
    
    actions_list = pcos_actions + uterine_actions
    if not actions_list:
        actions_list = [
            "Maintain regular menstrual cycle logging.",
            "Maintain balanced water intake of 2.5L+.",
            "Schedule regular yearly physical exam screenings."
        ]
        
    # Pick top 5 actions to keep document size clean
    for idx, act in enumerate(actions_list[:6]):
        story.append(Paragraph(f"{idx+1}. {act}", body_style))
        story.append(Spacer(1, 3))
        
    doc.build(story)

def datetime_str():
    import datetime
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
