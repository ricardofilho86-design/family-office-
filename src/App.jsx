import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [form, setForm] = useState({
    valor: "",
    tipo: "Receita",
    pessoa: "Ricardo",
    origem: "PJ",
    categoria: "Consultas",
    descricao: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar() {
    const { error } = await supabase.from("transactions").insert([
      {
        data: new Date(),
        tipo: form.tipo,
        pessoa: form.pessoa,
        origem: form.origem,
        categoria: form.categoria,
        valor: Number(form.valor),
        descricao: form.descricao
      }
    ]);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Salvo com sucesso!");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Family Office</h2>

      <select name="tipo" onChange={handleChange}>
        <option>Receita</option>
        <option>Despesa</option>
      </select>

      <select name="pessoa" onChange={handleChange}>
        <option>Ricardo</option>
        <option>Larissa</option>
      </select>

      <select name="origem" onChange={handleChange}>
        <option>PJ</option>
        <option>PF</option>
      </select>

      <input
        name="categoria"
        placeholder="Categoria"
        onChange={handleChange}
      />

      <input
        name="descricao"
        placeholder="Descrição"
        onChange={handleChange}
      />

      <input
        name="valor"
        placeholder="Valor"
        type="number"
        onChange={handleChange}
      />

      <button onClick={salvar}>Salvar</button>
    </div>
  );
}