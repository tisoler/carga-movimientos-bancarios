import { NextRequest, NextResponse } from "next/server";
import { initMovimiento, Movimiento } from "../../modelos/movimiento";
import { initRelacion, Relacion } from "../../modelos/relacion";
import { CodigoEvo, initCodigoEvo } from "@/app/modelos/codigoEvo";

export async function POST(request: NextRequest) {
  try {
    await initMovimiento();
    await initRelacion();
    await initCodigoEvo();
    const movimientos = await request.json();
    const relaciones = await Relacion.findAll() || [];
    const codigosEvo = await CodigoEvo.findAll() || [];
    const listaNuevasRelacions = [];

    // Actualizar/crear relaciones
    for (const mov of movimientos) {
      if (mov.codigoConceptoEvo === -1) continue;

      const relacion = relaciones.find(rel => rel.codigoConcepto === mov.codigoConcepto);
      if (relacion) {
        if (relacion.codigoConceptoEvo !== mov.codigoConceptoEvo) {
          relacion.codigoConceptoEvo = mov.codigoConceptoEvo;
          relacion.descripcionConceptoEvo = codigosEvo.find(c => c.codigoConceptoEvo === mov.codigoConceptoEvo)?.descripcionConceptoEvo || 'Sin descripción';
          await relacion.save();
        }
      } else {
        listaNuevasRelacions.push({
          codigoConcepto: mov.codigoConcepto,
          codigoConceptoEvo: mov.codigoConceptoEvo,
          descripcionConceptoEvo: codigosEvo.find(c => c.codigoConceptoEvo === mov.codigoConceptoEvo)?.descripcionConceptoEvo || 'Sin descripción'
        });
      }
    }
    if (listaNuevasRelacions.length > 0) {
      await Relacion.bulkCreate(listaNuevasRelacions);
    }

    movimientos.forEach((mov: Movimiento) => {
      if (!mov.codigoConceptoEvo || mov.codigoConceptoEvo === -1) {
        mov.codigoConceptoEvo = 35;
    }});
    await Movimiento.bulkCreate(movimientos);

    return NextResponse.json({ message: 'Movimientos actualizados exitosamente' });
  } catch (error) {
    return NextResponse.json({ message: 'Error actualizando movimientos: ' + error }, { status: 500 });
  }
}
