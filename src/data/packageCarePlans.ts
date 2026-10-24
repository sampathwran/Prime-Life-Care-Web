export interface DefaultCarePlan {
  bpFrequency: 'none' | '1x_daily' | '2x_daily' | '4x_daily' | string;
  sugarFrequency: 'none' | 'fasting' | 'fasting_and_pp' | 'random' | string;
  bedTurningRequired: boolean;
  medicationReminders: boolean;
  catheterCare?: boolean;
  woundDressing?: boolean;
  carePlanTasks: string[];
}

export const allStandardCareTasks = [
  'BP & Pulse Monitoring',
  'Blood Glucose (Sugar) Test',
  '2-Hour Bed Repositioning (Bedsore Care)',
  'Medication Reminders & Administration',
  'Catheter & Urine Bag Care',
  'Wound Dressing & Aseptic Care',
  'Ryles Tube / Feeding Tube Assistance',
  'Sponging, Bed Bath & Oral Hygiene',
  'Passive Limb Physiotherapy & Calming',
  'Fluid Intake & Output (I/O) Monitoring',
  'Fall Prevention & Assisted Walking',
  'Meal Preparation & Feeding Assistance',
  'Playtime & Safe Activity Supervision',
  'Nap & Sleep Routine Care',
  'Infant Feeding & Burping Routine',
  'Umbilical Cord & Baby Bath Care'
];

export function getDefaultCarePlanForService(serviceId: string, category?: string): DefaultCarePlan {
  const sId = (serviceId || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // 1. Post-Surgery & Surgical Rehabilitation
  if (sId.includes('surgery') || sId.includes('post_surgery') || cat.includes('surgery')) {
    return {
      bpFrequency: '4x_daily',
      sugarFrequency: 'fasting_and_pp',
      bedTurningRequired: true,
      medicationReminders: true,
      woundDressing: true,
      catheterCare: true,
      carePlanTasks: [
        'BP & Pulse Monitoring',
        'Wound Dressing & Aseptic Care',
        'Medication Reminders & Administration',
        'Catheter & Urine Bag Care',
        'Sponging, Bed Bath & Oral Hygiene',
        'Fluid Intake & Output (I/O) Monitoring'
      ]
    };
  }

  // 2. Bedridden, Paralysis, Stroke & Palliative Care
  if (sId.includes('bedridden') || sId.includes('palliative') || sId.includes('paralysis') || cat.includes('bedridden')) {
    return {
      bpFrequency: '2x_daily',
      sugarFrequency: 'fasting',
      bedTurningRequired: true,
      medicationReminders: true,
      catheterCare: true,
      woundDressing: false,
      carePlanTasks: [
        '2-Hour Bed Repositioning (Bedsore Care)',
        'Catheter & Urine Bag Care',
        'Ryles Tube / Feeding Tube Assistance',
        'Sponging, Bed Bath & Oral Hygiene',
        'Passive Limb Physiotherapy & Calming',
        'BP & Pulse Monitoring',
        'Medication Reminders & Administration'
      ]
    };
  }

  // 3. Dementia & Alzheimer's Care
  if (sId.includes('dementia') || sId.includes('alzheimer') || cat.includes('dementia')) {
    return {
      bpFrequency: '2x_daily',
      sugarFrequency: 'random',
      bedTurningRequired: false,
      medicationReminders: true,
      carePlanTasks: [
        'Medication Reminders & Administration',
        'BP & Pulse Monitoring',
        'Sponging, Bed Bath & Oral Hygiene',
        'Passive Limb Physiotherapy & Calming',
        'Fall Prevention & Assisted Walking'
      ]
    };
  }

  // 4. Child & Toddler Care / Babysitting
  if (sId.includes('child') || sId.includes('toddler')) {
    return {
      bpFrequency: 'none',
      sugarFrequency: 'none',
      bedTurningRequired: false,
      medicationReminders: false,
      carePlanTasks: [
        'Meal Preparation & Feeding Assistance',
        'Oral Hygiene & Bathing Assistance',
        'Playtime & Safe Activity Supervision',
        'Nap & Sleep Routine Care'
      ]
    };
  }

  // 5. Newborn Mother & Baby Care
  if (sId.includes('newborn') || sId.includes('baby') || sId.includes('mother')) {
    return {
      bpFrequency: '1x_daily',
      sugarFrequency: 'none',
      bedTurningRequired: false,
      medicationReminders: false,
      carePlanTasks: [
        'Infant Feeding & Burping Routine',
        'Umbilical Cord & Baby Bath Care',
        'Sponging, Bed Bath & Oral Hygiene',
        'Nap & Sleep Routine Care',
        'BP & Pulse Monitoring'
      ]
    };
  }

  // 6. Default General Elderly Care (12h Day, 12h Night, 24h Full Day)
  return {
    bpFrequency: '2x_daily',
    sugarFrequency: 'fasting',
    bedTurningRequired: false,
    medicationReminders: true,
    carePlanTasks: [
      'BP & Pulse Monitoring',
      'Blood Glucose (Sugar) Test',
      'Medication Reminders & Administration',
      'Sponging, Bed Bath & Oral Hygiene',
      'Fall Prevention & Assisted Walking'
    ]
  };
}
