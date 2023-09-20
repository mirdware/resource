# @spawm/resource
La idea detrás de este proyecto es generar peticiones hacia un servicio RESTful de manera natural. Los recursos son el bloque de compilación básico de creación de un servicio RESTful.

Los recursos los direccionan los URL y los métodos HTTP pueden llevar a cabo operaciones en recursos. Los recursos pueden tener diversas representaciones que utilicen distintos formatos como, por ejemplo, XML y JSON. Puede utilizar cabeceras y parámetros HTTP para pasar información adicional que sea relevante para la solicitud y la respuesta.

## Instalación
Mediante node se puede instalar con el comando `npm i @spawm/resource` o manualmente haciendo uso del [CDN](https://unpkg.com/@spawm/resource).

## Configuración

Es posible configurar la petición enviando como segundo parámetro del constructor de `Resource` los siguientes datos:

* **headers:** `[{'X-Requested-With': 'XMLHttpRequest'}]` Las cabeceras que enviara la petición, por defecto solo se envía la cabecera `X-Requested-With`, cabe recordar que una vez agregada una cabecera no es posible eliminarla.

* **redirect:** `true` si el servidor responde desde una ubicación diferente a la cual fue realizada la petición, el sistema realizara una redirección hacia esta nueva URL.

* **type:** son los tipos de respuesta que se esperan del servidor según el [responseType](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType). Si se deja vacío, la librería tratará de parsearlo según las cabeceras de respuesta del servidor.

* **cache:** Valor numérico que indica cuantos segundos dura la respuesta siendo válida antes de volver a hacer una nueva petición, solo funciona en peticiones GET. _:warning: En futuras versiones esta propiedad puede cambiar._

## Uso
Para utilizar un recurso basta con crear una instancia nueva de la clase Resource.

```javascript
import Resource from '@spawm/resource';

const user = new Resource('https://sespesoft.com/response.json');
```

Una vez creado un objeto se pueden invocar sus métodos `get`, `post`, `put`, `delete`, `patch` o `send`, este último se usa para crear una petición diferente a las mencionadas anteriormente (TRACE, OPTIONS, HEAD, CONNECT). Con lo mencionado por ahora no dista mucho del uso de [fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API) y es acá donde cabe recordar que Resource es una clase y como tal la podemos usar para aprovechar todas las características de la programación orientada a objetos; como por ejemplo la herencia.

```javascript
class AppResource extends Resource {
  constructor(path) {
    super('http://localhost:8080/' + path, {
      headers:  {
        "Authorization": "Basic YWxhZGRpbjpvcGVuc2VzYW1l"
      },
      redirect: false,
      type: "json",
      cache: 60
    });
  }
}
```

Si se cuenta con un sistema de inversión de control, es posible incluir la clase como un repositorio, con lo cual manejaremos un único objeto durante todo el ciclo de vida de la aplicación. Cabe resaltar el uso de [web workers](https://developer.mozilla.org/es/docs/Web/Guide/Performance/Usando_web_workers) para enviar peticiones, esto permite que toda petición realizada con Resource se realice en segundo plano.

## Métodos

* **get:** El método `get` solicita una representación de un recurso específico. Las peticiones que usan el método GET solo deben recuperar datos. Solo acepta como parámetro un objeto que convertirá en el query string.

* **post:** El método `post` se utiliza para enviar una entidad a un recurso en específico, causando a menudo un cambio en el estado o efectos secundarios en el servidor. Recibe dos objetos como parámetros, el primero es el que se enviara dentro del cuerpo del mensaje y el segundo opcional un query string.

* **put:** El modo `put` reemplaza todas las representaciones actuales del recurso de destino con la carga útil de la petición. Recibe dos objetos como parámetros, el primero es el que se enviara dentro del cuerpo del mensaje y el segundo opcional un query string.

* **delete:** El método `delete` borra un recurso en específico. Solo acepta como parámetro un objeto que convertirá en el query string.

* **patch:** El método `patch` es utilizado para aplicar modificaciones parciales a un recurso. Recibe dos objetos como parámetros, el primero es el que se enviara dentro del cuerpo del mensaje y el segundo opcional un query string.

* **send:** El método `send` envía cualquier tipo de petición al servidor, podemos pensar en los anteriores métodos como alias de este. Recibe tres parámetros, el primero es un string con el nombre del método por el cual se envía la petición, el segundo el objeto que se enviara en el cuerpo de la petición y el último el query string, igualmente como objeto javascript.

* **add:** El método `add` no envía peticiones al servidor, su función es crear un nuevo recurso sobreescribiendo las propiedades del recurso que llama el método; el nuevo recurso no puede volver a llamar al método add. Por ejemplo un recurso `/posts/1` podría tener una URL `/posts/1/comments` donde se listan los comentarios del post, para esta situación tendríamos el siguiente caso:

```javascript
const Resource = new Resource('/posts/{id}');
// Carga todos los recursos
resource.get().then(res => console.log(res));
//carga solo el recurso 1
resource.get({ id: 1 }).then(res => console.log(res));
//carga los comentarios del recurso 1
resource.add({path: '/comments'}).get({ id: 1 });
```

Como podemos observar el método add recibe un objeto como parámetro el cual tiene las propiedades `path`, `headers`, `redirect` y `type`; para los dos primero el nuevo recurso extenderá la propiedad, es decir, concatena la parte del path que hace falta y agregará los headers que se envían, mientras que para los últimos dos directamente reemplazará las propiedades.

## Revalidate
Capítulo aparte merece el método revalidate, el cual permite ejecutar peticiones en diferentes momentos y con diferentes estrategias, esto para tratar de mantener la información lo más actualizada posible haciendo uso de un método de invalidación de caché llamado Stale While Relavidate popularizado por [HTTP RFC 5861](https://datatracker.ietf.org/doc/html/rfc5861).

## Evitando los interceptores
Otra funcionalidad de la programación orientada a objetos que podemos usar es el polimorfismo, lo cual nos permite modificar peticiones o respuestas; tareas delegadas en la mayoría de casos a interceptores.

Como se mencionó anteriormente, send es el método principal y sobre el cual se realizan todas las peticiones al servidor y este puede ser sobreescrito por herencia como vimos en el pasado ejemplo.

```javascript
class AppResource extends Resource {
  async send(method, body, query) {
    const response = await super.send(method, body, query);
    response.at = new Date();
    return reponse;
  }
}
```