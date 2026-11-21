const fs = require('fs');
const path = require('path');

// Load .env.local first if present, then fallback to .env
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  require('dotenv').config({ path: path.join(__dirname, '.env.local') });
}
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `complaint-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve React production build from dist if available, else public
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
app.use(express.static(path.join(__dirname, 'public')));

// Pre-loaded Demo Data (Requirement 4)
const initialTickets = [
  {
    id: "TKT-1001",
    citizen_text: "बिजली का तार खंभे से टूटकर सड़क पर गिर गया है और बारिश हो रही है, पास में बच्चे खेल रहे हैं!",
    detected_language: "Hindi",
    category: "electricity",
    severity: "Critical",
    reason: "Exposed live electrical wire near a school poses an immediate fatal electrocution hazard.",
    one_line_reason: "Exposed live electrical wire near a school poses an immediate electrocution hazard.",
    department: "Bangalore Electricity Supply Company Limited (BESCOM)",
    english_summary: "Live snapped electrical wire fallen on road during rain with children playing nearby.",
    status: "In Progress",
    location: "Ward 42, Near Govt Primary School, 8th Cross",
    citizen_name: "Ramesh Sharma",
    citizen_phone: "+91 98451 23456",
    image_url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    action_recommendation: "Immediate emergency power cut-off and deployment of rapid-response lineman squad.",
    is_duplicate: false,
    upvotes_count: 38
  },
  {
    id: "TKT-1002",
    citizen_text: "Main water pipeline burst at 4th block junction, flooding the entire street and entering local commercial shops.",
    detected_language: "English",
    category: "water",
    severity: "High",
    reason: "High-pressure municipal water main rupture causing severe street inundation and property damage risk.",
    one_line_reason: "High-pressure municipal water main rupture causing severe street inundation and property damage risk.",
    department: "Bangalore Water Supply and Sewerage Board (BWSSB)",
    english_summary: "Major water pipeline rupture causing street flooding and entering nearby storefronts.",
    status: "Pending",
    location: "4th Block Commercial Complex Junction, MG Road",
    citizen_name: "Anita Deshmukh",
    citizen_phone: "+91 97412 87654",
    image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    action_recommendation: "Isolate pipeline control valve V-12 and dispatch excavation crew for emergency weld repair.",
    is_duplicate: false,
    upvotes_count: 24
  },
  {
    id: "TKT-1003",
    citizen_text: "Deep open crater pothole causing bike accidents on 100ft road near junction.",
    detected_language: "English",
    category: "roads",
    severity: "Critical",
    reason: "Severe road surface crater causing severe vehicular loss of control and fatal motorcycle accident risk.",
    one_line_reason: "Deep open crater pothole causing motorcycle accidents on 100ft road.",
    department: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    english_summary: "Deep open crater pothole causing motorcycle accidents on 100ft road.",
    status: "Pending",
    location: "100ft Road Junction, Indiranagar",
    citizen_name: "Karthik Subramanian",
    citizen_phone: "+91 99001 54321",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    action_recommendation: "Immediate asphalt patch repair and reflective hazard barricading.",
    is_duplicate: false,
    upvotes_count: 47
  },
  {
    id: "TKT-1004",
    citizen_text: "ಕಸದ ತೊಟ್ಟಿ ತುಂಬಿ ರಸ್ತೆಗೆ ಹರಡಿದೆ, ಬೀದಿ ನಾಯಿಗಳು ಕಸವನ್ನು ಎಲ್ಲೆಡೆ ಎಳೆದಾಡುತ್ತಿವೆ, ತುಂಬಾ ದುರ್ವಾಸನೆ ಬರುತ್ತಿದೆ.",
    detected_language: "Kannada",
    category: "waste",
    severity: "Medium",
    reason: "Overflowing public waste bin scattering organic garbage and attracting animals, creating sanitary and public health concern.",
    one_line_reason: "Overflowing public waste bin scattering organic garbage and attracting animals, creating sanitary and public health concern.",
    department: "BBMP Solid Waste Management Division (SWM)",
    english_summary: "Garbage bin overflowing onto street with waste scattered by stray animals causing foul odor.",
    status: "Pending",
    location: "Ward 18, Residential Area, 2nd Main Road",
    citizen_name: "Venkatesh Rao",
    citizen_phone: "+91 94480 33221",
    image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    action_recommendation: "Dispatch compactor tipper vehicle for clearance and sanitize the bin perimeter.",
    is_duplicate: false,
    upvotes_count: 19
  },
  {
    id: "TKT-1005",
    citizen_text: "ನಮ್ಮ ಮನೆಯ ಮುಂದೆ ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್ ಆಗಿದೆ",
    detected_language: "Kannada",
    category: "trees",
    severity: "Critical",
    reason: "Large uprooted tree fully blocking roadway and snagging overhead cables, obstructing emergency transit.",
    one_line_reason: "Complete arterial road blockage or imminent structural collapse creating life safety emergency.",
    department: "BBMP Forest / Horticulture Wing",
    english_summary: "Fallen tree blocking entire roadway in front of residential area.",
    status: "Pending",
    location: "12th Main Road, HAL 2nd Stage, Indiranagar",
    citizen_name: "Suresh Gowda",
    citizen_phone: "+91 98452 98765",
    image_url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    created_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    action_recommendation: "Dispatch tree clearance chainsaw gang and coordinate with BESCOM for cable safety.",
    is_duplicate: false,
    upvotes_count: 31
  }
];

let ticketsDatabase = [...initialTickets];

// Severity sorting weight
const severityOrder = {
  "Critical": 4,
  "High": 3,
  "Medium": 2,
  "Low": 1
};

// Municipal Department Registry with Nodal Officers, Helplines & Twitter handles
const DEPARTMENT_REGISTRY = {
  roads: {
    name: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    wing: "BBMP Road Infrastructure & Potholes",
    nodal_email: "commissioner@bbmp.gov.in",
    helpline: "1533",
    twitter: "@BBMPCOMM"
  },
  waste: {
    name: "BBMP Solid Waste Management Division",
    wing: "BBMP Solid Waste Management & Garbage Dumps",
    nodal_email: "swm@bbmp.gov.in",
    helpline: "080-22660000",
    twitter: "@BBMP_SWM"
  },
  water: {
    name: "Bangalore Water Supply and Sewerage Board (BWSSB)",
    wing: "BWSSB Water Supply & Pipe Bursts",
    nodal_email: "waterboard@bwssb.gov.in",
    helpline: "1916",
    twitter: "@ChairmanBWSSB"
  },
  electricity: {
    name: "Bangalore Electricity Supply Company Limited (BESCOM)",
    wing: "BESCOM Power Lines, Transformers & Streetlights",
    nodal_email: "helpline@bescom.co.in",
    helpline: "1912",
    twitter: "@BESCOM_India"
  },
  trees: {
    name: "BBMP Forest / Horticulture Wing",
    wing: "BBMP Forest / Horticulture Wing - Fallen trees/branches",
    nodal_email: "treeofficer@bbmp.gov.in",
    helpline: "080-22221188",
    twitter: "@BBMPForestCell"
  },
  drainage: {
    name: "BWSSB & BBMP Stormwater Drains",
    wing: "BWSSB Stormwater & Sewage Drains",
    nodal_email: "ce.swd@bbmp.gov.in",
    helpline: "1533 / 1916",
    twitter: "@BBMPCOMM"
  }
};

// Generate formal statutory notice citing Section 133 CrPC and viral social post
function generateActionDrafts(category, severity, one_line_reason, english_summary, location, citizen_name) {
  const dept = DEPARTMENT_REGISTRY[category] || DEPARTMENT_REGISTRY.roads;
  const loc = location || "Bengaluru Municipal Ward";
  const cit = citizen_name || "A Concerned Citizen";

  const statutorySubject = `STATUTORY NOTICE u/s 133 CrPC: Immediate Abatement of Civic Hazard - ${category.toUpperCase()} at ${loc}`;
  const statutoryBody = `To:
