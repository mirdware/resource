# @spawm/resource
La idea detrás de este proyecto es generar peticiones hacia un servicio RESTful de manera natural. El nombre de la librería esta dado porque los recursos son el bloque de compilación básico para la creación de un servicio RESTful.

Los recursos los direccionan las URL y los métodos HTTP pueden llevar a cabo operaciones en recursos. Los recursos pueden tener diversas representaciones que utilicen distintos formatos como, por ejemplo, XML y JSON. Puede utilizar cabeceras y parámetros HTTP para pasar información adicional que sea relevante para la solicitud y la respuesta.

## Instalación
Mediante node se puede instalar con el comando `npm i @spawm/resource` o manualmente haciendo uso del [CDN](https://unpkg.com/@spawm/resource).

## Configuración

Es posible configurar la petición enviando como segundo parámetro del constructor de `Resource` los siguientes datos:

* **headers:** `{'X-Requested-With': 'XMLHttpRequest'}` Las cabeceras que enviara la petición, por defecto solo se envía la cabecera `X-Requested-With`, cabe recordar que una vez agregada una cabecera no es posible eliminarla.

* **redirect:** `true` si el servidor responde desde una ubicación diferente a la cual fue realizada la petición, el sistema realizara una redirección hacia esta nueva URL.

* **type:** son los tipos de respuesta que se esperan del servidor según el [responseType](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType). Si se deja vacío, la librería tratará de parsearlo según las cabeceras de respuesta del servidor.

* **cache:** Valor numérico que indica cuantos segundos dura la respuesta siendo válida antes de volver a hacer una nueva petición, solo funciona en peticiones GET.

* **timeout:** que representa el número de milisegundos que una solicitud puede tardar antes de ser terminada automáticamente.

* **withCredentials:** Es un valor booleano que indica si las solicitudes de control de acceso entre sitios (cross-site) deben realizarse utilizando credenciales, tales como cookies, encabezados de autenticación o certificados de cliente TLS. Establecer el valor de withCredentials no tiene ningún efecto en las solicitudes del mismo origen. También se utiliza para señalar cuándo deben ignorarse las cookies en la respuesta.

* **swr:** Objeto para configurar el swr (Stale While Revalidate) acepta las propiedades: `focus`, `reconnect`, `stale` y `onUpdate`. Esta última es la función a ejecutar cuando se refresca un dato.

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
      swr: {
        focus: 5,
        reconnect: 5,
        stale: 30,
      },
      cache: 60
    });
  }
}
```

Si se cuenta con un sistema de inversión de control, es posible incluir la clase como un repositorio, con lo cual manejaremos un único objeto durante todo el ciclo de vida de la aplicación. Cabe resaltar el uso de [web workers](https://developer.mozilla.org/es/docs/Web/Guide/Performance/Usando_web_workers) para enviar peticiones, esto permite que toda petición realizada con Resource se realice en segundo plano.

Para que se logre ejecutar en un worker se requiere worker-src blob: en la política CSP del servidor para ejecutar peticiones en un Web Worker. Sin este permiso, las peticiones se ejecutan en el hilo principal.

Si una petición falla ya sea por error de red o el servidor responde con un estado fuera del rango 1xx–3xx (estados 4xx o 5xx), la promesa se rechazará con un reject.

## Métodos

* **get:** El método `get` solicita una representación de un recurso específico. Las peticiones que usan el método GET solo deben recuperar datos. Acepta dos parámetros (`2`), el primero un objeto que se reemplazá los elementos que coincidan con los tokens {key} y el restante se convierten en el query string y el segundo options para sobreescribir la configuración inicial del constructor (opcional).

* **post:** El método `post` se utiliza para enviar una entidad a un recurso en específico, causando a menudo un cambio en el estado o efectos secundarios en el servidor. Recibe tres (`3`) objetos como parámetros, el primero es el que se enviara dentro del cuerpo del mensaje, el segundo opcional un query parameters y el tercero options para sobreescribir la configuración inicial del constructor (opcional).

* **put:** El modo `put` reemplaza todas las representaciones actuales del recurso de destino con la carga útil de la petición. Recibe tres (`3`) objetos como parámetros, el primero es el que se enviara dentro del cuerpo del mensaje, el segundo opcional un query parameter y el tercero options para sobreescribir la configuración inicial del constructor (opcional).

* **delete:** El método `delete` borra un recurso en específico. Acepta dos (`2`) parámetros como parámetros un objeto que convertirá en el query parameters y el segundo options para sobreescribir la configuración inicial del constructor (opcional).

* **patch:** El método `patch` es utilizado para aplicar modificaciones parciales a un recurso. Recibe tres (`3`) objetos como parámetros, el primero es el que se enviara dentro del cuerpo del mensaje, el segundo opcional un query string y el tercero options para sobreescribir la configuración inicial del constructor (opcional).

* **send:** El método `send` envía cualquier tipo de petición al servidor, podemos pensar en los anteriores métodos como alias de este. Recibe cuatro (`4`) parámetros, el primero es un string con el nombre del método por el cual se envía la petición, el segundo el objeto que se enviara en el cuerpo de la petición, el tercero el query parameters y el último options para sobreescribir la configuración inicial del constructor (opcional).

* **add:** El método `add` no envía peticiones al servidor, su función es crear un nuevo recurso sobreescribiendo las propiedades de quien llama el método; el nuevo recurso **no** puede volver a llamar al método add. Por ejemplo un recurso `/posts/1` podría tener una URL `/posts/1/comments` donde se listan los comentarios del post, para esta situación tendríamos el siguiente caso:

```javascript
const resource = new Resource('/posts/{id}');
// Carga todos los recursos
resource.get().then(res => console.log(res));
//carga solo el recurso 1
resource.get({ id: 1 }).then(res => console.log(res));
//carga los comentarios del recurso 1
resource.add('/comments').get({ id: 1 });
```

El método add recibe dos parámetros, el primero es la url a añadir al recurso y el segundo un objeto el cual tiene las propiedades: `headers`, `redirect`, `cache`, `swr`, `timeout` y `type`; en el caso de la primera propiedad lo que se envíe se agregara a los headers ya existentes, mientras que para el resto se sobreescribira en caso de ya existir.

## Concurrencia y Deduplicación
Para optimizar el rendimiento y evitar el uso innecesario de red, la librería implementa **Deduplicación Automática de Peticiones en Vuelo (In-flight)**.

Si se realizan múltiples llamadas idénticas (mismo método, URL, headers y cuerpo) antes de que la primera haya finalizado, la librería no disparará nuevas peticiones de red. En su lugar, todas las promesas se "acoplarán" a la primera petición y se resolverán simultáneamente cuando esta termine.

Esta característica es especialmente útil en arquitecturas de microservicios o interfaces complejas donde varios componentes necesitan los mismos datos al inicializarse.

## Revalidate
Capítulo aparte merece el método revalidate, el cual permite ejecutar peticiones en diferentes momentos y con diferentes estrategias, esto para tratar de mantener la información lo más actualizada posible haciendo uso de un método de invalidación de caché llamado Stale While Revalidate popularizado por [HTTP RFC 5861](https://datatracker.ietf.org/doc/html/rfc5861).

El sistema de revalidación (swr) recibe un objeto bien sea por constructor o mediante el método get. Si se pasa swr con un valor null se anulara cualquier configuración creada anteriormente, igual se pueden invalidar cada una de las propiedades nulificándola. Los métodos del swr son:

* **focus:** Se ejecuta al tomar el foco de la ventana, puede ser cualquier valor númerico positivo incluyendo `0`.
* **reconect:** Se ejecuta al reconectar la aplicación a intener, puede ser cualquier valor númerico positivo incluyendo `0`.
* **stale** Se ejecuta de manera continua cada X tiempo, siendo X el valor númerico que se le pasa `>0`.
* **onUpdate** Es la función que se ejecuta cuando la cache ha cambiado.

```javascript
function loadAuthors(persons) {
  const fragment = document.createDocumentFragment();
  persons.splice(0 , 30).forEach((person) => {
    const li = document.createElement('li');
    const text = document.createTextNode(person.name.first + ' ' + person.name.last);
    li.appendChild(text);
    fragment.appendChild(li);
  });
  document.getElementById('credits').replaceChildren(fragment);
}

