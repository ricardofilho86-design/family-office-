import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

import DashboardCards from "./components/dashboard/DashboardCards";

import ReceitaForm from "./components/lancamentos/ReceitaForm";
import DespesaForm from "./components/lancamentos/DespesaForm";

import InvestimentoForm from "./components/investimentos/InvestimentoForm";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";

export default function App() {

  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const [form, setForm] = useState({

    tipo:"Receita",

    pessoa:"Ricardo",

    origem:"PJ",

    categoria:"Consultas",

    descricao:"",

    valor:"",

    tributavel:true

  });

  const [formInvest, setFormInvest] = useState({

    nome:"",

    pessoa:"Ricardo",

    categoria:"Renda Fixa",

    tipo_movimento:"Aporte",

    valor:""

  });

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#14b8a6",
    "#eab308"
  ];

  async function carregar() {

    const { data } =
      await supabase
        .from("transactions")
        .select("*")
        .order("data", { ascending:true });

    setDados(data || []);

    const { data: inv } =
      await supabase
        .from("investimentos")
        .select("*")
        .order("data", { ascending:true });

    setInvest(inv || []);
  }

  useEffect(()=>{
    carregar();
  },[]);

  const filtrados = useMemo(()=>{

    return dados.filter(d=>{

      const data = new Date(d.data);

      if(inicio && data < new Date(inicio)) {
        return false;
      }

      if(fim) {

        const dataFim = new Date(fim);
        dataFim.setHours(23,59,59,999);

        if(data > dataFim) {
          return false;
        }
      }

      return true;

    });

  },[dados,inicio,fim]);

  const investimentosFiltrados = useMemo(()=>{

    return invest.filter(i=>{

      const data = new Date(i.data);

      if(inicio && data < new Date(inicio)) {
        return false;
      }

      if(fim) {

        const dataFim = new Date(fim);
        dataFim.setHours(23,59,59,999);

        if(data > dataFim) {
          return false;
        }
      }

      return true;

    });

  },[invest,inicio,fim]);

  const receitas = filtrados
    .filter(d=>d.tipo==="Receita")
    .reduce((a,b)=>a+Number(b.valor),0);

  const despesas = filtrados
    .filter(d=>d.tipo==="Despesa")
    .reduce((a,b)=>a+Number(b.valor),0);

  const investimentos = investimentosFiltrados
    .reduce((acc,i)=>{

      if(i.tipo_movimento==="Aporte") {
        return acc + Number(i.valor);
      }

      return acc - Number(i.valor);

    },0);

  const patrimonio =
    receitas -
    despesas +
    investimentos;

  const receitasRicardo = filtrados
    .filter(
      d=>
        d.tipo==="Receita" &&
        d.pessoa==="Ricardo"
    )
    .reduce((a,b)=>a+Number(b.valor),0);

  const receitasLarissa = filtrados
    .filter(
      d=>
        d.tipo==="Receita" &&
        d.pessoa==="Larissa"
    )
    .reduce((a,b)=>a+Number(b.valor),0);

  const despesasRicardo = filtrados
    .filter(
      d=>
        d.tipo==="Despesa" &&
        d.pessoa==="Ricardo"
    )
    .reduce((a,b)=>a+Number(b.valor),0);

  const despesasLarissa = filtrados
    .filter(
      d=>
        d.tipo==="Despesa" &&
        d.pessoa==="Larissa"
    )
    .reduce((a,b)=>a+Number(b.valor),0);

  async function salvarReceita() {

    const valor = Number(form.valor);

    await supabase
      .from("transactions")
      .insert([{

        tipo:"Receita",

        pessoa:form.pessoa,

        origem:form.origem,

        categoria:form.categoria,

        descricao:form.descricao,

        valor,

        tributavel:form.tributavel,

        data:new Date()

      }]);

    let imposto = 0;

    if(form.origem==="PJ") {

      imposto = valor * 0.15;

    } else if(

      form.origem==="PF" &&
      form.tributavel === true &&
      valor > 5000

    ) {

      imposto = valor * 0.275;
    }

    if(imposto > 0) {

      await supabase
        .from("transactions")
        .insert([{

          tipo:"Despesa",

          pessoa:form.pessoa,

          origem:"Imposto",

          categoria:"Impostos",

          descricao:`Imposto automático sobre ${form.origem}`,

          valor:imposto,

          data:new Date()

        }]);
    }

    setForm({

      tipo:"Receita",

      pessoa:"Ricardo",

      origem:"PJ",

      categoria:"Consultas",

      descricao:"",

      valor:"",

      tributavel:true

    });

    carregar();
  }

  async function salvarDespesa() {

    await supabase
      .from("transactions")
      .insert([{

        tipo:"Despesa",

        pessoa:form.pessoa,

        origem:"Despesa",

        categoria:form.categoria,

        descricao:form.descricao,

        valor:Number(form.valor),

        data:new Date()

      }]);

    setForm({

      tipo:"Receita",

      pessoa:"Ricardo",

      origem:"PJ",

      categoria:"Consultas",

      descricao:"",

      valor:"",

      tributavel:true

    });

    carregar();
  }

  async function salvarInvest() {

    await supabase
      .from("investimentos")
      .insert([{

        nome:formInvest.nome,

        pessoa:formInvest.pessoa,

        categoria:formInvest.categoria,

        tipo_movimento:formInvest.tipo_movimento,

        valor:Number(formInvest.valor),

        data:new Date()

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

  const graficoReceitaDespesa = [

    {
      name:"Receitas",
      value:receitas
    },

    {
      name:"Despesas",
      value:despesas
    }

  ];

  const despesasCategoria = Object.values(

    filtrados
      .filter(d=>d.tipo==="Despesa")
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

  const patrimonioEvolucao = [];

  let acumulado = 0;

  [

    ...filtrados.map(d=>({

      data:d.data,

      valor:
        d.tipo==="Receita"
          ? Number(d.valor)
          : -Number(d.valor)

    })),

    ...investimentosFiltrados.map(i=>({

      data:i.data,

      valor:
        i.tipo_movimento==="Aporte"
          ? Number(i.valor)
          : -Number(i.valor)

    }))

  ]
  .sort((a,b)=>new Date(a.data)-new Date(b.data))
  .forEach(item=>{

    acumulado += item.valor;

    patrimonioEvolucao.push({

      data:new Date(item.data)
        .toLocaleDateString(),

      patrimonio:acumulado

    });

  });

  const carteira = Object.values(

    investimentosFiltrados.reduce((acc,i)=>{

      const valor =

        i.tipo_movimento==="Aporte"
          ? Number(i.valor)
          : -Number(i.valor);

      if(!acc[i.categoria]) {

        acc[i.categoria] = {

          name:i.categoria,

          value:0
        };
      }

      acc[i.categoria].value += valor;

      return acc;

    },{})

  ).filter(i=>i.value > 0);

  const totalCarteira =
    carteira.reduce((a,b)=>a+b.value,0);

  return (

    <div
      style={{
        background:"#0f172a",
        minHeight:"100vh",
        color:"#ffffff",
        padding:20,
        fontFamily:"Arial"
      }}
    >

      <h1
        style={{
          color:"#ffffff",
          fontSize:36,
          marginBottom:20
        }}
      >
        Family Office Enterprise
      </h1>

      <div
        style={{
          display:"flex",
          gap:10,
          marginBottom:30,
          flexWrap:"wrap"
        }}
      >

        <input
          type="date"
          value={inicio}
          onChange={e=>setInicio(e.target.value)}
          style={{
            padding:10,
            borderRadius:8
          }}
        />

        <input
          type="date"
          value={fim}
          onChange={e=>setFim(e.target.value)}
          style={{
            padding:10,
            borderRadius:8
          }}
        />

      </div>

      <DashboardCards

        receitas={receitas}

        despesas={despesas}

        investimentos={investimentos}

        patrimonio={patrimonio}

      />

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(350px,1fr))",
          gap:20,
          marginTop:30
        }}
      >

        <ReceitaForm

          form={form}

          setForm={setForm}

          salvar={salvarReceita}

        />

        <DespesaForm

          form={form}

          setForm={setForm}

          salvar={salvarDespesa}

        />

        <InvestimentoForm

          formInvest={formInvest}

          setFormInvest={setFormInvest}

          salvarInvest={salvarInvest}

        />

      </div>

      <div
        style={{
          marginTop:40,
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(450px,1fr))",
          gap:30
        }}
      >

        <div
          style={{
            background:"#1e293b",
            borderRadius:20,
            padding:20
          }}
        >

          <h2 style={{ color:"#fff" }}>
            Receitas x Despesas
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={graficoReceitaDespesa}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >

                {graficoReceitaDespesa.map((_,i)=>(

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

        </div>

        <div
          style={{
            background:"#1e293b",
            borderRadius:20,
            padding:20
          }}
        >

          <h2 style={{ color:"#fff" }}>
            Despesas por Categoria
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart data={despesasCategoria}>

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="name"/>

              <YAxis/>

              <Tooltip/>

              <Legend/>

              <Bar
                dataKey="value"
                fill="#ef4444"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div
          style={{
            background:"#1e293b",
            borderRadius:20,
            padding:20
          }}
        >

          <h2 style={{ color:"#fff" }}>
            Evolução Patrimonial
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <LineChart data={patrimonioEvolucao}>

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

        </div>

        <div
          style={{
            background:"#1e293b",
            borderRadius:20,
            padding:20
          }}
        >

          <h2 style={{ color:"#fff" }}>
            Carteira XP
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <PieChart>

              <Pie
                data={carteira}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label={({ name, value }) => {

                  const percentual =
                    totalCarteira > 0
                      ? ((value / totalCarteira) * 100).toFixed(1)
                      : 0;

                  return `${name} ${percentual}%`;
                }}
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

        </div>

      </div>

      <div
        style={{
          marginTop:40,
          background:"#1e293b",
          padding:25,
          borderRadius:20
        }}
      >

        <h2 style={{ color:"#fff" }}>
          Relatório Financeiro
        </h2>

        <div
          style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
            gap:20,
            marginTop:20
          }}
        >

          <div>

            <h3 style={{ color:"#22c55e" }}>
              Ricardo
            </h3>

            <p>
              Receitas:
              {" "}
              R$ {receitasRicardo.toFixed(2)}
            </p>

            <p>
              Despesas:
              {" "}
              R$ {despesasRicardo.toFixed(2)}
            </p>

            <p>
              Saldo:
              {" "}
              R$ {(receitasRicardo - despesasRicardo).toFixed(2)}
            </p>

          </div>

          <div>

            <h3 style={{ color:"#3b82f6" }}>
              Larissa
            </h3>

            <p>
              Receitas:
              {" "}
              R$ {receitasLarissa.toFixed(2)}
            </p>

            <p>
              Despesas:
              {" "}
              R$ {despesasLarissa.toFixed(2)}
            </p>

            <p>
              Saldo:
              {" "}
              R$ {(receitasLarissa - despesasLarissa).toFixed(2)}
            </p>

          </div>

          <div>

            <h3 style={{ color:"#f59e0b" }}>
              Consolidado
            </h3>

            <p>
              Receitas:
              {" "}
              R$ {receitas.toFixed(2)}
            </p>

            <p>
              Despesas:
              {" "}
              R$ {despesas.toFixed(2)}
            </p>

            <p>
              Investimentos:
              {" "}
              R$ {investimentos.toFixed(2)}
            </p>

            <p>
              Patrimônio:
              {" "}
              R$ {patrimonio.toFixed(2)}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}