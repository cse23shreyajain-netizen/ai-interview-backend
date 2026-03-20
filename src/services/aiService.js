const axios = require("axios")

const HF_TOKEN = process.env.HF_TOKEN

async function generateQuestions(role,type){

const prompt = `
Generate 5 ${type} interview questions for a ${role}.
Return only questions.
`

const response = await axios.post(
"https://api-inference.huggingface.co/models/google/flan-t5-large",
{inputs:prompt},
{
headers:{
Authorization:`Bearer ${HF_TOKEN}`
}
}
)

const text = response.data[0].generated_text

return text.split("\n").filter(q=>q.trim()!="")
}

async function evaluateAnswer(question,answer){

const prompt = `
Question: ${question}

Candidate Answer: ${answer}

Evaluate the answer.
Give:
Score out of 100
Short feedback
Correct answer
`

const response = await axios.post(
"https://api-inference.huggingface.co/models/google/flan-t5-large",
{inputs:prompt},
{
headers:{
Authorization:`Bearer ${HF_TOKEN}`
}
}
)

return response.data[0].generated_text

}

module.exports={
generateQuestions,
evaluateAnswer
}