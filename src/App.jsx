import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [valor, setValor] = useState("");
  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);
  const [novoInvest, setNovoInvest] = useState("");

  async function carregar() {
    const { data } = await supabase.from("transactions").select("*");
    setDados(data || []);

    const { data: inv } = await supabase.from("investimentos").select("*");
    setInvest(inv || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    await supabase.from("transactions").insert([
      {
        data: new Date(),
        tipo: "Receita",
        pessoa: "Ricardo",
        origem: "PJ",
        valor: Number(valor),
        descricao: "Manual"
      }
    ]);
    carregar();
  }

  async function salvarInvest() {
    await supabase.from("investimentos").insert([
      { nome: novoInvest, tipo: "Renda Fixa", valor: 1000 }
    ]);
    carregar();
  }

  const totalReceita = dados
    .filter(d => d.tipo === "Receita")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const totalDespesa = dados
    .filter(d => d.tipo === "Despesa")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Family Office</h1>

      <h3>Saldo: {totalReceita - totalDespesa}</h3>

      <h4>Receitas: {totalReceita}</h4>
      <h4>Despesas: {totalDespesa}</h4>

      <hr />

      <input
        placeholder="Valor"
        onChange={(e) => setValor(e.target.value)}
      />
      <button onClick={salvar}>Salvar Receita</button>

      <hr />

      <h3>Investimentos</h3>

      <input
        placeholder="Nome investimento"
        onChange={(e) => setNovoInvest(e.target.value)}
      />
      <button onClick={salvarInvest}>Adicionar</button>

      <ul>
        {invest.map(i => (
          <li key={i.id}>{i.nome} - {i.valor}</li>
        ))}
      </ul>

      <hr />

      <h3>Transações</h3>

      <ul>
        {dados.map(d => (
          <li key={d.id}>
            {d.tipo} - {d.valor}
          </li>
        ))}
      </ul>
    </div>
  );
}