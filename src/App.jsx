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
    =========================
    CARREGAR DADOS
    =========================
  */

  async function carregar() {

    const { data, error } =
      await supabase
        .from("transactions")
        .select("*")
        .order("data", { ascending:true });

    if(error) {
      console.log(error);
    }

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

  /*
    =========================
    FILTROS DE DATA
    =========================
  */

  const filtrados = useMemo(()=>{

    return dados.filter(d=>{

      const data = new Date(d.data);

      if(inicio && data < new Date(inicio)) {
        return false;
      }

      if(fim) {

        const dataFim = new Date(fim);

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

        const data = new Date(i.data);

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
    =========================
    RECEITAS
    =========================
  */

  const receitas = filtrados
    .filter(
      d=>

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
    =========================
    DESPESAS
    =========================
  */

  const despesas = filtrados
    .filter(
      d=>

        String(d.tipo)
          .toLowerCase()
          .trim() === "despesa"
    )
    .reduce(
      (a,b)=>
        a + Number(b.valor || 0),
      0
    );

  /*
    =========================
    IMPOSTOS
    =========================
  */

  const impostos = filtrados
    .filter(
      d=>

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
    =========================
    INVESTIMENTOS
    =========================
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
    =========================
    PATRIMÔNIO
    =========================
  */

  const patrimonio =

    receitas
    -
    despesas
    +
    investimentos;

  /*
    =========================
    CONSOLIDAÇÃO
    =========================
  */

  const receitasRicardo =
    filtrados
      .filter(
        d=>

          String(d.tipo)
            .toLowerCase()
            .trim() === "receita"

          &&

          d.pessoa === "Ricardo"
      )
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  const despesasRicardo =
    filtrados
      .filter(
        d=>

          String(d.tipo)
            .toLowerCase()
            .trim() === "despesa"

          &&

          d.pessoa === "Ricardo"
      )
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  const receitasLarissa =
    filtrados
      .filter(
        d=>

          String(d.tipo)
            .toLowerCase()
            .trim() === "receita"

          &&

          d.pessoa === "Larissa"
      )
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  const despesasLarissa =
    filtrados
      .filter(
        d=>

          String(d.tipo)
            .toLowerCase()
            .trim() === "despesa"

          &&

          d.pessoa === "Larissa"
      )
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  /*
    =========================
    RELATÓRIO SEMANAL
    =========================
  */

  const receitasSemana =
    filtrados
      .filter(d=>{

        const data =
          new Date(d.data);

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

          String(d.tipo)
            .toLowerCase()
            .trim() === "receita"

          &&

          dias <= 7

        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  const despesasSemana =
    filtrados
      .filter(d=>{

        const data =
          new Date(d.data);

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

          String(d.tipo)
            .toLowerCase()
            .trim() === "despesa"

          &&

          dias <= 7

        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  /*
    =========================
    RELATÓRIO MENSAL
    =========================
  */

  const receitasMes =
    filtrados
      .filter(d=>{

        const data =
          new Date(d.data);

        const hoje =
          new Date();

        return (

          String(d.tipo)
            .toLowerCase()
            .trim() === "receita"

          &&

          data.getMonth()
            === hoje.getMonth()

          &&

          data.getFullYear()
            === hoje.getFullYear()

        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  const despesasMes =
    filtrados
      .filter(d=>{

        const data =
          new Date(d.data);

        const hoje =
          new Date();

        return (

          String(d.tipo)
            .toLowerCase()
            .trim() === "despesa"

          &&

          data.getMonth()
            === hoje.getMonth()

          &&

          data.getFullYear()
            === hoje.getFullYear()

        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  /*
    =========================
    SALVAR RECEITA
    =========================
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
      =====================
      CÁLCULO IMPOSTO
      =====================
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
      PF TRIBUTÁVEL
      NOVA REGRA 2026
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

        let aliquota = 0;
        let deducao = 0;

        /*
          TABELA
        */

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
          5K -> 7.35K
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
      SALVAR IMPOSTO
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
    =========================
    SALVAR DESPESA
    =========================
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
    =========================
    SALVAR INVESTIMENTO
    =========================
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
    =========================
    GRÁFICOS
    =========================
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
        .filter(
          d=>

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
    =========================
    EVOLUÇÃO PATRIMONIAL
    =========================
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
    =========================
    CARTEIRA XP
    =========================
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
          onChange={
            e=>
              setInicio(
                e.target.value
              )
          }
          style={{
            padding:10,
            borderRadius:8
          }}
        />

        <input
          type="date"
          value={fim}
          onChange={
            e=>
              setFim(
                e.target.value
              )
          }
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

      <div
        style={{
          marginTop:40,
          display:"grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(450px,1fr))",
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
                data={
                  graficoReceitaDespesa
                }
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >

                {
                  graficoReceitaDespesa
                    .map((_,i)=>(

                    <Cell
                      key={i}
                      fill={
                        COLORS[
                          i %
                          COLORS.length
                        ]
                      }
                    />

                  ))
                }

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

            <BarChart
              data={despesasCategoria}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

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

            <LineChart
              data={
                patrimonioEvolucao
              }
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

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

                label={({
                  name,
                  value
                })=>{

                  const percentual =

                    totalCarteira > 0

                    ?

                    (
                      (
                        value /
                        totalCarteira
                      ) * 100
                    ).toFixed(1)

                    :

                    0;

                  return
                    `${name} ${percentual}%`;
                }}
              >

                {
                  carteira.map((_,i)=>(

                    <Cell
                      key={i}
                      fill={
                        COLORS[
                          i %
                          COLORS.length
                        ]
                      }
                    />

                  ))
                }

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
          Relatórios Financeiros
        </h2>

        <div
          style={{
            display:"grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap:20,
            marginTop:20
          }}
        >

          <div
            style={{
              background:"#0f172a",
              padding:20,
              borderRadius:16
            }}
          >

            <h3 style={{ color:"#22c55e" }}>
              Relatório Semanal
            </h3>

            <p>
              Receitas:
              {" "}
              R$
              {" "}
              {
                receitasSemana
                  .toFixed(2)
              }
            </p>

            <p>
              Despesas:
              {" "}
              R$
              {" "}
              {
                despesasSemana
                  .toFixed(2)
              }
            </p>

            <p>
              Saldo:
              {" "}
              R$
              {" "}
              {
                (
                  receitasSemana -
                  despesasSemana
                ).toFixed(2)
              }
            </p>

          </div>

          <div
            style={{
              background:"#0f172a",
              padding:20,
              borderRadius:16
            }}
          >

            <h3 style={{ color:"#3b82f6" }}>
              Relatório Mensal
            </h3>

            <p>
              Receitas:
              {" "}
              R$
              {" "}
              {
                receitasMes
                  .toFixed(2)
              }
            </p>

            <p>
              Despesas:
              {" "}
              R$
              {" "}
              {
                despesasMes
                  .toFixed(2)
              }
            </p>

            <p>
              Saldo:
              {" "}
              R$
              {" "}
              {
                (
                  receitasMes -
                  despesasMes
                ).toFixed(2)
              }
            </p>

          </div>

          <div
            style={{
              background:"#0f172a",
              padding:20,
              borderRadius:16
            }}
          >

            <h3 style={{ color:"#f59e0b" }}>
              Ricardo
            </h3>

            <p>
              Receitas:
              {" "}
              R$
              {" "}
              {
                receitasRicardo
                  .toFixed(2)
              }
            </p>

            <p>
              Despesas:
              {" "}
              R$
              {" "}
              {
                despesasRicardo
                  .toFixed(2)
              }
            </p>

            <p>
              Saldo:
              {" "}
              R$
              {" "}
              {
                (
                  receitasRicardo -
                  despesasRicardo
                ).toFixed(2)
              }
            </p>

          </div>

          <div
            style={{
              background:"#0f172a",
              padding:20,
              borderRadius:16
            }}
          >

            <h3 style={{ color:"#8b5cf6" }}>
              Larissa
            </h3>

            <p>
              Receitas:
              {" "}
              R$
              {" "}
              {
                receitasLarissa
                  .toFixed(2)
              }
            </p>

            <p>
              Despesas:
              {" "}
              R$
              {" "}
              {
                despesasLarissa
                  .toFixed(2)
              }
            </p>

            <p>
              Saldo:
              {" "}
              R$
              {" "}
              {
                (
                  receitasLarissa -
                  despesasLarissa
                ).toFixed(2)
              }
            </p>

          </div>

          <div
            style={{
              background:"#0f172a",
              padding:20,
              borderRadius:16
            }}
          >

            <h3 style={{ color:"#06b6d4" }}>
              Consolidado Geral
            </h3>

            <p>
              Receitas:
              {" "}
              R$
              {" "}
              {
                receitas
                  .toFixed(2)
              }
            </p>

            <p>
              Despesas:
              {" "}
              R$
              {" "}
              {
                despesas
                  .toFixed(2)
              }
            </p>

            <p>
              Impostos:
              {" "}
              R$
              {" "}
              {
                impostos
                  .toFixed(2)
              }
            </p>

            <p>
              Investimentos:
              {" "}
              R$
              {" "}
              {
                investimentos
                  .toFixed(2)
              }
            </p>

            <p>
              Patrimônio:
              {" "}
              R$
              {" "}
              {
                patrimonio
                  .toFixed(2)
              }
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}