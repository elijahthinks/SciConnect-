// Example content shown when SciConnect runs without its API (e.g. on a
// static host). Everything lives in memory and resets on reload.

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const ago = (ms) => new Date(Date.now() - ms).toISOString();

const person = (id, firstName, lastName, extra) => ({
  id,
  username: `${firstName}.${lastName}`.toLowerCase(),
  firstName,
  lastName,
  name: `${firstName} ${lastName}`,
  avatar: null,
  userType: 'academic',
  isVerified: true,
  badges: [],
  socialLinks: {},
  education: [],
  publications: [],
  sideProjects: [],
  skillTags: [],
  researchInterests: [],
  ...extra,
});

export const users = [
  person(1, 'Guest', 'Researcher', {
    username: 'guest',
    email: 'guest@sciconnect.local',
    position: 'Visitor',
    institution: 'SciConnect',
    bio: 'Exploring SciConnect. Everything here is example content.',
    isVerified: false,
    researchInterests: ['Open science'],
  }),
  person(2, 'Amara', 'Okafor', {
    position: 'Postdoctoral researcher',
    institution: 'University of Cape Town',
    department: 'Marine Biology',
    fieldOfStudy: 'Marine ecology',
    bio: 'Kelp forests, urchin barrens, and what tips one into the other.',
    researchInterests: ['Kelp ecology', 'Ocean warming', 'Citizen science'],
    skillTags: ['R', 'Underwater survey', 'Bayesian models'],
    education: [{ degree: 'PhD', field: 'Marine Biology', institution: 'University of Cape Town', year: 2022 }],
    publications: [{ title: 'Urchin density thresholds for kelp collapse in the Benguela', journal: 'Marine Ecology Progress Series', year: 2023, doi: '10.0000/demo.meps.2023' }],
  }),
  person(3, 'Lukas', 'Brenner', {
    position: 'PhD candidate',
    institution: 'ETH Zürich',
    department: 'Materials Science',
    fieldOfStudy: 'Battery chemistry',
    bio: 'Trying to make sodium-ion cells last as long as lithium ones.',
    researchInterests: ['Sodium-ion batteries', 'Electrolytes'],
    skillTags: ['Electrochemistry', 'Python', 'XRD'],
    sideProjects: [{ title: 'Open cycler logs', description: 'A public dataset of 400 cycling runs with full metadata.' }],
  }),
  person(4, 'Priya', 'Raman', {
    position: 'Associate professor',
    institution: 'IISc Bangalore',
    department: 'Neuroscience',
    fieldOfStudy: 'Sleep and memory',
    bio: 'Why does a nap help you remember a tune? Recording hippocampal ripples to find out.',
    researchInterests: ['Sleep', 'Memory consolidation', 'Electrophysiology'],
    skillTags: ['MATLAB', 'Spike sorting', 'Mentoring'],
  }),
  person(5, 'Tomás', 'Herrera', {
    position: 'Data scientist',
    institution: 'Instituto Nacional de Salud Pública',
    fieldOfStudy: 'Epidemiology',
    bio: 'Dengue forecasting from weather and search data. Happy to review stats.',
    researchInterests: ['Dengue', 'Forecasting', 'Reproducibility'],
    skillTags: ['Statistics', 'Stan', 'Time series'],
  }),
  person(6, 'Hana', 'Sato', {
    position: 'Research engineer',
    institution: 'RIKEN',
    fieldOfStudy: 'Quantum computing',
    bio: 'Building better error correction for superconducting qubits.',
    researchInterests: ['Quantum error correction', 'Cryogenics'],
    skillTags: ['Qiskit', 'FPGA', 'C++'],
  }),
  person(7, 'Elena', 'Petrova', {
    position: 'Science teacher and hobby astronomer',
    institution: 'Sofia Public Observatory',
    fieldOfStudy: 'Variable stars',
    bio: 'Backyard photometry of variable stars, with my students.',
    userType: 'hobbyist',
    researchInterests: ['Photometry', 'Science education'],
    skillTags: ['Astrophotography', 'Teaching'],
  }),
  person(8, 'Kwame', 'Mensah', {
    position: 'Agronomist',
    institution: 'CSIR Crops Research Institute',
    fieldOfStudy: 'Soil science',
    bio: 'Biochar trials on smallholder cassava farms.',
    researchInterests: ['Soil carbon', 'Cassava', 'Field trials'],
    skillTags: ['Field trials', 'Soil analysis'],
  }),
];

