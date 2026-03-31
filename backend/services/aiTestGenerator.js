const Assessment = require('../models/Assessment');

// Lazy-load Gemini only when needed and API key is available
let geminiModel = null;
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiModel) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } catch (err) {
      console.warn('Gemini module not available, using fallback question bank');
      return null;
    }
  }
  return geminiModel;
}

// Pre-built fallback question bank
const questionBank = {
  'Math': {
    'easy': [
      {
        question: 'What is 5 + 3?',
        options: ['7', '8', '9', '10'],
        correctAnswer: 'B',
        explanation: '5 + 3 equals 8.'
      },
      {
        question: 'What is 10 - 4?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 'B',
        explanation: '10 - 4 equals 6.'
      },
      {
        question: 'What is 2 x 3?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 'B',
        explanation: '2 x 3 equals 6.'
      },
      {
        question: 'Which number comes after 19?',
        options: ['18', '20', '21', '17'],
        correctAnswer: 'B',
        explanation: '20 comes after 19.'
      },
      {
        question: 'What is 12 divided by 4?',
        options: ['2', '3', '4', '6'],
        correctAnswer: 'B',
        explanation: '12 / 4 = 3.'
      }
    ],
    'medium': [
      {
        question: 'Solve: x + 5 = 12',
        options: ['6', '7', '8', '9'],
        correctAnswer: 'B',
        explanation: 'x + 5 = 12, so x = 12 - 5 = 7.'
      },
      {
        question: 'What is 15% of 100?',
        options: ['10', '15', '20', '25'],
        correctAnswer: 'B',
        explanation: '15% of 100 is (15/100) x 100 = 15.'
      },
      {
        question: 'What is the perimeter of a rectangle with length 8 and width 3?',
        options: ['11', '22', '24', '16'],
        correctAnswer: 'B',
        explanation: 'Perimeter = 2(l+w) = 2(8+3) = 22.'
      }
    ],
    'hard': [
      {
        question: 'What is the area of a triangle with base 10 and height 6?',
        options: ['30', '60', '16', '20'],
        correctAnswer: 'A',
        explanation: 'Area = (1/2) x base x height = (1/2) x 10 x 6 = 30.'
      },
      {
        question: 'If a train travels 120 km in 2 hours, what is its speed?',
        options: ['40 km/h', '60 km/h', '80 km/h', '120 km/h'],
        correctAnswer: 'B',
        explanation: 'Speed = distance/time = 120/2 = 60 km/h.'
      }
    ]
  },
  'English': {
    'easy': [
      {
        question: 'Which word is spelled correctly?',
        options: ['Begining', 'Beginning', 'Begnning', 'Biginning'],
        correctAnswer: 'B',
        explanation: 'Beginning is the correct spelling.'
      },
      {
        question: 'What is the opposite of "happy"?',
        options: ['Sad', 'Angry', 'Tired', 'Sick'],
        correctAnswer: 'A',
        explanation: 'Sad is the opposite of happy.'
      },
      {
        question: 'Which is a noun?',
        options: ['Run', 'Beautiful', 'Cat', 'Quickly'],
        correctAnswer: 'C',
        explanation: 'Cat is a noun (a naming word).'
      }
    ],
    'medium': [
      {
        question: 'Choose the sentence with correct grammar:',
        options: ['She go to school', 'She goes to school', 'She going to school', 'She gone to school'],
        correctAnswer: 'B',
        explanation: 'The correct form is "She goes to school" with proper subject-verb agreement.'
      },
      {
        question: 'What is the plural of "child"?',
        options: ['Childs', 'Children', 'Childes', 'Childrens'],
        correctAnswer: 'B',
        explanation: 'The plural of child is children (irregular plural).'
      }
    ],
    'hard': [
      {
        question: 'What literary device is used in "Her voice was music to my ears"?',
        options: ['Metaphor', 'Simile', 'Alliteration', 'Onomatopoeia'],
        correctAnswer: 'A',
        explanation: 'This is a metaphor, comparing voice to music directly without using "like" or "as".'
      }
    ]
  },
  'Science': {
    'easy': [
      {
        question: 'What is the chemical symbol for Oxygen?',
        options: ['O', 'Ox', 'Os', 'Og'],
        correctAnswer: 'A',
        explanation: 'The chemical symbol for Oxygen is O.'
      },
      {
        question: 'Which planet is closest to the Sun?',
        options: ['Venus', 'Earth', 'Mercury', 'Mars'],
        correctAnswer: 'C',
        explanation: 'Mercury is the closest planet to the Sun.'
      }
    ],
    'medium': [
      {
        question: 'What is the process by which plants make their own food?',
        options: ['Respiration', 'Fermentation', 'Photosynthesis', 'Digestion'],
        correctAnswer: 'C',
        explanation: 'Photosynthesis is the process where plants use sunlight to produce food.'
      },
      {
        question: 'What is the boiling point of water?',
        options: ['50°C', '100°C', '150°C', '200°C'],
        correctAnswer: 'B',
        explanation: 'Water boils at 100°C at standard atmospheric pressure.'
      }
    ],
    'hard': [
      {
        question: 'What is the second law of thermodynamics?',
        options: [
          'Energy cannot be created or destroyed',
          'Entropy in a closed system always increases',
          'Heat flows from hot to cold',
          'Temperature equals kinetic energy'
        ],
        correctAnswer: 'B',
        explanation: 'The second law states that entropy in a closed system always increases.'
      }
    ]
  },
  'Hindi': {
    'easy': [
      {
        question: 'How many vowels (swar) are there in Hindi?',
        options: ['10', '11', '12', '13'],
        correctAnswer: 'D',
        explanation: 'There are 13 vowels (swar) in Hindi.'
      }
    ],
    'medium': [
      {
        question: 'Which is the correct meaning of "Pustak"?',
        options: ['Pen', 'Book', 'Table', 'Chair'],
        correctAnswer: 'B',
        explanation: 'Pustak means Book in Hindi.'
      }
    ],
    'hard': [
      {
        question: 'What type of word is "Sundarta"?',
        options: ['Sangya (Noun)', 'Visheshan (Adjective)', 'Kriya (Verb)', 'Bhav Vachak Sangya (Abstract Noun)'],
        correctAnswer: 'D',
        explanation: 'Sundarta is a Bhav Vachak Sangya (Abstract Noun) derived from Sundar.'
      }
    ]
  }
};

