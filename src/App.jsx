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

  /*
  =====================================================
  STATES
  =====================================================
  */

  const [dados, setDados] = useState([]);
  const [invest, setInvest] = useState([]);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  /*
  =====================================================
  PROTEÇÃO ANTI DUPLO CLIQUE
  =====================================================
  */

  const [salvandoReceita, setSalvandoReceita] =
    useState(false);

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

  /*
  =====================================================
  CORES
  =====================================================
  */

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#14b8a6",
    "#eab308",
    "#ec4899",
    "#84cc16"
  ];

  /*
  =====================================================
  CARREGAR DADOS
  =====================================================
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
  =====================================================
  FILTROS DE DATA
  =====================================================
  */

  const filtrados = useMemo(()=>{

    return dados.filter(item=>{

      const data =
        new Date(item.data);

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

  },[
    dados,
    inicio,
    fim
  ]);

  /*
  =====================================================
  INVESTIMENTOS FILTRADOS
  =====================================================
  */

  const investimentosFiltrados =
    useMemo(()=>{

      return invest.filter(item=>{

        const data =
          new Date(item.data);

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

    },[
      invest,
      inicio,
      fim
    ]);

  /*
  =====================================================
  RECEITAS
  =====================================================
  */

  const receitas =
    filtrados
      .filter(item=>

        String(item.tipo)
          .toLowerCase()
          .trim() === "receita"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  DESPESAS
  =====================================================
  */

  const despesas =
    filtrados
      .filter(item=>

        String(item.tipo)
          .toLowerCase()
          .trim() === "despesa"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  IMPOSTOS
  =====================================================
  */

  const impostos =
    filtrados
      .filter(item=>

        String(item.categoria)
          .toLowerCase()
          .trim() === "impostos"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  INVESTIMENTOS
  =====================================================
  */

  const investimentos =
    investimentosFiltrados
      .reduce((acc,item)=>{

        if(

          String(item.tipo_movimento)
            .toLowerCase()
            .trim() === "aporte"

        ) {

          return (
            acc +
            Number(item.valor || 0)
          );
        }

        return (
          acc -
          Number(item.valor || 0)
        );

      },0);

  /*
  =====================================================
  PATRIMÔNIO
  =====================================================
  */

  const patrimonio =

    receitas
    -
    despesas
    +
    investimentos;

  /*
  =====================================================
  CONSOLIDAÇÃO
  =====================================================
  */

  const receitasRicardo =
    filtrados
      .filter(item=>

        item.pessoa === "Ricardo"

        &&

        String(item.tipo)
          .toLowerCase()
          .trim() === "receita"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  const despesasRicardo =
    filtrados
      .filter(item=>

        item.pessoa === "Ricardo"

        &&

        String(item.tipo)
          .toLowerCase()
          .trim() === "despesa"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  const receitasLarissa =
    filtrados
      .filter(item=>

        item.pessoa === "Larissa"

        &&

        String(item.tipo)
          .toLowerCase()
          .trim() === "receita"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  const despesasLarissa =
    filtrados
      .filter(item=>

        item.pessoa === "Larissa"

        &&

        String(item.tipo)
          .toLowerCase()
          .trim() === "despesa"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  RELATÓRIO SEMANAL
  =====================================================
  */

  const receitasSemana =
    filtrados
      .filter(item=>{

        const data =
          new Date(item.data);

        const hoje =
          new Date();

        const dias =
          (
            hoje - data
          ) /
          (
            1000 *
            60 *
            60 *
            24
          );

        return (

          dias <= 7

          &&

          String(item.tipo)
            .toLowerCase()
            .trim() === "receita"

        );

      })
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  const despesasSemana =
    filtrados
      .filter(item=>{

        const data =
          new Date(item.data);

        const hoje =
          new Date();

        const dias =
          (
            hoje - data
          ) /
          (
            1000 *
            60 *
            60 *
            24
          );

        return (

          dias <= 7

          &&

          String(item.tipo)
            .toLowerCase()
            .trim() === "despesa"

        );

      })
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  RELATÓRIO MENSAL
  =====================================================
  */

  const receitasMes =
    filtrados
      .filter(item=>{

        const data =
          new Date(item.data);

        const hoje =
          new Date();

        return (

          data.getMonth()
            === hoje.getMonth()

          &&

          data.getFullYear()
            === hoje.getFullYear()

          &&

          String(item.tipo)
            .toLowerCase()
            .trim() === "receita"

        );

      })
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  const despesasMes =
    filtrados
      .filter(item=>{

        const data =
          new Date(item.data);

        const hoje =
          new Date();

        return (

          data.getMonth()
            === hoje.getMonth()

          &&

          data.getFullYear()
            === hoje.getFullYear()

          &&

          String(item.tipo)
            .toLowerCase()
            .trim() === "despesa"

        );

      })
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  SALVAR RECEITA
  =====================================================
  */

  async function salvarReceita() {

    /*
    =========================================
    ANTI DUPLO CLIQUE
    =========================================
    */

    if(salvandoReceita) {
      return;
    }

    setSalvandoReceita(true);

    try {

      const valor =
        Number(form.valor);

      /*
      =======================================
      SALVA RECEITA
      =======================================
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
      =======================================
      CÁLCULO DE IMPOSTO
      =======================================
      */

      let imposto = 0;

      /*
      PJ
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

        if(valor <= 5000) {

          imposto = 0;
        }

        else {

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
      =======================================
      EVITA DUPLICAÇÃO DE IMPOSTO
      =======================================
      */

      if(imposto > 0) {

        const { data: existentes } =
          await supabase
            .from("transactions")
            .select("*")
            .eq(
              "descricao",
              `IR automático sobre ${form.origem}`
            )
            .eq(
              "valor",
              imposto
            )
            .gte(
              "data",
              new Date(
                Date.now() - 10000
              ).toISOString()
            );

        if(
          !existentes ||
          existentes.length === 0
        ) {

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

      }

      /*
      =======================================
      RESET
      =======================================
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

    finally {

      setSalvandoReceita(false);

    }

  }

  /*
  =====================================================
  SALVAR DESPESA
  =====================================================
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
  =====================================================
  SALVAR INVESTIMENTO
  =====================================================
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
  =====================================================
  GRÁFICOS
  =====================================================
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
        .filter(item=>

          String(item.tipo)
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
  =====================================================
  EVOLUÇÃO PATRIMONIAL
  =====================================================
  */

  const patrimonioEvolucao = [];

  let acumulado = 0;

  [

    ...filtrados.map(item=>({

      data:item.data,

      valor:

        String(item.tipo)
          .toLowerCase()
          .trim() === "receita"

          ?

          Number(item.valor)

          :

          -Number(item.valor)

    })),

    ...investimentosFiltrados
      .map(item=>({

        data:item.data,

        valor:

          String(item.tipo_movimento)
            .toLowerCase()
            .trim() === "aporte"

            ?

            Number(item.valor)

            :

            -Number(item.valor)

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
  =====================================================
  CARTEIRA XP
  =====================================================
  */

  const carteira =
    Object.values(

      investimentosFiltrados
        .reduce((acc,item)=>{

          const valor =

            String(item.tipo_movimento)
              .toLowerCase()
              .trim() === "aporte"

              ?

              Number(item.valor)

              :

              -Number(item.valor);

          if(
            !acc[item.categoria]
          ) {

            acc[item.categoria] = {

              name:item.categoria,

              value:0

            };
          }

          acc[item.categoria]
            .value += valor;

          return acc;

        },{})

    )
    .filter(item=>item.value > 0);

  const totalCarteira =

    carteira.reduce(
      (acc,item)=>
        acc + item.value,
      0
    );

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
          marginBottom:30
        }}
      >
        Family Office Enterprise
      </h1>

      <div
        style={{
          display:"flex",
          gap:10,
          marginBottom:20,
          flexWrap:"wrap"
        }}
      >

        <input
          type="date"
          value={inicio}
          onChange={e=>
            setInicio(
              e.target.value
            )
          }
          style={{
            padding:10,
            borderRadius:10,
            border:"none"
          }}
        />

        <input
          type="date"
          value={fim}
          onChange={e=>
            setFim(
              e.target.value
            )
          }
          style={{
            padding:10,
            borderRadius:10,
            border:"none"
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
          gridTemplateColumns:
            "repeat(auto-fit,minmax(350px,1fr))",
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

    </div>
  );
}