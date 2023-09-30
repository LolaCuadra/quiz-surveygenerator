import * as fs from 'fs';
import * as readline from 'readline';

class QuizQuestion {
  constructor(public question: string, public options: string[], public correctAnswerIndex: number) {}

  displayQuestion(): void {
    console.log(this.question);
    this.options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
  }

  isCorrect(answerIndex: number): boolean {
    return answerIndex === this.correctAnswerIndex;
  }
}

class Quiz {
  private questions: QuizQuestion[] = [];
  private currentQuestionIndex: number = 0;
  private score: number = 0;

  constructor() {}

  loadQuestionsFromFile(filePath: string): void {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const questionsData = JSON.parse(fileData);

    this.questions = questionsData.map(
      (q: { question: string; options: string[]; correctAnswerIndex: number }) =>
        new QuizQuestion(q.question, q.options, q.correctAnswerIndex)
    );
  }

  start(): void {
    console.log('Welcome to the Quiz!\n');
    console.log('Select an option:');
    console.log('1. Take a quiz');
    console.log('2. Create a quiz');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter your choice (1 or 2): ', (choice) => {
      rl.close();

      if (choice === '1') {
        this.selectAndStartQuiz();
      } else if (choice === '2') {
        this.createQuiz();
      } else {
        console.error('Invalid choice. Please select 1 or 2.');
      }
    });
  }

  selectAndStartQuiz(): void {
    console.log('\nAvailable question files:');
    fs.readdirSync('question_files').forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the number of the question file you want to use: ', (fileIndex) => {
      rl.close();

      const selectedFileIndex = parseInt(fileIndex, 10);
      if (isNaN(selectedFileIndex) || selectedFileIndex <= 0) {
        console.error('Invalid selection.');
        return;
      }

      const files = fs.readdirSync('question_files');
      if (selectedFileIndex > files.length) {
        console.error('File index out of range.');
        return;
      }

      const selectedFile = files[selectedFileIndex - 1];
      const filePath = `question_files/${selectedFile}`;
      this.loadQuestionsFromFile(filePath);

      this.askQuestion(this.currentQuestionIndex);
    });
  }

  createQuiz(): void {
    console.log('\nYou are now creating a quiz.');
    console.log('Enter your questions and options, and specify the correct answer index.');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const questions: QuizQuestion[] = [];

    const askQuestion = () => {
      rl.question('Enter the question: ', (question) => {
        rl.question('Enter options (comma-separated): ', (optionsStr) => {
          const options = optionsStr.split(',').map((option) => option.trim());
          rl.question('Enter the correct answer index (1, 2, 3): ', (correctAnswerIndex) => {
            const correctIndex = parseInt(correctAnswerIndex, 10) - 1; // making it so its user friendly, they do not know 0 = 1, so 1 = 1, 2 = 2, 3 = 3 etc...

            if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
              console.error('Invalid correct answer index.');
            } else {
              questions.push(new QuizQuestion(question, options, correctIndex));
              rl.question('Add another question? (yes/no): ', (addAnother) => {
                if (addAnother.toLowerCase() === 'yes') {
                  askQuestion();
                } else {
                  rl.close();
                  this.questions = questions;
                  this.askQuestion(this.currentQuestionIndex);
                }
              });
            }
          });
        });
      });
    };

    askQuestion();
  }

  askQuestion(index: number): void {
    if (index >= this.questions.length) {
      this.end();
      return;
    }

    const question = this.questions[index];
    question.displayQuestion();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter your answer (1, 2, 3): ', (answerIndex) => {
      rl.close();
      const userAnswer = parseInt(answerIndex, 10);

      if (question.isCorrect(userAnswer - 1)) {
        this.score++;
        console.log('Correct!\n');
      } else {
        console.log(`Incorrect. The correct answer was: ${question.correctAnswerIndex + 1}\n`);
      }

      this.currentQuestionIndex++;
      this.askQuestion(this.currentQuestionIndex);
    });
  }

  end(): void {
    console.log('Quiz completed!');
    console.log(`Your score: ${this.score}/${this.questions.length}`);
  }
}

// pls run
const quiz = new Quiz();
quiz.start();