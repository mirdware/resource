# @spawm/resource
 Libreria encargada de obtener información desde un servicio web haciendo uso de RESTful.

## Instalación
Mediante node se puede instalar con el comando `npm i @spawm/resource` o haciendo uso del [CDN](https://unpkg.com/@spawm/resource@0.1.0/lib/resource/resource.min.js).

 ## Uso
 Para utilizar un recurso basta con instanciar un objeto de la clase Resource.

```javascript
import Resource from '@spawm/resource';

const user = new Resource('response.json');
```

Ya con el objeto se pueden invocar sus métodos `get`, `post`, `put`, `delete` o `request`, este último se usa para crear una petición personalizada (PATCH, OPTIONS, HEAD). Hasta acá no difiere mucho de lo que se puede hacer con la [API fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API) pero también es posible extender la clase para realizar peticiones más personalizadas.

```javascript
import Resource from '@spawm/resource';

class ServerConnection extends Resource {
  constructor(path) {
    super('http://localhost:8080/' + path);
    this.headers = {
      Authorization: "Basic YWxhZGRpbjpvcGVuc2VzYW1l"
    }
  }
}
```

A parte de sobrescribir propiedades como observamos en el ejemplo anterior también es posible utilizar el sistema de inversión de control para usar un solo objeto durante todo el ciclo de vida de la aplicación, solo basta con proveer la clase y scalar se encarga del resto. Cabe resaltar el uso de [web workers](https://developer.mozilla.org/es/docs/Web/Guide/Performance/Usando_web_workers) para enviar peticiones, esto hace que toda petición realizada con Resource se realice en segundo plano.