const byId = (id) => users.find((u) => u.id === id);
const brief = (id) => {
  const u = byId(id);
  return { id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName, name: u.name, avatar: null, position: u.position, institution: u.institution, isVerified: u.isVerified };
};

let nextId = 1000;
export const newId = () => nextId++;

export const posts = [
  { id: 101, userId: 2, content: 'Second survey of the Kommetjie transects is done. Urchin counts are down 30% since we started removals in March, and juvenile kelp is coming back on two of the four sites. Still too early to call it, but it is the first good news in a while.', tags: ['kelp', 'marine-ecology', 'fieldwork'], createdAt: ago(40 * MIN) },
  { id: 102, userId: 5, content: 'Reminder that a forecast that is right on average can still be useless for planning. Our dengue model had good RMSE but missed every outbreak peak by two weeks. We are switching to scoring on peak timing instead. Has anyone done this with proper scoring rules?', tags: ['epidemiology', 'forecasting', 'statistics'], createdAt: ago(2 * HOUR) },
  { id: 103, userId: 7, content: 'My Year 10 class caught the dip of an eclipsing binary last night with a 20 cm scope and a phone camera. Light curve attached once we clean it up. Pretty proud of them.', tags: ['astronomy', 'education', 'citizen-science'], createdAt: ago(5 * HOUR) },
  { id: 104, userId: 3, content: 'Uploaded 400 sodium-ion cycling runs with full metadata: cell build, electrolyte batch, temperature, and every failure. Negative results included. Use it, break it, tell me what is wrong with it.', tags: ['batteries', 'open-data', 'materials'], createdAt: ago(9 * HOUR) },
  { id: 105, userId: 4, content: 'Looking for someone with experience in closed-loop auditory stimulation during sleep. We want to time sounds to slow oscillations and see if it changes replay. Open to co-supervising a student.', tags: ['neuroscience', 'sleep', 'collaboration'], createdAt: ago(1 * DAY) },
  { id: 106, userId: 8, content: 'Year-two yields from the biochar plots: +18% cassava root mass on the sandy sites, no difference on clay. Soil moisture seems to be doing the work. Writing it up now.', tags: ['agriculture', 'soil', 'climate'], createdAt: ago(1 * DAY + 6 * HOUR) },
  { id: 107, userId: 6, content: 'We finally got logical error rates below the physical ones on our distance-3 code. Small step, lots of cryostat time. Paper draft is going round the group this week.', tags: ['quantum', 'physics'], createdAt: ago(2 * DAY) },
  { id: 108, userId: 2, content: 'If you dive the Cape Peninsula and photograph urchins, I would love your photos with a date and rough location. Even blurry ones help us map densities.', tags: ['citizen-science', 'kelp'], createdAt: ago(3 * DAY) },
  { id: 109, userId: 5, content: 'Pre-registration is not bureaucracy. It is the cheapest way to make your future self honest.', tags: ['reproducibility', 'open-science'], createdAt: ago(4 * DAY) },
];