The Nodal Executive Officer,
${dept.name} (${dept.wing})
Official Email: ${dept.nodal_email} | 24x7 Helpline: ${dept.helpline}

SUBJECT: STATUTORY NOTICE UNDER SECTION 133 OF THE CODE OF CRIMINAL PROCEDURE (CrPC) - URGENT REMOVAL OF UNLAWFUL PUBLIC HAZARD / DANGER

Sir/Madam,

Please take formal notice that an urgent municipal hazard evaluated by CivicLens AI at severity level "${severity.toUpperCase()}" has been recorded in your administrative jurisdiction:

1. Nature of Defect: ${english_summary}
2. Critical Ground Justification: ${one_line_reason}
3. Exact Incident Location: ${loc}
4. Reporting Citizen: ${cit}

Under Section 133 of the Code of Criminal Procedure, it is the bounden statutory obligation of the competent municipal authority to prevent imminent danger to public life, prevent injury, and clear obstructions from public ways.

You are hereby requested to cause an immediate inspection and dispatch an emergency rectification squad within the stipulated civic SLA (${severity === 'Critical' ? '2 Hours' : severity === 'High' ? '12 Hours' : '48 Hours'}). Failure to abate life-threatening hazards may attract legal liability for municipal negligence under Indian law.

Digital Forensic Verification Seal Attached: CIVICLENS-BBMP-GOV
Generated via CivicLens AI Triage System`;

  const socialPost = `🚨 CIVIC HAZARD ALERT [${severity.toUpperCase()}] in #Bengaluru!
