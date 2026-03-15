function seedData() {
  return {
    users: [
      {
        id: 'admin1',
        username: 'admin',
        fullName: 'System Admin',
        email: 'admin@quizano.com',
        password: '123',
        role: 'admin'
      },
      {
        id: 'sv1',
        username: 'nguyenvana',
        fullName: 'Nguyen Van A',
        email: 'nguyenvana@gmail.com',
        password: '123',
        role: 'student'
      },
      {
        id: 'sv2',
        username: 'tranthib',
        fullName: 'Tran Thi B',
        email: 'tranthib@gmail.com',
        password: '123',
        role: 'student'
      }
    ],
    exams: [
      {
        id: 'exam1',
        title: 'Web Programming Practice',
        description: 'Practice exam for the web quiz platform.',
        type: 'free',
        duration: 15,
        status: 'active'
      },
      {
        id: 'exam2',
        title: 'Database Midterm',
        description: 'Scheduled midterm exam for database fundamentals.',
        type: 'scheduled',
        startTime: '2026-03-05T08:00:00.000Z',
        endTime: '2026-03-05T10:00:00.000Z',
        duration: 45,
        status: 'active'
      }
    ],
    questions: [
      {
        id: 'q1',
        examId: 'exam1',
        content: 'Which language is mainly used to define the structure of web pages?',
        options: [
          { id: 'optA', text: 'HTML' },
          { id: 'optB', text: 'CSS' },
          { id: 'optC', text: 'JavaScript' },
          { id: 'optD', text: 'Python' }
        ],
        correctOptionId: 'optA',
        explanation: 'HTML defines the structure of web pages.'
      },
      {
        id: 'q2',
        examId: 'exam1',
        content: 'Which HTML tag creates an unordered list?',
        options: [
          { id: 'optA', text: 'ol' },
          { id: 'optB', text: 'ul' },
          { id: 'optC', text: 'li' },
          { id: 'optD', text: 'list' }
        ],
        correctOptionId: 'optB',
        explanation: 'The ul tag creates an unordered list.'
      },
      {
        id: 'q3',
        examId: 'exam1',
        content: 'What does CSS stand for?',
        options: [
          { id: 'optA', text: 'Creative Style Sheets' },
          { id: 'optB', text: 'Cascading Style Sheets' },
          { id: 'optC', text: 'Computer Style Sheets' },
          { id: 'optD', text: 'Colorful Style Sheets' }
        ],
        correctOptionId: 'optB',
        explanation: 'CSS stands for Cascading Style Sheets.'
      },
      {
        id: 'q4',
        examId: 'exam2',
        content: 'Which SQL command is used to retrieve data?',
        options: [
          { id: 'optA', text: 'GET' },
          { id: 'optB', text: 'OPEN' },
          { id: 'optC', text: 'EXTRACT' },
          { id: 'optD', text: 'SELECT' }
        ],
        correctOptionId: 'optD',
        explanation: 'SELECT retrieves records from a database.'
      },
      {
        id: 'q5',
        examId: 'exam2',
        content: 'What is true about a primary key in a relational table?',
        options: [
          { id: 'optA', text: 'It can be NULL' },
          { id: 'optB', text: 'It must be unique and non-NULL' },
          { id: 'optC', text: 'It can contain duplicates' },
          { id: 'optD', text: 'It is only for formatting' }
        ],
        correctOptionId: 'optB',
        explanation: 'A primary key uniquely identifies each row and cannot be NULL.'
      }
    ],
    results: [
      {
        id: 'res1',
        studentId: 'sv1',
        examId: 'exam1',
        startTime: '2026-03-10T08:00:00.000Z',
        submitTime: '2026-03-10T08:09:30.000Z',
        answers: [
          { questionId: 'q1', selectedOptionId: 'optA' },
          { questionId: 'q2', selectedOptionId: 'optC' },
          { questionId: 'q3', selectedOptionId: 'optB' }
        ],
        correctCount: 2,
        totalQuestions: 3,
        score: 6.67,
        status: 'completed'
      }
    ]
  };
}

export { seedData };