export const researchPosts = [
  {
    id: 201, userId: 3, researchType: 'experiment', factCheckStatus: 'verified',
    content: 'Fluorinated ether electrolytes extend sodium-ion cycle life by 2.4× at 45 °C',
    methodology: 'Coin cells with hard-carbon anodes and layered-oxide cathodes, cycled at C/2 for 1,000 cycles across three electrolyte formulations. Five cells per condition, blinded assembly.',
    results: 'Capacity retention after 1,000 cycles was 81% with the fluorinated ether versus 34% for the carbonate baseline. Impedance growth was about a third of baseline.',
    conclusions: 'Electrolyte choice, not cathode coating, dominated high-temperature degradation in our cells.',
    funding: 'Swiss National Science Foundation',
    conflictsOfInterest: 'None declared.',
    citations: [{ title: 'Electrolyte design for sodium-ion batteries', authors: 'Kim et al.', year: 2021 }],
    preprintUrl: 'https://example.org/preprint/sodium-ether',
    tags: ['batteries', 'electrochemistry'], createdAt: ago(6 * HOUR),
  },
  {
    id: 202, userId: 4, researchType: 'results', factCheckStatus: 'pending',
    content: 'Short daytime naps improve melody recall in adults over 60',
    methodology: '48 participants learned two melodies, then either napped for 20 minutes or watched a documentary. Recall was tested after 4 hours. EEG recorded during naps.',
    results: 'Nap group recalled 23% more notes correctly. The benefit correlated with spindle density (r = 0.41).',
    conclusions: 'Even brief naps support musical memory in older adults. Larger replication planned.',
    citations: [],
    tags: ['sleep', 'memory', 'aging'], createdAt: ago(1 * DAY),
  },
  {
    id: 203, userId: 5, researchType: 'methodology', factCheckStatus: 'disputed',
    content: 'Search-trend signals add two weeks of lead time to dengue forecasts',
    methodology: 'Weekly case counts for 32 states, 2015–2024, with temperature, rainfall and search volume for symptom terms. Compared models with and without search data using leave-one-season-out validation.',
    results: 'Adding search data improved peak-timing accuracy from 41% to 63% within one week.',
    conclusions: 'Search data helps, but sensitivity to media coverage needs more work.',
    citations: [{ title: 'Detecting influenza epidemics using search engine query data', authors: 'Ginsberg et al.', year: 2009 }],
    tags: ['epidemiology', 'forecasting'], createdAt: ago(2 * DAY),
  },
  {
    id: 204, userId: 8, researchType: 'case_study', factCheckStatus: 'verified',
    content: 'Biochar raises cassava yields on sandy soils but not on clay',
    methodology: 'Randomised block trial on 12 smallholder farms over two seasons, 10 t/ha biochar against untreated control.',
    results: 'Root mass +18% on sandy soils (p = 0.01), no detectable effect on clay. Soil moisture was the strongest mediator.',
    conclusions: 'Target biochar at sandy, drought-prone plots.',
    funding: 'CGIAR small grants',
    citations: [],
    tags: ['agriculture', 'soil'], createdAt: ago(4 * DAY),
  },
  {
    id: 205, userId: 7, researchType: 'survey', factCheckStatus: 'flagged',
    content: 'Phone cameras are good enough for school-level variable star photometry',
    methodology: 'Twelve students recorded the same eclipsing binary with phones on a 20 cm Dobsonian and compared against a reference CCD.',
    results: 'Phone light curves matched timing of minimum within 4 minutes; depth errors were around 0.15 mag.',
    conclusions: 'Usable for timing, not yet for depth. Calibration help welcome.',
    citations: [],
    tags: ['astronomy', 'education'], createdAt: ago(5 * DAY),
  },
];

export const factChecks = {
  201: [
    { id: 301, type: 'clarification', severity: 'low', status: 'resolved', content: 'Were the five cells per condition from the same electrode batch?', evidence: 'Batch effects can be large in coin cells.', citations: [], voteScore: 4, authorId: 6, createdAt: ago(3 * HOUR) },
  ],
  203: [
    { id: 302, type: 'methodology_concern', severity: 'high', status: 'pending', content: 'Search volume spiked during the 2019 news coverage regardless of cases. The lead time may come from media attention rather than illness.', evidence: 'Compare against a placebo search term with similar media exposure.', citations: [{ title: 'The parable of Google Flu', authors: 'Lazer et al.', year: 2014 }], voteScore: 7, authorId: 4, createdAt: ago(1 * DAY) },
  ],
  205: [
    { id: 303, type: 'citation', severity: 'medium', status: 'pending', content: 'The 0.15 mag figure needs a source or a table of the comparison.', evidence: '', citations: [], voteScore: 2, authorId: 6, createdAt: ago(2 * DAY) },
  ],
};

