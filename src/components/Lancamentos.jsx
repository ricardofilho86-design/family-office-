import Section from "./Section";

export default function Lancamentos({

  form,
  setForm,
  salvar

}) {

  return (

    <Section title="Novo Lançamento">

      <div
        style={{
          display:"grid",
          gap:10
        }}
      >

        <select
          onChange={e=>
            setForm({
              ...form,
              tipo:e.target.value
            })
          }
        >

          <option>Receita</option>
          <option>Despesa</option>

        </select>

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
              tributavel:
                e.target.value === "true"
            })
          }
        >

          <option value="true">
            Tributável
          </option>

          <option value="false">
            Isento
          </option>

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
          <option>Distribuição de Lucros</option>
          <option>Dividendos</option>
          <option>Moradia</option>
          <option>Condomínio</option>
          <option>Alimentação</option>
          <option>Transporte</option>
          <option>Viagens</option>
          <option>Educação</option>
          <option>Saúde</option>
          <option>Impostos</option>
          <option>Cartão</option>
          <option>Lazer</option>
          <option>Outros</option>

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
          Salvar
        </button>

      </div>

    </Section>
  );
}