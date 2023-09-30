"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var readline = require("readline");
var QuizQuestion = /** @class */ (function () {
    function QuizQuestion(question, options, correctAnswerIndex) {
        this.question = question;
        this.options = options;
        this.correctAnswerIndex = correctAnswerIndex;
    }
    QuizQuestion.prototype.displayQuestion = function () {
        console.log(this.question);
        this.options.forEach(function (option, index) {
            console.log("".concat(index + 1, ". ").concat(option));
        });
    };
    QuizQuestion.prototype.isCorrect = function (answerIndex) {
        return answerIndex === this.correctAnswerIndex;
    };
    return QuizQuestion;
}());
var Quiz = /** @class */ (function () {
    function Quiz() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
    }
    Quiz.prototype.loadQuestionsFromFile = function (filePath) {
        var fileData = fs.readFileSync(filePath, 'utf-8');
        var questionsData = JSON.parse(fileData);
        this.questions = questionsData.map(function (q) {
            return new QuizQuestion(q.question, q.options, q.correctAnswerIndex);
        });
    };
    Quiz.prototype.start = function () {
        var _this = this;
        console.log('Welcome to the Quiz!\n');
        console.log('Select an option:');
        console.log('1. Take a quiz');
        console.log('2. Create a quiz');
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter your choice (1 or 2): ', function (choice) {
            rl.close();
            if (choice === '1') {
                _this.selectAndStartQuiz();
            }
            else if (choice === '2') {
                _this.createQuiz();
            }
            else {
                console.error('Invalid choice. Please select 1 or 2.');
            }
        });
    };
    Quiz.prototype.selectAndStartQuiz = function () {
        var _this = this;
        console.log('\nAvailable question files:');
        fs.readdirSync('question_files').forEach(function (file, index) {
            console.log("".concat(index + 1, ". ").concat(file));
        });
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the number of the question file you want to use: ', function (fileIndex) {
            rl.close();
            var selectedFileIndex = parseInt(fileIndex, 10);
            if (isNaN(selectedFileIndex) || selectedFileIndex <= 0) {
                console.error('Invalid selection.');
                return;
            }
            var files = fs.readdirSync('question_files');
            if (selectedFileIndex > files.length) {
                console.error('File index out of range.');
                return;
            }
            var selectedFile = files[selectedFileIndex - 1];
            var filePath = "question_files/".concat(selectedFile);
            _this.loadQuestionsFromFile(filePath);
            _this.askQuestion(_this.currentQuestionIndex);
        });
    };
    Quiz.prototype.createQuiz = function () {
        var _this = this;
        console.log('\nYou are now creating a quiz.');
        console.log('Enter your questions and options, and specify the correct answer index.');
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        var questions = [];
        var askQuestion = function () {
            rl.question('Enter the question: ', function (question) {
                rl.question('Enter options (comma-separated): ', function (optionsStr) {
                    var options = optionsStr.split(',').map(function (option) { return option.trim(); });
                    rl.question('Enter the correct answer index (1, 2, 3): ', function (correctAnswerIndex) {
                        var correctIndex = parseInt(correctAnswerIndex, 10) - 1; // making it so its user friendly, they do not know 0 = 1, so 1 = 1, 2 = 2, 3 = 3 etc...
                        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
                            console.error('Invalid correct answer index.');
                        }
                        else {
                            questions.push(new QuizQuestion(question, options, correctIndex));
                            rl.question('Add another question? (yes/no): ', function (addAnother) {
                                if (addAnother.toLowerCase() === 'yes') {
                                    askQuestion();
                                }
                                else {
                                    rl.close();
                                    _this.questions = questions;
                                    _this.askQuestion(_this.currentQuestionIndex);
                                }
                            });
                        }
                    });
                });
            });
        };
        askQuestion();
    };
    Quiz.prototype.askQuestion = function (index) {
        var _this = this;
        if (index >= this.questions.length) {
            this.end();
            return;
        }
        var question = this.questions[index];
        question.displayQuestion();
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter your answer (1, 2, 3): ', function (answerIndex) {
            rl.close();
            var userAnswer = parseInt(answerIndex, 10);
            if (question.isCorrect(userAnswer - 1)) {
                _this.score++;
                console.log('Correct!\n');
            }
            else {
                console.log("Incorrect. The correct answer was: ".concat(question.correctAnswerIndex + 1, "\n"));
            }
            _this.currentQuestionIndex++;
            _this.askQuestion(_this.currentQuestionIndex);
        });
    };
    Quiz.prototype.end = function () {
        console.log('Quiz completed!');
        console.log("Your score: ".concat(this.score, "/").concat(this.questions.length));
    };
    return Quiz;
}());
// pls run
var quiz = new Quiz();
quiz.start();
