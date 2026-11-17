export interface MemberInfo {
  name: string;
  role: string;
  instagram?: string;
  email?: string;
}

export interface GenTreeData {
  id: string;
  genLabel: string;
  yearRange: string;
  statusLabel: string;
  isCurrent?: boolean;
  president: MemberInfo[];
  vicePresident: MemberInfo[];
  creativeDirector?: MemberInfo[];
  generalSecretary: MemberInfo[];
  jointSecretary?: MemberInfo[];
  departmentHeads: {
    department: string;
    members: MemberInfo[];
  }[];
}

export interface HistoricalGenData {
  id: string;
  genLabel: string;
  yearRange: string;
  statusLabel: string;
  members: MemberInfo[];
}

// 12th Generation (Current Active Board 2026-27)
export const active12thGenMembers: MemberInfo[] = [
  { name: "Niteesh", role: "President", instagram: "https://instagram.com/_nitarora" },
  { name: "Sai Sankeerth Reddy", role: "Vice President", instagram: "https://instagram.com/sai_sankeerth_reddy" },
  { name: "Varun Teja Cherukuthota", role: "Creative Director", instagram: "https://instagram.com/vrooms_diaries" },
  { name: "Hamsini", role: "General Secretary", instagram: "https://instagram.com/_hamsiniii" },
  { name: "Kevin Tejas", role: "Joint Secretary", instagram: "https://instagram.com/kev.inseye" },
  { name: "Mahitha Vedantam", role: "Joint Secretary", instagram: "https://instagram.com/hitha_chithraalu" },
  { name: "Ram Shri Varun", role: "Head of Social Media & PR", instagram: "https://instagram.com/cbitphotoclub" },
  { name: "Surya Teja Jangili", role: "Image Processing Lead", instagram: "https://instagram.com/ocutales" },
  { name: "Rashmith Sheela", role: "Head of Events & Documentation", instagram: "https://instagram.com/rashmithsheela" },
];

export const gen12Tree: GenTreeData = {
  id: "12th",
  genLabel: "12th Gen",
  yearRange: "2026–27",
  statusLabel: "Current Executive Board",
  isCurrent: true,
  president: [
    { name: "Niteesh", role: "President", instagram: "https://instagram.com/_nitarora" },
  ],
  vicePresident: [
    { name: "Sai Sankeerth Reddy", role: "Vice President", instagram: "https://instagram.com/sai_sankeerth_reddy" },
  ],
  creativeDirector: [
    { name: "Varun Teja Cherukuthota", role: "Creative Director", instagram: "https://instagram.com/vrooms_diaries" },
  ],
  generalSecretary: [
    { name: "Hamsini", role: "General Secretary", instagram: "https://instagram.com/_hamsiniii" },
  ],
  jointSecretary: [
    { name: "Kevin Tejas", role: "Joint Secretary", instagram: "https://instagram.com/kev.inseye" },
    { name: "Mahitha Vedantam", role: "Joint Secretary", instagram: "https://instagram.com/hitha_chithraalu" },
  ],
  departmentHeads: [
    {
      department: "PR & Social Media",
      members: [
        { name: "Ram Shri Varun", role: "Head of Social Media & PR", instagram: "https://instagram.com/cbitphotoclub" },
      ],
    },
    {
      department: "Image Processing",
      members: [
        { name: "Surya Teja Jangili", role: "Image Processing Lead", instagram: "https://instagram.com/ocutales" },
      ],
    },
    {
      department: "Events & Documentation",
      members: [
        { name: "Rashmith Sheela", role: "Head of Events & Documentation", instagram: "https://instagram.com/rashmithsheela" },
      ],
    },
  ],
};

export const previousGenerations: HistoricalGenData[] = [
  {
    id: "11th",
    genLabel: "11th Gen",
    yearRange: "2025–26",
    statusLabel: "Alumni Board",
    members: [
      { name: "Adarsh", role: "President", instagram: "https://instagram.com/pxl_vision9" },
      { name: "Sowmya", role: "Vice President", instagram: "https://instagram.com/soo_full" },
      { name: "Nanda Kishore", role: "General Secretary", instagram: "https://instagram.com/nk__archives" },
      { name: "Medha Bonu", role: "General Secretary", instagram: "https://instagram.com/medhawscapes" },
      { name: "Aumer Ali", role: "Joint Secretary", instagram: "https://instagram.com/aumeecam" },
      { name: "Indradeep Roy", role: "Joint Secretary", instagram: "https://instagram.com/indradeep2004" },
      { name: "Ram Shri Varun", role: "Documentation Head", instagram: "https://instagram.com/cbitphotoclub" },
      { name: "Pavan Sriram", role: "Events Head", instagram: "https://instagram.com/pavan_sriram" },
      { name: "Hamsini", role: "Media Head", instagram: "https://instagram.com/_hamsiniii" },
      { name: "Surya Teja", role: "Media Head", instagram: "https://instagram.com/ocutales" },
    ],
  },
  {
    id: "10th",
    genLabel: "10th Gen",
    yearRange: "2024–25",
    statusLabel: "Alumni Board",
    members: [
      { name: "Sreekar", role: "President" },
      { name: "Varun", role: "Vice President" },
      { name: "Sujith", role: "General Secretary" },
      { name: "Sowmya", role: "Joint Secretary" },
      { name: "Niteesh", role: "Joint Secretary" },
      { name: "Adarsh", role: "Documentation Head" },
      { name: "Aumer Ali", role: "Events Head" },
      { name: "Nanda Kishore", role: "Media Head" },
    ],
  },
  {
    id: "9th",
    genLabel: "9th Gen",
    yearRange: "2023–24",
    statusLabel: "Alumni Board",
    members: [
      { name: "Kaushik", role: "President" },
      { name: "Charitha", role: "Vice President" },
      { name: "Varun", role: "General Secretary" },
      { name: "Sreekar", role: "Joint Secretary" },
      { name: "Praneeth", role: "Documentation Head" },
      { name: "Sujith", role: "Events Head" },
      { name: "Sowmya", role: "Media Head" },
    ],
  },
];

