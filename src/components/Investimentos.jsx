import Section from "./Section";

export default function Investimentos({

  formInvest,
  setFormInvest,
  salvarInvest,
  invest

}) {

  return (

    <Section title="Investimentos">

      <div
        style={{
          display:"grid",
          gap:10
        }}
      >

        <input
          placeholder="Nome do ativo"
          onChange={e=>
            setFormInvest({
              ...formInvest,
              nome:e.target.value
            })
          }
        />

        <select
          onChange={e=>
            setFormInvest({
              ...formInvest,
              pessoa:e.target.value
            })
          }
        >

          <option>Ricardo</option>
          <option>Larissa</option>

        </select>

        <select
          onChange={e=>
            setFormInvest({
              ...formInvest,
              categoria:e.target.value
            })
          }
        >

          <option>Renda Fixa</option>
          <option>Tesouro</option>
          <option>CDB</option>
          <option>Ações Brasil</option>
          <option>Stocks USA</option>
          <option>ETFs</option>
          <option>FIIs</option>
          <option>Fundos</option>
          <option>Previdência</option>
          <option>Cripto</option>

        </select>

        <select
          onChange={e=>
            setFormInvest({
              ...formInvest,
              tipo_movimento:e.target.value
            })
          }
        >

          <option>Aporte</option>
          <option>Resgate</option>

        </select>

        <input
          type="number"
          placeholder="Valor"
          onChange={e=>
            setFormInvest({
              ...formInvest,
              valor:e.target.value
            })
          }
        />

        <button onClick={salvarInvest}>
          Salvar Investimento
        </button>

      </div>

      <div style={{ marginTop:20 }}>

        {invest.map(i=>(

          <div
            key={i.id}
            style={{
              background:"#0f172a",
              padding:10,
              marginBottom:10,
              borderRadius:8
            }}
          >

            <strong>{i.nome}</strong>

            <p>{i.categoria}</p>

            <p>{i.tipo_movimento}</p>

            <p>
              R$ {Number(i.valor).toFixed(2)}
            </p>

          </div>
        ))}

      </div>

    </Section>
  );
}