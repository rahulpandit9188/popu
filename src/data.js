import { extraClassPages } from './classData.js';

export const classPageKeys = {
  'class-9': 'Class 9',
  'class-10': 'Class 10',
  'class-11': 'Class 11',
  'class-12': 'Class 12',
  graduation: 'Graduation',
};

export const navLinks = [
  { href: '#home', label: 'Home', icon: 'fas fa-home' },
  { href: '#classes', label: 'Classes', icon: 'fas fa-layer-group' },
  { href: '#subjects', label: 'Subjects', icon: 'fas fa-book-open' },
  { href: '#notes', label: 'Notes', icon: 'fas fa-file-alt' },
  { href: '#mcqs', label: 'MCQs', icon: 'fas fa-check-square' },
  { href: '#questions', label: 'Questions', icon: 'fas fa-circle-question' },
];

export const heroSubjects = [
  { name: 'Physics', notes: '24 Notes' },
  { name: 'Chemistry', notes: '31 Notes' },
  { name: 'Mathematics', notes: '28 Notes' },
];

export const popularSearches = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Accountancy',
  'Computer Science',
];

export const boards = [
  'CBSE',
  'ICSE',
  'UP Board',
  'RBSE',
  'MP Board',
  'Bihar Board',
  'Maharashtra Board',
  'Other State Board',
];

export const mediums = ['English', 'Hindi'];

