export default function Card({ title, value }) {

  return (

    <div
      style={{
        background:"#1e293b",
        padding:20,
        borderRadius:12,
        boxShadow:"0 0 10px rgba(0,0,0,0.3)"
      }}
    >

      <p>{title}</p>

      <h2>
        R$ {Number(value || 0).toFixed(2)}
      </h2>

    </div>
  );
}