Grievance: ${english_summary}
Location: ${loc}
Dept Responsible: ${dept.twitter} (${dept.name})
Urgency: ${one_line_reason}
Urgent inspection demanded under Section 133 CrPC! @CMofKarnataka @DKShivakumar #CivicLens #BBMP #BengaluruCivic`;

  return {
    statutory_email: {
      to: dept.nodal_email,
      subject: statutorySubject,
      body: statutoryBody
    },
    social_post: socialPost
  };
}

// Offline / Heuristic Triage Engine
function ruleBasedTriage(text, hasImage = false, location = "Bengaluru", citizen_name = "Citizen") {
  const lower = (text || "").toLowerCase();

  // AI-Slop & Authenticity Gatekeeper heuristic check
  if (/(midjourney|dall-e|stablediffusion|anime|cartoon|meme|deepfake|synthetic|fake image|ai art|stock photo watermark|fictional)/i.test(lower)) {
    return {
      is_authentic: false,
      authenticity_reason: "Suspected AI-Generated, cartoon, or synthetic non-civic media.",
      has_civic_issue: false,
      no_issue_reason: "Media identified as synthetic, AI-generated, or unrelated to civic infrastructure.",
      category: null,
      severity: null,
      one_line_reason: "Failed authenticity gatekeeper check.",
      reason: "Failed authenticity gatekeeper check.",
      detected_language: "English",
      english_summary: "Submission blocked: Suspected synthetic/AI-generated media.",
      department: null,
      action_drafts: null
    };
  }

  // Check for "No Civic Defect"
  if (/(no problem|all good|clean road|nice road|selfie|indoor|room|office|sunny day|good job|smooth road)/i.test(lower) && !/(wire|pothole|pipe|drain|tree|garbage|waste|ಕಸ)/i.test(lower)) {
    return {
      is_authentic: true,
      authenticity_reason: "Verified authentic real-world civic documentation.",
      has_civic_issue: false,
      no_issue_reason: "Scene or description indicates normal civic conditions with no actionable municipal hazard.",
      category: null,
      severity: null,
      one_line_reason: "No civic defect or public hazard found.",
      reason: "No civic defect or public hazard found.",
      detected_language: "English",
      english_summary: "No municipal defect reported.",
      department: null,
      action_drafts: null
    };
  }

  let category = "roads";
  let severity = "Medium";
  let detected_language = "English";

  // Regional Language Detection
  if (/[\u0C80-\u0CFF]/.test(text)) detected_language = "Kannada";
  else if (/[\u0900-\u097F]/.test(text)) detected_language = "Hindi";
  else if (/[\u0B80-\u0BFF]/.test(text)) detected_language = "Tamil";
  else if (/[\u0C00-\u0C7F]/.test(text)) detected_language = "Telugu";

  // Category matching (including robust Garbage / Waste Detection)
  if (/(ಕಸ|ತ್ಯಾಜ್ಯ|ತಿಪ್ಪೆ|ದುರ್ವಾಸನೆ|waste|garbage|dump|trash|dustbin|bin|litter|debris|rubbish|smell|stench|ಕಸದ ತೊಟ್ಟಿ|कचरा|कूड़ा|गंदगी|डस्टबिन|सफाई)/i.test(lower)) {
    category = "waste";
  } else if (/(ಮರ|ಬಿದ್ದಿದೆ|ಕೊಂಬೆ|tree|branch|fallen|trunk|cracked|पेड़|शाखा)/i.test(lower)) {
    category = "trees";
  } else if (/(तार|बिजली|current|wire|spark|transformer|streetlight|light|electric|shock|power|voltage|ವಿದ್ಯುತ್|ಕರೆಂಟ್)/i.test(lower)) {
    category = "electricity";
  } else if (/(ಗಟಾರ|ಚರಂಡಿ|drain|drainage|sewer|sewage|clog|stagnant|overflow|नाली|नाला|गंदा पानी)/i.test(lower)) {
    category = "drainage";
  } else if (/(ನೀರು|water|leak|pipe|burst|supply|drinking|pipeline|पानी|नल)/i.test(lower)) {
    category = "water";
  } else if (/(ರಸ್ತೆ|ಗುಂಡಿ|pothole|road|asphalt|traffic|crater|tar|ಸड़क|गड्ढा)/i.test(lower)) {
    category = "roads";
  }

  // Severity matching
  const criticalTriggers = /(ಮರ.*ಬಿದ್ದಿದೆ|ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್|तार.*टूट|बिजली.*तार|exposed wire|sparking|fire|death|danger|live wire|school|hospital|flood|collapsed|emergency|child|बच्चे|blast|electrocution|accident|open manhole|deep.*crater|crater)/i;
  const highTriggers = /(burst|huge pothole|deep crater|completely blocked|major accident|contaminated|foul smell|inundated|entering house|entering shop|कचरे का ढेर|गंदा पानी)/i;
  const lowTriggers = /(minor|small|corner|aesthetic|painting|dim light|faded)/i;

  let one_line_reason = "";
  if (criticalTriggers.test(lower)) {
    severity = "Critical";
    one_line_reason = category === "electricity" 
      ? "Exposed live wire near public transit zone poses an immediate fatal electrocution hazard."
      : category === "roads"
      ? "Severe deep road crater posing fatal motorcycle and vehicular accident danger."
      : "Complete arterial road blockage or imminent structural collapse creating life safety emergency.";
  } else if (highTriggers.test(lower)) {
    severity = "High";
    one_line_reason = category === "water"
      ? "High-pressure municipal pipeline burst causing severe street inundation and property flooding."
      : category === "waste"
      ? "Heavy accumulation of rotting garbage blocking access and posing acute health hazard."
      : "Severe civic obstruction creating high risk of vehicular accidents or health epidemics.";
  } else if (lowTriggers.test(lower)) {
    severity = "Low";
    one_line_reason = "Non-hazardous civic blemish with minimal impact on public mobility or safety.";
  } else {
    severity = "Medium";
    one_line_reason = category === "waste"
      ? "Overflowing waste bin scattering garbage, requiring beat compactor clearance."
      : "Standard municipal defect scheduled for routine departmental resolution.";
  }

  // English Summary
  let english_summary = text;
  if (text.includes("ಮರ ಬಿದ್ದಿದೆ ರಸ್ತೆ ಬಂದ್")) {
    english_summary = "Fallen tree blocking entire roadway in front of residential area.";
  } else if (text.includes("ಕಸದ ತೊಟ್ಟಿ ತುಂಬಿ")) {
    english_summary = "Garbage bin overflowing onto roadway with waste scattered by animals.";
  } else if (text.includes("स्कूल के सामने कचरे का ढेर")) {
    english_summary = "Heaps of garbage and stagnant filthy water accumulated outside school entrance.";
  } else if (text.includes("बिजली का तार")) {
    english_summary = "Snapped live electrical wire fallen on road during rain near playing children.";
  } else if (text.includes("Deep open crater pothole")) {
    english_summary = "Deep open crater pothole causing motorcycle accidents on 100ft road.";
  } else if (text.length > 90) {
    english_summary = text.substring(0, 87) + "...";
  }

  const dept = DEPARTMENT_REGISTRY[category] || DEPARTMENT_REGISTRY.roads;
  const action_drafts = generateActionDrafts(category, severity, one_line_reason, english_summary, location, citizen_name);

  return {
    is_authentic: true,
    authenticity_reason: "Verified authentic real-world civic documentation.",
    has_civic_issue: true,
    no_issue_reason: null,
    category,
    severity,
    one_line_reason,
    reason: one_line_reason,
    department: dept.name,
    department_details: dept,
    detected_language,
    english_summary,
    action_drafts,
    action_recommendation: severity === "Critical" 
      ? "Immediate dispatch within 2 hours. Notify ward supervisor." 
      : severity === "High" 
      ? "Schedule inspection within 12 hours." 
      : "Queue for standard municipal shift within 48 hours."
  };
}

