export default function InvestimentoForm({

  formInvest,
  setFormInvest,
  salvarInvest

}) {

  return (

    <div
      style={{
        background:"#1e293b",
        padding:20,
        borderRadius:16,
        marginTop:20
      }}
    >

      <h3>Investimentos</h3>

      <input
        placeholder="Ativo"
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
        <option>Ações</option>
        <option>ETFs</option>
        <option>FIIs</option>
        <option>Stocks USA</option>
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
  );
}