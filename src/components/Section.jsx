export default function Section({ title, children }) {

  return (

    <div
      style={{
        marginTop:25,
        background:"#1e293b",
        padding:20,
        borderRadius:12,
        boxShadow:"0 0 10px rgba(0,0,0,0.3)"
      }}
    >

      <h3 style={{ marginBottom:20 }}>
        {title}
      </h3>

      {children}

    </div>
  );
}