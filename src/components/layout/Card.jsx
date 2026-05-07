export default function Card({ title, value }) {

  return (

    <div
      style={{
        background:"#1e293b",
        borderRadius:16,
        padding:20,
        boxShadow:"0 0 15px rgba(0,0,0,0.3)"
      }}
    >

      <p style={{ opacity:0.7 }}>
        {title}
      </p>

      <h2>
        R$ {Number(value || 0).toFixed(2)}
      </h2>

    </div>
  );
}