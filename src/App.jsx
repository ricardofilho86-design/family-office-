import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const COLORS = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#14b8a6",
  "#f97316"
];

export default function App() {

  // =========================
  // ESTADOS
  // =========================

  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const [relatorio, setRelatorio] = useState(null);

  const [form, setForm] = useState({
    tipo: "Receita",
    pessoa: "Ricardo",
    origem: "PJ",
    tributavel: true,
    categoria: "Consultas",
    descricao: "",
    valor: ""
  });

  const [formInvest, setFormInvest] = useState({
    nome: "",
    pessoa: "Ricardo",
    categoria: "Renda Fixa",
    tipo_movimento: "Aporte",
    valor: ""
  });

  // =========================
  // LOAD
  // =========================

  async function carregar() {

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("data");

    setDados(data || []);

    const { data: inv } = await supabase
      .from("investimentos")
      .select("*")
      .order("data");

    setInvest(inv || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  // =========================
  // FILTRO
  // =========================

  function dentroPeriodo(dataItem) {

    const data = new Date(dataItem);

    if (inicio && new Date(inicio) > data) return false;
    if (fim && new Date(fim) < data) return false;

    return true;
  }

  const filtrados = dados.filter(d =>
    dentroPeriodo(d.data)
  );

  const investimentosFiltrados = invest.filter(i =>
    dentroPeriodo(i.data)
  );

  // =========================
  // RECEITAS / DESPESAS
  // =========================

  const totalReceita = filtrados
    .filter(d => d.tipo === "Receita")
    .reduce((a,b)=>a+Number(b.valor||0),0);

  const totalDespesa = filtrados
    .filter(d => d.tipo === "Despesa")
    .reduce((a,b)=>a+Number(b.valor||0),0);

  const saldo = totalReceita - totalDespesa;

  // =========================
  // INVESTIMENTOS
  // =========================

  const totalInvest = investimentosFiltrados.reduce((acc,i)=>{

    if(i.tipo_movimento === "Aporte") {
      return acc + Number(i.valor);
    }

    if(i.tipo_movimento === "Resgate") {
      return acc - Number(i.valor);
    }

    return acc;

  },0);

  // =========================
  // PATRIMÔNIO
  // =========================

  const patrimonio = saldo + totalInvest;

  // =========================
  // RELATÓRIO POR PESSOA
  // =========================

  function resumoPessoa(nome) {

    const receitas = filtrados
      .filter(
        d =>
          d.tipo === "Receita" &&
          d.pessoa === nome
      )
      .reduce((a,b)=>a+Number(b.valor||0),0);

    const despesas = filtrados
      .filter(
        d =>
          d.tipo === "Despesa" &&
          d.pessoa === nome
      )
      .reduce((a,b)=>a+Number(b.valor||0),0);

    const investimentos = investimentosFiltrados
      .filter(i => i.pessoa === nome)
      .reduce((acc,i)=>{

        if(i.tipo_movimento === "Aporte") {
          return acc + Number(i.valor);
        }

        if(i.tipo_movimento === "Resgate") {
          return acc - Number(i.valor);
        }

        return acc;

      },0);

    return {
      receitas,
      despesas,
      investimentos,
      saldo: receitas - despesas,
      patrimonio:
        receitas -
        despesas +
        investimentos
    };
  }

  const ricardo = resumoPessoa("Ricardo");
  const larissa = resumoPessoa("Larissa");

  // =========================
  // EVOLUÇÃO
  // =========================

  let acumulado = 0;

  const evolucao = [];

  const eventos = [

    ...filtrados.map(d => ({
      data: d.data,
      valor:
        d.tipo === "Receita"
          ? Number(d.valor)
          : -Number(d.valor)
    })),

    ...investimentosFiltrados.map(i => ({
      data: i.data,
      valor:
        i.tipo_movimento === "Aporte"
          ? Number(i.valor)
          : -Number(i.valor)
    }))
  ];

  eventos.sort(
    (a,b)=>new Date(a.data)-new Date(b.data)
  );

  eventos.forEach(e=>{

    acumulado += e.valor;

    evolucao.push({
      data: new Date(e.data).toLocaleDateString(),
      patrimonio: acumulado
    });
  });

  // =========================
  // CARTEIRA XP
  // =========================

  const carteira = Object.values(

    investimentosFiltrados.reduce((acc,i)=>{

      const valor =
        i.tipo_movimento === "Aporte"
          ? Number(i.valor)
          : -Number(i.valor);

      if(!acc[i.categoria]) {

        acc[i.categoria] = {
          name: i.categoria,
          value: 0
        };
      }

      acc[i.categoria].value += valor;

      return acc;

    },{})

  ).filter(i => i.value > 0);

  const totalCarteira =
    carteira.reduce((a,b)=>a+b.value,0);

  const carteiraPercentual = carteira.map(i=>({

    ...i,

    percentual:
      totalCarteira > 0
        ? ((i.value / totalCarteira) * 100).toFixed(1)
        : 0
  }));

  // =========================
  // GRÁFICOS
  // =========================

  const graficoRD = [
    { name: "Receitas", value: totalReceita },
    { name: "Despesas", value: totalDespesa }
  ];

  const despesasCategoria = Object.values(

    filtrados
      .filter(d => d.tipo === "Despesa")
      .reduce((acc,item)=>{

        if(!acc[item.categoria]) {

          acc[item.categoria] = {
            name:item.categoria,
            value:0
          };
        }

        acc[item.categoria].value += Number(item.valor);

        return acc;

      },{})

  );

  const graficoPessoas = [

    {
      nome: "Ricardo",
      receitas: ricardo.receitas,
      despesas: ricardo.despesas,
      investimentos: ricardo.investimentos
    },

    {
      nome: "Larissa",
      receitas: larissa.receitas,
      despesas: larissa.despesas,
      investimentos: larissa.investimentos
    }
  ];

  // =========================
  // RELATÓRIO
  // =========================

  function gerarRelatorio() {

    setRelatorio({

      receitas: totalReceita,

      despesas: totalDespesa,

      investimentos: totalInvest,

      saldo,

      patrimonio
    });
  }

  // =========================
  // SALVAR TRANSAÇÃO
  // =========================

  async function salvar() {

    const valor = Number(form.valor);

    await supabase.from("transactions").insert([{

      data: new Date(),

      ...form,

      valor

    }]);

    // IMPOSTOS
    let imposto = 0;

    // PJ
    if (
      form.tipo === "Receita" &&
      form.origem === "PJ"
    ) {
      imposto = valor * 0.15;
    }

    // PF
    if (
      form.tipo === "Receita" &&
      form.origem === "PF" &&
      form.tributavel === true &&
      valor > 5000
    ) {
      imposto = valor * 0.275;
    }

    // LUCROS = ISENTO

    if(imposto > 0) {

      await supabase.from("transactions").insert([{

        data: new Date(),

        tipo: "Despesa",

        pessoa: form.pessoa,

        origem: "Imposto",

        categoria: "Impostos",

        descricao: `Imposto automático - ${form.origem}`,

        valor: imposto

      }]);
    }

    setForm({
      ...form,
      valor:"",
      descricao:""
    });

    carregar();
  }

  // =========================
  // SALVAR INVESTIMENTO
  // =========================

  async function salvarInvest() {

    await supabase.from("investimentos").insert([{

      ...formInvest,

      valor: Number(formInvest.valor),

      data: new Date()

    }]);

    setFormInvest({

      nome:"",

      pessoa:"Ricardo",

      categoria:"Renda Fixa",

      tipo_movimento:"Aporte",

      valor:""
    });

    carregar();
  }

  // =========================
  // UI
  // =========================

  return (

    <div
      style={{
        background:"#0f172a",
        color:"#ffffff",
        minHeight:"100vh",
        padding:20,
        fontFamily:"Arial"
      }}
    >

      {/* TÍTULO */}
      <h1 style={{ color:"#ffffff" }}>
        Family Office
      </h1>

      {/* FILTRO */}
      <div
        style={{
          display:"flex",
          gap:10,
          marginBottom:20
        }}
      >

        <input
          type="date"
          onChange={e=>setInicio(e.target.value)}
        />

        <input
          type="date"
          onChange={e=>setFim(e.target.value)}
        />

      </div>

      {/* DASHBOARD */}
      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          gap:15
        }}
      >

        <Card title="Receitas" value={totalReceita}/>
        <Card title="Despesas" value={totalDespesa}/>
        <Card title="Investimentos" value={totalInvest}/>
        <Card title="Patrimônio" value={patrimonio}/>

      </div>

      {/* RELATÓRIO */}
      <Section title="Relatório Financeiro">

        <button onClick={gerarRelatorio}>
          Gerar Relatório
        </button>

        {relatorio && (

          <div style={{ marginTop:20 }}>

            <h3>Balanço Geral</h3>

            <p>
              Receitas:
              R$ {relatorio.receitas.toFixed(2)}
            </p>

            <p>
              Despesas:
              R$ {relatorio.despesas.toFixed(2)}
            </p>

            <p>
              Investimentos:
              R$ {relatorio.investimentos.toFixed(2)}
            </p>

            <p>
              Saldo:
              R$ {relatorio.saldo.toFixed(2)}
            </p>

            <h3>
              Patrimônio:
              R$ {relatorio.patrimonio.toFixed(2)}
            </h3>

            <hr />

            <h3>Ricardo</h3>

            <p>
              Receitas:
              R$ {ricardo.receitas.toFixed(2)}
            </p>

            <p>
              Despesas:
              R$ {ricardo.despesas.toFixed(2)}
            </p>

            <p>
              Investimentos:
              R$ {ricardo.investimentos.toFixed(2)}
            </p>

            <p>
              Patrimônio:
              R$ {ricardo.patrimonio.toFixed(2)}
            </p>

            <hr />

            <h3>Larissa</h3>

            <p>
              Receitas:
              R$ {larissa.receitas.toFixed(2)}
            </p>

            <p>
              Despesas:
              R$ {larissa.despesas.toFixed(2)}
            </p>

            <p>
              Investimentos:
              R$ {larissa.investimentos.toFixed(2)}
            </p>

            <p>
              Patrimônio:
              R$ {larissa.patrimonio.toFixed(2)}
            </p>

          </div>
        )}

      </Section>

      {/* RECEITAS X DESPESAS */}
      <Section title="Receitas vs Despesas">

        <ResponsiveContainer width="100%" height={350}>

          <PieChart>

            <Pie
              data={graficoRD}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {graficoRD.map((_,i)=>(
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip/>
            <Legend/>

          </PieChart>

        </ResponsiveContainer>

      </Section>

      {/* DESPESAS */}
      <Section title="Despesas por Categoria">

        <ResponsiveContainer width="100%" height={350}>

          <PieChart>

            <Pie
              data={despesasCategoria}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {despesasCategoria.map((_,i)=>(
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip/>
            <Legend/>

          </PieChart>

        </ResponsiveContainer>

      </Section>

      {/* POR PESSOA */}
      <Section title="Ricardo vs Larissa">

        <ResponsiveContainer width="100%" height={350}>

          <BarChart data={graficoPessoas}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="nome"/>

            <YAxis/>

            <Tooltip/>

            <Legend/>

            <Bar dataKey="receitas" fill="#22c55e"/>

            <Bar dataKey="despesas" fill="#ef4444"/>

            <Bar dataKey="investimentos" fill="#3b82f6"/>

          </BarChart>

        </ResponsiveContainer>

      </Section>

      {/* EVOLUÇÃO */}
      <Section title="Evolução Patrimonial">

        <ResponsiveContainer width="100%" height={350}>

          <LineChart data={evolucao}>

            <CartesianGrid strokeDasharray="3 3"/>

            <XAxis dataKey="data"/>

            <YAxis/>

            <Tooltip/>

            <Legend/>

            <Line
              type="monotone"
              dataKey="patrimonio"
              stroke="#22c55e"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </Section>

      {/* CARTEIRA XP */}
      <Section title="Carteira de Investimentos">

        <ResponsiveContainer width="100%" height={400}>

          <PieChart>

            <Pie
              data={carteira}
              dataKey="value"
              nameKey="name"
              outerRadius={140}
              label
            >

              {carteira.map((_,i)=>(
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip/>
            <Legend/>

          </PieChart>

        </ResponsiveContainer>

        <div style={{ marginTop:20 }}>

          {carteiraPercentual.map((c,i)=>(

            <p key={i}>

              {c.name} —

              R$ {c.value.toFixed(2)}

              ({c.percentual}%)

            </p>

          ))}

        </div>

      </Section>

    </div>
  );
}

// =========================
// CARD
// =========================

function Card({title,value}) {

  return (

    <div
      style={{
        background:"#1e293b",
        padding:20,
        borderRadius:12
      }}
    >

      <p>{title}</p>

      <h2>
        R$ {Number(value).toFixed(2)}
      </h2>

    </div>
  );
}

// =========================
// SECTION
// =========================

function Section({title,children}) {

  return (

    <div
      style={{
        marginTop:25,
        background:"#1e293b",
        padding:20,
        borderRadius:12
      }}
    >

      <h3 style={{ marginBottom:20 }}>
        {title}
      </h3>

      {children}

    </div>
  );
}