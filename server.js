const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const fs = require('fs');
const mammoth = require('mammoth');
const app = express();
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const port = 3011;
app.use(express.static('/Users/bhuwanbhandari/Desktop/Final'));
app.use(bodyParser.json());
let category = '';
//read the file
//console.log(fileContents);
//generate the question
let modelContent = [];
const filepaths = [
  './Income.docx',
  './Budget.docx',
  './Savings.docx',
  './DEBT.docx'
];
const jsonFileNames = filepaths.map(filepath => {
  const baseName = filepath.split('/').pop(); // Get the base filename
  return baseName.replace('.docx', '.json'); // Replace .docx extension with .json
});

// Read content of each .docx file
Promise.all(filepaths.map(readFileAsync))
  .then(contents => {
    modelContent = contents.map(content => `Create ten questions from the below text related to financial literacy and create a json array with the question with variable name "question", four options with name "options", correct answer (0,1,2 or 3) with variable name "correct_answer", description (description about that answer. What and Why?) with variable name "description". Only one option should be correct among the 4 options. Just give the JSON array and nothing else
      ------------
      ${content}
      ------------`);

    // Define the messages to send for each completion
    const messages = modelContent.map(content => ({ role: 'user', content }));

    // Perform multiple completions in parallel
    Promise.all(messages.map(message => openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [message],
      temperature: 0,
      max_tokens: 1500,
    })))
      .then(completions => {
        completions.forEach((responseGPT, index) => {
          console.log(`Completion ${index + 1}:`, responseGPT.choices[0].message.content);
          // Send the generated questions as JSON response
          // Original string
          const originalString = responseGPT.choices[0].message.content;

          // Extracting substring
          const startIndex = originalString.indexOf('[');
          const endIndex = originalString.lastIndexOf(']');
          const extractedString = originalString.slice(startIndex, endIndex + 1);
          const fileName = jsonFileNames[index]
          fs.writeFileSync(fileName, JSON.parse(JSON.stringify(extractedString, null, 2)));
          app.get(`/generateQuestions/${index}`, (req, res) => {
            res.status(200).json(responseGPT);
          });
        });
      })
      .catch(err => {
        console.error('Error generating questions:', err);
      });
  })
  .catch(err => {
    console.error('Error reading files:', err);
  });

        // console.log(responseGPT.choices[0].message.content);

        // Send the generated questions as JSON response
        //read the json file
        
        /*app.get('/generateQuestions', (req, res) => {
          res.status(200).json(responseGPT);
        });

        app.get('/incomeQues', (req, res) => {
          const index = parseInt(req.query.index);
          const question = questions[index];
          res.json(question);
      });

        app.post('/askquestion', (req, res) => {
          const responseObject = {
            question: responseGPT.message.content
          };
          //console.log(fileContent);
          res.send(responseObject);
        });
*/


//console.log(questions);
//Handle the data according to page.
app.get('/', (req, res) => {
  const myPage = fs.readFileSync('home.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/income/:nextBtnCount', (req, res) => {
  const questions = JSON.parse(fs.readFileSync(`income.json`));
  const index = req.params.nextBtnCount;
  const sendingData = {question: questions[index].question, options:questions[index].options};
  res.send(sendingData);
  console.log("Json file sent")
});
app.get('/budget/:nextBtnCount', (req, res) => {
  const questions = JSON.parse(fs.readFileSync(`Budget.json`));
  const index = req.params.nextBtnCount;
  const sendingData = {question: questions[index].question, options:questions[index].options};
  console.log(sendingData);
  res.send(sendingData);
  
});
app.get('/debt/:nextBtnCount', (req, res) => {
  const questions = JSON.parse(fs.readFileSync(`debt.json`));
  const index = req.params.nextBtnCount;
  console.log(index);
  const sendingData = {question: questions[index].question, options:questions[index].options};
  console.log(sendingData);
  res.send(sendingData);
  console.log("Json file sent")
});
app.get('/saving/:nextBtnCount', (req, res) => {
  const questions = JSON.parse(fs.readFileSync(`Savings.json`));
  const index = req.params.nextBtnCount;
  console.log(index);
  const sendingData = {question: questions[index].question, options:questions[index].options};
  console.log(sendingData);
  res.send(sendingData);
  console.log("Json file sent")
});
app.get('/incomeAnswer/:nextBtnCount', (req, res) => {
  const index = req.params.nextBtnCount;
  console.log(index);
  const questions = JSON.parse(fs.readFileSync(`income.json`));
  const answerDescription = {answer: questions[index].correct_answer, description:questions[index].description};
  res.send(answerDescription);
  console.log("Json file sent")
});
app.get('/debtAnswer/:nextBtnCount', (req, res) => {
  const index = req.params.nextBtnCount;
  console.log(index);
  const questions = JSON.parse(fs.readFileSync(`debt.json`));
  const answerDescription = {answer: questions[index].correct_answer, description:questions[index].description};
  res.send(answerDescription);
  console.log("Json file sent")
});
app.get('/budgetAnswer/:nextBtnCount', (req, res) => {
  const index = req.params.nextBtnCount;
  console.log(index);
  const questions = JSON.parse(fs.readFileSync(`Budget.json`));
  const answerDescription = {answer: questions[index].correct_answer, description:questions[index].description};
  res.send(answerDescription);
  console.log("Json file sent")
});
app.get('/savingAnswer/:nextBtnCount', (req, res) => {
  const index = req.params.nextBtnCount;
  console.log(index);
  const questions = JSON.parse(fs.readFileSync(`Savings.json`));
  const answerDescription = {answer: questions[index].correct_answer, description:questions[index].description};
  res.send(answerDescription);
  console.log("Json file sent")
});
//Route to each page
app.get('/debtQuiz.html', (req, res) => {
  const myPage = fs.readFileSync('debtQuiz.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/budgetQuiz.html', (req, res) => {
  const myPage = fs.readFileSync('budgetQuiz.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/savingQuiz.html', (req, res) => {
  const myPage = fs.readFileSync('savingQuiz.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/incomeQuiz.html', (req, res) => {
  //const questions = JSON.parse(fs.readFileSync('./Income.json'));
  const myPage = fs.readFileSync('incomeQuiz.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/play.html', (req, res) => {
  const myPage = fs.readFileSync('play.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/home.html', (req, res) => {
  const myPage = fs.readFileSync('home.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/investing.html', (req, res) => {
  const myPage = fs.readFileSync('investing.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/saving.html', (req, res) => {
  const myPage = fs.readFileSync('saving.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});
app.get('/support.html', (req, res) => {
  const myPage = fs.readFileSync('support.html', 'utf8');
  res.setHeader('Content-Type', 'text/html'); 
  res.send(myPage);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

// Helper function to read a file asynchronously
function readFileAsync(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        mammoth.extractRawText({ buffer: data })
          .then(result => resolve(result.value))
          .catch(reject);
      }
    });
  });
}




