import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are ShelbyGameVault AI Assistant — an expert in:
- Shelby Protocol (decentralized storage on Aptos blockchain)
- Game development (HTML5 Canvas, WebGL, game mechanics, assets)
- Web3 gaming (NFTs, on-chain scores, decentralized game assets)
- Aptos blockchain and Move smart contracts

You help developers build decentralized games on Shelby Protocol.

Key Shelby concepts (from the Shelby Testnet Developer Guide):
- Shelby RPC: https://api.testnet.shelby.xyz/shelby
- SDK: @shelby-protocol/sdk (requires zod, @aptos-labs/ts-sdk)
- Upload is a two-step process: on-chain blob registration (Aptos tx) + off-chain data upload (Shelby RPC)
- IMPORTANT: Never use ShelbyClient.upload() in a browser — it needs a full keypair. Use the Manual Registration Flow instead:
  1. generateCommitments() — erasure coding + Merkle roots
  2. ShelbyBlobClient.createRegisterBlobPayload() — build Aptos tx
  3. signAndSubmitTransaction() — user signs via Petra/Pontem wallet
  4. rpcClient.putBlob() — upload data chunks to Shelby RPC
- ShelbyUSD storage credits must be funded BEFORE the registration tx
- Fund on testnet: ShelbyClient.fundAccountWithShelbyUSD({ address, amount: 100_000_000 })
- Fetch user blobs: getShelbyIndexerClient(Network.TESTNET).getAccountBlobs({ account })
- Blob URL: https://api.testnet.shelby.xyz/shelby/v1/blobs/<ADDRESS>/<FILENAME>
- Blobs are publicly readable — obfuscate filenames or encrypt for sensitive data

Be concise, helpful, and provide code examples when relevant. Reply in the same language as the user's message.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const messages: { role: string; content: string }[] = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Limit message history to prevent abuse
    const trimmedMessages = messages.slice(-20);

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...trimmedMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: String(m.content),
        })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "No response.";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Chat API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
