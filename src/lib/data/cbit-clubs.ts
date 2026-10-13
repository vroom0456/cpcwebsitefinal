export interface FacultyCoordinator {
  role: string;
  name: string;
  designation?: string;
  department?: string;
  email?: string;
  mobile?: string;
}

export interface ClubCategory {
  id: string;
  name: string;
  description?: string;
  leadership?: FacultyCoordinator[];
  clubs: {
    id: string;
    name: string;
    alias?: string;
    coordinators?: FacultyCoordinator[];
  }[];
}

export const CBIT_EXTRA_CURRICULAR_ACTIVITIES: ClubCategory[] = [
  {
    id: "cultural",
    name: "Chaitanya Samskruthi (Chaitanya Bharathi Cultural Club)",
    leadership: [
      {
        role: "Chairman",
        name: "Dr. K. Jagannadha Rao",
        designation: "Professor & JD-SA & P",
        department: "Civil Engineering",
        email: "jagannadharao_civil@cbit.ac.in",
        mobile: "9849075484",
      },
      {
        role: "Vice-Chairman",
        name: "Dr. G. Suresh Babu",
        designation: "Professor & Head",
        department: "EEE",
        email: "hod_eee@cbit.ac.in",
        mobile: "9493411401",
      },
      {
        role: "Convener",
        name: "Sri Sreenivas Andoju",
        designation: "Assistant Professor",
        department: "English",
        email: "andoju_english@cbit.ac.in",
        mobile: "9000356111",
      },
      {
        role: "Co-Convener",
        name: "Dr. Bishwambhar Mishra",
        designation: "Assistant Professor",
        department: "Biotechnology",
        email: "bishwambhar_biotech@cbit.ac.in",
        mobile: "7036442532",
      },
    ],
    clubs: [
      {
        id: "cpc",
        name: "Chaitanya Chaya (Photography) - CBIT Photo Club",
        alias: "CBIT Photo Club (CPC)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri K. Gurubrahmam",
            designation: "Assistant Professor",
            department: "MED",
            email: "gurubrahmam_mech@cbit.ac.in",
            mobile: "9440590695",
          },
        ],
      },
      {
        id: "film",
        name: "Chaitanya Chaya (Film Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri Sreenivas Andoju",
            designation: "Assistant Professor",
            department: "English",
            email: "andoju_english@cbit.ac.in",
            mobile: "9000356111",
          },
        ],
      },
      {
        id: "drama",
        name: "Chaitanya Chaya (Drama Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri M. Nagaraju",
            designation: "Assistant Professor",
            department: "EEE",
            email: "mnagaraju_eee@cbit.ac.in",
            mobile: "7013526685",
          },
        ],
      },
      {
        id: "srujana",
        name: "Chaitanya Srujana (Painting & Other Crafts)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri K. Naveen Kumar",
            designation: "Assistant Professor",
            department: "English",
            email: "naveenkumar_english@cbit.ac.in",
            mobile: "9440944186",
          },
        ],
      },
      {
        id: "lasya",
        name: "Chaitanya Lasya (The Dance Club - UDC)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri P. R. K. Prasad",
            designation: "Associate Professor",
            department: "MED",
            email: "prkprasad_mech@cbit.ac.in",
            mobile: "9848223473",
          },
          {
            role: "Co-coordinator",
            name: "Smt. T. L. Lalithamba",
            designation: "Senior Assistant",
            department: "AEC",
            email: "lalitha.cbit@gmail.com",
          },
        ],
      },
      {
        id: "geethi",
        name: "Chaitanya Geethi (The Singing Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri G. Nataraj",
            designation: "Assistant Professor",
            department: "Physics",
            email: "gnataraju_physics@cbit.ac.in",
            mobile: "9966678880",
          },
          {
            role: "Co-coordinator",
            name: "Dr. Bishwambhar Mishra",
            designation: "Assistant Professor",
            department: "Biotechnology",
            email: "bishwambhar_biotech@cbit.ac.in",
            mobile: "7036442532",
          },
        ],
      },
      {
        id: "vaadya",
        name: "Chaitanya Vaadya (The Instrumental Music Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. B. Sreenivas Reddy",
            designation: "Professor",
            department: "Physics",
            email: "bsreenivasareddy_physics@cbit.ac.in",
            mobile: "9849272455",
          },
          {
            role: "Co-coordinator",
            name: "Sri M. Shipley",
            designation: "Tech Gr-II",
            department: "Chemical",
            email: "shipleycbit@gmail.com",
            mobile: "9912085108",
          },
        ],
      },
      {
        id: "communicando",
        name: "Chaitanya Sahithi – Communicando (Literary Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Smt. A. Vijaya Lakshmi",
            designation: "Assistant Professor",
            department: "English",
            email: "vijayalakshmi_english@cbit.ac.in",
            mobile: "9849533161",
          },
        ],
      },
      {
        id: "toastmasters",
        name: "Chaitanya Sahithi – Toastmasters",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. Ch. Suvarna Ragini",
            designation: "Assistant Professor",
            department: "English",
            email: "suvarnaragini_english@cbit.ac.in",
            mobile: "9885707771",
          },
        ],
      },
      {
        id: "mun",
        name: "Chaitanya Sahithi – Model United Nations (MUN)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. Shagufta Parween",
            designation: "Assistant Professor",
            department: "English",
            email: "sparween_english@cbit.ac.in",
            mobile: "9550315302",
          },
        ],
      },
      {
        id: "geervana",
        name: "Chaitanya Sahithi – Geervana Bharathi (Sanskrit Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. G. Suresh Babu",
            designation: "Professor",
            department: "EEE",
            email: "hod_eee@cbit.ac.in",
            mobile: "9493411401",
          },
        ],
      },
      {
        id: "transcendent",
        name: "Chaitanya Sahithi – Transcendent",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. Shirisha Deshpande",
            designation: "Assistant Professor",
            department: "English",
            email: "Shirisha_english@cbit.ac.in",
            mobile: "9866008345",
          },
        ],
      },
      {
        id: "kruthi",
        name: "Chaitanya Kruthi (Writers & Poets Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Smt. G. Vanitha",
            designation: "Assistant Professor",
            department: "CSE",
            email: "gvanitha_cse@cbit.ac.in",
            mobile: "9959959585",
          },
        ],
      },
    ],
  },
  {
    id: "social_service",
    name: "Chaitanya Seva (The Social Service Club)",
    leadership: [
      {
        role: "Chairman",
        name: "Dr. M. Swamy Das",
        designation: "Professor & JD-Academics",
        department: "CSE",
        email: "jd_academics@cbit.ac.in",
        mobile: "9490475959",
      },
      {
        role: "Vice-Chairman",
        name: "Dr. M. Ganeshwar Rao",
        designation: "Professor",
        department: "Mathematics",
        email: "ganeshwararao_maths@cbit.ac.in",
        mobile: "9490316979",
      },
      {
        role: "Convener",
        name: "Sri K. Sudarshan Reddy",
        designation: "Associate Professor",
        department: "ECE",
        email: "sudarshanreddy_ece@cbit.ac.in",
        mobile: "9291522525",
      },
      {
        role: "Co-Convener",
        name: "Sri M. Thirupathaiah",
        designation: "Assistant Professor",
        department: "EEE",
        email: "thirupathaiah_eee@cbit.ac.in",
        mobile: "9963181845",
      },
    ],
    clubs: [
      {
        id: "nss",
        name: "NSS (National Service Scheme)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. M. Ganeshwar Rao",
            designation: "Professor",
            department: "Mathematics",
            email: "ganeshwararao_maths@cbit.ac.in",
            mobile: "9490316979",
          },
          {
            role: "Co-coordinator",
            name: "Sri K. Sudarshan Reddy",
            designation: "Assistant Professor",
            department: "ECE",
            email: "sudarshanreddy_ece@cbit.ac.in",
            mobile: "9291522525",
          },
        ],
      },
      {
        id: "spandana",
        name: "Chaitanya Spandana (Formerly Street Cause CBIT)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. A. Vani",
            designation: "Associate Professor",
            department: "ECE",
            email: "avani_ece@cbit.ac.in",
            mobile: "9440079310",
          },
          {
            role: "Co-coordinator",
            name: "Dr. P. Kowstubha",
            designation: "Associate Professor",
            department: "EEE",
            email: "kowstubha_eee@cbit.ac.in",
            mobile: "9676402006",
          },
        ],
      },
      {
        id: "ewb",
        name: "Engineers Without Borders (EWB)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Sri M. Thirupathaiah",
            designation: "Assistant Professor",
            department: "EEE",
            email: "thirupathaiah_eee@cbit.ac.in",
            mobile: "9963181845",
          },
          {
            role: "Co-coordinator",
            name: "Sri C. Srisailam",
            designation: "Assistant Professor",
            department: "EEE",
            email: "srisailamc_eee@cbit.ac.in",
            mobile: "9032838993",
          },
        ],
      },
      {
        id: "medha",
        name: "Technical Seva (Chaitanya Medha)",
      },
      {
        id: "elc",
        name: "Electoral Literacy Club (ELC)",
      },
    ],
  },
  {
    id: "lifestyle",
    name: "Chaitanya Reethi (The Lifestyle Club)",
    leadership: [
      {
        role: "Chairman",
        name: "Dr. P. Prabhakar Reddy",
        designation: "Professor",
        department: "MED",
        email: "prabhakarreddy_mech@cbit.ac.in",
        mobile: "9885468253",
      },
      {
        role: "Vice-Chairman",
        name: "Dr. P. V. Naga Prapurna",
        designation: "Associate Professor",
        department: "Chemical",
        email: "nagaprapurna_chem@cbit.ac.in",
        mobile: "9885256057",
      },
      {
        role: "Convener",
        name: "Dr. T. Murali Krishna",
        designation: "Assistant Professor",
        department: "EEE",
        email: "tmuralikrishna_eee@cbit.ac.in",
        mobile: "9866479770",
      },
      {
        role: "Co-Convener",
        name: "Smt. K. Manasa",
        designation: "Assistant Professor",
        department: "Civil",
        email: "kmanasa_civil@cbit.ac.in",
        mobile: "9618079892",
      },
    ],
    clubs: [
      {
        id: "parivritha",
        name: "Parivritha (Environmental Club)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Smt. K. Manasa",
            designation: "Assistant Professor",
            department: "Civil",
            email: "kmanasa_civil@cbit.ac.in",
            mobile: "9618079892",
          },
          {
            role: "Co-coordinator",
            name: "Smt. K. Karthika Kishore",
            designation: "Assistant Professor",
            department: "Civil",
            email: "karthika_civil@cbit.ac.in",
            mobile: "8333090365",
          },
        ],
      },
      {
        id: "oorja",
        name: "Energy Savers Lab (Chaitanya Oorja)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. T. Muralikrishna",
            designation: "Assistant Professor",
            department: "EEE",
            email: "tmuralikrishna_eee@cbit.ac.in",
            mobile: "9866479770",
          },
          {
            role: "Co-coordinator",
            name: "Dr. N. Vasantha Gouri",
            designation: "Assistant Professor",
            department: "EEE",
            email: "vasanthagouri_eee@cbit.ac.in",
            mobile: "9052221446",
          },
        ],
      },
      {
        id: "edc",
        name: "Entrepreneurship Development Cell (EDC - Chaitanya Teja)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. P. Prabhakar Reddy",
            designation: "Professor",
            department: "MED",
            email: "prabhakarreddy_mech@cbit.ac.in",
            mobile: "9885468253",
          },
          {
            role: "Co-coordinator",
            name: "Smt. V. Sandhya",
            designation: "Assistant Professor",
            department: "MED",
            email: "vsandhya_mech@cbit.ac.in",
            mobile: "9701540189",
          },
        ],
      },
      {
        id: "wellness",
        name: "Wellness Club (Chaitanya Svaasthya)",
        coordinators: [
          {
            role: "Faculty Coordinator",
            name: "Dr. P. V. Naga Prapurna",
            designation: "Associate Professor",
            department: "Chemical",
            email: "nagaprapurna_chem@cbit.ac.in",
            mobile: "9885256057",
          },
          {
            role: "Co-coordinator",
            name: "Sri Sreenivas Andoju",
            designation: "Assistant Professor",
            department: "English",
            email: "asrinivasulu_english@cbit.ac.in",
            mobile: "9000356111",
          },
        ],
      },
      {
        id: "suraksha",
        name: "Women Safety Club (Chaitanya Suraksha)",
      },
      {
        id: "uhv",
        name: "Universal Human Values (UHV Club)",
      },
    ],
  },
  {
    id: "sports",
    name: "Chaitanya Kreeda (The Sports Club)",
    leadership: [
      {
        role: "Chairman",
        name: "Dr. G. Shyam Mohan Reddy",
        designation: "Head",
        department: "PED",
        email: "shyammohanreddy_ped@cbit.ac.in",
      },
      {
        role: "Vice-Chairman",
        name: "Dr. M. V. Krishna Rao",
        designation: "Professor",
        department: "Civil",
        email: "mvkrishnarao_civil@cbit.ac.in",
        mobile: "9490754235",
      },
      {
        role: "Convener",
        name: "Dr. Rajeshwari",
        designation: "Assistant Professor",
        department: "PED",
        email: "rajeswari_ped@cbit.ac.in",
      },
      {
        role: "Co-Convener",
        name: "Sri M. Ram Chander",
        designation: "Assistant Professor",
        department: "MCA",
        email: "mramchander_mca@cbit.ac.in",
        mobile: "9703144559",
      },
    ],
    clubs: [
      {
        id: "sports_club",
        name: "CBIT Sports Club",
      },
      {
        id: "yoga_club",
        name: "Yoga Club",
      },
    ],
  },
  {
    id: "alumni",
    name: "Chaitanya Smrithi (The Alumni Club)",
    leadership: [
      {
        role: "Chairman",
        name: "Dr. Suresh Pabboju",
        designation: "Professor",
        department: "IT",
        email: "psuresh_it@cbit.ac.in",
        mobile: "9885313161",
      },
      {
        role: "Vice-Chairman",
        name: "Dr. K. Sagar",
        designation: "Professor",
        department: "CSE",
        email: "ksagar_cse@cbit.ac.in",
        mobile: "9849400136",
      },
      {
        role: "Convener",
        name: "Dr. B. V. S. Rao",
        designation: "Assistant Professor",
        department: "MED",
        email: "bvsrao_mech@cbit.ac.in",
        mobile: "9290545750",
      },
      {
        role: "Co-Convener",
        name: "Sri P. Sreenivas Reddy",
        designation: "Assistant Professor",
        department: "Civil",
        email: "psrinivasareddy_civil@cbit.ac.in",
        mobile: "8106200704",
      },
    ],
    clubs: [
      {
        id: "alumni_association",
        name: "Chaitanya Smrithi (Alumni Association)",
      },
    ],
  },
];

