const OpenAI = require('openai');
const Assessment = require('../models/Assessment');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
        question: 'What is 2 × 3?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 'B',
        explanation: '2 × 3 equals 6.'
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
        explanation: '15% of 100 is (15/100) × 100 = 15.'
      }
    ],
    'hard': [
      {
        question: 'What is the area of a circle with radius 5?',
        options: ['25π', '10π', '50π', '100π'],
        correctAnswer: 'A',
        explanation: 'Area of circle = πr² = π(5)² = 25π.'
      }
    ]
  },
  'English': {
    'easy': [
      {
        question: 'Which word is spelled correctly?',
        options: ['Begining', 'Beginning', 'Begining', 'Begining'],
        correctAnswer: 'B',
        explanation: 'Beginning is the correct spelling.'
      },
      {
        question: 'What is the opposite of "happy"?',
        options: ['Sad', 'Angry', 'Tired', 'Sick'],
        correctAnswer: 'A',
        explanation: 'Sad is the opposite of happy.'
      }
    ],
    'medium': [
      {
        question: 'Choose the sentence with correct grammar:',
        options: ['She go to school', 'She goes to school', 'She going to school', 'She gone to school'],
        correctAnswer: 'B',
        explanation: 'The correct form is "She goes to school" with proper subject-verb agreement.'
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
      }
    ],
    'medium': [
      {
        question: 'What is the process by which plants make their own food?',
        options: ['Respiration', 'Fermentation', 'Photosynthesis', 'Digestion'],
        correctAnswer: 'C',
        explanation: 'Photosynthesis is the process where plants use sunlight to produce food.'
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
  }
};

/**
 * Generate AI-powered test using OpenAI
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

    // Build prompt for OpenAI
    const gradeLevel = grade.toString();
    const prompt = `Generate exactly ${numQuestions} multiple choice questions for a ${difficulty} level test.
Subject: ${subject}
Topic: ${topic}
Grade/Level: ${gradeLevel}

Requirements:
- Each question must have exactly 4 options labeled A, B, C, D
- One correct answer per question
- Include explanations for each answer
- Questions should be appropriate for grade ${gradeLevel}
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

Return ONLY the JSON array, no other text.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assessment designer creating high-quality multiple choice questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = response.choices[0].message.content;
      const questions = JSON.parse(content);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format from OpenAI');
      }

      return {
        success: true,
        source: 'OpenAI',
        questions: questions,
        questionCount: questions.length
      };
    } catch (apiError) {
      console.warn('OpenAI API failed, falling back to question bank:', apiError.message);
      return fallbackToQuestionBank(topic, subject, difficulty, numQuestions);
    }
  } catch (error) {
    console.error('Error in test generation:', error);
    return fallbackToQuestionBank(topic, subject, difficulty, numQuestions);
  }
}

/**
 * Fallback function when OpenAI API fails
 */
function fallbackToQuestionBank(topic, subject, difficulty, numQuestions) {
  const subjectQuestions = questionBank[subject]?.[difficulty] || [];

  if (subjectQuestions.length === 0) {
    // Return generic questions if subject not found
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
    // Generate questions
    const testData = await generateTest(topic, subject, grade, difficulty, numQuestions);

    if (!testData.success || !testData.questions || testData.questions.length === 0) {
      throw new Error('Failed to generate test questions');
    }

    // Create Assessment document
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
