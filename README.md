# @spawm/resource
Libreria encargada de obtener información desde un servicio web haciendo uso de una arquitectura REST.

## Instalación
Mediante node se puede instalar con el comando `npm i @spawm/resource` o manualmente haciendo uso del [CDN](https://unpkg.com/@spawm/resource@0.1.0/lib/resource/resource.min.js).

 ## Uso
 Para utilizar un recurso basta con instanciar un objeto de la clase Resource.

```javascript
import Resource from '@spawm/resource';

const user = new Resource('response.json');
```

Ya con el objeto se pueden invocar sus métodos `get`, `post`, `put`, `delete`, `patch` o `send`, este último se usa para crear una petición personalizada (TRACE, OPTIONS, HEAD, CONNECT). Hasta el momento no existe mucha diferencia con el uso de [fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API) y es acá donde cabe recordar que Resource es una clase y como tal la podemos usar para aprovechar todas las caracteristicas de la programación orientada a objetos; como por ejemplo la herencia.

```javascript
class ServerConnection extends Resource {
  constructor(path) {
    super('http://localhost:8080/' + path);
    this.headers = {
      Authorization: "Basic YWxhZGRpbjpvcGVuc2VzYW1l"
    }
  }
}
```

A parte de sobrescribir propiedades como observamos en el ejemplo anterior mediante herencia también es posible utilizar un sistema de inversión de control para usar un solo objeto durante todo el ciclo de vida de la aplicación. Cabe resaltar el uso de [web workers](https://developer.mozilla.org/es/docs/Web/Guide/Performance/Usando_web_workers) para enviar peticiones, esto hace que toda petición realizada con Resource se realice en segundo plano.

## Métodos

* **get:** El método GET solicita una representación de un recurso específico. Las peticiones que usan el método GET sólo deben recuperar datos. Solo acepta como parametro un objeto que convertira en el query string.

* **post:** El método POST se utiliza para enviar una entidad a un recurso en específico, causando a menudo un cambio en el estado o efectos secundarios en el servidor. Recibe dos objetos como paramteros, el primero es el que se enviara dentro del cuerpo del mansaje y el segundo opcional un query string.

* **put:** El modo PUT reemplaza todas las representaciones actuales del recurso de destino con la carga útil de la petición. Recibe dos objetos como paramteros, el primero es el que se enviara dentro del cuerpo del mansaje y el segundo opcional un query string.

* **delete:** El método DELETE borra un recurso en específico. Solo acepta como parametro un objeto que convertira en el query string.

* **patch:** El método PATCH es utilizado para aplicar modificaciones parciales a un recurso. Recibe dos objetos como paramteros, el primero es el que se enviara dentro del cuerpo del mansaje y el segundo opcional un query string.

* **send:** EL método SEND es el principal y por el cual pasan todas las peticiones que se deben realizar al servidor, podemos pensar en los anteriores métodos como alias de este. Recibe tres parametros, el primero es un setring con el nombre del método por el cual se envia la petición, el segundo el objeto que se enviara en el cuerpo de la petición y el último el query string, igualmente como objeto javascript.

* **route:** El método ROUTE no envia peticiones al servidor, si no que sirve de ayuda para complementar las rutas del recurso, es comun que una recurso no se maneje siempre en la misma routa, por ejemplo `/cursos` puede traer una colección de cursos o agregar un nuevo curso, pero para modificar un curso u obtener uno en especifico se debria acceder a `/curso/spawm` con lo cual se debe complementar la url del recurso con `this.route('/spawm')`. Como podemos observar recibe un string como parametro y puede concatenar varios; al momento de realizar la petición la url del recurso regresa a su estado original.

## Evitando los interceptores
Otra funcionalidad de la programación oriendata a objetos que podemos usar es el polimorfismo, lo cual nos permite modificar peticiones o respuestas; tareas delegadas en la mayoria de casos a intecptores.

Como se meciono anteriormente send es el método principal y sobre el cual se realizan todas las peticiones al servidor y este puede ser sobre escrito por herencia como vimos en el pasado ejemplo.

```javascript
class ServerConnection extends Resource {
  async send(method, body, query) {
    const response = await super.send(method, body, query);
    response.at = new Date();
    return reponse;
  }
}
