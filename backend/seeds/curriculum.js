const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
const Badge = require('../models/Badge');
require('dotenv').config();

const mathGrade3Modules = [
  {
    subject: 'Math',
    grade: 3,
    topic: 'Number Recognition (100-1000)',
    order: 1,
    prerequisites: [],
    teachingGuide: `Start with counting objects in groups of 100. Use bundles of sticks or blocks.\n\n1. Show 100 items grouped together\n2. Ask students to count by 100s: 100, 200, 300...\n3. Write numbers on board and ask students to read them\n4. Practice: Give a number, student writes it. Give written number, student says it.\n\nCommon Misconception: Students often confuse place values. Use physical groupings to reinforce hundreds vs tens vs ones.`,
    activities: [
      { name: 'Number Bingo', description: 'Create bingo cards with 3-digit numbers. Call out numbers, students mark them.', duration: 15 },
      { name: 'Number Line Walk', description: 'Draw a number line on the floor. Call a number, student stands at approximate position.', duration: 10 },
      { name: 'Place Value Blocks', description: 'Use blocks to build numbers. Hundreds=flat, Tens=stick, Ones=cube.', duration: 15 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Addition (2-digit)',
    order: 2,
    prerequisites: [],
    teachingGuide: `Build on number recognition. Use concrete examples first.\n\n1. Start with adding objects: 23 apples + 15 apples\n2. Show column addition method step by step\n3. Explain carrying over (regrouping)\n4. Practice with real-world word problems\n\nTip: Let students use their fingers or objects initially. Don't rush to abstract math.`,
    activities: [
      { name: 'Shopping Game', description: 'Create a pretend shop. Students buy 2 items and calculate total cost.', duration: 15 },
      { name: 'Addition Relay', description: 'Teams race to solve addition problems on the board.', duration: 10 },
      { name: 'Story Problems', description: 'Students create their own addition word problems for classmates.', duration: 15 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Subtraction (2-digit)',
    order: 3,
    prerequisites: [],
    teachingGuide: `Connect subtraction to addition as inverse operation.\n\n1. Start with "taking away" objects from a group\n2. Show column subtraction method\n3. Explain borrowing (regrouping)\n4. Use number lines to visualize\n5. Practice with money examples (Rs. 50 - Rs. 23)\n\nCommon Issue: Students often subtract smaller from larger regardless of position. Emphasize place value.`,
    activities: [
      { name: 'Money Change', description: 'Give students play money. They buy items and calculate change.', duration: 15 },
      { name: 'Subtraction Stories', description: 'Read stories with subtraction scenarios. Students solve.', duration: 10 },
      { name: 'Number Line Hops', description: 'Use number line to hop backwards for subtraction.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Multiplication Basics',
    order: 4,
    prerequisites: [],
    teachingGuide: `Introduce multiplication as repeated addition.\n\n1. Show 3 groups of 4 objects. "How many total?"\n2. Write: 4 + 4 + 4 = 12, then 3 x 4 = 12\n3. Use arrays (rows and columns) to visualize\n4. Start multiplication tables: 2s, 5s, 10s first\n5. Practice with real objects (seeds, stones, pencils)\n\nKey: Don't force memorization. Build understanding of what multiplication MEANS first.`,
    activities: [
      { name: 'Array Art', description: 'Students draw arrays (rows x columns) and write the multiplication.', duration: 15 },
      { name: 'Skip Counting Songs', description: 'Sing/chant skip counting patterns: 2,4,6,8... 5,10,15,20...', duration: 10 },
      { name: 'Multiplication Stories', description: 'Students create stories: "3 friends each have 5 mangoes..."', duration: 15 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Division Basics',
    order: 5,
    prerequisites: [],
    teachingGuide: `Introduce division as "sharing equally."\n\n1. Take 12 objects. "Share equally among 3 friends."\n2. Physically distribute objects one by one\n3. Write: 12 / 3 = 4\n4. Connect to multiplication: "3 x ? = 12"\n5. Practice with different scenarios\n\nCommon Issue: Students confuse division direction. Always start with the total being shared.`,
    activities: [
      { name: 'Fair Sharing', description: 'Distribute sweets/objects equally. Count how many each person gets.', duration: 15 },
      { name: 'Division and Multiplication Pairs', description: 'Match division problems with multiplication facts.', duration: 10 },
      { name: 'Grouping Game', description: 'Given 20 objects, make groups of 4. How many groups?', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Shapes and Patterns',
    order: 6,
    prerequisites: [],
    teachingGuide: `Explore 2D and 3D shapes in the environment.\n\n1. Identify shapes: circle, square, rectangle, triangle\n2. Find shapes in the classroom/environment\n3. Learn properties: sides, corners\n4. Introduce simple patterns (AB, ABC, ABB)\n5. Create and extend patterns\n\nTip: Take a "shape walk" - look for shapes in the building, playground, nature.`,
    activities: [
      { name: 'Shape Hunt', description: 'Find and photograph shapes in the environment. Create a shape collage.', duration: 15 },
      { name: 'Pattern Creator', description: 'Use colored blocks/beads to create and extend patterns.', duration: 15 },
      { name: 'Shape Art', description: 'Draw a picture using only geometric shapes.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Measurement (Length)',
    order: 7,
    prerequisites: [],
    teachingGuide: `Introduce standard measurement units.\n\n1. Start with non-standard units (hand spans, footsteps)\n2. Introduce ruler and centimeters\n3. Measure objects in the classroom\n4. Compare lengths: longer, shorter, same\n5. Simple addition/subtraction with measurements\n\nKey: Let students measure REAL things. Abstract measurement means nothing without hands-on experience.`,
    activities: [
      { name: 'Measure Everything', description: 'Students measure 10 objects in the room with a ruler.', duration: 15 },
      { name: 'Height Chart', description: 'Measure each student height. Order from shortest to tallest.', duration: 15 },
      { name: 'Estimation Game', description: 'Estimate length first, then measure. Closest estimate wins.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Time (Hours and Half-Hours)',
    order: 8,
    prerequisites: [],
    teachingGuide: `Teach reading analog and digital clocks.\n\n1. Parts of a clock: hour hand, minute hand\n2. Reading hours (o'clock)\n3. Reading half hours (half past)\n4. Daily schedule: relate time to activities\n5. Duration: "How long from 2:00 to 4:00?"\n\nCommon Issue: Students confuse hour and minute hands. Use clocks where hands are different colors/sizes.`,
    activities: [
      { name: 'My Day Timeline', description: 'Students draw their daily schedule with clock faces.', duration: 15 },
      { name: 'Clock Craft', description: 'Make a paper plate clock with movable hands.', duration: 15 },
      { name: 'Time Bingo', description: 'Show clock face, students match to written time on bingo card.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Money (Indian Rupees)',
    order: 9,
    prerequisites: [],
    teachingGuide: `Teach identifying coins/notes and basic transactions.\n\n1. Identify: Rs.1, Rs.2, Rs.5, Rs.10, Rs.20, Rs.50, Rs.100\n2. Count money: combine coins and notes to make amounts\n3. Simple buying: "You have Rs.50, item costs Rs.35, what change?"\n4. Compare prices: which is more expensive?\n\nTip: Use play money. Let students role-play shopkeeper and customer.`,
    activities: [
      { name: 'Classroom Shop', description: 'Set up shop with priced items. Students buy and give change.', duration: 20 },
      { name: 'Money Match', description: 'Match different coin/note combinations that equal the same amount.', duration: 10 },
      { name: 'Budget Challenge', description: 'Given Rs.100, buy as many items as possible from a menu.', duration: 15 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'Math',
    grade: 3,
    topic: 'Fractions (Halves and Quarters)',
    order: 10,
    prerequisites: [],
    teachingGuide: `Introduce fractions as equal parts of a whole.\n\n1. Fold paper in half: "This is one-half (1/2)"\n2. Fold again: "This is one-quarter (1/4)"\n3. Use food: cut roti/chapati in halves and quarters\n4. Shade fractions of shapes\n5. Compare: which is bigger, 1/2 or 1/4?\n\nKey: Always start with PHYSICAL folding/cutting. Never start with written fractions.`,
    activities: [
      { name: 'Fraction Pizza', description: 'Draw circular pizzas. Divide into halves and quarters. Color portions.', duration: 15 },
      { name: 'Paper Folding', description: 'Fold paper into halves, quarters. Label each part.', duration: 10 },
      { name: 'Fair Share', description: 'Share 1 roti among 2 people, then 4 people. What fraction does each get?', duration: 10 }
    ],
    estimatedDuration: 45
  }
];

const englishGrade3Modules = [
  {
    subject: 'English',
    grade: 3,
    topic: 'Alphabet & Phonics Review',
    order: 1,
    prerequisites: [],
    teachingGuide: `Review all 26 letters and their sounds.\n\n1. Sing the alphabet song\n2. Practice letter sounds (phonics): A says /a/ as in apple\n3. Identify beginning sounds in words\n4. Match letters to pictures\n5. Simple CVC words: cat, dog, pen\n\nTip: Use songs and actions for each letter sound. Kids learn phonics better through music.`,
    activities: [
      { name: 'Sound Hunt', description: 'Find objects starting with each letter sound.', duration: 15 },
      { name: 'Letter Bingo', description: 'Call letter sounds, students mark the letter.', duration: 10 },
      { name: 'Word Building', description: 'Use letter cards to build 3-letter words.', duration: 15 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'English',
    grade: 3,
    topic: 'Simple Sentences',
    order: 2,
    prerequisites: [],
    teachingGuide: `Teach basic sentence structure.\n\n1. What is a sentence? (A complete thought)\n2. Parts: Subject + Verb (The dog runs)\n3. Capital letter at start, full stop at end\n4. Practice: turn words into sentences\n5. Read simple sentences aloud\n\nCommon Issue: Students write fragments. Always check: "Does it tell us WHO and WHAT THEY DO?"`,
    activities: [
      { name: 'Sentence Scramble', description: 'Rearrange word cards to form sentences.', duration: 15 },
      { name: 'Picture Sentences', description: 'Look at pictures and write sentences about them.', duration: 15 },
      { name: 'Sentence Chain', description: 'One student says a word, next adds a word, until sentence is complete.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'English',
    grade: 3,
    topic: 'Reading Comprehension (Basic)',
    order: 3,
    prerequisites: [],
    teachingGuide: `Build reading comprehension with short passages.\n\n1. Read a short story together (5-6 sentences)\n2. Ask: Who? What? Where? When?\n3. Retell the story in own words\n4. Find specific information in the text\n5. Predict what happens next\n\nTip: Read aloud first while students follow along. Then let them try reading independently.`,
    activities: [
      { name: 'Story Time', description: 'Read a short story. Answer who/what/where questions.', duration: 15 },
      { name: 'Story Sequencing', description: 'Cut up a story into parts. Put in correct order.', duration: 15 },
      { name: 'Draw the Story', description: 'Read a paragraph and draw what it describes.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'English',
    grade: 3,
    topic: 'Nouns and Verbs',
    order: 4,
    prerequisites: [],
    teachingGuide: `Introduce naming words and action words.\n\n1. Nouns: name of person, place, thing, animal\n2. Find nouns in the classroom\n3. Verbs: words that show action (run, jump, eat, sleep)\n4. Act out verbs\n5. Build sentences with noun + verb\n\nGame: "Simon Says" but use different verbs - great for teaching action words!`,
    activities: [
      { name: 'Noun Hunt', description: 'Walk around and list 20 nouns you can see.', duration: 10 },
      { name: 'Verb Charades', description: 'Act out verbs. Others guess the word.', duration: 15 },
      { name: 'Sort It', description: 'Given a list of words, sort into Nouns and Verbs columns.', duration: 10 }
    ],
    estimatedDuration: 45
  },
  {
    subject: 'English',
    grade: 3,
    topic: 'Vocabulary Building',
    order: 5,
    prerequisites: [],
    teachingGuide: `Expand word knowledge through themes.\n\n1. Pick a theme: Animals, Food, Family, School, Body Parts\n2. Learn 10-15 new words per theme\n3. Use pictures with words\n4. Practice spelling\n5. Use new words in sentences\n\nKey: Always teach words in context, not isolation. "The tall giraffe" is better than just "giraffe."`,
    activities: [
      { name: 'Word Wall', description: 'Create a themed word wall with pictures and words.', duration: 15 },
      { name: 'Spelling Bee', description: 'Practice spelling new vocabulary words.', duration: 10 },
      { name: 'Word Stories', description: 'Write 3 sentences using at least 5 new words.', duration: 15 }
    ],
    estimatedDuration: 45
  }
];

const defaultBadges = [
  {
    name: 'First Test',
    description: 'Completed your very first test!',
    type: 'milestone',
    criteria: { type: 'first_test', count: 1 },
    iconUrl: '/badges/first-test.png'
  },
  {
    name: 'Perfect Score',
    description: 'Scored 100% on a test!',
    type: 'performance',
    criteria: { type: 'perfect_score', score: 100 },
    iconUrl: '/badges/perfect-score.png'
  },
  {
    name: 'Math Star',
    description: 'Scored 90%+ on 3 consecutive Math tests',
    type: 'performance',
    criteria: { type: 'consecutive_high_score', subject: 'Math', minScore: 90, count: 3 },
    iconUrl: '/badges/math-star.png'
  },
  {
    name: 'English Star',
    description: 'Scored 90%+ on 3 consecutive English tests',
    type: 'performance',
    criteria: { type: 'consecutive_high_score', subject: 'English', minScore: 90, count: 3 },
    iconUrl: '/badges/english-star.png'
  },
  {
    name: '7-Day Streak',
    description: 'Active for 7 consecutive days!',
    type: 'consistency',
    criteria: { type: 'streak', days: 7 },
    iconUrl: '/badges/streak-7.png'
  },
  {
    name: '30-Day Streak',
    description: 'Active for 30 consecutive days! Amazing dedication!',
    type: 'consistency',
    criteria: { type: 'streak', days: 30 },
    iconUrl: '/badges/streak-30.png'
  },
  {
    name: 'Top Performer',
    description: 'Finished in the top 3 of your class on a test',
    type: 'performance',
    criteria: { type: 'top_performer', rank: 3 },
    iconUrl: '/badges/top-performer.png'
  },
  {
    name: '10 Tests Completed',
    description: 'Completed 10 tests! Keep going!',
    type: 'milestone',
    criteria: { type: 'tests_completed', count: 10 },
    iconUrl: '/badges/ten-tests.png'
  },
  {
    name: 'Subject Master',
    description: 'Mastered all topics in a subject',
    type: 'milestone',
    criteria: { type: 'all_topics_mastered', subject: 'any' },
    iconUrl: '/badges/subject-master.png'
  },
  {
    name: 'Rising Star',
    description: 'Improved score by 30%+ between two consecutive tests',
    type: 'performance',
    criteria: { type: 'improvement', minImprovement: 30 },
    iconUrl: '/badges/rising-star.png'
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gapzero';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing seed data
    await LearningModule.deleteMany({});
    await Badge.deleteMany({});
    console.log('Cleared existing modules and badges');

    // Seed Learning Modules
    const allModules = [...mathGrade3Modules, ...englishGrade3Modules];
    const insertedModules = await LearningModule.insertMany(allModules);
    console.log(`Seeded ${insertedModules.length} learning modules`);

    // Seed Badges
    const insertedBadges = await Badge.insertMany(defaultBadges);
    console.log(`Seeded ${insertedBadges.length} badges`);

    console.log('\nSeed Summary:');
    console.log(`  Math Grade 3: ${mathGrade3Modules.length} modules`);
    console.log(`  English Grade 3: ${englishGrade3Modules.length} modules`);
    console.log(`  Badges: ${defaultBadges.length} badges`);
    console.log('\nSeeding complete!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
