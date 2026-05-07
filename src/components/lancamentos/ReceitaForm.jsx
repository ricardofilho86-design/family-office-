export default function ReceitaForm({

  form,
  setForm,
  salvar

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

      <h3>Nova Receita</h3>

      <select
        onChange={e=>
          setForm({
            ...form,
            pessoa:e.target.value
          })
        }
      >

        <option>Ricardo</option>
        <option>Larissa</option>

      </select>

      <select
        onChange={e=>
          setForm({
            ...form,
            origem:e.target.value
          })
        }
      >

        <option>PJ</option>
        <option>PF</option>
        <option>Lucros</option>

      </select>

      <select
        onChange={e=>
          setForm({
            ...form,
            categoria:e.target.value
          })
        }
      >

        <option>Consultas</option>
        <option>Plantões</option>
        <option>Dividendos</option>
        <option>Pró-labore</option>
        <option>Aluguel</option>
        <option>Rendimentos</option>

      </select>

      <input
        placeholder="Descrição"
        onChange={e=>
          setForm({
            ...form,
            descricao:e.target.value
          })
        }
      />

      <input
        type="number"
        placeholder="Valor"
        onChange={e=>
          setForm({
            ...form,
            valor:e.target.value
          })
        }
      />

      <button onClick={salvar}>
        Salvar Receita
      </button>

    </div>
  );
}