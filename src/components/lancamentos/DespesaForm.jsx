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

<option>
  Moradia
</option>

<option>
  Alimentação Diária
</option>

<option>
  Saídas e Restaurantes
</option>

<option>
  Delivery
</option>

<option>
  Lanches
</option>

<option>
  Cafezinhos
</option>

<option>
  Uber
</option>

<option>
  Passagens Aéreas
</option>

<option>
  Presentes
</option>

<option>
  Terapia
</option>

<option>
  Fisioterapia
</option>

<option>
  Academia
</option>

<option>
  Streaming
</option>

<option>
  Saúde
</option>

<option>
  Educação
</option>

<option>
  Lazer
</option>

<option>
  Transporte
</option>

<option>
  Impostos
</option>

<option>
  Seguro
</option>

<option>
  Outros
</option>

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