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

  async function carregar() {
    const { data } = await supabase.from("transactions").select("*");
    setDados(data || []);

    const { data: inv } = await supabase.from("investimentos").select("*");
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

  const receitas = filtrados.filter(d => d.tipo === "Receita");
  const despesas = filtrados.filter(d => d.tipo === "Despesa");

  const totalReceita = receitas.reduce((a,b)=>a+Number(b.valor||0),0);
  const totalDespesa = despesas.reduce((a,b)=>a+Number(b.valor||0),0);
  const saldo = totalReceita - totalDespesa;

  const totalInvest = invest.reduce((acc,i)=>{
    if(i.tipo_movimento==="Aporte") return acc + Number(i.valor);
    if(i.tipo_movimento==="Resgate") return acc - Number(i.valor);
    return acc;
  },0);

  const patrimonio = saldo + totalInvest;

  function gerarRelatorio() {
    const receitas = filtrados.filter(d=>d.tipo==="Receita")
      .reduce((a,b)=>a+Number(b.valor||0),0);

    const despesas = filtrados.filter(d=>d.tipo==="Despesa")
      .reduce((a,b)=>a+Number(b.valor||0),0);

    setRelatorio({
      receitas,
      despesas,
      saldo: receitas - despesas,
      patrimonio
    });
  }

  const graficoRD = [
    { name: "Receitas", value: totalReceita },
    { name: "Despesas", value: totalDespesa }
  ];

  const porCategoria = Object.values(
    filtrados.reduce((acc,item)=>{
      if(!acc[item.categoria]){
        acc[item.categoria] = { name:item.categoria, value:0 };
      }
      acc[item.categoria].value += Number(item.valor);
      return acc;
    },{})
  );

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

      {/* FORM */}
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
          <option>Investimentos</option>
        </select>

        <input placeholder="Descrição" onChange={e=>setForm({...form, descricao:e.target.value})}/>
        <input type="number" placeholder="Valor" onChange={e=>setForm({...form, valor:e.target.value})}/>
        <button onClick={salvar}>Salvar</button>
      </Section>

      {/* GRÁFICO */}
      <Section title="Receitas vs Despesas">
        <PieChart width={300} height={300}>
          <Pie data={graficoRD} dataKey="value" outerRadius={100}>
            {graficoRD.map((_,i)=><Cell key={i}/>)}
          </Pie>
          <Tooltip/>
        </PieChart>
      </Section>

      {/* POR CATEGORIA */}
      <Section title="Despesas por Categoria">
        <ul>
          {porCategoria.map((c,i)=>(
            <li key={i}>{c.name} - R$ {c.value}</li>
          ))}
        </ul>
      </Section>

      {/* TRANSAÇÕES */}
      <Section title="Transações">
        <ul>
          {filtrados.map(d=>(
            <li key={d.id}>
              {d.tipo} | {d.origem} | {d.categoria} | R$ {d.valor}
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