export const classPages = {
  'Class 9': {
    number: '9',
    title: 'Class 9',
    subtitle: 'Build a strong foundation with chapter-wise notes, questions, and PDFs.',
    info: 'NCERT-aligned study materials for every subject',
    subjects: [
      {
        name: 'Mathematics',
        icon: 'fas fa-calculator',
        description: 'Number systems, algebra, geometry, mensuration, and statistics.',
        chapters: [
          {
            title: 'Number Systems',
            meta: 'Chapter 1',
            description: 'Rational and irrational numbers, real numbers on the number line, and laws of exponents.',
          },
          {
            title: 'Polynomials',
            meta: 'Chapter 2',
            description: 'Zeros of a polynomial, remainder theorem, factorisation, and algebraic identities.',
          },
          {
            title: 'Coordinate Geometry',
            meta: 'Chapter 3',
            description: 'Cartesian plane, plotting points, and locating coordinates of given points.',
          },
          {
            title: 'Linear Equations in Two Variables',
            meta: 'Chapter 4',
            description: 'Solutions of linear equations and their graphical representation on a plane.',
          },
          {
            title: "Introduction to Euclid's Geometry",
            meta: 'Chapter 5',
            description: "Euclid's definitions, axioms, postulates, and equivalent versions of the fifth postulate.",
          },
          {
            title: 'Lines and Angles',
            meta: 'Chapter 6',
            description: 'Intersecting lines, parallel lines, corresponding angles, and angle-sum properties.',
          },
          {
            title: 'Triangles',
            meta: 'Chapter 7',
            description: 'Congruence criteria, inequalities in a triangle, and properties of sides and angles.',
          },
          {
            title: 'Quadrilaterals',
            meta: 'Chapter 8',
            description: 'Properties of parallelograms, mid-point theorem, and types of quadrilaterals.',
          },
          {
            title: 'Circles',
            meta: 'Chapter 9',
            description: 'Chords, arcs, cyclic quadrilaterals, and angle subtended by an arc.',
          },
          {
            title: "Heron's Formula",
            meta: 'Chapter 10',
            description: 'Area of a triangle using Heron’s formula and applications to quadrilaterals.',
          },
          {
            title: 'Surface Areas and Volumes',
            meta: 'Chapter 11',
            description: 'Surface area and volume of cubes, cuboids, cylinders, cones, and spheres.',
          },
          {
            title: 'Statistics',
            meta: 'Chapter 12',
            description: 'Collection of data, frequency distribution, bar graphs, histograms, and frequency polygons.',
          },
        ],
      },
      {
        name: 'Physics',
        icon: 'fas fa-atom',
        description: 'Complete Class 9 Physics — from motion and force to light, heat, and electricity.',
        chapters: [
          {
            title: 'Motion',
            meta: 'Chapter 1',
            description: 'Distance, displacement, speed, velocity, acceleration, and equations of motion.',
          },
          {
            title: 'Force and Laws of Motion',
            meta: 'Chapter 2',
            description: "Newton's laws, inertia, momentum, and action-reaction pairs with numericals.",
          },
          {
            title: 'Gravitation',
            meta: 'Chapter 3',
            description: 'Universal law of gravitation, free fall, mass vs weight, and acceleration due to gravity.',
          },
          {
            title: 'Floatation',
            meta: 'Chapter 4',
            description: "Thrust, pressure, buoyancy, Archimedes' principle, and why objects float or sink.",
          },
          {
            title: 'Work and Energy',
            meta: 'Chapter 5',
            description: 'Work, kinetic and potential energy, law of conservation of energy, and power.',
          },
          {
            title: 'Sound',
            meta: 'Chapter 6',
            description: 'Production and propagation of sound, characteristics of waves, echo, and SONAR.',
          },
          {
            title: 'Heat',
            meta: 'Chapter 7',
            description: 'Temperature, heat transfer, expansion of solids, liquids and gases, and specific heat.',
          },
          {
            title: 'Light',
            meta: 'Chapter 8',
            description: 'Reflection of light, plane mirrors, spherical mirrors, and image formation.',
          },
          {
            title: 'Electricity',
            meta: 'Chapter 9',
            description: "Electric current, potential difference, Ohm's law, resistance, and simple circuits.",
          },
          {
            title: 'Magnetism',
            meta: 'Chapter 10',
            description: 'Magnetic field, poles of a magnet, magnetic effects of current, and electromagnets.',
          },
        ],
      },
      {
        name: 'Chemistry',
        icon: 'fas fa-flask',
        description: 'Matter, mixtures, atoms, molecules, and atomic structure.',
        chapters: [
          {
            title: 'Matter in Our Surroundings',
            meta: 'Chapter 1 • Science',
            description: 'States of matter, change of state, evaporation, and the effect of temperature and pressure.',
          },
          {
            title: 'Is Matter Around Us Pure?',
            meta: 'Chapter 2 • Science',
            description: 'Mixtures, solutions, colloids, suspensions, and methods of separation.',
          },
          {
            title: 'Atoms and Molecules',
            meta: 'Chapter 3 • Science',
            description: 'Laws of chemical combination, atoms, molecules, ions, and mole concept.',
          },
          {
            title: 'Structure of the Atom',
            meta: 'Chapter 4 • Science',
            description: 'Atomic models, electrons, protons, neutrons, valency, and atomic number.',
          },
        ],
      },
      {
        name: 'Biology',
        icon: 'fas fa-dna',
        description: 'Cell structure, tissues, and improvement in food resources.',
        chapters: [
          {
            title: 'The Fundamental Unit of Life',
            meta: 'Chapter 5 • Science',
            description: 'Cell theory, plasma membrane, nucleus, organelles, and differences between plant and animal cells.',
          },
          {
            title: 'Tissues',
            meta: 'Chapter 6 • Science',
            description: 'Plant tissues, animal tissues, meristematic vs permanent tissue, and their functions.',
          },
          {
            title: 'Improvement in Food Resources',
            meta: 'Chapter 12 • Science',
            description: 'Crop production, animal husbandry, and sustainable agricultural practices.',
          },
        ],
      },
      {
        name: 'English',
        icon: 'fas fa-language',
        description: 'Beehive and Moments — prose, poetry, and grammar practice.',
        chapters: [
          {
            title: 'The Fun They Had',
            meta: 'Beehive • Chapter 1',
            description: 'A story of future schooling, mechanical teachers, and the value of real classrooms.',
          },
          {
            title: 'The Sound of Music',
            meta: 'Beehive • Chapter 2',
            description: 'Evelyn Glennie and Bismillah Khan — determination, music, and overcoming challenges.',
          },
          {
            title: 'The Little Girl',
            meta: 'Beehive • Chapter 3',
            description: 'Kezia’s changing relationship with her father and the meaning of parental love.',
          },
          {
            title: 'A Truly Beautiful Mind',
            meta: 'Beehive • Chapter 4',
            description: 'Albert Einstein’s life, scientific ideas, and his concern for humanity.',
          },
          {
            title: 'The Lost Child',
            meta: 'Moments • Chapter 1',
            description: 'A child at a fair who realises that parents matter more than toys and sweets.',
          },
          {
            title: 'The Adventures of Toto',
            meta: 'Moments • Chapter 2',
            description: 'Ruskin Bond’s humorous account of a mischievous pet monkey.',
          },
        ],
      },
      {
        name: 'Hindi',
        icon: 'fas fa-book',
        description: 'Kshitij, Sparsh, and grammar notes for Class 9 Hindi.',
        chapters: [
          {
            title: 'दो बैलों की कथा',
            meta: 'क्षितिज • गद्य',
            description: 'प्रेमचंद की कहानी — स्वतंत्रता, शोषण, और साहस के भाव पर आधारित नोट्स।',
          },
          {
            title: 'ल्हासा की ओर',
            meta: 'क्षितिज • गद्य',
            description: 'यात्रा वृत्तांत के माध्यम से तिब्बत की संस्कृति और कठिनाइयों का अध्ययन।',
          },
          {
            title: 'साखियाँ एवं सबद',
            meta: 'क्षितिज • काव्य',
            description: 'कबीर की साखियाँ — गुरु, ज्ञान, और सामाजिक कुरूपता पर टिप्पणी।',
          },
          {
            title: 'व्याकरण: संधि एवं समास',
            meta: 'व्याकरण',
            description: 'संधि के भेद, समास के प्रकार, और परीक्षा के लिए महत्वपूर्ण उदाहरण।',
          },
        ],
      },
      {
        name: 'History',
        icon: 'fas fa-landmark',
        description: 'India and the Contemporary World — revolutions and modern history.',
        chapters: [
          {
            title: 'The French Revolution',
            meta: 'Chapter 1',
            description: 'Causes of the revolution, estates, rise of Napoleon, and ideas of liberty and equality.',
          },
          {
            title: 'Socialism in Europe and the Russian Revolution',
            meta: 'Chapter 2',
            description: 'Industrial society, socialist ideas, 1917 revolution, and changes in Russia.',
          },
          {
            title: 'Nazism and the Rise of Hitler',
            meta: 'Chapter 3',
            description: 'Weimar Republic, Hitler’s rise, Nazi ideology, and the Second World War.',
          },
          {
            title: 'Forest Society and Colonialism',
            meta: 'Chapter 4',
            description: 'Colonial forest policies, deforestation, and tribal resistance movements.',
          },
          {
            title: 'Pastoralists in the Modern World',
            meta: 'Chapter 5',
            description: 'Pastoral communities, colonial laws, and how modern states affected nomadic life.',
          },
        ],
      },
      {
        name: 'Geography',
        icon: 'fas fa-globe-americas',
        description: 'Contemporary India — physical features, climate, and population.',
        chapters: [
          {
            title: 'India – Size and Location',
            meta: 'Chapter 1',
            description: 'Location, neighbours, standard meridian, and India’s place in the world.',
          },
          {
            title: 'Physical Features of India',
            meta: 'Chapter 2',
            description: 'Himalayas, Northern Plains, Peninsular Plateau, coastal plains, and islands.',
          },
          {
            title: 'Drainage',
            meta: 'Chapter 3',
            description: 'Himalayan and Peninsular rivers, lakes, and the importance of rivers.',
          },
          {
            title: 'Climate',
            meta: 'Chapter 4',
            description: 'Monsoon mechanism, seasons, rainfall distribution, and climatic controls.',
          },
          {
            title: 'Natural Vegetation and Wildlife',
            meta: 'Chapter 5',
            description: 'Types of vegetation, wildlife, and conservation of forests and animals.',
          },
          {
            title: 'Population',
            meta: 'Chapter 6',
            description: 'Population size, distribution, density, growth, and literacy in India.',
          },
        ],
      },
      {
        name: 'Political Science',
        icon: 'fas fa-balance-scale',
        description: 'Democratic Politics — constitution, elections, and rights.',
        chapters: [
          {
            title: 'What is Democracy? Why Democracy?',
            meta: 'Chapter 1',
            description: 'Features of democracy, arguments for and against, and broader meaning of democracy.',
          },
          {
            title: 'Constitutional Design',
            meta: 'Chapter 2',
            description: 'Making of the Indian Constitution, guiding values, and institutional design.',
          },
          {
            title: 'Electoral Politics',
            meta: 'Chapter 3',
            description: 'Why elections, how they work in India, and what makes elections democratic.',
          },
          {
            title: 'Working of Institutions',
            meta: 'Chapter 4',
            description: 'Parliament, the executive, the judiciary, and how major decisions are taken.',
          },
          {
            title: 'Democratic Rights',
            meta: 'Chapter 5',
            description: 'Fundamental Rights, Right to Information, and expanding the scope of rights.',
          },
        ],
      },
      {
        name: 'Economics',
        icon: 'fas fa-coins',
        description: 'Village economy, human resources, poverty, and food security.',
        chapters: [
          {
            title: 'The Story of Village Palampur',
            meta: 'Chapter 1',
            description: 'Factors of production, farming, and non-farm activities in a village economy.',
          },
          {
            title: 'People as Resource',
            meta: 'Chapter 2',
            description: 'Human capital, education, health, unemployment, and the quality of population.',
          },
          {
            title: 'Poverty as a Challenge',
            meta: 'Chapter 3',
            description: 'Poverty estimates, causes, vulnerable groups, and anti-poverty measures.',
          },
          {
            title: 'Food Security in India',
            meta: 'Chapter 4',
            description: 'Food security, buffer stock, PDS, and the role of cooperatives.',
          },
        ],
      },
      {
        name: 'Computer Applications',
        icon: 'fas fa-laptop-code',
        description: 'Computer basics, cyber safety, office tools, and introductory programming.',
        chapters: [
          {
            title: 'Basics of Computer System',
            meta: 'Chapter 1',
            description: 'Hardware, software, memory, input-output devices, and how a computer works.',
          },
          {
            title: 'Cyber Safety',
            meta: 'Chapter 2',
            description: 'Safe browsing, passwords, cyberbullying, and responsible use of the internet.',
          },
          {
            title: 'Office Tools',
            meta: 'Chapter 3',
            description: 'Word processing, spreadsheets, and presentations for school projects.',
          },
          {
            title: 'Introduction to Programming',
            meta: 'Chapter 4',
            description: 'Algorithms, flowcharts, and getting started with Scratch or Python.',
          },
        ],
      },
    ],
  },
  ...extraClassPages,
};

