import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function App() {

  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

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

  async function carregar() {
    const { data } = await supabase.from("transactions").select("*");
    setDados(data || []);

    const { data: inv } = await supabase.from("investimentos").select("*").order("data");
    setInvest(inv || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  function filtrar() {
    return dados.filter(d => {
      const data = new Date(d.data);
      if (inicio && new Date(inicio) > data) return false;
      if (fim && new Date(fim) < data) return false;
      return true;
    });
  }

  const filtrados = filtrar();

  const totalReceita = filtrados
    .filter(d => d.tipo === "Receita")
    .reduce((a,b)=>a+Number(b.valor||0),0);

  const totalDespesa = filtrados
    .filter(d => d.tipo === "Despesa")
    .reduce((a,b)=>a+Number(b.valor||0),0);

  const saldo = totalReceita - totalDespesa;

  // INVESTIMENTOS
  const totalInvest = invest.reduce((acc,i)=>{
    if(i.tipo_movimento==="Aporte") return acc + Number(i.valor);
    if(i.tipo_movimento==="Resgate") return acc - Number(i.valor);
    return acc;
  },0);

  const patrimonio = saldo + totalInvest;

  // EVOLUÇÃO COMPLETA (com investimentos)
  const evolucao = [];
  let acumulado = 0;

  const eventos = [
    ...dados.map(d => ({
      data: d.data,
      valor: d.tipo === "Receita" ? Number(d.valor) : -Number(d.valor)
    })),
    ...invest.map(i => ({
      data: i.data,
      valor: i.tipo_movimento === "Aporte"
        ? Number(i.valor)
        : -Number(i.valor)
    }))
  ];

  eventos.sort((a,b)=>new Date(a.data)-new Date(b.data));

  eventos.forEach(e=>{
    acumulado += e.valor;
    evolucao.push({
      data: new Date(e.data).toLocaleDateString(),
      patrimonio: acumulado
    });
  });

  // CARTEIRA XP STYLE
  const carteira = Object.values(
    invest.reduce((acc, i) => {
      const valor =
        i.tipo_movimento === "Aporte"
          ? Number(i.valor)
          : -Number(i.valor);

      if (!acc[i.categoria]) {
        acc[i.categoria] = { name: i.categoria, value: 0 };
      }

      acc[i.categoria].value += valor;

      return acc;
    }, {})
  ).filter(i => i.value > 0);

  const totalCarteira = carteira.reduce((a,b)=>a+b.value,0);

  const carteiraPercentual = carteira.map(i => ({
    ...i,
    percentual: totalCarteira > 0
      ? ((i.value / totalCarteira) * 100).toFixed(1)
      : 0
  }));

  // GRÁFICOS
  const graficoRD = [
    { name: "Receitas", value: totalReceita },
    { name: "Despesas", value: totalDespesa }
  ];

  // RELATÓRIO
  function gerarRelatorio() {
    setRelatorio({
      receitas: totalReceita,
      despesas: totalDespesa,
      saldo,
      patrimonio
    });
  }

  // SALVAR
  async function salvar() {
    await supabase.from("transactions").insert([{
      data: new Date(),
      ...form,
      valor: Number(form.valor)
    }]);

    setForm({ ...form, valor:"", descricao:"" });
    carregar();
  }

  async function salvarInvest() {
    await supabase.from("investimentos").insert([{
      ...formInvest,
      valor: Number(formInvest.valor),
      data: new Date()
    }]);

    setFormInvest({
      nome:"",
      categoria:"Renda Fixa",
      tipo_movimento:"Aporte",
      valor:""
    });

    carregar();
  }

  return (
    <div style={{ background:"#0f172a", color:"#fff", minHeight:"100vh", padding:20 }}>

      <h1>Family Office</h1>

      {/* FILTRO */}
      <div style={{ display:"flex", gap:10 }}>
        <input type="date" onChange={e=>setInicio(e.target.value)} />
        <input type="date" onChange={e=>setFim(e.target.value)} />
      </div>

      {/* DASHBOARD */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <Card title="Saldo" value={saldo}/>
        <Card title="Receita" value={totalReceita}/>
        <Card title="Despesa" value={totalDespesa}/>
        <Card title="Patrimônio" value={patrimonio}/>
      </div>

      {/* RELATÓRIO */}
      <Section title="Relatório">
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

      <Section title="Evolução Patrimonial">
        <LineChart width={500} height={300} data={evolucao}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="data"/>
          <YAxis/>
          <Tooltip/>
          <Line dataKey="patrimonio"/>
        </LineChart>
      </Section>

      {/* CARTEIRA XP */}
      <Section title="Carteira de Investimentos (Estilo XP)">
        <PieChart width={350} height={350}>
          <Pie data={carteira} dataKey="value" nameKey="name" outerRadius={120} label>
            {carteira.map((_,i)=><Cell key={i}/>)}
          </Pie>
          <Tooltip/>
        </PieChart>

        {carteiraPercentual.map((c,i)=>(
          <p key={i}>
            {c.name} — R$ {c.value.toFixed(2)} ({c.percentual}%)
          </p>
        ))}
      </Section>

      {/* FORM TRANSAÇÃO */}
      <Section title="Novo Lançamento">
        <select onChange={e=>setForm({...form, tipo:e.target.value})}>
          <option>Receita</option>
          <option>Despesa</option>
        </select>

        <select onChange={e=>setForm({...form, pessoa:e.target.value})}>
          <option>Ricardo</option>
          <option>Larissa</option>
        </select>

        <select onChange={e=>setForm({...form, origem:e.target.value})}>
          <option>PJ</option>
          <option>PF</option>
          <option>Lucros</option>
        </select>

        <select onChange={e=>setForm({...form, categoria:e.target.value})}>
          <option>Consultas</option>
          <option>Moradia</option>
          <option>Alimentação</option>
          <option>Transporte</option>
          <option>Lazer</option>
          <option>Saúde</option>
          <option>Educação</option>
          <option>Impostos</option>
        </select>

        <input placeholder="Descrição" onChange={e=>setForm({...form, descricao:e.target.value})}/>
        <input type="number" placeholder="Valor" onChange={e=>setForm({...form, valor:e.target.value})}/>
        <button onClick={salvar}>Salvar</button>
      </Section>

      {/* INVESTIMENTOS */}
      <Section title="Investimentos">
        <input placeholder="Nome do ativo" onChange={e=>setFormInvest({...formInvest, nome:e.target.value})}/>

        <select onChange={e=>setFormInvest({...formInvest, categoria:e.target.value})}>
          <option>Renda Fixa</option>
          <option>Ações</option>
          <option>FIIs</option>
          <option>ETFs</option>
          <option>Internacional</option>
          <option>Cripto</option>
        </select>

        <select onChange={e=>setFormInvest({...formInvest, tipo_movimento:e.target.value})}>
          <option>Aporte</option>
          <option>Resgate</option>
        </select>

        <input type="number" placeholder="Valor" onChange={e=>setFormInvest({...formInvest, valor:e.target.value})}/>
        <button onClick={salvarInvest}>Salvar</button>

        <ul>
          {invest.map(i=>(
            <li key={i.id}>
              {i.nome} | {i.categoria} | {i.tipo_movimento} | R$ {i.valor}
            </li>
          ))}
        </ul>
      </Section>

    </div>
  );
}

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
    <div style={{ marginTop:20, background:"#1e293b", padding:20, borderRadius:10 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}