import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

import DashboardCards from "./components/dashboard/DashboardCards";

import ReceitaForm from "./components/lancamentos/ReceitaForm";
import DespesaForm from "./components/lancamentos/DespesaForm";
import InvestimentoForm from "./components/investimentos/InvestimentoForm";

import ExportarPDF from "./components/relatorios/ExportarPDF";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line
} from "recharts";

export default function App() {

  /*
  =====================================================
  STATES
  =====================================================
  */

  const [dados, setDados] = useState([]);
  const [investimentosData, setInvestimentosData] =
    useState([]);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

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
    "#ec4899"
  ];

  /*
  =====================================================
  CARREGAR DADOS
  =====================================================
  */

  async function carregar() {

    const { data } =
      await supabase
        .from("transactions")
        .select("*")
        .order("data", {
          ascending:true
        });

    setDados(data || []);

    const { data: investimentos } =
      await supabase
        .from("investimentos")
        .select("*")
        .order("data", {
          ascending:true
        });

    setInvestimentosData(
      investimentos || []
    );

  }

  useEffect(()=>{

    carregar();

  },[]);

  /*
  =====================================================
  FILTRO DATA
  =====================================================
  */

  const filtrados =
    useMemo(()=>{

      return dados.filter(item=>{

        const data =
  item.data
    ?.split("T")[0];

       if(
  inicio &&
  data < inicio
) {
          return false;
        }

       if(
  fim &&
  data > fim
) {
  return false;
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
  FILTRO INVESTIMENTOS
  =====================================================
  */

  const investimentosFiltrados =
    useMemo(()=>{

      return investimentosData.filter(item=>{

        const data =
  item.data
    ?.split("T")[0];

        if(
  inicio &&
  data < inicio
) {
          return false;
        }

        if(
  fim &&
  data > fim
) {
  return false;
}

        return true;

      });

    },[
      investimentosData,
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

        item.tipo === "Receita"

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

      item.tipo === "Despesa"

      &&

      item.categoria !== "Investimentos"

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

        item.categoria === "Impostos"

      )
      .reduce(
        (acc,item)=>
          acc +
          Number(item.valor || 0),
        0
      );

  /*
  =====================================================
  DESPESAS SEM IMPOSTO
  =====================================================
  */

  const despesasSemImposto =
  filtrados
    .filter(item=>

      item.tipo === "Despesa"

      &&

      item.categoria !== "Impostos"

      &&

      item.categoria !== "Investimentos"

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
          item.tipo_movimento === "Aporte"
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

  (
    receitas
    -
    despesasSemImposto
    -
    impostos
  )
  +
  investimentos;

  /*
  =====================================================
  RELATÓRIOS
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
          item.tipo === "Receita"
        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
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
          item.tipo === "Despesa"
        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

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

          item.tipo === "Receita"

        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
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

          item.tipo === "Despesa"

        );

      })
      .reduce(
        (a,b)=>
          a + Number(b.valor || 0),
        0
      );

  /*
  =====================================================
  SALVAR RECEITA
  =====================================================
  */

  async function salvarReceita() {

    if(salvandoReceita) {
      return;
    }

    setSalvandoReceita(true);

    try {

      const valor =
        Number(form.valor);

      /*
      =======================================
      INSERE RECEITA
      =======================================
      */

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

      /*
      =======================================
      CALCULA IMPOSTO
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

          if(valor <= 2826.65) {

            imposto =
              valor * 0.075 - 182.16;

          }

          else if(valor <= 3751.05) {

            imposto =
              valor * 0.15 - 394.16;

          }

          else if(valor <= 4664.68) {

            imposto =
              valor * 0.225 - 675.49;

          }

          else {

            imposto =
              valor * 0.275 - 908.73;

          }

          /*
          REDUTOR
          */

          if(valor <= 7350) {

            imposto -=

              978.62
              -
              (
                0.133145 *
                valor
              );

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
      APENAS UM INSERT DE IMPOSTO
      =======================================
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

    catch(error) {

      console.log(error);

      alert(
        "Erro ao salvar receita"
      );

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

    carregar();

  }

  /*
  =====================================================
  SALVAR INVESTIMENTO
  =====================================================
  */

  async function salvarInvest() {

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
  /*
=====================================================
GRÁFICO POR PESSOA
=====================================================
*/

const graficoPessoa = [

  {
    name:"Ricardo Receitas",
    value:
      filtrados
        .filter(item=>

          item.tipo === "Receita"

          &&

          item.pessoa === "Ricardo"

        )
        .reduce(
          (a,b)=>
            a + Number(b.valor || 0),
          0
        )
  },

  {
    name:"Ricardo Despesas",
    value:
      filtrados
        .filter(item=>

          item.tipo === "Despesa"

          &&

          item.pessoa === "Ricardo"

        )
        .reduce(
          (a,b)=>
            a + Number(b.valor || 0),
          0
        )
  },

  {
    name:"Larissa Receitas",
    value:
      filtrados
        .filter(item=>

          item.tipo === "Receita"

          &&

          item.pessoa === "Larissa"

        )
        .reduce(
          (a,b)=>
            a + Number(b.valor || 0),
          0
        )
  },

  {
    name:"Larissa Despesas",
    value:
      filtrados
        .filter(item=>

          item.tipo === "Despesa"

          &&

          item.pessoa === "Larissa"

        )
        .reduce(
          (a,b)=>
            a + Number(b.valor || 0),
          0
        )
  }

];

/*
=====================================================
DESPESAS POR CATEGORIA
=====================================================
*/

const despesasCategoria =
  Object.values(

    filtrados
      .filter(item=>

        item.tipo === "Despesa"

      )
      .reduce((acc,item)=>{

        if(
          !acc[item.categoria]
        ) {

          acc[item.categoria] = {

            categoria:
              item.categoria,

            valor:0

          };

        }

        acc[item.categoria]
          .valor +=
            Number(item.valor || 0);

        return acc;

      },{})

  );

/*
=====================================================
EVOLUÇÃO PATRIMONIAL
=====================================================
*/

let acumulado = 0;

const evolucaoPatrimonial =

  [...filtrados]

  .sort(
    (a,b)=>

      new Date(a.data)
      -
      new Date(b.data)
  )

  .map(item=>{

    if(item.tipo === "Receita") {

      acumulado +=
        Number(item.valor || 0);

    }

    if(item.tipo === "Despesa") {

      acumulado -=
        Number(item.valor || 0);

    }

    return {

      data:
        new Date(item.data)
          .toLocaleDateString(),

      patrimonio:
        acumulado

    };

  });

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
        />

        <input
          type="date"
          value={fim}
          onChange={e=>
            setFim(
              e.target.value
            )
          }
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
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(500px,1fr))",
    gap:30,
    marginTop:40
  }}
>

  {/* EVOLUÇÃO PATRIMONIAL */}

  <div
    style={{
      background:"#1e293b",
      padding:20,
      borderRadius:20
    }}
  >

    <h2>
      Evolução Patrimonial
    </h2>

    <ResponsiveContainer
      width="100%"
      height={350}
    >

      <LineChart
        data={evolucaoPatrimonial}
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

  {/* RECEITA E DESPESA POR PESSOA */}

  <div
    style={{
      background:"#1e293b",
      padding:20,
      borderRadius:20
    }}
  >

    <h2>
      Ricardo x Larissa
    </h2>

    <ResponsiveContainer
      width="100%"
      height={350}
    >

      <BarChart
        data={graficoPessoa}
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
          fill="#3b82f6"
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

  {/* DESPESAS POR CATEGORIA */}

  <div
    style={{
      background:"#1e293b",
      padding:20,
      borderRadius:20
    }}
  >

    <h2>
      Despesas por Categoria
    </h2>

    <ResponsiveContainer
      width="100%"
      height={350}
    >

      <PieChart>

        <Pie
          data={despesasCategoria}
          dataKey="valor"
          nameKey="categoria"
          outerRadius={120}
          label
        >

          {
            despesasCategoria
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

  {/* TABELA DESPESAS */}

  <div
    style={{
      background:"#1e293b",
      padding:20,
      borderRadius:20
    }}
  >

    <h2>
      Tabela de Despesas
    </h2>

    <table
      style={{
        width:"100%",
        color:"#fff"
      }}
    >

      <thead>

        <tr>

          <th>
            Categoria
          </th>

          <th>
            Valor
          </th>

        </tr>

      </thead>

      <tbody>

        {
          despesasCategoria.map(
            (item,i)=>(

            <tr key={i}>

              <td>
                {item.categoria}
              </td>

              <td>
                R$
                {" "}
                {
                  item.valor
                    .toFixed(2)
                }
              </td>

            </tr>

          ))
        }

      </tbody>

    </table>

  </div>

</div>

      <div
        id="relatorio-pdf"
        style={{
          marginTop:40
        }}
      >

        <div
          style={{
            background:"#1e293b",
            padding:20,
            borderRadius:20
          }}
        >

          <h2>
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
            marginTop:40,
            background:"#1e293b",
            padding:25,
            borderRadius:20
          }}
        >

          <h2>
            Relatórios
          </h2>

          <div
            style={{
              display:"grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap:20
            }}
          >

            <div
              style={{
                background:"#0f172a",
                padding:20,
                borderRadius:16
              }}
            >

              <h3>
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

            </div>

            <div
              style={{
                background:"#0f172a",
                padding:20,
                borderRadius:16
              }}
            >

              <h3>
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

            </div>

          </div>

          <button

            onClick={ExportarPDF}

            style={{

              marginTop:30,

              background:"#22c55e",

              color:"#ffffff",

              border:"none",

              padding:15,

              borderRadius:12,

              fontWeight:"bold",

              cursor:"pointer"

            }}
          >

            Exportar Relatório PDF

          </button>

        </div>

      </div>

    </div>

  );

}