const authors = await credits.get(null, {
  focus: 5,
  stale: 20,
  onUpdate: loadAuthors
});

loadAuthors(authors);
```

> **Nota:** Las revalidaciones automáticas (focus, reconnect, stale) también pasan por el sistema de deduplicación. Si una revalidación está en curso, cualquier petición manual al mismo recurso esperará a dicha actualización en lugar de crear ruido en la red.

## Abort
Todas las promesas devueltas por los métodos de petición cuentan con un método `.abort()`. Al invocarlo, se cancelará la petición de red en curso y se detendrán los ciclos de revalidación (stale) asociados en el Web Worker.

* **Cancelación Selectiva:** Si múltiples partes de tu aplicación están esperando la misma petición (deduplicación), invocar `.abort()` en una de ellas solo desconectará a ese observador.
* **Cancelación Física:** La petición de red solo se cancelará físicamente (y se detendrán los ciclos de revalidación en el Worker) cuando **todos** los interesados hayan llamado a `.abort()`.

```javascript
const req1 = user.get({ id: 1 });
const req2 = user.get({ id: 1 }); // Esta no genera una nueva petición de red

req1.abort(); // La petición física sigue viva porque req2 aún la necesita.
req2.abort(); // Ahora que no hay interesados, la petición se cancela en el Worker/Navegador.
```

Cada cancelación liberará la promesa con un reject que devolvera un Error indicando que la petición ha sido abortada. Cualquier petición con SWR en una SPA debe ser abortada al destruir el componente para liberar memoria.

## Evitando los interceptores
Otra funcionalidad de la programación orientada a objetos que podemos usar es el polimorfismo, lo cual nos permite modificar peticiones o respuestas; tareas delegadas en la mayoría de casos a interceptores.

Como se mencionó anteriormente, send es el método principal y sobre el cual se realizan todas las peticiones al servidor y este puede ser sobreescrito por herencia como vimos en el pasado ejemplo.

```javascript
class AppResource extends Resource {
  async send(method, body, query) {
    const response = await super.send(method, body, query);
    response.at = new Date();
    return response;
  }
}
```
