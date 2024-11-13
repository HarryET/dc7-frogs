import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const Home = () => {
  const [data, setData] = useState([]);

  (async () => {
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

    // @ts-ignore
    setData(data);
  })();

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="w-full h-full p-8 md:max-w-6xl flex flex-col gap-8 justify-between items-center">
        <header>
          <h1 className="text-4xl font-mono">Devcon 7 Frog Frens</h1>
        </header>
        <div className="flex flex-row gap-6">
          <p>Project from Harry</p>
          <a
            href="https://x.com/theharryet"
            className="hover:text-blue-600 hover:underline"
          >
            Twitter
          </a>
          <a
            href="https://github.com/harryet/dc7-frogs"
            className="hover:text-blue-600 hover:underline"
          >
            Github
          </a>
        </div>
        <div>
          <p>🐸 {data.length} potential frens</p>
        </div>
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-gray-300 px-4 py-2 text-left">
                    UUID
                  </th>
                  <th className="border-b border-gray-300 px-4 py-2 text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  // @ts-ignore
                  let url = `https://dc7.getfrogs.xyz/necklace/${item.uuid}`;
                  return (
                    <>
                      {/* @ts-ignore */}
                      <tr key={item.uuid} className="hover:bg-gray-100">
                        <td className="border-b border-gray-300 px-4 py-2">
                          {/* @ts-ignore */}
                          {item.uuid}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-2">
                          <a
                            href={url}
                            className="bg-green-500 text-white px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
                          >
                            To Zupass
                          </a>
                          {/* <a
                        href={`/report/${item.uuid}`}
                        className="bg-red-500 text-white px-4 py-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Report
                      </a> */}
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