export const classes = [
  {
    number: '9',
    title: 'Class 9',
    description: 'Build your foundation',
    info: 'Subjects: 11',
    button: 'Explore Class 9',
  },
  {
    number: '10',
    title: 'Class 10',
    description: 'Prepare with confidence',
    info: 'Subjects: 11',
    button: 'Explore Class 10',
  },
  {
    number: '11',
    title: 'Class 11',
    description: 'Strengthen your concepts',
    info: 'Streams: Science • Commerce • Arts',
    button: 'Explore Class 11',
  },
  {
    number: '12',
    title: 'Class 12',
    description: 'Prepare for your exams',
    info: 'Streams: Science • Commerce • Arts',
    button: 'Explore Class 12',
  },
  {
    number: '🎓',
    title: 'Graduation',
    description: 'Master your degree subjects',
    info: 'Courses: B.A. • B.Sc. • B.Com. • BCA • BBA',
    button: 'Explore Graduation',
  },
];

export const streams = [
  {
    icon: '🔬',
    title: 'SCIENCE',
    subjects: 'Physics • Chemistry • Biology • Mathematics',
  },
  {
    icon: '💼',
    title: 'COMMERCE',
    subjects: 'Accountancy • Business Studies • Economics',
  },
  {
    icon: '🎓',
    title: 'ARTS & HUMANITIES',
    subjects: 'History • Geography • Political Science • Sociology',
  },
];

