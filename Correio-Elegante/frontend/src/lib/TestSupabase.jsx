import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function TestSupabase() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            sender: "TESTE",
            receiver: "TESTE",
            message: "FUNCIONOU",
            plan: "basic",
            value: 1.0,
            status: "AGUARDANDO"
          }
        ])
        .select();

      console.log("DATA:", data);
      console.log("ERROR:", error);
    }

    test();
  }, []);

  return <h1>Testando Supabase...</h1>;
}