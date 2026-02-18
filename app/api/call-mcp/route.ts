import callMCPServer from "@/utils/callMCPServer";

// to the call the local mcp server here
export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await callMCPServer(prompt);

  return Response.json({ response });
}
