// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "..";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data } = await supabase
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
