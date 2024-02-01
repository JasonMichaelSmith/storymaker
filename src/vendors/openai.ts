import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.API_KEY });

export default openai;