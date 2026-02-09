import "dotenv/config";
import { WebSocketServer } from "ws";
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const wss = new WebSocketServer({ port: 3000 });
const djangoServerUrl = "http://localhost:8000"

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (msg) => {
    /// fetch coursepromp
  let response = await fetch(`${djangoServerUrl}/api/rag?code=T-301-REIR`);
  console.log(response)
  let jsonObj = await response.json();
  let prompt = jsonObj.prompt;



    msg = msg.toString()
    const stream = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: "Answer in Markdown. Any equation, symbol, or expression must be wrapped in LaTeX: inline \( ... \), block $$ ... $$. Avoid Unicode math symbols (e.g., ∫, ∇) outside LaTeX."
        },
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: msg
        }
      ],

      stream: true,
    });

    let firstWord = true;
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        if (firstWord) {
          ws.send(JSON.stringify({type:"start", data:event.delta}))
          firstWord = false;
        }
        else {ws.send(JSON.stringify({type:"token", data:event.delta}))}
      }
    }
    ws.send(JSON.stringify({type:"end", data:""}))
    
  });
});
