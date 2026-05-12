export default function DespesaForm({

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

      <h3>Nova Despesa</h3>

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
            categoria:e.target.value
          })
        }
      >

        <option>Moradia</option>
        <option>Alimentação</option>
        <option>Transporte</option>
        <option>Viagens</option>
        <option>Saúde</option>
        <option>Educação</option>
        <option>Impostos</option>
        <option>Cartão</option>
        <option>Lazer</option>

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
  value={form.valor}
  onChange={e=>
    setForm({
      ...form,
      valor:e.target.value
    })
  }
/>

      <button onClick={salvar}>
        Salvar Despesa
      </button>

    </div>
  );
}