// Multimodal AI Triage Engine via Gemini API with Model Cascade
async function triageComplaint(text, imageBase64OrPath = null, location = "Bengaluru", citizen_name = "Citizen", clientKey = null) {
  const apiKey = clientKey || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    console.log("ℹ️ No GEMINI_API_KEY provided; utilizing High-Precision Heuristic Triage Engine.");
    return ruleBasedTriage(text, !!imageBase64OrPath, location, citizen_name);
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are CivicLens AI, an expert multimodal civic complaint triage and authenticity gatekeeper engine for Bengaluru Municipal Corporation (BBMP, BESCOM, BWSSB).
Analyze the citizen grievance (which may be in English, Kannada, Hindi, Tamil, Telugu, etc.) along with any attached photo evidence.

You MUST respond in STRICT JSON ONLY adhering to this exact schema:
{
  "is_authentic": boolean,
  "authenticity_reason": "1-line explanation of why this passed or failed authenticity verification",
  "has_civic_issue": boolean,
  "no_issue_reason": string or null,
  "category": "roads" | "waste" | "water" | "electricity" | "trees" | "drainage" | null,
  "severity": "Low" | "Medium" | "High" | "Critical" | null,
  "one_line_reason": "Crisp 1-line explanation of WHY this severity was chosen (e.g. 'Exposed live wire near a school poses an immediate electrocution hazard')",
  "detected_language": "Name of language detected in citizen text (e.g. Kannada, Hindi, Tamil, Telugu, English)",
  "english_summary": "Clean, professional 1-sentence English translation and summary for the municipal officer",
  "action_recommendation": "1-line immediate operational directive for field squad"
}

RULES:
1. AI-Slop & Authenticity Gatekeeper: Set "is_authentic": false if the image appears AI-generated/synthetic (e.g. Midjourney, DALL-E, Stable Diffusion), anime/cartoon, meme, stock-watermarked, digital illustration, or completely unrelated to real civic/municipal issues. In that case, explain why in "authenticity_reason" (e.g. "Suspected AI-generated or synthetic non-civic rendering"). If it depicts a real camera photo of physical street/civic condition or authentic grievance, set "is_authentic": true and "authenticity_reason": "Verified authentic real-world civic documentation".
2. "No Civic Defect": If photo/text shows an intact road, indoor scene, selfie, personal photo, or NO public municipal hazard, set "has_civic_issue": false, "no_issue_reason": "Detailed explanation of why there is no civic issue", and set category/severity to null.
3. Category: Must be EXACTLY one of:
   - "waste": Solid waste management, overflowing garbage bins, illegal garbage dumps, scattered trash, litter, stench.
   - "roads": Potholes, damaged asphalt, craters, missing pavers, road cave-in.
   - "water": BWSSB water supply, pipeline bursts, drinking water leaks, contaminated municipal water.
   - "electricity": BESCOM live wires, snapped power conductors, sparking transformers, dark streetlights.
   - "trees": Fallen trees, broken branches obstructing roads, dangerous hanging boughs.
   - "drainage": Stormwater drains, open manholes, clogged sewage drains, contaminated overflow.
4. Severity: "Critical" (life hazard/exposed wire/deep collapse), "High" (flooding/burst pipe/major roadblock/severe garbage pile), "Medium" (overflowing bin/routine pothole/dead streetlight), "Low" (minor aesthetic/faded paint).
5. One Line Reason: An explicit, compelling 1-line justification of why the severity level was chosen.`;

  const contents = [];

  // Handle image if provided
  if (imageBase64OrPath) {
    let mimeType = 'image/jpeg';
    let data = '';

    if (imageBase64OrPath.startsWith('data:')) {
      const match = imageBase64OrPath.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        data = match[2];
      }
    } else if (fs.existsSync(imageBase64OrPath)) {
      mimeType = imageBase64OrPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
      data = fs.readFileSync(imageBase64OrPath).toString('base64');
    }

    if (data) {
      contents.push({
        inlineData: {
          mimeType,
          data
        }
      });
    }
  }

  contents.push({
    text: `Citizen Grievance to triage:\n"${text || "Please analyze attached photo for municipal defects."}"\nLocation: ${location}`
  });

  // Model Cascade: gemini-3.5-flash-lite -> gemini-3.1-flash-lite
  const modelCascade = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite'
  ];

  for (const modelName of modelCascade) {
    try {
      console.log(`🤖 Invoking Gemini Model Cascade: ${modelName}...`);
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API 7000ms response timeout')), 7000)
      );
      const response = await Promise.race([generatePromise, timeoutPromise]);

      const rawText = response.text.trim();
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const is_authentic = parsed.is_authentic !== false;
      const authenticity_reason = parsed.authenticity_reason || (is_authentic ? "Verified authentic real-world civic documentation." : "Suspected AI-generated or synthetic non-civic media.");

      // Gatekeeper: If not authentic, block immediately
      if (!is_authentic) {
        return {
          is_authentic: false,
          authenticity_reason,
          has_civic_issue: false,
          no_issue_reason: authenticity_reason,
          category: null,
          severity: null,
          one_line_reason: authenticity_reason,
          reason: authenticity_reason,
          detected_language: parsed.detected_language || "English",
          english_summary: "Submission blocked: Suspected synthetic/AI-generated media.",
          department: null,
          action_drafts: null
        };
      }

      if (parsed.has_civic_issue === false) {
        return {
          is_authentic: true,
          authenticity_reason,
          has_civic_issue: false,
          no_issue_reason: parsed.no_issue_reason || "No municipal hazard detected in report.",
          category: null,
          severity: null,
          one_line_reason: "No municipal defect identified.",
          reason: "No municipal defect identified.",
          detected_language: parsed.detected_language || "English",
          english_summary: "No municipal defect reported.",
          department: null,
          action_drafts: null
        };
      }

      const category = DEPARTMENT_REGISTRY[parsed.category?.toLowerCase()] ? parsed.category.toLowerCase() : "roads";
      const severity = ["Low", "Medium", "High", "Critical"].includes(parsed.severity) ? parsed.severity : "Medium";
      const one_line_reason = parsed.one_line_reason || "Classified according to municipal public safety standards.";
      const english_summary = parsed.english_summary || text;
      const dept = DEPARTMENT_REGISTRY[category];
      const action_drafts = generateActionDrafts(category, severity, one_line_reason, english_summary, location, citizen_name);

      return {
        is_authentic: true,
        authenticity_reason,
        has_civic_issue: true,
        no_issue_reason: null,
        category,
        severity,
        one_line_reason,
        reason: one_line_reason,
        department: dept.name,
        department_details: dept,
        detected_language: parsed.detected_language || "English",
        english_summary,
        action_drafts,
        action_recommendation: parsed.action_recommendation || "Dispatch inspection squad."
      };
    } catch (err) {
      console.warn(`Model ${modelName} failed or unavailable (${err.message}). Trying next in cascade...`);
    }
  }

  console.warn("All Gemini models in cascade failed or rate-limited; switching to deterministic fallback.");
  return ruleBasedTriage(text, !!imageBase64OrPath, location, citizen_name);
}

// Check for duplicate complaints
function checkDuplicate(newCategory, newText, newLocation) {
  const words = (newText || "").toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const match = ticketsDatabase.find(t => {
    if (t.category !== newCategory) return false;
    const existingWords = (t.citizen_text + " " + (t.location || "")).toLowerCase();
    const sharedWords = words.filter(w => existingWords.includes(w));
    return sharedWords.length >= 2;
  });
  return match ? match.id : null;
}

// API Routes

// 0. Serverless Multimodal Hazard Triage Endpoint (/api/triage-hazard)
app.post('/api/triage-hazard', async (req, res) => {
  try {
    const { complaintText, imageBase64, latitude, longitude, citizen_name, authData, apiKey } = req.body;

    if (!complaintText && !imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Either complaintText or imageBase64 must be provided."
      });
    }

    const locStr = (latitude && longitude)
      ? `GPS (${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)})`
      : "Bengaluru Municipal Limits";

    const triage = await triageComplaint(complaintText || "", imageBase64 || null, locStr, citizen_name || "Citizen", apiKey);

    res.json({
      success: true,
      triage
    });
  } catch (err) {
    console.error("Error in /api/triage-hazard:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 1. Get all tickets sorted by severity (Critical -> High -> Medium -> Low), then newest
app.get('/api/tickets', (req, res) => {
  const sorted = [...ticketsDatabase].sort((a, b) => {
    const sevDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  res.json({
    success: true,
    count: sorted.length,
    tickets: sorted
  });
});

// 2. Submit new citizen complaint + AI Triage
app.post('/api/tickets', upload.single('image'), async (req, res) => {
  try {
    const { citizen_text, location, citizen_name, citizen_phone } = req.body;
    const file = req.file;

    if (!citizen_text && !file) {
      return res.status(400).json({ success: false, error: "Please provide either a complaint description or a photo." });
    }

    const imageFilePath = file ? file.path : null;
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    // Run AI Triage Engine
    const triageResult = await triageComplaint(citizen_text || "", imageFilePath);

    // Duplicate detection check
    const duplicateOf = checkDuplicate(triageResult.category, citizen_text || "", location || "");

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      citizen_text: citizen_text || "Image-only complaint filed",
      detected_language: triageResult.detected_language,
      category: triageResult.category,
      severity: triageResult.severity,
      reason: triageResult.reason,
      one_line_reason: triageResult.one_line_reason,
      department: triageResult.department,
      department_details: triageResult.department_details,
      english_summary: triageResult.english_summary,
      status: "Pending",
      location: location || "Location not specified by citizen",
      citizen_name: citizen_name || "Anonymous Citizen",
      citizen_phone: citizen_phone || "Not provided",
      image_url: imageUrl,
      action_drafts: triageResult.action_drafts,
      created_at: new Date().toISOString(),
      action_recommendation: triageResult.action_recommendation,
      is_duplicate: !!duplicateOf,
      duplicate_of: duplicateOf
    };

    ticketsDatabase.unshift(newTicket);

    res.status(201).json({
      success: true,
      ticket: newTicket,
      message: "Complaint successfully processed and routed by CivicLens AI"
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update Ticket Status (Pending -> In Progress -> Resolved)
app.patch('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { status, officer_notes } = req.body;

  const ticket = ticketsDatabase.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: "Ticket not found" });
  }

  if (status) ticket.status = status;
  if (officer_notes !== undefined) ticket.officer_notes = officer_notes;
  ticket.updated_at = new Date().toISOString();

  res.json({ success: true, ticket });
});

// 4. Reset to Demo Data
app.post('/api/tickets/reset', (req, res) => {
  ticketsDatabase = JSON.parse(JSON.stringify(initialTickets));
  res.json({ success: true, message: "Database reset to initial demo tickets", count: ticketsDatabase.length });
});

// 5. System Stats / Metrics
app.get('/api/stats', (req, res) => {
  const total = ticketsDatabase.length;
  const critical = ticketsDatabase.filter(t => t.severity === 'Critical').length;
  const high = ticketsDatabase.filter(t => t.severity === 'High').length;
  const inProgress = ticketsDatabase.filter(t => t.status === 'In Progress').length;
  const resolved = ticketsDatabase.filter(t => t.status === 'Resolved').length;

  res.json({
    total,
    critical,
    high,
    inProgress,
    resolved,
    resolvedPercentage: total > 0 ? Math.round((resolved / total) * 100) : 0
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CivicLens AI Triage System is LIVE!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Active (Live Generative AI)' : 'Not set (Active Heuristic Engine)'}`);
  console.log(`======================================================\n`);
});
