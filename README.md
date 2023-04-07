# @spawm/resource
Libreria encargada de obtener información desde un servicio web haciendo uso de una arquitectura REST.

## Instalación
Mediante node se puede instalar con el comando `npm i @spawm/resource` o manualmente haciendo uso del [CDN](https://unpkg.com/@spawm/resource).

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

* **get:** El método `get` solicita una representación de un recurso específico. Las peticiones que usan el método GET sólo deben recuperar datos. Solo acepta como parametro un objeto que convertira en el query string.

* **post:** El método `post` se utiliza para enviar una entidad a un recurso en específico, causando a menudo un cambio en el estado o efectos secundarios en el servidor. Recibe dos objetos como paramteros, el primero es el que se enviara dentro del cuerpo del mansaje y el segundo opcional un query string.

* **put:** El modo `put` reemplaza todas las representaciones actuales del recurso de destino con la carga útil de la petición. Recibe dos objetos como paramteros, el primero es el que se enviara dentro del cuerpo del mansaje y el segundo opcional un query string.

* **delete:** El método `delete` borra un recurso en específico. Solo acepta como parametro un objeto que convertira en el query string.

* **patch:** El método `patch` es utilizado para aplicar modificaciones parciales a un recurso. Recibe dos objetos como paramteros, el primero es el que se enviara dentro del cuerpo del mansaje y el segundo opcional un query string.

* **send:** El método `send` es el principal y por el cual pasan todas las peticiones que se deben realizar al servidor, podemos pensar en los anteriores métodos como alias de este. Recibe tres parametros, el primero es un setring con el nombre del método por el cual se envia la petición, el segundo el objeto que se enviara en el cuerpo de la petición y el último el query string, igualmente como objeto javascript.

* **addPath:** El método `addPath` no envía peticiones al servidor, si no que sirve de ayuda para complementar la ruta del recurso; por ejemplo cuando un recurso `/posts/1` que maneja relaciones podría tener una url `/posts/1/comments`, para la situcación anterior tendriamos el siguiente caso:

```javascript
const Resource = new Resource('/posts/{id}');
// Carga todos los recursos
resource.get().then(res => console.log(res));
//carga solo el recurso 1
resource.get({ id: 1 }).then(res => console.log(res));
//carga los comentarios del recurso 1
resource.addPath('/comments').get({ id: 1 });
```

Como podemos observar el método addPath recibe un string como parametro el cual sera concatenado a la url original del recurso y devuelve la referencia al mismo recurso; al momento de realizar la petición la url del recurso regresa a su estado original.

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
