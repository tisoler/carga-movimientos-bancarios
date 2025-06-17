import { CodigoEvo, initCodigoEvo } from "../../modelos/codigoEvo";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await initCodigoEvo();
    if (request.method === 'GET') {
      const codigosEvo = await CodigoEvo.findAll() || [];

      return NextResponse.json(codigosEvo);
    } else {
      return NextResponse.json({ message: 'Método no permitido' }, { status: 405 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperando códigos EVO: ' + error }, {status: 500});
  }
}