export const CBIT_TECHNICAL_CLUBS: {
  department: string;
  clubs: { id: string; name: string }[];
}[] = [
  {
    department: "Computer Science & Engineering (CSE)",
    clubs: [
      { id: "cosc", name: "Chaitanya Open Source Community (COSC)" },
      { id: "gdsc", name: "Google Developer Student Club (GDSC)" },
      { id: "hackiton", name: "Hackiton - CSE Coding Club" },
      { id: "cse_makers", name: "Makers of India (CSE)" },
    ],
  },
  {
    department: "Information Technology (IT)",
    clubs: [
      { id: "it_cosc", name: "COSC - IT Chapter" },
      { id: "united_coders", name: "United Coders Club" },
    ],
  },
  {
    department: "Electronics & Communication Engineering (ECE)",
    clubs: [
      { id: "ece_ieee", name: "IEEE - ECE Student Chapter" },
      { id: "iete", name: "IETE Student Forum" },
      { id: "ieee_cas", name: "IEEE Circuits & Systems Society (CAS)" },
      { id: "ece_makers", name: "Makers of India (ECE)" },
    ],
  },
  {
    department: "Electrical & Electronics Engineering (EEE)",
    clubs: [
      { id: "eee_ieee", name: "IEEE - EEE Student Branch" },
    ],
  },
  {
    department: "Mechanical Engineering (MED)",
    clubs: [
      { id: "mea", name: "Mechanical Engineering Association (MEA)" },
      { id: "robotics", name: "Robotics & Innovation Club (MED & ECE)" },
      { id: "mech_innovation", name: "Mechanical Innovation Club" },
      { id: "sae", name: "SAE Collegiate Club" },
      { id: "asme", name: "ASME Student Section" },
      { id: "astra", name: "ASTRA - Aerospace & Astronomy Club" },
    ],
  },
  {
    department: "Civil Engineering (CED)",
    clubs: [
      { id: "cea", name: "Civil Engineering Association (CEA)" },
      { id: "ici", name: "Indian Concrete Institute (ICI)" },
      { id: "igbc", name: "Indian Green Building Council (IGBC)" },
    ],
  },
  {
    department: "Chemical Engineering",
    clubs: [
      { id: "iiche", name: "Indian Institute of Chemical Engineers (IIChE)" },
    ],
  },
  {
    department: "Biotechnology",
    clubs: [
      { id: "biotech", name: "Bioengineering & Biotechnology Club" },
    ],
  },
  {
    department: "MCA",
    clubs: [
      { id: "mca_dtc", name: "Digital Transactions Competence Club" },
    ],
  },
  {
    department: "School of Management Studies (SMS)",
    clubs: [
      { id: "sms_think", name: "Think Club - SMS" },
    ],
  },
  {
    department: "Mathematics",
    clubs: [
      { id: "ramanujan", name: "Ramanujan Maths Club" },
    ],
  },
];

