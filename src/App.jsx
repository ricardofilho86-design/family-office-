import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [valor, setValor] = useState("");

  async function salvar() {
    await supabase.from("transactions").insert([
      {
        data: new Date(),
        tipo: "Receita",
        pessoa: "Ricardo",
        origem: "PJ",
        valor: Number(valor),
        descricao: "Teste"
      }
    ]);
    alert("Salvo!");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Family Office</h1>
      <input
        placeholder="Valor"
        onChange={(e) => setValor(e.target.value)}
      />
      <button onClick={salvar}>Salvar</button>
    </div>
  );
}