export const subjects = [
  { name: 'Mathematics', count: '240+ notes', icon: 'fas fa-calculator' },
  { name: 'Physics', count: '180+ notes', icon: 'fas fa-atom' },
  { name: 'Chemistry', count: '160+ notes', icon: 'fas fa-flask' },
  { name: 'Biology', count: '200+ notes', icon: 'fas fa-dna' },
  { name: 'English', count: '120+ notes', icon: 'fas fa-language' },
  { name: 'Accountancy', count: '150+ notes', icon: 'fas fa-chart-line' },
  { name: 'Economics', count: '100+ notes', icon: 'fas fa-coins' },
  { name: 'Computer Science', count: '80+ notes', icon: 'fas fa-laptop-code' },
  { name: 'History', count: '90+ notes', icon: 'fas fa-landmark' },
  { name: 'Geography', count: '85+ notes', icon: 'fas fa-globe-americas' },
  { name: 'Political Science', count: '75+ notes', icon: 'fas fa-balance-scale' },
  { name: 'Business Studies', count: '110+ notes', icon: 'fas fa-briefcase' },
];

export const featuredNotes = [
  {
    badge: 'Class 10 • Science',
    title: 'Chemical Reactions and Equations',
    meta: 'Chapter 1 • Chemistry',
    description:
      'Complete notes covering types of chemical reactions, balancing equations, and important examples with practice problems.',
  },
  {
    badge: 'Class 12 • Physics',
    title: 'Electromagnetic Induction',
    meta: 'Chapter 6 • Physics',
    description:
      "Detailed explanation of Faraday's law, Lenz's law, self-induction, and mutual induction with solved examples.",
  },
  {
    badge: 'Class 11 • Chemistry',
    title: 'Structure of Atom',
    meta: 'Chapter 2 • Chemistry',
    description:
      'Comprehensive coverage of atomic models, quantum numbers, electronic configuration and important concepts.',
  },
  {
    badge: 'Class 10 • Mathematics',
    title: 'Real Numbers',
    meta: 'Chapter 1 • Mathematics',
    description:
      "Complete study material on Euclid's division lemma, HCF, LCM, and fundamental theorem of arithmetic.",
  },
  {
    badge: 'Class 12 • Accountancy',
    title: 'Accounting for Partnership',
    meta: 'Part 1 • Accountancy',
    description:
      'Detailed notes on partnership firm formation, profit sharing, admission, retirement and dissolution.',
  },
  {
    badge: 'Class 11 • Biology',
    title: 'Cell: The Unit of Life',
    meta: 'Chapter 8 • Biology',
    description:
      'Complete study of cell structure, organelles, prokaryotic and eukaryotic cells with diagrams and functions.',
  },
];

