import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function App() {
  // ------------------ ESTADOS ------------------
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

  const [formInvest, setFormInvest] = useState({
    nome: "",
    categoria: "Renda Fixa",
    tipo_movimento: "Aporte",
    valor: ""
  });

  const [filtro, setFiltro] = useState("mes");

  // ------------------ HANDLERS ------------------
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleInvest(e) {
    setFormInvest({ ...formInvest, [e.target.name]: e.target.value });
  }

  // ------------------ LOAD ------------------
  async function carregar() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    setDados(data || []);

    const { data: inv } = await supabase
      .from("investimentos")
      .select("*")
      .order("data", { ascending: false });

    setInvest(inv || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  // ------------------ SALVAR TRANSAÇÃO ------------------
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
      alert(error.message);
    } else {
      setForm({ ...form, valor: "", descricao: "" });
      carregar();
    }
  }

  // ------------------ SALVAR INVESTIMENTO ------------------
  async function salvarInvest() {
    const { error } = await supabase.from("investimentos").insert([
      {
        nome: formInvest.nome,
        categoria: formInvest.categoria,
        tipo_movimento: formInvest.tipo_movimento,
        valor: Number(formInvest.valor),
        data: new Date()
      }
    ]);

    if (error) {
      alert(error.message);
    } else {
      setFormInvest({
        nome: "",
        categoria: "Renda Fixa",
        tipo_movimento: "Aporte",
        valor: ""
      });
      carregar();
    }
  }

  // ------------------ FILTRO ------------------
  function filtrarDados() {
    const hoje = new Date();

    return dados.filter(d => {
      const data = new Date(d.data);

      if (filtro === "semana") {
        const semana = new Date();
        semana.setDate(hoje.getDate() - 7);
        return data >= semana;
      }

      if (filtro === "mes") {
        return (
          data.getMonth() === hoje.getMonth() &&
          data.getFullYear() === hoje.getFullYear()
        );
      }

      return true;
    });
  }

  const filtrados = filtrarDados();

  // ------------------ CÁLCULOS ------------------
  const totalReceita = filtrados
    .filter(d => d.tipo === "Receita")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const totalDespesa = filtrados
    .filter(d => d.tipo === "Despesa")
    .reduce((a, b) => a + Number(b.valor || 0), 0);

  const saldo = totalReceita - totalDespesa;

  const totalInvest = invest.reduce((acc, item) => {
    if (item.tipo_movimento === "Aporte") return acc + Number(item.valor);
    if (item.tipo_movimento === "Resgate") return acc - Number(item.valor);
    return acc;
  }, 0);

  const patrimonio = saldo + totalInvest;

  // ------------------ GRÁFICO ------------------
  const porCategoria = Object.values(
    filtrados.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = { name: item.categoria, value: 0 };
      }
      acc[item.categoria].value += Number(item.valor);
      return acc;
    }, {})
  );

  // ------------------ UI ------------------
  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h1>Family Office</h1>

      {/* FILTRO */}
      <select onChange={(e) => setFiltro(e.target.value)}>
        <option value="mes">Mensal</option>
        <option value="semana">Semanal</option>
      </select>

      {/* DASHBOARD */}
      <div style={{ background: "#eee", padding: 15, borderRadius: 10 }}>
        <h3>Saldo: R$ {saldo.toFixed(2)}</h3>
        <p>Receitas: R$ {totalReceita.toFixed(2)}</p>
        <p>Despesas: R$ {totalDespesa.toFixed(2)}</p>
        <h2>Patrimônio: R$ {patrimonio.toFixed(2)}</h2>
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

      {/* GRÁFICO */}
      <div style={{ marginTop: 30 }}>
        <h3>Gastos por Categoria</h3>
        <PieChart width={300} height={300}>
          <Pie data={porCategoria} dataKey="value" nameKey="name" outerRadius={100}>
            {porCategoria.map((entry, index) => (
              <Cell key={index} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* INVESTIMENTOS */}
      <div style={{ marginTop: 30 }}>
        <h3>Investimentos</h3>

        <input
          name="nome"
          placeholder="Nome do ativo"
          value={formInvest.nome}
          onChange={handleInvest}
        />

        <select name="categoria" value={formInvest.categoria} onChange={handleInvest}>
          <option>Renda Fixa</option>
          <option>Ações</option>
          <option>Fundos Imobiliários (FIIs)</option>
          <option>ETFs</option>
          <option>Fundos de Investimento</option>
          <option>Internacional</option>
          <option>Criptomoedas</option>
          <option>Previdência</option>
          <option>Caixa / Liquidez</option>
        </select>

        <select name="tipo_movimento" value={formInvest.tipo_movimento} onChange={handleInvest}>
          <option>Aporte</option>
          <option>Resgate</option>
        </select>

        <input
          name="valor"
          type="number"
          placeholder="Valor"
          value={formInvest.valor}
          onChange={handleInvest}
        />

        <button onClick={salvarInvest}>Salvar</button>

        <ul>
          {invest.map(i => (
            <li key={i.id}>
              {i.nome} | {i.categoria} | {i.tipo_movimento} | R$ {i.valor}
            </li>
          ))}
        </ul>
      </div>

      {/* TRANSAÇÕES */}
      <div style={{ marginTop: 30 }}>
        <h3>Transações</h3>

        <ul>
          {filtrados.map(d => (
            <li key={d.id}>
              {d.tipo} | {d.categoria} | R$ {d.valor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}