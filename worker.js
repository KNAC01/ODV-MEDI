export default {
  async fetch(request, env) {
    const auth = request.headers.get('Authorization');
    const esperado = 'Basic ' + btoa(`${env.GATE_USER}:${env.GATE_PASS}`);
    if (auth !== esperado) {
      return new Response('Acceso restringido — contacta a tu supervisor(a) para la contraseña.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Delico ODV"' }
      });
    }
    return env.ASSETS.fetch(request);
  }
}
