/**
 * Predefined Course Modules for GapZero Learning Paths
 *
 * Structure:
 *   gradeGroup → subject → array of modules (4 weeks / 1 month)
 *
 * Grade Groups: "1-3" (Grades 1–3), "4-5" (Grades 4–5)
 * Subject Groups: Group A = Math, Science  |  Group B = English, Social
 * Volunteer picks ONE from each group (2 subjects total)
 *
 * Each module represents ~1 week of teaching (2-3 sessions)
 * Total: 4 modules per subject × 2 subjects = 8 modules over 1 month
 */

const courseModules = {
  '1-3': {
    Math: [
      {
        week: 1,
        title: 'Numbers & Counting',
        topic: 'Number Recognition and Counting (1-100)',
        description: 'Students learn to recognize, read, write, and count numbers up to 100. Includes skip counting by 2s, 5s, and 10s.',
        sessions: [
          { title: 'Counting Objects & Number Names', duration: 45, activities: ['Counting game with objects', 'Number name matching cards'] },
          { title: 'Skip Counting & Number Patterns', duration: 45, activities: ['Skip counting songs', 'Pattern worksheets'] }
        ],
        learningOutcomes: ['Count forward and backward to 100', 'Identify number patterns', 'Write number names']
      },
      {
        week: 2,
        title: 'Addition & Subtraction Basics',
        topic: 'Single and Double Digit Addition & Subtraction',
        description: 'Building fluency with addition and subtraction using visual aids, number lines, and real-world examples.',
        sessions: [
          { title: 'Addition with Objects & Pictures', duration: 45, activities: ['Object grouping', 'Picture addition worksheets'] },
          { title: 'Subtraction Stories & Number Lines', duration: 45, activities: ['Story problems', 'Number line practice'] }
        ],
        learningOutcomes: ['Add numbers up to 20', 'Subtract numbers up to 20', 'Solve word problems']
      },
      {
        week: 3,
        title: 'Shapes & Measurements',
        topic: 'Basic Geometry and Measurement Concepts',
        description: 'Identifying 2D and 3D shapes, understanding length, weight, and capacity through hands-on activities.',
        sessions: [
          { title: 'Shapes Around Us', duration: 45, activities: ['Shape hunt game', 'Drawing shapes'] },
          { title: 'Measuring Things', duration: 45, activities: ['Measuring with hand spans', 'Comparing weights'] }
        ],
        learningOutcomes: ['Name basic 2D and 3D shapes', 'Compare lengths and weights', 'Use non-standard units']
      },
      {
        week: 4,
        title: 'Multiplication Introduction',
        topic: 'Introduction to Multiplication as Repeated Addition',
        description: 'Understanding multiplication through groups, arrays, and skip counting. Tables of 2, 5, and 10.',
        sessions: [
          { title: 'Groups and Arrays', duration: 45, activities: ['Equal groups with objects', 'Array drawing'] },
          { title: 'Times Tables Fun', duration: 45, activities: ['Multiplication songs', 'Flash card games'] }
        ],
        learningOutcomes: ['Understand multiplication as repeated addition', 'Know tables of 2, 5, 10', 'Solve simple multiplication']
      }
    ],
    Science: [
      {
        week: 1,
        title: 'Living & Non-Living Things',
        topic: 'Characteristics of Living and Non-Living Things',
        description: 'Distinguishing living from non-living things, understanding basic needs of living things (food, water, air, shelter).',
        sessions: [
          { title: 'What is Alive?', duration: 45, activities: ['Sorting game', 'Nature walk observation'] },
          { title: 'Needs of Living Things', duration: 45, activities: ['Plant watering experiment', 'Drawing needs chart'] }
        ],
        learningOutcomes: ['Classify living vs non-living', 'List basic needs of living things', 'Observe nature']
      },
      {
        week: 2,
        title: 'Plants Around Us',
        topic: 'Parts of a Plant and How Plants Grow',
        description: 'Identifying parts of a plant (roots, stem, leaves, flower, fruit), understanding how seeds grow into plants.',
        sessions: [
          { title: 'Parts of a Plant', duration: 45, activities: ['Plant labeling', 'Leaf collection'] },
          { title: 'Seed to Plant Journey', duration: 45, activities: ['Seed planting activity', 'Growth journal'] }
        ],
        learningOutcomes: ['Name parts of a plant', 'Describe plant growth stages', 'Understand what plants need']
      },
      {
        week: 3,
        title: 'Animals & Their Homes',
        topic: 'Animal Habitats and Food Chains',
        description: 'Different types of animal homes, what animals eat (herbivore, carnivore, omnivore), and simple food chains.',
        sessions: [
          { title: 'Where Do Animals Live?', duration: 45, activities: ['Habitat matching game', 'Animal home drawing'] },
          { title: 'What Do Animals Eat?', duration: 45, activities: ['Food chain activity', 'Animal diet sorting'] }
        ],
        learningOutcomes: ['Name different animal habitats', 'Classify animals by diet', 'Draw simple food chains']
      },
      {
        week: 4,
        title: 'Water & Weather',
        topic: 'Water Cycle and Weather Patterns',
        description: 'Understanding where water comes from, states of water, basic weather types, and seasonal changes.',
        sessions: [
          { title: 'The Water Cycle', duration: 45, activities: ['Water cycle diagram', 'Evaporation experiment'] },
          { title: 'Weather Watch', duration: 45, activities: ['Weather chart making', 'Season matching'] }
        ],
        learningOutcomes: ['Explain water cycle basics', 'Identify weather types', 'Understand seasons']
      }
    ],
    English: [
      {
        week: 1,
        title: 'Alphabet & Phonics',
        topic: 'Letter Sounds and Basic Phonics',
        description: 'Reinforcing alphabet sounds, consonant-vowel blending, and reading simple CVC words (cat, bat, sit).',
        sessions: [
          { title: 'Letter Sounds Fun', duration: 45, activities: ['Phonics songs', 'Sound matching cards'] },
          { title: 'Reading Simple Words', duration: 45, activities: ['CVC word building', 'Picture-word matching'] }
        ],
        learningOutcomes: ['Produce all letter sounds', 'Blend consonants and vowels', 'Read CVC words']
      },
      {
        week: 2,
        title: 'Simple Sentences',
        topic: 'Reading and Writing Simple Sentences',
        description: 'Building sentences with sight words, understanding sentence structure (subject + verb), reading simple stories.',
        sessions: [
          { title: 'Building Sentences', duration: 45, activities: ['Word card sentences', 'Sight word bingo'] },
          { title: 'Story Time Reading', duration: 45, activities: ['Guided reading', 'Picture story creation'] }
        ],
        learningOutcomes: ['Read simple sentences', 'Write 3-4 word sentences', 'Use sight words']
      },
      {
        week: 3,
        title: 'Nouns & Verbs',
        topic: 'Introduction to Nouns (Naming Words) and Verbs (Action Words)',
        description: 'Identifying nouns and verbs in sentences, building vocabulary through categories (animals, food, actions).',
        sessions: [
          { title: 'Naming Words Everywhere', duration: 45, activities: ['Noun scavenger hunt', 'Category sorting'] },
          { title: 'Action Words in Motion', duration: 45, activities: ['Action charades', 'Verb illustration'] }
        ],
        learningOutcomes: ['Identify nouns in sentences', 'Identify verbs in sentences', 'Expand vocabulary']
      },
      {
        week: 4,
        title: 'Creative Expression',
        topic: 'Storytelling and Creative Writing Basics',
        description: 'Encouraging creative expression through storytelling, picture descriptions, and writing short paragraphs.',
        sessions: [
          { title: 'Tell Me a Story', duration: 45, activities: ['Story sequence cards', 'Oral storytelling'] },
          { title: 'My First Paragraph', duration: 45, activities: ['Guided paragraph writing', 'Show and tell'] }
        ],
        learningOutcomes: ['Tell a story with beginning, middle, end', 'Write a short paragraph', 'Express ideas clearly']
      }
    ],
    Social: [
      {
        week: 1,
        title: 'My Family & Community',
        topic: 'Understanding Family Relationships and Community Helpers',
        description: 'Exploring family structures, roles of family members, and important community helpers (doctor, teacher, police).',
        sessions: [
          { title: 'My Family Tree', duration: 45, activities: ['Family tree drawing', 'Role play'] },
          { title: 'Helpers Around Us', duration: 45, activities: ['Community helper cards', 'Thank you letters'] }
        ],
        learningOutcomes: ['Describe family relationships', 'Name community helpers', 'Understand social roles']
      },
      {
        week: 2,
        title: 'Our India',
        topic: 'National Symbols, Festivals, and Cultural Diversity',
        description: 'Learning about India\'s national symbols (flag, anthem, emblem), major festivals, and cultural diversity.',
        sessions: [
          { title: 'Symbols of India', duration: 45, activities: ['Flag coloring', 'Symbol matching'] },
          { title: 'Festival of India', duration: 45, activities: ['Festival calendar', 'Cultural dress drawing'] }
        ],
        learningOutcomes: ['Identify national symbols', 'Name major festivals', 'Appreciate cultural diversity']
      },
      {
        week: 3,
        title: 'Maps & Directions',
        topic: 'Basic Map Reading and Directions',
        description: 'Understanding maps, directions (N/S/E/W), reading simple maps, and locating places.',
        sessions: [
          { title: 'My Classroom Map', duration: 45, activities: ['Classroom mapping', 'Direction games'] },
          { title: 'Treasure Hunt Maps', duration: 45, activities: ['Treasure map creation', 'Direction following'] }
        ],
        learningOutcomes: ['Read simple maps', 'Use cardinal directions', 'Draw basic maps']
      },
      {
        week: 4,
        title: 'Good Habits & Safety',
        topic: 'Personal Hygiene, Good Habits, and Basic Safety',
        description: 'Importance of cleanliness, healthy habits, road safety, and staying safe at home and school.',
        sessions: [
          { title: 'Healthy Habits', duration: 45, activities: ['Habit chart making', 'Hygiene quiz'] },
          { title: 'Staying Safe', duration: 45, activities: ['Safety rules poster', 'Road safety role play'] }
        ],
        learningOutcomes: ['Practice good hygiene', 'Follow safety rules', 'Make healthy choices']
      }
    ]
  },
  '4-5': {
    Math: [
      {
        week: 1,
        title: 'Fractions & Decimals',
        topic: 'Understanding Fractions and Introduction to Decimals',
        description: 'Concept of fractions (half, quarter, third), comparing fractions, introduction to decimal notation.',
        sessions: [
          { title: 'Pizza Fractions', duration: 45, activities: ['Fraction circles', 'Pizza sharing problems'] },
          { title: 'Decimals in Daily Life', duration: 45, activities: ['Money and decimals', 'Decimal number line'] }
        ],
        learningOutcomes: ['Read and write fractions', 'Compare fractions', 'Understand decimal place value']
      },
      {
        week: 2,
        title: 'Geometry & Angles',
        topic: 'Properties of Shapes, Perimeter, Area, and Basic Angles',
        description: 'Properties of triangles and quadrilaterals, calculating perimeter and area, types of angles.',
        sessions: [
          { title: 'Shape Properties', duration: 45, activities: ['Shape classification', 'Angle measurement'] },
          { title: 'Perimeter & Area', duration: 45, activities: ['Garden perimeter problem', 'Area with grid paper'] }
        ],
        learningOutcomes: ['Classify triangles and quadrilaterals', 'Calculate perimeter', 'Calculate area of rectangles']
      },
      {
        week: 3,
        title: 'Data Handling',
        topic: 'Collecting Data, Bar Graphs, and Pictographs',
        description: 'Collecting and organizing data, reading and creating bar graphs and pictographs, interpreting data.',
        sessions: [
          { title: 'Collecting & Organizing Data', duration: 45, activities: ['Class survey', 'Tally marks'] },
          { title: 'Graphs Tell Stories', duration: 45, activities: ['Bar graph creation', 'Graph interpretation'] }
        ],
        learningOutcomes: ['Collect and organize data', 'Create bar graphs', 'Interpret data from graphs']
      },
      {
        week: 4,
        title: 'Word Problems & Logic',
        topic: 'Multi-step Word Problems and Logical Reasoning',
        description: 'Solving multi-step word problems, identifying patterns, logical thinking and estimation.',
        sessions: [
          { title: 'Problem Solving Strategies', duration: 45, activities: ['RUCSAC method', 'Real-life scenarios'] },
          { title: 'Patterns & Logic Puzzles', duration: 45, activities: ['Number patterns', 'Logic grid puzzles'] }
        ],
        learningOutcomes: ['Solve multi-step problems', 'Apply estimation', 'Use logical reasoning']
      }
    ],
    Science: [
      {
        week: 1,
        title: 'Human Body Systems',
        topic: 'Digestive, Respiratory, and Circulatory Systems',
        description: 'Understanding major organ systems, how food is digested, how we breathe, and blood circulation.',
        sessions: [
          { title: 'The Digestive Journey', duration: 45, activities: ['Digestive tract model', 'Food journey mapping'] },
          { title: 'Breathing & Blood Flow', duration: 45, activities: ['Lung capacity test', 'Heart rate measurement'] }
        ],
        learningOutcomes: ['Name major organs', 'Trace the digestive process', 'Explain breathing mechanics']
      },
      {
        week: 2,
        title: 'Force & Motion',
        topic: 'Types of Forces, Simple Machines, and Motion',
        description: 'Push and pull forces, friction, gravity, simple machines (lever, pulley, wheel), speed and distance.',
        sessions: [
          { title: 'Forces Around Us', duration: 45, activities: ['Force exploration stations', 'Friction experiments'] },
          { title: 'Simple Machines', duration: 45, activities: ['Lever experiments', 'Machine scavenger hunt'] }
        ],
        learningOutcomes: ['Identify types of forces', 'Explain friction', 'Name simple machines and their uses']
      },
      {
        week: 3,
        title: 'Materials & Matter',
        topic: 'States of Matter, Properties of Materials, and Changes',
        description: 'Solids, liquids, gases, reversible and irreversible changes, properties of different materials.',
        sessions: [
          { title: 'Solids, Liquids, Gases', duration: 45, activities: ['State sorting', 'Ice melting observation'] },
          { title: 'Material Properties', duration: 45, activities: ['Material testing', 'Change experiments'] }
        ],
        learningOutcomes: ['Classify states of matter', 'Compare material properties', 'Distinguish reversible/irreversible changes']
      },
      {
        week: 4,
        title: 'Earth & Space',
        topic: 'Solar System, Earth\'s Rotation, and Natural Resources',
        description: 'Planets of the solar system, day and night, seasons, renewable and non-renewable resources.',
        sessions: [
          { title: 'Our Solar System', duration: 45, activities: ['Planet model making', 'Planet fact cards'] },
          { title: 'Earth\'s Resources', duration: 45, activities: ['Resource classification', 'Conservation poster'] }
        ],
        learningOutcomes: ['Name planets in order', 'Explain day/night cycle', 'Classify natural resources']
      }
    ],
    English: [
      {
        week: 1,
        title: 'Reading Comprehension',
        topic: 'Reading Passages and Answering Questions',
        description: 'Reading age-appropriate passages, identifying main idea, supporting details, and making inferences.',
        sessions: [
          { title: 'Finding the Main Idea', duration: 45, activities: ['Passage reading', 'Main idea cards'] },
          { title: 'Details & Inferences', duration: 45, activities: ['Detective reading', 'Inference worksheets'] }
        ],
        learningOutcomes: ['Identify main idea', 'Find supporting details', 'Make simple inferences']
      },
      {
        week: 2,
        title: 'Grammar Foundations',
        topic: 'Tenses, Pronouns, Adjectives, and Adverbs',
        description: 'Understanding present, past, and future tenses, using pronouns correctly, descriptive adjectives and adverbs.',
        sessions: [
          { title: 'Tenses in Action', duration: 45, activities: ['Tense timeline', 'Sentence transformation'] },
          { title: 'Describing with Words', duration: 45, activities: ['Adjective game', 'Adverb charades'] }
        ],
        learningOutcomes: ['Use tenses correctly', 'Apply pronouns properly', 'Use adjectives and adverbs']
      },
      {
        week: 3,
        title: 'Essay & Letter Writing',
        topic: 'Paragraph Structure, Essay Writing, and Letter Format',
        description: 'Writing organized paragraphs with topic sentences, supporting details, conclusions. Formal and informal letters.',
        sessions: [
          { title: 'Structured Paragraphs', duration: 45, activities: ['Topic sentence practice', 'Paragraph building'] },
          { title: 'Letter Writing', duration: 45, activities: ['Friendly letter writing', 'Formal letter format'] }
        ],
        learningOutcomes: ['Write organized paragraphs', 'Structure an essay', 'Write formal and informal letters']
      },
      {
        week: 4,
        title: 'Poetry & Literature',
        topic: 'Understanding Poetry, Figures of Speech, and Story Elements',
        description: 'Reading and appreciating poetry, understanding similes, metaphors, and analyzing story elements (plot, character, setting).',
        sessions: [
          { title: 'Poetry Appreciation', duration: 45, activities: ['Poem reading', 'Rhyme identification'] },
          { title: 'Story Elements', duration: 45, activities: ['Story mapping', 'Character analysis'] }
        ],
        learningOutcomes: ['Identify poetic devices', 'Analyze story elements', 'Write simple poems']
      }
    ],
    Social: [
      {
        week: 1,
        title: 'Indian History Basics',
        topic: 'Ancient India, Major Empires, and Freedom Struggle',
        description: 'Overview of Indus Valley civilization, Maurya & Mughal empires, key freedom fighters and independence movement.',
        sessions: [
          { title: 'Ancient India', duration: 45, activities: ['Timeline creation', 'Civilization fact cards'] },
          { title: 'Freedom Fighters', duration: 45, activities: ['Freedom fighter profiles', 'Independence story'] }
        ],
        learningOutcomes: ['Name ancient civilizations', 'Identify major empires', 'Know key freedom fighters']
      },
      {
        week: 2,
        title: 'Indian Geography',
        topic: 'Physical Features, States, and Climate Zones of India',
        description: 'Mountains, rivers, plateaus, coastal regions. Major states and capitals. Understanding climate diversity.',
        sessions: [
          { title: 'India\'s Physical Features', duration: 45, activities: ['Map labeling', 'River tracing'] },
          { title: 'States & Climates', duration: 45, activities: ['State capital quiz', 'Climate zone mapping'] }
        ],
        learningOutcomes: ['Locate physical features on map', 'Name states and capitals', 'Describe climate zones']
      },
      {
        week: 3,
        title: 'Government & Democracy',
        topic: 'Indian Government Structure, Constitution Basics, and Rights',
        description: 'Three branches of government, Panchayati Raj, fundamental rights and duties, importance of voting.',
        sessions: [
          { title: 'How India is Governed', duration: 45, activities: ['Government structure chart', 'Role play elections'] },
          { title: 'Our Rights & Duties', duration: 45, activities: ['Rights poster', 'Duty pledge'] }
        ],
        learningOutcomes: ['Explain government structure', 'Name fundamental rights', 'Understand democratic process']
      },
      {
        week: 4,
        title: 'Environment & Sustainability',
        topic: 'Environmental Issues, Conservation, and Sustainable Development',
        description: 'Pollution types, deforestation, water conservation, waste management, and what children can do.',
        sessions: [
          { title: 'Environmental Challenges', duration: 45, activities: ['Pollution identification', 'Impact discussion'] },
          { title: 'Be a Planet Hero', duration: 45, activities: ['Conservation action plan', 'Eco-pledge writing'] }
        ],
        learningOutcomes: ['Identify environmental issues', 'Suggest conservation methods', 'Plan eco-friendly actions']
      }
    ]
  }
};

module.exports = courseModules;
