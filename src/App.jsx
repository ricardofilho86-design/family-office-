import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function App() {
  // ---------------- ESTADOS ----------------
  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const [tipoRelatorio, setTipoRelatorio] = useState("mensal");
  const [relatorio, setRelatorio] = useState(null);

  const [form, setForm] = useState({
    tipo: "Receita",
    pessoa: "Ricardo",
    origem: "PJ",
    categoria: "Consultas",
    descricao: "",
    valor: ""
  });

  const [formInvest, setFormInvest] = useState({
    nome: "",
    categoria: "Renda Fixa",
    tipo_movimento: "Aporte",
    valor: ""
  });

  // ---------------- LOAD ----------------
  async function carregar() {
    const { data } = await supabase.from("transactions").select("*");
    setDados(data || []);

    const { data: inv } = await supabase.from("investimentos").select("*");
    setInvest(inv || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  // ---------------- FILTRO ----------------
  function filtrar() {
    return dados.filter(d => {
      const data = new Date(d.data);
      if (inicio && new Date(inicio) > data) return false;
      if (fim && new Date(fim) < data) return false;
      return true;
    });
  }

  const filtrados = filtrar();

  // ---------------- CÁLCULOS ----------------
  const receitas = filtrados.filter(d => d.tipo === "Receita");
  const despesas = filtrados.filter(d => d.tipo === "Despesa");

  const totalReceita = receitas.reduce((a, b) => a + Number(b.valor || 0), 0);
  const totalDespesa = despesas.reduce((a, b) => a + Number(b.valor || 0), 0);
  const saldo = totalReceita - totalDespesa;

  const totalInvest = invest.reduce((acc, i) => {
    if (i.tipo_movimento === "Aporte") return acc + Number(i.valor);
    if (i.tipo_movimento === "Resgate") return acc - Number(i.valor);
    return acc;
  }, 0);

  const patrimonio = saldo + totalInvest;

  // ---------------- RELATÓRIO ----------------
  function gerarRelatorio() {
    const hoje = new Date();
    let base = dados;

    if (tipoRelatorio === "semanal") {
      const semana = new Date();
      semana.setDate(hoje.getDate() - 7);
      base = dados.filter(d => new Date(d.data) >= semana);
    }

    if (tipoRelatorio === "mensal") {
      base = dados.filter(d => {
        const data = new Date(d.data);
        return data.getMonth() === hoje.getMonth() &&
               data.getFullYear() === hoje.getFullYear();
      });
    }

    const receitas = base.filter(d => d.tipo === "Receita")
      .reduce((a,b)=>a+Number(b.valor||0),0);

    const despesas = base.filter(d => d.tipo === "Despesa")
      .reduce((a,b)=>a+Number(b.valor||0),0);

    const saldo = receitas - despesas;

    setRelatorio({
      receitas,
      despesas,
      saldo,
      patrimonio
    });
  }

  // ---------------- GRÁFICOS ----------------
  const graficoRD = [
    { name: "Receitas", value: totalReceita },
    { name: "Despesas", value: totalDespesa }
  ];

  const evolucao = filtrados.map(d => ({
    data: new Date(d.data).toLocaleDateString(),
    valor: Number(d.valor)
  }));

  const porCategoria = Object.values(
    filtrados.reduce((acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = { name: item.categoria, value: 0 };
      }
      acc[item.categoria].value += Number(item.valor);
      return acc;
    }, {})
  );

  // ---------------- SALVAR ----------------
  async function salvar() {
    await supabase.from("transactions").insert([{
      data: new Date(),
      ...form,
      valor: Number(form.valor)
    }]);

    setForm({ ...form, valor: "", descricao: "" });
    carregar();
  }

  async function salvarInvest() {
    await supabase.from("investimentos").insert([{
      ...formInvest,
      valor: Number(formInvest.valor),
      data: new Date()
    }]);

    setFormInvest({
      nome: "",
      categoria: "Renda Fixa",
      tipo_movimento: "Aporte",
      valor: ""
    });

    carregar();
  }

  // ---------------- UI ----------------
  return (
    <div style={{
      background:"#0f172a",
      color:"#fff",
      minHeight:"100vh",
      padding:20,
      fontFamily:"system-ui"
    }}>
      <h1>Family Office</h1>

      {/* CALENDÁRIO */}
      <div style={{ display:"flex", gap:10 }}>
        <input type="date" onChange={e=>setInicio(e.target.value)} />
        <input type="date" onChange={e=>setFim(e.target.value)} />
      </div>

      {/* DASHBOARD */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:20 }}>
        <Card title="Saldo" value={saldo}/>
        <Card title="Receita" value={totalReceita}/>
        <Card title="Despesa" value={totalDespesa}/>
        <Card title="Patrimônio" value={patrimonio}/>
      </div>

      {/* RELATÓRIO */}
      <Section title="Relatórios">
        <select onChange={(e)=>setTipoRelatorio(e.target.value)}>
          <option value="mensal">Mensal</option>
          <option value="semanal">Semanal</option>
        </select>

        <button onClick={gerarRelatorio}>Gerar</button>

        {relatorio && (
          <>
            <p>Receitas: R$ {relatorio.receitas.toFixed(2)}</p>
            <p>Despesas: R$ {relatorio.despesas.toFixed(2)}</p>
            <p>Saldo: R$ {relatorio.saldo.toFixed(2)}</p>
            <h3>Patrimônio: R$ {relatorio.patrimonio.toFixed(2)}</h3>
          </>
        )}
      </Section>

      {/* GRÁFICOS */}
      <Section title="Receitas vs Despesas">
        <PieChart width={300} height={300}>
          <Pie data={graficoRD} dataKey="value" outerRadius={100}>
            {graficoRD.map((_,i)=><Cell key={i}/>)}
          </Pie>
          <Tooltip/>
        </PieChart>
      </Section>

      <Section title="Evolução">
        <LineChart width={500} height={300} data={evolucao}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="data"/>
          <YAxis/>
          <Tooltip/>
          <Line dataKey="valor"/>
        </LineChart>
      </Section>

      {/* FORM */}
      <Section title="Novo Lançamento">
        <input placeholder="Descrição" onChange={e=>setForm({...form, descricao:e.target.value})}/>
        <input type="number" placeholder="Valor" onChange={e=>setForm({...form, valor:e.target.value})}/>
        <button onClick={salvar}>Salvar</button>
      </Section>

      {/* INVESTIMENTOS */}
      <Section title="Investimentos">
        <input placeholder="Nome" onChange={e=>setFormInvest({...formInvest, nome:e.target.value})}/>
        <select onChange={e=>setFormInvest({...formInvest, categoria:e.target.value})}>
          <option>Renda Fixa</option>
          <option>Ações</option>
          <option>FIIs</option>
        </select>
        <select onChange={e=>setFormInvest({...formInvest, tipo_movimento:e.target.value})}>
          <option>Aporte</option>
          <option>Resgate</option>
        </select>
        <input type="number" placeholder="Valor" onChange={e=>setFormInvest({...formInvest, valor:e.target.value})}/>
        <button onClick={salvarInvest}>Salvar</button>
      </Section>
    </div>
  );
}

// COMPONENTES
function Card({title,value}) {
  return (
    <div style={{ background:"#1e293b", padding:15, borderRadius:10 }}>
      <p>{title}</p>
      <h2>R$ {Number(value).toFixed(2)}</h2>
    </div>
  );
}

function Section({title,children}) {
  return (
    <div style={{ marginTop:30, background:"#1e293b", padding:20, borderRadius:12 }}>
      <h3>{title}</h3>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {children}
      </div>
    </div>
  );
}