/**
 * Generate AI-powered test using Google Gemini
 * Falls back to question bank if API fails
 */
async function generateTest(topic, subject, grade, difficulty = 'medium', numQuestions = 20) {
  try {
    // Validate inputs
    if (!topic || !subject || !grade) {
      throw new Error('Missing required parameters: topic, subject, grade');
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      difficulty = 'medium';
    }

    const gradeLevel = grade.toString();
    const prompt = `Generate exactly ${numQuestions} multiple choice questions for a ${difficulty} level test.
Subject: ${subject}
Topic: ${topic}
Grade/Level: ${gradeLevel}

Requirements:
- Each question must have exactly 4 options labeled A, B, C, D
- One correct answer per question
- Include explanations for each answer
- Questions should be appropriate for grade ${gradeLevel} students in India
- ${difficulty === 'easy' ? 'Focus on fundamental concepts' : difficulty === 'hard' ? 'Include challenging critical thinking questions' : 'Mix of conceptual and application questions'}

Format your response as a JSON array with this structure:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Why this is correct..."
  }
]

Return ONLY the JSON array, no other text or markdown formatting.`;

    const model = getGeminiClient();
    if (!model) {
      console.log('No Gemini API key configured, using fallback question bank');
      return fallbackToQuestionBank(topic, subject, difficulty, numQuestions);
    }

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      let content = response.text();

      // Clean up markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const questions = JSON.parse(content);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format from Gemini');
      }

      return {
        success: true,
        source: 'Gemini',
        questions: questions,
        questionCount: questions.length
      };
    } catch (apiError) {
      console.warn('Gemini API failed, falling back to question bank:', apiError.message);
      return fallbackToQuestionBank(topic, subject, difficulty, numQuestions);
    }
  } catch (error) {
    console.error('Error in test generation:', error);
    return fallbackToQuestionBank(topic, subject, difficulty, numQuestions);
  }
}

/**
 * Fallback function when Gemini API fails
 */
function fallbackToQuestionBank(topic, subject, difficulty, numQuestions) {
  const subjectQuestions = questionBank[subject]?.[difficulty] || [];

  if (subjectQuestions.length === 0) {
    const genericQuestions = generateGenericQuestions(topic, numQuestions);
    return {
      success: true,
      source: 'Fallback-Generic',
      questions: genericQuestions,
      questionCount: genericQuestions.length,
      note: 'Using fallback generic questions'
    };
  }

  // Repeat questions if needed to reach numQuestions
  const questions = [];
  let idx = 0;
  for (let i = 0; i < numQuestions; i++) {
    questions.push(subjectQuestions[idx % subjectQuestions.length]);
    idx++;
  }

  return {
    success: true,
    source: 'Fallback-QuestionBank',
    questions: questions,
    questionCount: questions.length,
    note: 'Using pre-built question bank'
  };
}

/**
 * Generate generic fallback questions
 */
function generateGenericQuestions(topic, numQuestions) {
  const questions = [];
  for (let i = 1; i <= Math.min(numQuestions, 5); i++) {
    questions.push({
      question: `${topic} - Question ${i}: What is the importance of understanding ${topic}?`,
      options: [
        'It improves critical thinking',
        'It helps solve real-world problems',
        'It builds foundational knowledge',
        'All of the above'
      ],
      correctAnswer: 'D',
      explanation: `Understanding ${topic} is important for all these reasons.`
    });
  }
  return questions;
}

/**
 * Create and save an assessment with generated questions
 */
async function createAssessment(topic, subject, grade, difficulty, numQuestions, volunteerId, classGroupId) {
  try {
    const testData = await generateTest(topic, subject, grade, difficulty, numQuestions);

    if (!testData.success || !testData.questions || testData.questions.length === 0) {
      throw new Error('Failed to generate test questions');
    }

    const assessment = new Assessment({
      title: `${subject} - ${topic}`,
      subject: subject,
      topic: topic,
      grade: grade,
      difficulty: difficulty,
      questions: testData.questions,
      totalQuestions: testData.questions.length,
      createdBy: volunteerId,
      classGroupId: classGroupId,
      createdAt: new Date(),
      status: 'published',
      source: testData.source
    });

    await assessment.save();

    return {
      success: true,
      assessment: assessment,
      message: `Assessment created with ${testData.questions.length} questions`
    };
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw new Error(`Failed to create assessment: ${error.message}`);
  }
}

module.exports = {
  generateTest,
  createAssessment,
  fallbackToQuestionBank
};
