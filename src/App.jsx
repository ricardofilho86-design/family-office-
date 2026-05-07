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

  /*
    ==========================================
    CARREGAR DADOS
    ==========================================
  */

  async function carregar() {

    const { data, error } =
      await supabase
        .from("transactions")
        .select("*")
        .order("data", {
          ascending:true
        });

    if(error) {
      console.log(error);
    }

    setDados(data || []);

    const { data: inv } =
      await supabase
        .from("investimentos")
        .select("*")
        .order("data", {
          ascending:true
        });

    setInvest(inv || []);
  }

  useEffect(()=>{
    carregar();
  },[]);

  /*
    ==========================================
    FILTRO DE DATA
    ==========================================
  */

  const filtrados = useMemo(()=>{

    return dados.filter(d=>{

      const data =
        new Date(d.data);

      if(
        inicio &&
        data < new Date(inicio)
      ) {
        return false;
      }

      if(fim) {

        const dataFim =
          new Date(fim);

        dataFim.setHours(
          23,
          59,
          59,
          999
        );

        if(data > dataFim) {
          return false;
        }
      }

      return true;

    });

  },[dados,inicio,fim]);

  const investimentosFiltrados =
    useMemo(()=>{

      return invest.filter(i=>{

        const data =
          new Date(i.data);

        if(
          inicio &&
          data < new Date(inicio)
        ) {
          return false;
        }

        if(fim) {

          const dataFim =
            new Date(fim);

          dataFim.setHours(
            23,
            59,
            59,
            999
          );

          if(data > dataFim) {
            return false;
          }
        }

        return true;

      });

    },[invest,inicio,fim]);

  /*
    ==========================================
    RECEITAS
    ==========================================
  */

  const receitas = filtrados
    .filter(d=>

      String(d.tipo)
        .toLowerCase()
        .trim() === "receita"

    )
    .reduce(
      (a,b)=>
        a + Number(b.valor || 0),
      0
    );

  /*
    ==========================================
    DESPESAS
    EXCLUI INVESTIMENTOS
    ==========================================
  */

  const despesas = filtrados
    .filter(d=>

      String(d.tipo)
        .toLowerCase()
        .trim() === "despesa"

      &&

      String(d.categoria)
        .toLowerCase()
        .trim() !== "investimento"

    )
    .reduce(
      (a,b)=>
        a + Number(b.valor || 0),
      0
    );

  /*
    ==========================================
    IMPOSTOS
    ==========================================
  */

  const impostos = filtrados
    .filter(d=>

      String(d.tipo)
        .toLowerCase()
        .trim() === "despesa"

      &&

      String(d.categoria)
        .toLowerCase()
        .trim() === "impostos"

    )
    .reduce(
      (a,b)=>
        a + Number(b.valor || 0),
      0
    );

  /*
    ==========================================
    INVESTIMENTOS
    ==========================================
  */

  const investimentos =
    investimentosFiltrados
      .reduce((acc,i)=>{

        if(

          String(i.tipo_movimento)
            .toLowerCase()
            .trim() === "aporte"

        ) {

          return (
            acc +
            Number(i.valor || 0)
          );
        }

        return (
          acc -
          Number(i.valor || 0)
        );

      },0);

  /*
    ==========================================
    PATRIMÔNIO
    ==========================================
  */

  const patrimonio =

    receitas
    -
    despesas
    +
    investimentos;

  /*
    ==========================================
    SALVAR RECEITA
    ==========================================
  */

  async function salvarReceita() {

    const valor =
      Number(form.valor);

    /*
      SALVA RECEITA
    */

    const { error } =
      await supabase
        .from("transactions")
        .insert([{

          tipo:"Receita",

          pessoa:form.pessoa,

          origem:form.origem,

          categoria:form.categoria,

          descricao:form.descricao,

          valor:valor,

          tributavel:
            form.tributavel,

          data:
            new Date()
              .toISOString()

        }]);

    if(error) {

      alert(
        "Erro ao salvar receita: " +
        error.message
      );

      return;
    }

    /*
      ====================================
      CÁLCULO DE IMPOSTO
      ====================================
    */

    let imposto = 0;

    /*
      PJ = 15%
    */

    if(
      form.origem === "PJ"
    ) {

      imposto =
        valor * 0.15;
    }

    /*
      LUCROS ISENTOS
    */

    else if(
      form.origem === "Lucros"
    ) {

      imposto = 0;
    }

    /*
      PF
    */

    else if(

      form.origem === "PF"

      &&

      form.tributavel === true

    ) {

      /*
        ISENÇÃO
      */

      if(valor <= 5000) {

        imposto = 0;
      }

      else {

        /*
          REGRA 2026
        */

        let aliquota = 0;
        let deducao = 0;

        if(valor <= 2826.65) {

          aliquota = 0.075;
          deducao = 182.16;

        }

        else if(
          valor <= 3751.05
        ) {

          aliquota = 0.15;
          deducao = 394.16;

        }

        else if(
          valor <= 4664.68
        ) {

          aliquota = 0.225;
          deducao = 675.49;

        }

        else {

          aliquota = 0.275;
          deducao = 908.73;

        }

        imposto =

          (
            valor *
            aliquota
          )

          -

          deducao;

        /*
          REDUTOR
        */

        if(valor <= 7350) {

          const redutor =

            978.62

            -

            (
              0.133145 *
              valor
            );

          imposto =
            imposto -
            redutor;
        }

        if(imposto < 0) {
          imposto = 0;
        }

      }

    }

    imposto =
      Number(
        imposto.toFixed(2)
      );

    /*
      ====================================
      SALVAR SOMENTE IMPOSTO
      ====================================

      NÃO CRIA DESPESA DUPLICADA

    */

    if(imposto > 0) {

      await supabase
        .from("transactions")
        .insert([{

          tipo:"Despesa",

          pessoa:form.pessoa,

          origem:"Imposto",

          categoria:"Impostos",

          descricao:
            `IR automático sobre ${form.origem}`,

          valor:imposto,

          data:
            new Date()
              .toISOString()

        }]);
    }

    /*
      RESET
    */

    setForm({

      pessoa:"Ricardo",

      origem:"PJ",

      categoria:"Consultas",

      descricao:"",

      valor:"",

      tributavel:true

    });

    carregar();
  }

  /*
    ==========================================
    SALVAR DESPESA
    ==========================================
  */

  async function salvarDespesa() {

    const { error } =
      await supabase
        .from("transactions")
        .insert([{

          tipo:"Despesa",

          pessoa:form.pessoa,

          origem:"Despesa",

          categoria:form.categoria,

          descricao:form.descricao,

          valor:
            Number(form.valor),

          data:
            new Date()
              .toISOString()

        }]);

    if(error) {

      alert(
        "Erro ao salvar despesa: " +
        error.message
      );

      return;
    }

    carregar();
  }

  /*
    ==========================================
    SALVAR INVESTIMENTO
    ==========================================
  */

  async function salvarInvest() {

    const { error } =
      await supabase
        .from("investimentos")
        .insert([{

          nome:
            formInvest.nome,

          pessoa:
            formInvest.pessoa,

          categoria:
            formInvest.categoria,

          tipo_movimento:
            formInvest.tipo_movimento,

          valor:
            Number(
              formInvest.valor
            ),

          data:
            new Date()
              .toISOString()

        }]);

    if(error) {

      alert(
        "Erro ao salvar investimento: " +
        error.message
      );

      return;
    }

    carregar();
  }

  /*
    ==========================================
    GRÁFICOS
    ==========================================
  */

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

  const despesasCategoria =
    Object.values(

      filtrados
        .filter(d=>

          String(d.tipo)
            .toLowerCase()
            .trim() === "despesa"

        )
        .reduce((acc,item)=>{

          if(
            !acc[item.categoria]
          ) {

            acc[item.categoria] = {

              name:
                item.categoria,

              value:0
            };
          }

          acc[item.categoria]
            .value +=
              Number(item.valor);

          return acc;

        },{})

    );

  /*
    ==========================================
    EVOLUÇÃO PATRIMONIAL
    ==========================================
  */

  const patrimonioEvolucao = [];

  let acumulado = 0;

  [

    ...filtrados.map(d=>({

      data:d.data,

      valor:

        String(d.tipo)
          .toLowerCase()
          .trim() === "receita"

          ?

          Number(d.valor)

          :

          -Number(d.valor)

    })),

    ...investimentosFiltrados
      .map(i=>({

        data:i.data,

        valor:

          String(i.tipo_movimento)
            .toLowerCase()
            .trim() === "aporte"

            ?

            Number(i.valor)

            :

            -Number(i.valor)

      }))

  ]

  .sort(
    (a,b)=>

      new Date(a.data)
      -
      new Date(b.data)
  )

  .forEach(item=>{

    acumulado += item.valor;

    patrimonioEvolucao.push({

      data:

        new Date(item.data)
          .toLocaleDateString(),

      patrimonio:acumulado

    });

  });

  /*
    ==========================================
    CARTEIRA XP
    ==========================================
  */

  const carteira =
    Object.values(

      investimentosFiltrados
        .reduce((acc,i)=>{

          const valor =

            String(i.tipo_movimento)
              .toLowerCase()
              .trim() === "aporte"

              ?

              Number(i.valor)

              :

              -Number(i.valor);

          if(
            !acc[i.categoria]
          ) {

            acc[i.categoria] = {

              name:i.categoria,

              value:0
            };
          }

          acc[i.categoria]
            .value += valor;

          return acc;

        },{})

    )
    .filter(i=>i.value > 0);

  const totalCarteira =

    carteira.reduce(
      (a,b)=>
        a + b.value,
      0
    );

  return (

    <div
      style={{
        background:"#0f172a",
        minHeight:"100vh",
        color:"#ffffff",
        padding:20
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

      <DashboardCards
        receitas={receitas}
        despesas={despesas}
        investimentos={investimentos}
        patrimonio={patrimonio}
      />

    </div>
  );
}