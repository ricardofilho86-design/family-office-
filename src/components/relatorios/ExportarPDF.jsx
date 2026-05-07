import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default async function ExportarPDF() {

  const elemento =
    document.getElementById(
      "relatorio-pdf"
    );

  const canvas =
    await html2canvas(elemento);

  const imagem =
    canvas.toDataURL("image/png");

  const pdf = new jsPDF(
    "p",
    "mm",
    "a4"
  );

  pdf.addImage(
    imagem,
    "PNG",
    0,
    0,
    210,
    297
  );

  pdf.save(
    "family-office.pdf"
  );
}