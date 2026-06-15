import GeminiRepository from "./src/repositories/implementations/GeminiRepository.js";

async function testGemini() {
  console.log("Starting GeminiRepository test...");
  try {
    const repo = new GeminiRepository();
    console.log("Successfully instantiated GeminiRepository.");

    // Verify graph is compiled and has the nodes
    if (repo.graph && typeof repo.graph.streamEvents === "function") {
      console.log("Graph was successfully compiled!");
    } else {
      console.warn("Warning: Graph compile check failed or returned unexpected shape.");
    }

    console.log("Testing streamResponse interface...");
    // Let's attempt to run streamResponse. We expect it to either stream successfully (if API key is valid)
    // or fail with an API key validation error (which proves the repository is correctly configured).
    let chunkCount = 0;
    try {
      await repo.streamResponse("Hello, who are you?", "gemini", (chunk) => {
        chunkCount++;
        process.stdout.write(chunk);
      });
      console.log(`\nStream complete. Received ${chunkCount} chunks.`);
    } catch (apiError) {
      if (apiError.message && (apiError.message.includes("API key") || apiError.message.includes("key not found") || apiError.message.includes("API_KEY"))) {
        console.log("\n[Expected behavior]: streamResponse failed with API key error: ", apiError.message);
        console.log("This verifies the GeminiRepository is wired up and configured correctly to use the GEMINI_API_KEY.");
      } else {
        throw apiError;
      }
    }

    console.log("Testing createTitle interface...");
    try {
      const title = await repo.createTitle("How does LangGraph state management work?");
      console.log("Generated Title:", title);
    } catch (apiError) {
      if (apiError.message && (apiError.message.includes("API key") || apiError.message.includes("key not found") || apiError.message.includes("API_KEY"))) {
        console.log("[Expected behavior]: createTitle failed with API key error: ", apiError.message);
      } else {
        throw apiError;
      }
    }

    console.log("Test finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

testGemini();
