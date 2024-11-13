// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const superSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data } = await superSupabase
    .from<
      "uuid_records",
      {
        uuid: string;
        source: string;
        added_at: string;
        contributed_by: string;
      }
    >("uuid_records")
    .select("*");

  res.status(200).json(data);
}
