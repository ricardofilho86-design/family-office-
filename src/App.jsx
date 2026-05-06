import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [form, setForm] = useState({
    tipo: "Receita",
    pessoa: "Ricardo",
    origem: "PJ",
    categoria: "Consultas",
    descricao: "",
    valor: ""
  });

  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);
  const [novoInvest, setNovoInvest] = useState("");
  const [valorInvest, setValorInvest] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function carregar() {
    const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    setDados(data || []);

    const { data: inv } = await supabase.from("investimentos").select("*");
    setInvest(inv || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    const { error } = await supabase.from("transactions").insert([
      {
        data: new Date(),
        tipo: form.tipo,
        pessoa: form.pessoa,
        origem: form.origem,
        categoria: form.categoria,
        descricao: form.descricao,
        valor: Number(form.valor)
      }
    ]);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      setForm({ ...form, valor: "", descricao: "" });
      carregar();
    }
  }

  async function salvarInvest() {
    const { error } = await supabase.from("investimentos").insert([
      {
        nome: novoInvest,
        tipo: "Ativo",
        valor: Number(valorInvest)
      }
    ]);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      setNovoInvest("");
      setValorInvest("");
      carregar();
    }
  }

  const totalReceita = dados
    .filter(d => d.tipo === "Receita")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const totalDespesa = dados
    .filter(d => d.tipo === "Despesa")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const saldo = totalReceita - totalDespesa;

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto", fontFamily: "Arial" }}>
      <h1>Family Office</h1>

      {/* DASHBOARD */}
      <div style={{ background: "#f5f5f5", padding: 15, borderRadius: 10 }}>
        <h3>Saldo: R$ {saldo.toFixed(2)}</h3>
        <p>Receitas: R$ {totalReceita.toFixed(2)}</p>
        <p>Despesas: R$ {totalDespesa.toFixed(2)}</p>
      </div>

      {/* FORMULÁRIO */}
      <div style={{ marginTop: 20 }}>
        <h3>Novo Lançamento</h3>

        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option>Receita</option>
          <option>Despesa</option>
        </select>

        <select name="pessoa" value={form.pessoa} onChange={handleChange}>
          <option>Ricardo</option>
          <option>Larissa</option>
        </select>

        <select name="origem" value={form.origem} onChange={handleChange}>
          <option>PJ</option>
          <option>PF</option>
        </select>

        <select name="categoria" value={form.categoria} onChange={handleChange}>
          <option>Consultas</option>
          <option>Alimentação</option>
          <option>Moradia</option>
          <option>Transporte</option>
          <option>Impostos</option>
          <option>Investimentos</option>
          <option>Lazer</option>
        </select>

        <input
          name="descricao"
          placeholder="Descrição"
          value={form.descricao}
          onChange={handleChange}
        />

        <input
          name="valor"
          type="number"
          placeholder="Valor"
          value={form.valor}
          onChange={handleChange}
        />

        <button onClick={salvar}>Salvar</button>
      </div>

      {/* INVESTIMENTOS */}
      <div style={{ marginTop: 30 }}>
        <h3>Investimentos</h3>

        <input
          placeholder="Nome"
          value={novoInvest}
          onChange={(e) => setNovoInvest(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor"
          value={valorInvest}
          onChange={(e) => setValorInvest(e.target.value)}
        />

        <button onClick={salvarInvest}>Adicionar</button>

        <ul>
          {invest.map(i => (
            <li key={i.id}>{i.nome} - R$ {i.valor}</li>
          ))}
        </ul>
      </div>

      {/* LISTA */}
      <div style={{ marginTop: 30 }}>
        <h3>Transações</h3>

        <ul>
          {dados.map(d => (
            <li key={d.id}>
              {d.tipo} | {d.categoria} | R$ {d.valor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}