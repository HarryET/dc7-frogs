// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const emojis = ["❤️", "🐸", "🔎"];

type Data = {
  uuid: string[];
};

const superSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // load body
  const body = JSON.parse(req.body) as Data;

  if (body.uuid.length >= 1000) {
    return res.status(401).json({
      message: "Don't be annoying.",
    });
  }

  // check the whole array is a valid uuid
  for (const uuid of body.uuid) {
    // regex match for a valid uuid
    let r = uuid.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    if (r === null) {
      return res.status(400).json({
        message: "Invalid UUID",
      });
    }
  }

  await superSupabase.from("uuid_records").upsert(
    body.uuid.map((uuid) => ({
      uuid,
      source: "SUBMITTED",
      added_at: new Date().toISOString(),
      contributed_by: "anon",
    })),
    { onConflict: "uuid" },
  );

  return new Response(
    JSON.stringify({
      message:
        "Thanks for the new Frogs, they should be on the website soon :eyes:",
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export const runtime = "edge";