export const features = [
  {
    icon: 'fas fa-book-open',
    title: 'Comprehensive Notes',
    description:
      'Easy-to-understand notes organized chapter by chapter with clear explanations and examples.',
  },
  {
    icon: 'fas fa-search',
    title: 'Powerful Search',
    description:
      'Find exactly what you need in seconds with our advanced search functionality.',
  },
  {
    icon: 'fas fa-question-circle',
    title: 'Important Questions',
    description:
      'Focus on questions that matter most for exams with our curated important questions.',
  },
  {
    icon: 'fas fa-check-square',
    title: 'MCQs & Quizzes',
    description:
      'Test your knowledge and track your performance with interactive quizzes and MCQs.',
  },
  {
    icon: 'fas fa-file-pdf',
    title: 'PDF Downloads',
    description:
      'Download notes and study materials as PDFs for offline studying anytime, anywhere.',
  },
  {
    icon: 'fas fa-mobile-alt',
    title: 'Learn Anywhere',
    description:
      'A fully responsive experience optimized for mobile, tablet, and desktop devices.',
  },
];

export const steps = [
  {
    number: '1',
    title: 'Choose Your Class',
    description:
      'Select your class, stream, or degree program from our comprehensive options.',
  },
  {
    number: '2',
    title: 'Pick a Subject',
    description:
      'Browse subjects and chapters to find exactly what you want to study.',
  },
  {
    number: '3',
    title: 'Start Learning',
    description:
      'Read notes, practice questions, take quizzes, or download PDFs for offline study.',
  },
];

