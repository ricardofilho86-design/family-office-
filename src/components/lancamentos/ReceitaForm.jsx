export default function ReceitaForm({

  form,
  setForm,
  salvar

}) {

  return (

    <form

      onSubmit={(e)=>{

        e.preventDefault();

        salvar();

      }}

      style={{

        background:"#1e293b",

        padding:20,

        borderRadius:20,

        display:"flex",

        flexDirection:"column",

        gap:12

      }}
    >

      <h2
        style={{
          color:"#ffffff"
        }}
      >
        Receita
      </h2>

      <select
        value={form.pessoa}
        onChange={e=>
          setForm({

            ...form,

            pessoa:e.target.value

          })
        }
      >

        <option>
          Ricardo
        </option>

        <option>
          Larissa
        </option>

      </select>

      <select
        value={form.origem}
        onChange={e=>
          setForm({

            ...form,

            origem:e.target.value

          })
        }
      >

        <option>
          PJ
        </option>

        <option>
          PF
        </option>

        <option>
          Lucros
        </option>

      </select>

      <select
        value={form.categoria}
        onChange={e=>
          setForm({

            ...form,

            categoria:e.target.value

          })
        }
      >

        <option>
  Consultas
</option>

<option>
  Cirurgia
</option>

<option>
  Plantão
</option>

<option>
  Atendimentos
</option>

<option>
  Exames
</option>

      </select>

      <input
        placeholder="Descrição"
        value={form.descricao}
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

      {

        form.origem === "PF"

        &&

        <label
          style={{
            color:"#ffffff"
          }}
        >

          <input

            type="checkbox"

            checked={form.tributavel}

            onChange={e=>
              setForm({

                ...form,

                tributavel:e.target.checked

              })
            }

          />

          Tributável

        </label>

      }

      <button

        type="submit"

        style={{

          background:"#22c55e",

          color:"#ffffff",

          border:"none",

          padding:12,

          borderRadius:12,

          fontWeight:"bold",

          cursor:"pointer"

        }}
      >

        Salvar Receita

      </button>

    </form>

  );

}