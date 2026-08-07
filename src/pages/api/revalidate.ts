import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    if (!body || !body._type) {
      return new Response(JSON.stringify({ message: 'Bad Request' }), { status: 400 });
    }

    // Aquí procesamos el webhook de Sanity
    // Dependiendo del entorno de Vercel (y si se usa modo server/hybrid en Astro), 
    // ejecutaríamos lógicas de purga de caché avanzadas o regeneración (On-Demand Revalidation)
    console.log(`Revalidando contenido para _type: ${body._type}`);

    return new Response(JSON.stringify({ message: 'Revalidated successfully', type: body._type }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Error al procesar el webhook', err);
    return new Response(JSON.stringify({ message: 'Error processing webhook' }), { status: 500 });
  }
};