export const CBIT_STUDENT_CHAPTERS = [
  "Indian Society for Technical Education (ISTE)",
  "Institute of Electrical and Electronics Engineers (IEEE)",
  "Indian Institute of Chemical Engineers (IIChE)",
  "American Society of Mechanical Engineers (ASME)",
  "Society of Automotive Engineers (SAE)",
  "Institution of Engineers India (IEI)",
  "Indian Society of Mechanical Engineers (ISME)",
];

/**
 * Returns a flat, clean list of all CBIT clubs and departments suitable for
 * coverage forms, filters, and event metadata.
 */
export function getAllCBITClubsList(): { group: string; options: string[] }[] {
  return [
    {
      group: "College Fests & Core Committees",
      options: [
        "CBIT Photo Club (CPC)",
        "Sudhee Tech Fest Committee",
        "Shruthi Annual Cultural Fest Committee",
        "Principal Office / Student Affairs",
      ],
    },
    {
      group: "Cultural & Creative Clubs (Extra-Curricular)",
      options: [
        "Chaitanya Lasya (The Dance Club - UDC)",
        "Chaitanya Geethi (The Singing Club)",
        "Chaitanya Vaadya (Instrumental Music)",
        "Chaitanya Chaya (Film Club)",
        "Chaitanya Chaya (Drama Club)",
        "Chaitanya Srujana (Painting & Crafts)",
        "Chaitanya Sahithi (Communicando)",
        "Chaitanya Sahithi (Toastmasters)",
        "Chaitanya Sahithi (MUN - Model United Nations)",
        "Chaitanya Sahithi (Geervana Bharathi - Sanskrit)",
        "Chaitanya Sahithi (Transcendent)",
        "Chaitanya Kruthi (Writers & Poets Club)",
      ],
    },
    {
      group: "Social Service, Wellness & Lifestyle",
      options: [
        "Chaitanya Seva (NSS - National Service Scheme)",
        "Chaitanya Spandana (Street Cause CBIT)",
        "Engineers Without Borders (EWB)",
        "Technical Seva (Chaitanya Medha)",
        "Electoral Literacy Club (ELC)",
        "Chaitanya Reethi (Parivritha)",
        "Energy Savers Lab (Chaitanya Oorja)",
        "Entrepreneurship Development Cell (EDC - Chaitanya Teja)",
        "Wellness Club (Chaitanya Svaasthya)",
        "Women Safety Club (Chaitanya Suraksha)",
        "Universal Human Values (UHV Club)",
        "Chaitanya Kreeda (Sports Club)",
        "Yoga Club",
        "Chaitanya Smrithi (Alumni Association)",
      ],
    },
    {
      group: "Technical Clubs & Student Chapters (Co-Curricular)",
      options: [
        "COSC (Chaitanya Open Source Community)",
        "GDSC (Google Developer Student Club)",
        "Hackiton (CSE)",
        "United Coders Club (IT)",
        "Makers of India (CSE / ECE)",
        "IEEE Student Branch / Chapter",
        "IETE Student Forum",
        "IEEE Circuits & Systems Society (CAS)",
        "Robotics & Innovation Club",
        "Mechanical Engineering Association (MEA)",
        "SAE Collegiate Club",
        "ASME Student Section",
        "ASTRA (Aerospace & Astronomy)",
        "Civil Engineering Association (CEA)",
        "Indian Concrete Institute (ICI)",
        "Indian Green Building Council (IGBC)",
        "IIChE (Chemical Engineering)",
        "Bioengineering & Biotechnology Club",
        "Digital Transactions Competence (MCA)",
        "Think Club (SMS)",
        "Ramanujan Maths Club",
        "ISTE Student Chapter",
      ],
    },
    {
      group: "Academic Departments",
      options: [
        "CSE Department",
        "IT Department",
        "ECE Department",
        "EEE Department",
        "Mechanical Engineering Department",
        "Civil Engineering Department",
        "Chemical Engineering Department",
        "Biotechnology Department",
        "Artificial Intelligence & Data Science (AI&DS)",
        "Artificial Intelligence & Machine Learning (AIML)",
        "School of Management Studies (SMS - MBA)",
        "MCA Department",
        "Physics / Chemistry / Mathematics (H&S)",
      ],
    },
  ];
}

export const CBIT_CAMPUS_VENUES = [
  "D-Block Seminar Hall",
  "Assembly Hall",
  "N-Block Seminar Hall",
  "SMS Seminar Hall",
  "E-Classroom",
  "R&E Hub",
  "TPO Labs",
  "CDC Conference Hall",
  "Open Air Auditorium (OAT)",
  "Cricket Ground Main Stage",
] as const;

