import { initRelacion, Relacion } from "../../modelos/relacion";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await initRelacion();
    if (request.method === 'GET') {
      const relaciones = await Relacion.findAll() || [];

      return NextResponse.json(relaciones);
    } else {
      return NextResponse.json({ message: 'Método no permitido' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperando relaciones de códigos: ' + error }, {status: 500});
  }
}
