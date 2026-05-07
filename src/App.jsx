import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import DashboardCards from "./components/dashboard/DashboardCards";

import ReceitaForm from "./components/lancamentos/ReceitaForm";
import DespesaForm from "./components/lancamentos/DespesaForm";

import InvestimentoForm from "./components/investimentos/InvestimentoForm";

export default function App() {

  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);

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

  async function carregar() {

    const { data } =
      await supabase
        .from("transactions")
        .select("*");

    setDados(data || []);

    const { data: inv } =
      await supabase
        .from("investimentos")
        .select("*");

    setInvest(inv || []);
  }

  useEffect(()=>{
    carregar();
  },[]);

  const receitas =
    dados
      .filter(d=>d.tipo==="Receita")
      .reduce((a,b)=>a+Number(b.valor),0);

  const despesas =
    dados
      .filter(d=>d.tipo==="Despesa")
      .reduce((a,b)=>a+Number(b.valor),0);

  const investimentos =
    invest.reduce((acc,i)=>{

      if(i.tipo_movimento==="Aporte") {
        return acc + Number(i.valor);
      }

      return acc - Number(i.valor);

    },0);

  const patrimonio =
    receitas -
    despesas +
    investimentos;

  async function salvarReceita() {

    const valor = Number(form.valor);

    await supabase
      .from("transactions")
      .insert([{

        ...form,

        tipo:"Receita",

        valor,

        data:new Date()

      }]);

    let imposto = 0;

    if(form.origem==="PJ") {
      imposto = valor * 0.15;
    }

    if(
      form.origem==="PF" &&
      form.tributavel===true &&
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

          descricao:"Imposto automático",

          valor:imposto,

          data:new Date()

        }]);
    }

    carregar();
  }

  async function salvarDespesa() {

    await supabase
      .from("transactions")
      .insert([{

        ...form,

        tipo:"Despesa",

        valor:Number(form.valor),

        data:new Date()

      }]);

    carregar();
  }

  async function salvarInvest() {

    await supabase
      .from("investimentos")
      .insert([{

        ...formInvest,

        valor:Number(formInvest.valor),

        data:new Date()

      }]);

    carregar();
  }

  return (

    <div
      style={{
        background:"#0f172a",
        minHeight:"100vh",
        color:"#fff",
        padding:20
      }}
    >

      <h1>
        Family Office Enterprise
      </h1>

      <DashboardCards

        receitas={receitas}

        despesas={despesas}

        investimentos={investimentos}

        patrimonio={patrimonio}

      />

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
  );
}