import { tavily } from "@tavily/core";
import { TAVILY_API_KEY } from "../../config/environment.js";
import { Tool, tool } from "@langchain/core/tools";
import * as z from "zod"

const tvly = tavily({ apiKey: TAVILY_API_KEY });

async function tavilySearch({query}) {
  const response = await tvly.search(query, {
    maxResults: 3,
  });

  return JSON.stringify(response.results);
}

export const tavilyTool = tool(tavilySearch, {
  name: "tavilySearch",
  description: "Use this tool to search the web for real-time or external information. It is useful when the user asks about recent events, technical concepts that may require verification, documentation, news, trends, or any topic that may not be fully covered by internal knowledge. Returns structured search results with relevant sources for grounding responses.",
  schema: z.object({
    query: z.string().describe("Search Query")
  })
})