export const collaborations = {
  202: [
    { id: 401, userId: 5, role: 'Statistician', contribution: 'Mixed-effects analysis of recall data', expertise: ['Statistics', 'Stan'], status: 'accepted', invitedAt: ago(20 * HOUR) },
  ],
  204: [
    { id: 402, userId: 2, role: 'Reviewer', contribution: 'Checking the field-trial design', expertise: ['Field trials'], status: 'pending', invitedAt: ago(2 * DAY) },
  ],
};

export const comments = {
  101: [
    { id: 501, authorId: 8, content: 'Great to see recovery. Are you tracking abalone too?', createdAt: ago(20 * MIN), replies: [] },
  ],
  102: [
    { id: 502, authorId: 4, content: 'We use the continuous ranked probability score for timing. Happy to share code.', createdAt: ago(80 * MIN), replies: [] },
  ],
  104: [
    { id: 503, authorId: 6, content: 'Thank you for including the failures. That is rare.', createdAt: ago(7 * HOUR), replies: [] },
  ],
};

export const reactions = {
  101: { like: [3, 8], heart: [7], insightful: [5] },
  102: { insightful: [2, 4, 6] },
  103: { celebrate: [2, 3, 4, 8], heart: [5] },
  104: { like: [2, 5, 6], insightful: [4] },
  105: { curious: [6, 7] },
  106: { like: [2], insightful: [5] },
  107: { celebrate: [3, 4] },
};

export const groups = [
  { id: 601, name: 'Open Data Club', description: 'Share datasets, ask for help cleaning them, and swap reuse stories.', type: 'public', tags: ['open-data', 'reproducibility'], memberIds: [1, 3, 5, 8] },
  { id: 602, name: 'Ocean Field Notes', description: 'For anyone doing fieldwork at sea or on the shore.', type: 'public', tags: ['marine', 'fieldwork'], memberIds: [2, 8] },
  { id: 603, name: 'Sleep & Memory Journal Club', description: 'One paper every other Thursday. Everyone welcome.', type: 'public', tags: ['neuroscience', 'sleep'], memberIds: [4, 5, 6] },
  { id: 604, name: 'Backyard Astronomers', description: 'Observing logs, kit advice and outreach ideas.', type: 'public', tags: ['astronomy', 'citizen-science'], memberIds: [1, 7] },
  { id: 605, name: 'Battery Builders', description: 'Cell chemistry, cycling rigs and failure analysis.', type: 'public', tags: ['batteries', 'materials'], memberIds: [3, 6] },
];

export const groupMessages = {
  601: [
    { id: 701, senderId: 3, content: 'Uploaded the cycling dataset. Feedback on the metadata schema welcome.', createdAt: ago(8 * HOUR) },
    { id: 702, senderId: 5, content: 'Looks good. Could you add the cell build date as ISO 8601?', createdAt: ago(7 * HOUR) },
    { id: 703, senderId: 8, content: 'Stealing this schema for our soil data.', createdAt: ago(3 * HOUR) },
  ],
  604: [
    { id: 704, senderId: 7, content: 'Clear skies forecast for Saturday. Anyone joining the Algol watch?', createdAt: ago(1 * DAY) },
  ],
};

export const conversations = [
  { id: 801, otherId: 2, messages: [
    { id: 811, senderId: 2, content: 'Hi! Saw you were looking around SciConnect. Ask me anything about kelp.', createdAt: ago(3 * HOUR) },
  ] },
  { id: 802, otherId: 5, messages: [
    { id: 812, senderId: 1, content: 'Is the dengue model code public?', createdAt: ago(1 * DAY) },
    { id: 813, senderId: 5, content: 'Yes, it is linked from the preprint. The forecasting notebook is the place to start.', createdAt: ago(23 * HOUR) },
  ] },
];

export const notifications = [
  { id: 901, type: 'message', content: 'Amara Okafor sent you a message.', read: false, createdAt: ago(3 * HOUR) },
  { id: 902, type: 'follow', content: 'Elena Petrova started following you.', read: false, createdAt: ago(10 * HOUR) },
  { id: 903, type: 'group', content: 'New messages in Open Data Club.', read: true, createdAt: ago(1 * DAY) },
];

export const following = [2, 5];
export const followers = [7, 2];

export { brief, byId, ago };
