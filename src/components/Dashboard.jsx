import Card from "./Card";

export default function Dashboard({

  receitas,
  despesas,
  investimentos,
  patrimonio

}) {

  return (

    <div
      style={{
        display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:15
      }}
    >

      <Card
        title="Receitas"
        value={receitas}
      />

      <Card
        title="Despesas"
        value={despesas}
      />

      <Card
        title="Investimentos"
        value={investimentos}
      />

      <Card
        title="Patrimônio"
        value={patrimonio}
      />

    </div>
  );
}