export const stats = [
  { target: 10000, label: 'Study Notes' },
  { target: 500, label: 'Chapters' },
  { target: 100, label: 'Subjects' },
  { target: 50000, label: 'Students' },
];

export const testimonials = [
  {
    text: 'StudyNotes makes revision so much easier. I can find chapter-wise notes without wasting time searching everywhere.',
    name: 'Rahul',
    role: 'Class 12 Student',
    initial: 'R',
  },
  {
    text: 'The notes are organized perfectly and the MCQs are really useful for exam preparation. Highly recommended!',
    name: 'Priya',
    role: 'Class 10 Student',
    initial: 'P',
  },
  {
    text: 'Having all my BCA subjects in one place is extremely convenient. The PDF downloads are a great feature.',
    name: 'Aman',
    role: 'BCA Student',
    initial: 'A',
  },
];

export const faqs = [
  {
    question: 'What classes are covered?',
    answer:
      'StudyNotes provides comprehensive resources from Class 9 through Class 12 and Graduation level courses including B.A., B.Sc., B.Com., BCA, and BBA.',
  },
  {
    question: 'Are the notes free?',
    answer:
      'We offer both free and premium content. Basic notes and study materials are available for free, while premium features include advanced notes, practice tests, and downloadable PDFs.',
  },
  {
    question: 'Can I download notes as PDF?',
    answer:
      'Yes, notes that have downloadable PDFs will include a PDF download option. You can study offline by downloading these materials to your device.',
  },
  {
    question: 'Can I use StudyNotes on mobile?',
    answer:
      'Absolutely! Our website is fully responsive and optimized for mobile, tablet, and desktop devices. You can study seamlessly across all platforms.',
  },
  {
    question: 'Do you provide MCQs?',
    answer:
      'Yes, many subjects and chapters include chapter-wise MCQs and interactive quizzes to help you test your knowledge and prepare for exams effectively.',
  },
];

export const footerColumns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', href: '#home' },
      { label: 'Classes', href: '#classes' },
      { label: 'Subjects', href: '#subjects' },
      { label: 'Notes', href: '#notes' },
      { label: 'MCQs', href: '#mcqs' },
    ],
  },
  {
    title: 'Classes',
    links: [
      { label: 'Class 9', href: '#class-9' },
      { label: 'Class 10', href: '#class-10' },
      { label: 'Class 11', href: '#class-11' },
      { label: 'Class 12', href: '#class-12' },
      { label: 'Graduation', href: '#graduation' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Important Questions', href: '#' },
      { label: 'Previous Year Questions', href: '#' },
      { label: 'Quizzes', href: '#' },
      { label: 'PDF Notes', href: '#' },
      { label: 'Practice Tests', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
];

export const socialLinks = [
  { label: 'Instagram', icon: 'fab fa-instagram' },
  { label: 'YouTube', icon: 'fab fa-youtube' },
  { label: 'Telegram', icon: 'fab fa-telegram' },
  { label: 'Facebook', icon: 'fab fa-facebook' },
];
