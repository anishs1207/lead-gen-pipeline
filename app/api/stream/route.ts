// import { google } from '@ai-sdk/google';
// import { streamText } from 'ai';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = await streamText({
//     model: google('gemini-1.5-flash'), // Or 'gemini-1.5-pro'
//     messages,
//   });

//   // This utility converts the model output into a standard ReadableStream
//   return result.toDataStreamResponse();
// }


// and for the frontend:

// 'use client';

// import { useChat } from '@ai-sdk/react';

// export default function Chat() {
//   // useChat handles the fetch, the stream, and the message state
//   const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

//   return (
//     <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
//       {messages.map(m => (
//         <div key={m.id} className="whitespace-pre-wrap mb-4">
//           <strong>{m.role === 'user' ? 'User: ' : 'AI: '}</strong>
//           {m.content}
//         </div>
//       ))}

//       <form onSubmit={handleSubmit}>
//         <input
//           className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
//           value={input}
//           placeholder="Say something..."
//           onChange={handleInputChange}
//           disabled={isLoading}
//         />
//       </form>
//     </div>
//   );
// }