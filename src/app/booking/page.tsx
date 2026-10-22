'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { ServiceItem, BookingSubmission, StaffTierId, SavedPatient } from '@/types';
import { districtList, initialServices } from '@/data/services';
import { staffTiers } from '@/data/staffTiers';
import { saveBookingToFirestore } from '@/lib/firestoreService';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Heart,
  Award,
  Sparkles,
  MapPin,
  Check,
  ChevronRight,
  MessageCircle,
  LogIn,
  AlertCircle,
  HelpCircle,
  Building2,
  Stethoscope,
  Activity,
  Layers,
  FileCheck2,
  Loader2,
  Home
} from 'lucide-react';

function BookingFormInner() {
  const { language, setLanguage } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query params pre-fill
  const paramService = searchParams.get('service');
  const paramTier = searchParams.get('tier') as StaffTierId | null;
  const paramPatient = searchParams.get('patient');
  const paramAge = searchParams.get('patientAge');
  const paramGender = searchParams.get('patientGender') as 'male' | 'female' | null;
  const paramConditions = searchParams.get('patientConditions');
  const paramMobility = searchParams.get('patientMobility') as 'independent' | 'partial_assistance' | 'bedridden' | 'wheelchair' | null;

  // Step state: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Service & Tier
  const [activeServiceId, setActiveServiceId] = useState<string>(paramService || initialServices[0].id);
  const [activeTierId, setActiveTierId] = useState<StaffTierId>(paramTier || 'nvq_4_caregiver');

  // Step 2: Patient Profile
  const [patientName, setPatientName] = useState(paramPatient || '');
  const [patientAge, setPatientAge] = useState<number | ''>(paramAge ? Number(paramAge) : 75);
  const [patientGender, setPatientGender] = useState<'male' | 'female'>(paramGender || 'female');
  const [mobilityLevel, setMobilityLevel] = useState<'independent' | 'partial_assistance' | 'bedridden' | 'wheelchair'>(
    paramMobility || 'partial_assistance'
  );
  const [medicalConditions, setMedicalConditions] = useState(paramConditions || '');

  // Step 3: Location & Schedule
  const [district, setDistrict] = useState(user?.district || districtList[0]);
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.address || '');
  const [shiftType, setShiftType] = useState<'12h_day' | '12h_night' | '24h_full'>('12h_day');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [specialNotes, setSpecialNotes] = useState('');

  // Contact Info
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSubmission | null>(null);

  // Sync profile details if logged in
  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.name);
      if (!contactPhone) setContactPhone(user.phone);
      if (user.address && !address) setAddress(user.address);
      if (user.city && !city) setCity(user.city);
      if (user.district) setDistrict(user.district);
    }
  }, [user]);

  // Set default start date to tomorrow
  useEffect(() => {
    if (!startDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [startDate]);

  // Trilingual Text Content
  const t = {
    si: {
      pageTitle: 'සාත්තු සේවකයෙකු වෙන්කරවා ගැනීම',
      pageSub: 'මෙම කෙටි පෝරමය සම්පූර්ණ කරන්න. අපගේ සත්කාරක සම්බන්ධීකාරක විනාඩි 15ක් ඇතුළත ඔබව අමතා සියලු විස්තර තහවුරු කරනු ඇත.',
      badge15Min: 'විනාඩි 15 ප්‍රතිචාර සහතිකය',
      badgeCertified: 'NVQ-4 / SLMC සහතිකලත් කාර්ය මණ්ඩලය',
      badgeZeroDeposit: 'කල්තියා මුදල් අය කිරීමක් නොමැත',
      badgeIslandwide: 'දිවයින පුරා දිස්ත්‍රික්ක 25ම ආවරණය',
      closeBtn: 'මුල් පිටුවට (Home)',
      home: 'මුල් පිටුව',
      step1: '1. සේවාව සහ සුදුසුකම්',
      step2: '2. රෝගියාගේ තොරතුරු',
      step3: '3. දිනය සහ ලිපිනය',
      step4: '4. සාරාංශය සහ තහවුරු කිරීම',
      step5: '5. සාර්ථකයි!',
      
      // Step 1
      selectServiceTitle: '1. සාත්තු සේවා පැකේජය තෝරන්න',
      selectTierTitle: '2. කාර්යමණ්ඩල සුදුසුකම් මට්ටම තෝරන්න',
      perDay: '/ දිනකට',
      recommendedBadge: 'වඩාත් ජනප්‍රිය',

      // Step 2
      patientDetailsTitle: 'රෝගියාගේ හෝ වැඩිහිටියාගේ තොරතුරු',
      patientDetailsSub: 'සුදුසුම සාත්තු සේවිකාව තෝරාගැනීම සඳහා මෙම තොරතුරු ඉතා වැදගත් වේ.',
      savedFamilyQuickSelect: 'ඔබගේ Profile එකේ සුරැකි පවුලේ සාමාජිකයන් (1-Click Fill):',
      patientNameLabel: 'රෝගියාගේ සම්පූර්ණ නම',
      patientNamePlaceholder: 'උදා: කරුණාරත්න සිල්වා',
      patientAgeLabel: 'වයස (අවුරුදු)',
      genderLabel: 'ස්ත්‍රී / පුරුෂ භාවය',
      genderMale: 'පුරුෂ (Male)',
      genderFemale: 'ස්ත්‍රී (Female)',
      mobilityLabel: 'ඇවිදීමේ සහ චලන හැකියාව (Mobility Status)',
      mobIndependent: 'තනිවම ඇවිදිය හැක',
      mobPartial: 'ඇවිදීමට සහාය අවශ්‍යයි',
      mobWheelchair: 'රෝද පුටුවක සිටී (Wheelchair)',
      mobBedridden: 'සම්පූර්ණයෙන්ම ඇඳ විවේකයේ (Bedridden)',
      conditionsLabel: 'විශේෂ රෝගී තත්ත්වයන් සහ වෛද්‍ය ඉතිහාසය',
      conditionsPlaceholder: 'උදා: දියවැඩියාව, ආඝාතය (Stroke), මතකය අඩුවීම (Dementia), අධි රුධිර පීඩනය...',

      // Step 3
      scheduleTitle: 'සේවාව අවශ්‍ය ප්‍රදේශය සහ දින වකවානු',
      scheduleSub: 'සාත්තු සේවකයා නිවසට හෝ රෝහලට ළඟා වීම සඳහා ලිපිනය ඇතුළත් කරන්න.',
      districtLabel: 'දිස්ත්‍රික්කය (District)',
      cityLabel: 'නගරය / ප්‍රදේශය (City / Town)',
      cityPlaceholder: 'උදා: නුගේගොඩ, මහරගම, කිරිබත්ගොඩ',
      addressLabel: 'සම්පූර්ණ නිවසේ ලිපිනය සහ ළඟම හඳුනාගැනීමේ සලකුණු',
      addressPlaceholder: 'අංක 45/2, පන්සල පාර...',
      shiftLabel: 'සේවා මුරය (Shift Type)',
      shiftDay: 'දිවා මුරය (12h Day - 7 AM to 7 PM)',
      shiftNight: 'රාත්‍රී මුරය (12h Night - 7 PM to 7 AM)',
      shiftFull: 'පූර්ණ පැය 24 සත්කාරය (24h Full Live-in)',
      startDateLabel: 'සේවාව ආරම්භ කළ යුතු දිනය',
      durationLabel: 'සේවාව අවශ්‍ය දින ගණන (Duration)',
      days7: 'දින 7',
      days14: 'දින 14 (සති 2)',
      days30: 'දින 30 (මාසයයි)',
      specialNotesLabel: 'ආහාර, ආගමික හෝ භාෂාමය විශේෂ උපදෙස් (විකල්ප)',
      specialNotesPlaceholder: 'උදා: නිර්මාංශ ආහාර පමණි, සිංහල කතා කරන සේවිකාවක්...',
      contactTitle: 'සම්බන්ධීකාරක ඇමතුම ලබාගන්නා ඔබගේ තොරතුරු',
      contactNameLabel: 'ඔබගේ නම (Contact Person Name)',
      contactPhoneLabel: 'දුරකථන / WhatsApp අංකය (15 mins ඇතුළත අප අමතන අංකය)',

      // Step 4
      reviewTitle: 'වෙන්කිරීමේ සාරාංශය සහ ගාස්තු ගණනය කිරීම',
      reviewSub: 'කරුණාකර සියලු විස්තර නිවැරදිදැයි පරීක්ෂා කර Booking එක තහවුරු කරන්න.',
      selectedPackage: 'තෝරාගත් සාත්තු සේවාව',
      selectedTier: 'කාර්යමණ්ඩල සුදුසුකම',
      patientSummary: 'රෝගියාගේ තොරතුරු',
      locationSummary: 'සේවාව සපයන ස්ථානය',
      dutyScheduleSummary: 'රාජකාරි කාලසීමාව',
      estimatedInvestment: 'ඇස්තමේන්තුගත මුළු මුදල (Estimate)',
      advanceNoticeTitle: 'අත්තිකාරම් ගෙවීමක් අවශ්‍ය නැත (LKR 0.00)',
      advanceNoticeDesc: 'අද දින කිසිදු මුදලක් ගෙවීමට අවශ්‍ය නොවේ. අපගේ ජ්‍යෙෂ්ඨ සම්බන්ධීකාරකවරයා විනාඩි 15ක් ඇතුළත ඔබව අමතා අවශ්‍යතාව තහවුරු කර සේවකයා පැමිණි පසු ගෙවීම් කළ හැක.',
      coordinatorPledge: 'අපගේ සම්බන්ධීකාරක නිලධාරියා විනාඩි 15ක් ඇතුළත ඔබව අමතනු ඇත.',
      btnBack: 'පෙර පියවර',
      btnNext: 'මීළඟ පියවර',
      btnConfirm: 'Booking එක තහවුරු කරන්න (Confirm Booking)',

      // Step 5
      successTitle: 'ඔබගේ සාත්තු සේවා ඉල්ලීම සාර්ථකව ලැබිණි!',
      successSub: 'Prime Life Care කෙරෙහි තැබූ විශ්වාසයට ස්තූතියි. අපගේ ජ්‍යෙෂ්ඨ හෙද සම්බන්ධීකාරක නිලධාරියෙකු විනාඩි 15ක් ඇතුළත ඔබගේ දුරකථනයට අමතනු ඇත.',
      bookingCodeLabel: 'ඔබගේ Booking කේතය:',
      coordinatorCallNotice: 'සාත්තු සේවකයාගේ පැමිණීම සහ වේලාවන් තහවුරු කිරීමට අපගේ නිලධාරියා ඔබ අමතනු ඇත.',
      btnViewProfile: 'මගේ Profile එකේ බලන්න',
      btnWhatsApp: 'සම්බන්ධීකාරක සමඟ WhatsApp කතාබහ',
      btnBackHome: 'මුල් පිටුවට යන්න'
    },
    en: {
      pageTitle: 'Request a Caregiver',
      pageSub: 'Complete this quick form and our care coordinator will call you within 15 minutes to confirm.',
      badge15Min: '15-Min Response Guarantee',
      badgeCertified: 'NVQ-4 / SLMC Certified Staff',
      badgeZeroDeposit: 'Zero Upfront Deposit Required',
      badgeIslandwide: 'Islandwide Coverage Across 25 Districts',
      closeBtn: 'Back to Home',
      home: 'Home',
      step1: '1. Service & Staff Tier',
      step2: '2. Patient Details',
      step3: '3. Schedule & Address',
      step4: '4. Review & Confirm',
      step5: '5. Confirmed!',

      // Step 1
      selectServiceTitle: '1. Select Care Package',
      selectTierTitle: '2. Select Staff Qualification Tier',
      perDay: '/ day',
      recommendedBadge: 'Most Popular',

      // Step 2
      patientDetailsTitle: 'Patient or Elder Information',
      patientDetailsSub: 'Essential details to match the most capable and compassionate caregiver for your loved one.',
      savedFamilyQuickSelect: 'Saved Family Members in your Profile (1-Click Fill):',
      patientNameLabel: "Patient's Full Name",
      patientNamePlaceholder: 'e.g. Karunaratne Silva',
      patientAgeLabel: 'Age (Years)',
      genderLabel: 'Gender',
      genderMale: 'Male',
      genderFemale: 'Female',
      mobilityLabel: 'Mobility & Physical Status',
      mobIndependent: 'Walks independently',
      mobPartial: 'Requires assistance to walk',
      mobWheelchair: 'Wheelchair bound',
      mobBedridden: 'Bedridden',
      conditionsLabel: 'Medical Conditions & Clinical History',
      conditionsPlaceholder: 'e.g. Diabetes, Stroke recovery, Dementia, Hypertension...',

      // Step 3
      scheduleTitle: 'Location & Duty Schedule',
      scheduleSub: 'Specify where and when you need the caregiver dispatched.',
      districtLabel: 'District',
      cityLabel: 'City / Town',
      cityPlaceholder: 'e.g. Nugegoda, Maharagama, Kiribathgoda',
      addressLabel: 'Full House Address & Landmarks',
      addressPlaceholder: 'No 45/2, Temple Road...',
      shiftLabel: 'Shift Type',
      shiftDay: '12h Day Shift (07:00 AM - 07:00 PM)',
      shiftNight: '12h Night Shift (07:00 PM - 07:00 AM)',
      shiftFull: '24h Full Live-In Care (Day & Night)',
      startDateLabel: 'Desired Start Date',
      durationLabel: 'Duration (Days)',
      days7: '7 Days',
      days14: '14 Days (2 Weeks)',
      days30: '30 Days (1 Month)',
      specialNotesLabel: 'Special Dietary, Religious or Language Instructions (Optional)',
      specialNotesPlaceholder: 'e.g. Vegetarian diet only, Sinhala or Tamil speaking preferred...',
      contactTitle: 'Family Contact Information',
      contactNameLabel: 'Your Name (Family Contact)',
      contactPhoneLabel: 'Phone / WhatsApp Number (Our coordinator will call this number)',

      // Step 4
      reviewTitle: 'Summary & Cost Breakdown',
      reviewSub: 'Please verify all booking details before confirming your care dispatch request.',
      selectedPackage: 'Care Service Package',
      selectedTier: 'Staff Qualification Tier',
      patientSummary: 'Patient Information',
      locationSummary: 'Service Location',
      dutyScheduleSummary: 'Duty Schedule & Duration',
      estimatedInvestment: 'Estimated Total Investment',
      advanceNoticeTitle: 'No Upfront Payment Required (LKR 0.00 Today)',
      advanceNoticeDesc: 'Zero advance payment required today. Our clinical coordinator will phone you within 15 minutes to confirm duties, and payment is settled after service commences.',
      coordinatorPledge: 'Our duty coordinator will call you within 15 minutes.',
      btnBack: 'Back',
      btnNext: 'Next Step',
      btnConfirm: 'Confirm & Request Caregiver',

      // Step 5
      successTitle: 'Booking Request Received!',
      successSub: 'Thank you for placing your trust in Prime Life Care. Our care coordinator will call you within 15 minutes to confirm your caregiver dispatch.',
      bookingCodeLabel: 'Your Official Booking Code:',
      coordinatorCallNotice: 'Our coordinator will call you to confirm caregiver arrival time and duty requirements.',
      btnViewProfile: 'View in My Profile',
      btnWhatsApp: 'Chat with Coordinator on WhatsApp',
      btnBackHome: 'Return to Home'
    },
    ta: {
      pageTitle: 'பராமரிப்பாளரை முன்பதிவு செய்க',
      pageSub: 'இந்த படிவத்தை பூர்த்தி செய்யுங்கள். எங்கள் ஒருங்கிணைப்பாளர் 15 நிமிடங்களில் உங்களை தொடர்புகொள்வார்.',
      badge15Min: '15 நிமிட பதில் உத்தரவாதம்',
      badgeCertified: 'NVQ-4 / SLMC சான்றளிக்கப்பட்ட பணியாளர்கள்',
      badgeZeroDeposit: 'முன்பணம் தேவையில்லை',
      badgeIslandwide: '25 மாவட்டங்களிலும் தீவு தழுவிய சேவை',
      closeBtn: 'முகப்புக்கு (Home)',
      home: 'முகப்பு',
      step1: '1. சேவை மற்றும் தகுதி',
      step2: '2. நோயாளி விவரங்கள்',
      step3: '3. இடம் மற்றும் நேரம்',
      step4: '4. சுருக்கம் மற்றும் உறுதி',
      step5: '5. முடிந்தது!',

      // Step 1
      selectServiceTitle: '1. பராமரிப்பு சேவையை தேர்வு செய்க',
      selectTierTitle: '2. பணியாளர் தகுதி நிலையை தேர்வு செய்க',
      perDay: '/ ஒரு நாளைக்கு',
      recommendedBadge: 'பிரபலமானது',

      // Step 2
      patientDetailsTitle: 'நோயாளி அல்லது முதியவர் விவரங்கள்',
      patientDetailsSub: 'சரியான பராமரிப்பாளரை தேர்வு செய்ய இந்த தகவல்கள் உதவுகின்றன.',
      savedFamilyQuickSelect: 'உங்கள் சுயவிவரத்தில் சேமிக்கப்பட்ட குடும்பத்தினர் (1-Click Fill):',
      patientNameLabel: 'நோயாளியின் முழுப் பெயர்',
      patientNamePlaceholder: 'எ.கா: கருணாரத்ன சில்வா',
      patientAgeLabel: 'வயது',
      genderLabel: 'பாலினம்',
      genderMale: 'ஆண் (Male)',
      genderFemale: 'பெண் (Female)',
      mobilityLabel: 'இயக்க நிலை (Mobility)',
      mobIndependent: 'சுயமாக நடப்பவர்',
      mobPartial: 'நடக்க உதவி தேவை',
      mobWheelchair: 'சக்கர நாற்காலியில் உள்ளவர்',
      mobBedridden: 'படுக்கையில் உள்ளவர் (Bedridden)',
      conditionsLabel: 'மருத்துவ நிலை மற்றும் வரலாறு',
      conditionsPlaceholder: 'எ.கா: நீரிழிவு, பக்கவாதம், உயர் இரத்த அழுத்தம்...',

      // Step 3
      scheduleTitle: 'சேவை தேவைப்படும் இடம் மற்றும் நேரம்',
      scheduleSub: 'பராமரிப்பாளர் வர வேண்டிய முகவரியை வழங்கவும்.',
      districtLabel: 'மாவட்டம் (District)',
      cityLabel: 'நகரம் (City / Town)',
      cityPlaceholder: 'எ.கா: நுகேகொடை, மகரகம',
      addressLabel: 'முழுமையான வீட்டு முகவரி',
      addressPlaceholder: 'எண் 45/2, கோவில் வீதி...',
      shiftLabel: 'பணி நேரம் (Shift Type)',
      shiftDay: 'பகல்நேர பணி (12h Day - 7 AM to 7 PM)',
      shiftNight: 'இரவுநேர பணி (12h Night - 7 PM to 7 AM)',
      shiftFull: 'முழுமையான 24 மணி நேர தங்கி பணி (24h Full Live-in)',
      startDateLabel: 'சேவை தொடங்க வேண்டிய தேதி',
      durationLabel: 'தேவையான நாட்கள் (Duration)',
      days7: '7 நாட்கள்',
      days14: '14 நாட்கள் (2 வாரங்கள்)',
      days30: '30 நாட்கள் (1 மாதம்)',
      specialNotesLabel: 'உணவு அல்லது பிற சிறப்பு வழிமுறைகள்',
      specialNotesPlaceholder: 'எ.கா: சைவ உணவு மட்டும்...',
      contactTitle: 'குடும்ப தொடர்பாளர் விவரங்கள்',
      contactNameLabel: 'உங்கள் பெயர்',
      contactPhoneLabel: 'தொலைபேசி / WhatsApp எண் (15 நிமிடங்களில் அழைப்போம்)',

      // Step 4
      reviewTitle: 'சுருக்கம் மற்றும் கட்டண விவரம்',
      reviewSub: 'முன்பதிவை உறுதி செய்வதற்கு முன் அனைத்து விவரங்களையும் சரிபார்க்கவும்.',
      selectedPackage: 'தேர்ந்தெடுக்கப்பட்ட சேவை',
      selectedTier: 'பணியாளர் தகுதி',
      patientSummary: 'நோயாளி விவரங்கள்',
      locationSummary: 'சேவை இடம்',
      dutyScheduleSummary: 'பணி நேரம் & நாட்கள்',
      estimatedInvestment: 'மதிப்பிடப்பட்ட மொத்த தொகை',
      advanceNoticeTitle: 'முன்பணம் செலுத்த வேண்டியதில்லை (LKR 0.00)',
      advanceNoticeDesc: 'இன்று பணம் செலுத்த வேண்டியதில்லை. எங்கள் ஒருங்கிணைப்பாளர் 15 நிமிடங்களில் உங்களை தொடர்புகொண்டு உறுதிப்படுத்துவார்.',
      coordinatorPledge: 'எங்கள் ஒருங்கிணைப்பாளர் 15 நிமிடங்களில் உங்களை அழைப்பார்.',
      btnBack: 'பின்செல்',
      btnNext: 'அடுத்த படி',
      btnConfirm: 'முன்பதிவை உறுதி செய்க',

      // Step 5
      successTitle: 'முன்பதிவு கோரிக்கை பெறப்பட்டது!',
      successSub: 'எங்கள் மீதான நம்பிக்கைக்கு நன்றி! எங்கள் ஒருங்கிணைப்பாளர் 15 நிமிடங்களில் உங்களை தொடர்புகொள்வார்.',
      bookingCodeLabel: 'உங்கள் பதிவு குறியீடு:',
      coordinatorCallNotice: 'பராமரிப்பாளர் நியமனத்தை உறுதி செய்ய எங்கள் ஒருங்கிணைப்பாளர் உங்களை அழைப்பார்.',
      btnViewProfile: 'சுயவிவரத்தில் காண்க',
      btnWhatsApp: 'WhatsApp இல் ஒருங்கிணைப்பாளருடன் பேச',
      btnBackHome: 'முகப்புக்கு திரும்புக'
    }
  }[language];

  const currentService = initialServices.find((s) => s.id === activeServiceId) || initialServices[0];
  const currentTier = staffTiers.find((t) => t.id === activeTierId) || staffTiers[2];
  const dailyRate = currentTier.dailyRateLKR;
  const totalCost = dailyRate * (Number(durationDays) || 7);

  // Quick fill from saved patient
  const handleSelectSavedPatient = (pat: SavedPatient) => {
    setPatientName(pat.name);
    setPatientAge(pat.age);
    setPatientGender(pat.gender);
    if (pat.conditions) setMedicalConditions(pat.conditions);
    if (pat.mobility) {
      const mob = pat.mobility.toLowerCase();
      if (mob.includes('bedridden')) setMobilityLevel('bedridden');
      else if (mob.includes('wheelchair')) setMobilityLevel('wheelchair');
      else if (mob.includes('partial') || mob.includes('assistance')) setMobilityLevel('partial_assistance');
      else setMobilityLevel('independent');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      if (!patientName.trim()) {
        alert(language === 'si' ? 'කරුණාකර රෝගියාගේ නම ඇතුළත් කරන්න' : 'Please enter patient full name');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 3) {
      if (!contactPhone.trim()) {
        alert(language === 'si' ? 'කරුණාකර ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න' : 'Please enter your phone number');
        return;
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 4) {
      handleSubmitBooking();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `PLC-2026-${randomSuffix}`;

    const newBooking: BookingSubmission = {
      id: `b_${Date.now()}`,
      userId: user?.id,
      bookingCode: code,
      serviceId: currentService.id,
      serviceName: currentService.name[language],
      staffTierId: currentTier.id,
      staffTierName: currentTier.name[language],
      shiftType,
      priceLKR: dailyRate,
      patientName: patientName.trim() || 'Patient',
      patientAge: Number(patientAge) || 75,
      patientGender,
      mobilityLevel,
      medicalConditions: medicalConditions.trim() || 'None specified',
      district,
      city: city.trim() || 'Colombo',
      address: address.trim() || 'Address confirmed over call',
      contactName: contactName.trim() || user?.name || 'Family Contact',
      contactPhone: contactPhone.trim(),
      contactEmail: user?.email,
      startDate: startDate || new Date().toISOString().split('T')[0],
      durationDays: Number(durationDays) || 7,
      totalCostLKR: totalCost,
      specialNotes: specialNotes.trim(),
      status: 'pending_review',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString()
    };

    try {
      await saveBookingToFirestore(newBooking);
    } catch (err) {
      console.warn('[Firestore] Proceeding with local confirmation:', err);
    } finally {
      setIsSubmitting(false);
      setConfirmedBooking(newBooking);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const whatsappMessage = confirmedBooking
    ? `Hello Prime Life Care! I just submitted a Caregiver Request online.%0A%0A*Booking Code:* ${confirmedBooking.bookingCode}%0A*Patient:* ${confirmedBooking.patientName} (${confirmedBooking.patientAge}y)%0A*Service:* ${confirmedBooking.serviceName}%0A*Tier:* ${confirmedBooking.staffTierName}%0A*Location:* ${confirmedBooking.city}, ${confirmedBooking.district}%0A*Contact:* ${confirmedBooking.contactPhone}%0A%0APlease call me to confirm caregiver arrival.`
    : '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Professional Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Prime Life Care"
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-contain p-0.5 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight block">
                PRIME LIFE CARE
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-blue-600 block">
                Official Dispatch Desk
              </span>
            </div>
          </Link>

          {/* Right Actions: Hotline, Language & Prominent Close Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* 24/7 Hotline Badge */}
            <a
              href="tel:+94771234567"
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>077 123 4567</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('si')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'si' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'en' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ENG
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'ta' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* PROMINENT CLOSE / BACK TO HOME BUTTON */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 hover:border-red-200 transition-all shadow-xs cursor-pointer group"
              title="Return to Home page"
            >
              <X className="w-4 h-4 text-slate-500 group-hover:text-red-600 group-hover:rotate-90 transition-transform" />
              <span className="hidden xs:inline">{t.closeBtn}</span>
            </Link>

          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Hero Section Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 space-y-3">
            
            {/* Top Guarantees Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {t.badge15Min}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {t.badgeCertified}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t.badgeZeroDeposit}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t.pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {t.pageSub}
            </p>

          </div>

          {/* Subtle Background Glow Decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* User Logged-in / Guest Status Banner */}
        {user ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-blue-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold">
                  {language === 'si' ? 'පිවිස සිටින්නේ:' : language === 'ta' ? 'உள்நுழைந்துள்ளவர்:' : 'Logged in as:'}{' '}
                  <span className="text-blue-950 font-black">{user.name}</span> ({user.email})
                </p>
                <p className="text-xs text-blue-700">
                  {language === 'si'
                    ? 'මෙම Booking එක ස්වයංක්‍රීයව ඔබගේ Profile ගිණුමට එකතු කරනු ලැබේ.'
                    : 'This booking will automatically sync with your customer Profile dashboard.'}
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline shrink-0"
            >
              {language === 'si' ? 'මගේ Profile එක' : 'My Profile'}
            </Link>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === 'si'
                  ? 'ඔබට ගිණුමක් නොමැතිව වුවද Booking එක සම්පූර්ණ කළ හැක. එහෙත් Google මඟින් Login වීමෙන් සජීවීව Caregiver නිරීක්ෂණය කළ හැක.'
                  : 'You can proceed as guest. Logging in with Google allows live caregiver tracking in your dashboard.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'si' ? 'Google මඟින් පිවිසෙන්න' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        {/* Stepper Progress Card */}
        {currentStep < 5 && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 mb-8 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <div
                onClick={() => setCurrentStep(1)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  currentStep === 1
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : currentStep > 1
                    ? 'border-slate-200 bg-emerald-50/50 text-emerald-800'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  {currentStep > 1 && <Check className="w-3 h-3 text-emerald-600 inline" />}
                  {t.step1}
                </div>
                <div className="text-xs truncate font-medium mt-0.5">{currentService.name[language]}</div>
              </div>

              <div
                onClick={() => currentStep > 2 && setCurrentStep(2)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  currentStep === 2
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : currentStep > 2
                    ? 'border-slate-200 bg-emerald-50/50 text-emerald-800 cursor-pointer'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  {currentStep > 2 && <Check className="w-3 h-3 text-emerald-600 inline" />}
                  {t.step2}
                </div>
                <div className="text-xs truncate font-medium mt-0.5">{patientName || 'Patient Details'}</div>
              </div>

              <div
                onClick={() => currentStep > 3 && setCurrentStep(3)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  currentStep === 3
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : currentStep > 3
                    ? 'border-slate-200 bg-emerald-50/50 text-emerald-800 cursor-pointer'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  {currentStep > 3 && <Check className="w-3 h-3 text-emerald-600 inline" />}
                  {t.step3}
                </div>
                <div className="text-xs truncate font-medium mt-0.5">{city || district}</div>
              </div>

              <div
                className={`p-3 rounded-xl border text-left transition-all ${
                  currentStep === 4
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : 'border-transparent text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold">
                  {t.step4}
                </div>
                <div className="text-xs truncate font-medium mt-0.5">
                  LKR {totalCost.toLocaleString()}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 1: SERVICE & STAFF TIER SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. Care Package Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {t.selectServiceTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {language === 'si'
                    ? 'ඔබගේ අවශ්‍යතාවයට ගැළපෙන සාත්තු සේවා පැකේජය තෝරන්න.'
                    : 'Select the primary care package suited for your family member.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {initialServices.slice(0, 6).map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setActiveServiceId(svc.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      activeServiceId === svc.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-slate-900">
                          {svc.name[language]}
                        </h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {svc.shiftType === '12h_day' ? '12h Day' : svc.shiftType === '12h_night' ? '12h Night' : '24h Full'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {svc.shortDescription[language]}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-bold">
                        {svc.features[language][0]}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <span>LKR {svc.priceLKR.toLocaleString()}</span>
                        <span className="text-slate-400 font-normal">{t.perDay}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Staff Qualification Tier Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {t.selectTierTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {language === 'si'
                    ? 'රෝගියාගේ තත්ත්වය අනුව සුදුසුකම් ලත් කාර්ය මණ්ඩල සාමාජිකයා තෝරන්න.'
                    : 'Choose the qualification level according to patient dependency.'}
                </p>
              </div>

              <div className="grid gap-3.5">
                {staffTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setActiveTierId(tier.id)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      activeTierId === tier.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    {tier.id === 'nvq_4_caregiver' && (
                      <span className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-xs">
                        {t.recommendedBadge}
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base text-slate-900">
                            {tier.name[language]}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                            {tier.experienceYears}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {tier.qualifications[language]}
                        </p>
                        <p className="text-xs text-slate-400 italic">
                          {tier.idealFor[language]}
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-lg sm:text-xl font-black text-blue-600">
                          LKR {tier.dailyRateLKR.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {tier.shiftTypeNote[language]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href="/"
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.closeBtn}</span>
              </Link>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: PATIENT DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {t.patientDetailsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t.patientDetailsSub}
                </p>
              </div>

              {/* Saved Family Member Quick Fill Chips */}
              {user?.savedPatients && user.savedPatients.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{t.savedFamilyQuickSelect}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.savedPatients.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => handleSelectSavedPatient(pat)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <span>✓ {pat.name}</span>
                        <span className="text-[10px] font-normal opacity-80">({pat.relation}, {pat.age}y)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Name & Age */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.patientNameLabel} *
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={t.patientNamePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.patientAgeLabel} *
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                    min={1}
                    max={120}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.genderLabel}
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setPatientGender('female')}
                    className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                      patientGender === 'female'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t.genderFemale}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientGender('male')}
                    className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                      patientGender === 'male'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t.genderMale}
                  </button>
                </div>
              </div>

              {/* Mobility Status */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.mobilityLabel}
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  
                  <div
                    onClick={() => setMobilityLevel('independent')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      mobilityLevel === 'independent'
                        ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                      {mobilityLevel === 'independent' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{t.mobIndependent}</span>
                  </div>

                  <div
                    onClick={() => setMobilityLevel('partial_assistance')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      mobilityLevel === 'partial_assistance'
                        ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                      {mobilityLevel === 'partial_assistance' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{t.mobPartial}</span>
                  </div>

                  <div
                    onClick={() => setMobilityLevel('wheelchair')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      mobilityLevel === 'wheelchair'
                        ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                      {mobilityLevel === 'wheelchair' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{t.mobWheelchair}</span>
                  </div>

                  <div
                    onClick={() => setMobilityLevel('bedridden')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                      mobilityLevel === 'bedridden'
                        ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                      {mobilityLevel === 'bedridden' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{t.mobBedridden}</span>
                  </div>

                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.conditionsLabel}
                </label>
                <textarea
                  rows={3}
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder={t.conditionsPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-medium text-slate-900 bg-white transition-all shadow-2xs"
                />
              </div>

            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btnBack}</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: LOCATION & SCHEDULE */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {t.scheduleTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t.scheduleSub}
                </p>
              </div>

              {/* District & City */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.districtLabel} *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                  >
                    {districtList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.cityLabel} *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t.cityPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.addressLabel}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Shift Type Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.shiftLabel}
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setShiftType('12h_day')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      shiftType === '12h_day'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.shiftDay}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftType('12h_night')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      shiftType === '12h_night'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.shiftNight}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftType('24h_full')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      shiftType === '24h_full'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.shiftFull}</div>
                  </button>
                </div>
              </div>

              {/* Start Date & Duration */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.startDateLabel} *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.durationLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationDays(7)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        durationDays === 7 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.days7}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationDays(14)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        durationDays === 14 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.days14}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationDays(30)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        durationDays === 30 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.days30}
                    </button>
                    <input
                      type="number"
                      value={durationDays}
                      min={1}
                      max={180}
                      onChange={(e) => setDurationDays(e.target.value ? Number(e.target.value) : 7)}
                      className="w-20 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.specialNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder={t.specialNotesPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-medium text-slate-900 bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{t.contactTitle}</span>
                  </h4>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t.contactNameLabel} *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Priyantha Silva"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t.contactPhoneLabel} *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="077XXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 text-sm font-semibold text-slate-900 bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btnBack}</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>{t.btnNext}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {t.reviewTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t.reviewSub}
                </p>
              </div>

              {/* Review Summary Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Service Package */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.selectedPackage}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{currentService.name[language]}</div>
                  <div className="text-xs text-slate-500">
                    {shiftType === '12h_day' ? '12h Day Shift' : shiftType === '12h_night' ? '12h Night Shift' : '24h Full Live-In'}
                  </div>
                </div>

                {/* Staff Tier */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.selectedTier}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{currentTier.name[language]}</div>
                  <div className="text-xs text-blue-600 font-bold">
                    LKR {dailyRate.toLocaleString()} {t.perDay}
                  </div>
                </div>

                {/* Patient Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.patientSummary}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {patientName} ({patientAge} years, {patientGender === 'female' ? 'Female' : 'Male'})
                  </div>
                  <div className="text-xs text-slate-500">
                    Mobility: {mobilityLevel} • {medicalConditions || 'No chronic history'}
                  </div>
                </div>

                {/* Location & Start */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t.locationSummary}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {city || 'City'}, {district}
                  </div>
                  <div className="text-xs text-slate-500">
                    Starts on {startDate} for {durationDays} Days
                  </div>
                </div>

              </div>

              {/* Transparent Cost Breakdown Card */}
              <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Staff Daily Rate ({durationDays} Days × LKR {dailyRate.toLocaleString()}):
                  </span>
                  <span className="font-bold text-slate-900">
                    LKR {totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Administrative Dispatch Fee:</span>
                  <span className="font-bold text-emerald-600">FREE (LKR 0)</span>
                </div>
                <div className="pt-3 border-t border-blue-200 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">{t.estimatedInvestment}:</span>
                  <span className="text-2xl font-black text-blue-700">
                    LKR {totalCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Zero Advance Deposit Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                    {t.advanceNoticeTitle}
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                    {t.advanceNoticeDesc}
                  </p>
                </div>
              </div>

              {/* 15-Minute Coordinator Call Guarantee */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">{t.coordinatorPledge}</span>{' '}
                  <span className="text-slate-300">
                    ({contactName} - {contactPhone})
                  </span>
                </div>
              </div>

            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.btnBack}</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t.btnConfirm}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* STEP 5: SUCCESS & DISPATCH CONFIRMATION */}
        {currentStep === 5 && confirmedBooking && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200 max-w-2xl mx-auto">
            
            {/* Green Success Badge */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Heading */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t.successTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
                {t.successSub}
              </p>
            </div>

            {/* Booking Code Highlight Card */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white max-w-md mx-auto shadow-md">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {t.bookingCodeLabel}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-wider my-1">
                {confirmedBooking.bookingCode}
              </div>
              <div className="text-xs text-slate-300">
                {confirmedBooking.serviceName} • {confirmedBooking.patientName} ({confirmedBooking.durationDays} Days)
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 max-w-md mx-auto flex items-center gap-3 text-left">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                {t.coordinatorCallNotice} ({confirmedBooking.contactPhone})
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2 max-w-md mx-auto">
              
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/94771234567?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.btnWhatsApp}</span>
              </a>

              {/* View in Profile */}
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t.btnViewProfile}</span>
              </button>

              {/* Return to Home */}
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{t.btnBackHome}</span>
              </Link>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 Prime Life Care (Pvt) Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-blue-600 font-bold">{t.home}</Link>
            <Link href="/profile" className="hover:text-blue-600 font-bold">Profile</Link>
            <a href="tel:+94771234567" className="text-blue-600 font-bold">24/7 Hotline: 077 123 4567</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading Prime Life Care Dispatch Desk...</span>
          </div>
        </div>
      }
    >
      <BookingFormInner />
    </Suspense>
  );
}
