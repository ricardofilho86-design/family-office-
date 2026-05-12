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
    
const [salvandoDespesa, setSalvandoDespesa] =
  useState(false);

const [salvandoInvest, setSalvandoInvest] =
  useState(false);
 /*
=====================================================
FORM RECEITA
=====================================================
*/

const [formReceita, setFormReceita] = useState({

  pessoa:"Ricardo",

  origem:"PJ",

  categoria:"Consultas",

  descricao:"",

  valor:"",

  tributavel:true

});

/*
=====================================================
FORM DESPESA
=====================================================
*/

const [formDespesa, setFormDespesa] = useState({

  pessoa:"Ricardo",

  categoria:"Moradia",

  descricao:"",

  valor:""

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

  "#ef4444",

  "#f97316",

  "#eab308",

  "#8b5cf6",

  "#ec4899",

  "#06b6d4",

  "#6366f1",

  "#f43f5e",

  "#78716c"

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

    const despesasTotais =
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
      Number(formReceita.valor);

    /*
    =======================================
    INSERE RECEITA
    =======================================
    */

    await supabase
      .from("transactions")
      .insert([{

        tipo:"Receita",

        pessoa:
          formReceita.pessoa,

        origem:
          formReceita.origem,

        categoria:
          formReceita.categoria,

        descricao:
          formReceita.descricao,

        valor:valor,

        tributavel:
          formReceita.tributavel,

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
      formReceita.origem === "PJ"
    ) {

      imposto =
        valor * 0.15;
    }

    /*
    LUCROS ISENTOS
    */

    else if(
      formReceita.origem === "Lucros"
    ) {

      imposto = 0;
    }

    /*
    PF
    */

    else if(

      formReceita.origem === "PF"

      &&

      formReceita.tributavel === true

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
    INSERE IMPOSTO
    =======================================
    */

    if(imposto > 0) {

      await supabase
        .from("transactions")
        .insert([{

          tipo:"Despesa",

          pessoa:
            formReceita.pessoa,

          origem:"Imposto",

          categoria:"Impostos",

          descricao:
            `IR automático sobre ${formReceita.origem}`,

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

    setFormReceita({

      pessoa:"Ricardo",

      origem:"PJ",

      categoria:"Consultas",

      descricao:"",

      valor:"",

      tributavel:true

    });

    await carregar();

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

  if(salvandoDespesa) {
    return;
  }

  setSalvandoDespesa(true);

  try {

    await supabase
      .from("transactions")
      .insert([{

        tipo:"Despesa",

        pessoa:formDespesa.pessoa,

        origem:"Despesa",

        categoria:formDespesa.categoria,

        descricao:formDespesa.descricao,

        valor:Number(formDespesa.valor),

        data:new Date().toISOString()

      }]);

    setFormDespesa({

      pessoa:"Ricardo",

      categoria:"Moradia",

      descricao:"",

      valor:""

    });

    await carregar();

  }

  catch(error) {

    console.log(error);

    alert("Erro ao salvar despesa");

  }

  finally {

    setSalvandoDespesa(false);

  }

}

  /*
  =====================================================
  SALVAR INVESTIMENTO
  =====================================================
  */

  async function salvarInvest() {

  if(salvandoInvest) {
    return;
  }

  setSalvandoInvest(true);

  try {

    await supabase
      .from("investimentos")
      .insert([{

        nome:formInvest.nome,

        pessoa:formInvest.pessoa,

        categoria:formInvest.categoria,

        tipo_movimento:formInvest.tipo_movimento,

        valor:Number(formInvest.valor),

        data:new Date().toISOString()

      }]);

    setFormInvest({

      nome:"",

      pessoa:"Ricardo",

      categoria:"Renda Fixa",

      tipo_movimento:"Aporte",

      valor:""

    });

    await carregar();

  }

  catch(error) {

    console.log(error);

    alert("Erro ao salvar investimento");

  }

  finally {

    setSalvandoInvest(false);

  }

}

  /*
=====================================================
EXCLUIR LANÇAMENTO
=====================================================
*/

async function excluirLancamento(
  tabela,
  id
) {

  const confirmar =
    window.confirm(
      "Deseja realmente excluir este lançamento?"
    );

  if(!confirmar) {
    return;
  }

  await supabase
    .from(tabela)
    .delete()
    .eq("id", id);

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
  value:despesasTotais
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

const graficoTipos =

  Object.values(

    filtrados.reduce((acc,item)=>{

      const chave =

        `${item.tipo}-${item.categoria}`;

      if(!acc[chave]) {

        acc[chave] = {

          categoria:
            item.categoria,

          receitas:0,

          despesas:0

        };

      }

      if(item.tipo === "Receita") {

        acc[chave].receitas +=
          Number(item.valor || 0);

      }

      if(

        item.tipo === "Despesa"

        &&

        item.categoria !== "Investimentos"

      ) {

        acc[chave].despesas +=
          Number(item.valor || 0);

      }

      return acc;

    },{})

  );

/*
=====================================================
DESPESAS POR CATEGORIA
=====================================================
*/

const despesasCategoria =
  useMemo(()=>{

    return Object.values(

      filtrados
        .filter(item=>

          item.tipo === "Despesa"

          &&

          item.categoria !== "Investimentos"

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

  },[filtrados]);

/*
=====================================================
EVOLUÇÃO PATRIMONIAL
=====================================================
*/

let acumulado = 0;

const evolucaoPatrimonial =

  [

    ...filtrados.map(item=>({

      ...item,

      origemTabela:"transactions"

    })),

    ...investimentosFiltrados.map(item=>({

      ...item,

      tipo:"Investimento",

      origemTabela:"investimentos"

    }))

  ]

  .sort(
    (a,b)=>

      new Date(a.data)
      -
      new Date(b.data)
  )

  .map(item=>{

    /*
    RECEITAS
    */

    if(item.tipo === "Receita") {

      acumulado +=
        Number(item.valor || 0);

    }

    /*
    DESPESAS
    */

    if(

      item.tipo === "Despesa"

      &&

      item.categoria !== "Investimentos"

    ) {

      acumulado -=
        Number(item.valor || 0);

    }

    /*
    INVESTIMENTOS
    */

    if(item.tipo === "Investimento") {

      if(
        item.tipo_movimento === "Aporte"
      ) {

        acumulado +=
          Number(item.valor || 0);

      }

      else {

        acumulado -=
          Number(item.valor || 0);

      }

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
  form={formReceita}
  setForm={setFormReceita}
          salvar={salvarReceita}
        />

        <DespesaForm
  form={formDespesa}
  setForm={setFormDespesa}
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

   <h2
  style={{
    color:"#ffffff"
  }}
>
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

  <div
  style={{
    background:"#1e293b",
    padding:20,
    borderRadius:20
  }}
>

  <h2
    style={{
      color:"#ffffff"
    }}
  >
    Receitas e Despesas por Categoria
  </h2>

  <ResponsiveContainer
    width="100%"
    height={350}
  >

    <BarChart
      data={graficoTipos}
    >

      <CartesianGrid
        strokeDasharray="3 3"
      />

      <XAxis
        dataKey="categoria"
      />

      <YAxis/>

      <Tooltip/>

      <Legend/>

      <Bar
        dataKey="receitas"
        fill="#22c55e"
      />

      <Bar
        dataKey="despesas"
        fill="#ef4444"
      />

    </BarChart>

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

    <h2
  style={{
    color:"#ffffff"
  }}
>
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

        <Bar
  dataKey="value"
>

  {

    graficoPessoa.map((item,i)=>(

      <Cell

        key={i}

        fill={

          item.name.includes(
            "Receitas"
          )

          ? "#22c55e"

          : "#ef4444"

        }

      />

    ))

  }

</Bar>

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

    <h2
      style={{
        color:"#ffffff"
      }}
    >
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

    <h2
  style={{
    color:"#ffffff"
  }}
>
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

{/*
=====================================================
HISTÓRICO DE LANÇAMENTOS
=====================================================
*/}

<div
  style={{
    marginTop:40,
    background:"#1e293b",
    padding:25,
    borderRadius:20,
    overflowX:"auto"
  }}
>

  <h2
    style={{
      color:"#ffffff"
    }}
  >
    Histórico de Lançamentos
  </h2>

  <table
    style={{
      width:"100%",
      color:"#ffffff",
      marginTop:20
    }}
  >

    <thead>

      <tr>

        <th>Data</th>

        <th>Tipo</th>

        <th>Pessoa</th>

        <th>Categoria</th>

        <th>Descrição</th>

        <th>Valor</th>

        <th>Ações</th>

      </tr>

    </thead>

    <tbody>

     {
  [

    ...filtrados.map(item=>({

      ...item,

      tabela:"transactions",

      tipoRegistro:"Financeiro"

    })),

    ...investimentosFiltrados.map(item=>({

      ...item,

      tabela:"investimentos",

      tipo:"Investimento",

      descricao:item.nome,

      tipoRegistro:"Investimento"

    }))

  ]

  .sort(
    (a,b)=>

      new Date(b.data)
      -
      new Date(a.data)
  )

  .map((item,i)=>(

    <tr key={`${item.tabela}-${item.id}`}>

      <td>

        {
          new Date(item.data)
            .toLocaleDateString()
        }

      </td>

      <td>
        {item.tipo}
      </td>

      <td>
        {item.pessoa}
      </td>

      <td>
        {item.categoria}
      </td>

      <td>
        {item.descricao}
      </td>

      <td>

        R$
        {" "}

        {
          Number(item.valor || 0)
            .toFixed(2)
        }

      </td>

      <td>

        <button

          onClick={()=>

            excluirLancamento(
              item.tabela,
              item.id
            )

          }

          style={{

            background:"#ef4444",

            color:"#fff",

            border:"none",

            padding:"8px 12px",

            borderRadius:8,

            cursor:"pointer"

          }}
        >

          Excluir

        </button>

      </td>

    </tr>

  ))
}

      

    </tbody>

  </table>

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

          <h2
            style={{
              color:"#ffffff"
            }}
          >
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
    .map((item,i)=>(

    <Cell

      key={i}

      fill={

        item.name === "Receitas"

        ? "#22c55e"

        : "#ef4444"

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

          <h2
            style={{
              color:"#ffffff"
            }}
            >
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

              <h3
  style={{
    color:"#ffffff"
  }}
>
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

              <h3
  style={{
    color:"#ffffff"
  }}
>
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