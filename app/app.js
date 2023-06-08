import './styles/theme.css';
import Resource from '../src/spawm/resource';

class Post extends Resource {
    constructor() {
        super('https://jsonplaceholder.typicode.com/posts/{id}');
    }

    async getDetail(id) {
        const response = await Promise.all([
            this.get({ id }),
            this.add({path: '/comments'}).get({ id }),
        ]);
        const detail = response[0];
        detail.comments = response[1];
        return detail;
    }
}

class Photo extends Resource {
    constructor() {
        super('https://jsonplaceholder.typicode.com/photos/{id}');
    }
}

function downloadBlob(blob, name = 'file.txt') {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
    document.body.removeChild(link);
  }

const post = new Post();
const photo = new Photo();
const file = new Resource(window.location.origin + '/response.json', {type: 'blob'});

async function showDetail(e) {
    e.preventDefault();
    document.querySelector('.overlay').style.display = 'block';
    const { id } = e.target.dataset;
    const [detail, image] = await Promise.all([
        post.getDetail(id),
        photo.get({ id })
    ]);
    const fragment = document.createDocumentFragment();
    const mainTitle = document.createElement('h2');
    const img = document.createElement('img');
    const body = document.createElement('p');
    const commentTitle = document.createElement('h2');
    commentTitle.appendChild(document.createTextNode('Comentarios'));
    img.setAttribute('src', image.thumbnailUrl);
    mainTitle.appendChild(img);
    mainTitle.appendChild(document.createTextNode('#' + detail.id + ': ' + detail.title));
    body.appendChild(document.createTextNode(detail.body));
    fragment.appendChild(mainTitle);
    fragment.appendChild(body);
    fragment.appendChild(commentTitle);
    detail.comments.forEach((comment) => {
        const article = document.createElement('article');
        const title = document.createElement('h3');
        const body = document.createElement('p');
        const who = document.createElement('span');
        title.appendChild(document.createTextNode(comment.name));
        body.appendChild(document.createTextNode(comment.body));
        who.appendChild(document.createTextNode(comment.email));
        article.appendChild(title);
        article.appendChild(body);
        article.appendChild(who);
        fragment.appendChild(article);
    });
    document.getElementById('main').replaceChildren(fragment);
    img.addEventListener('load', () => {
        document.querySelector('.return').style.display = 'block';
        document.querySelector('.overlay').style.display = 'none';
    })
}

async function showMain() {
    const footer = new Resource(window.location.origin + '/footer.html');
    const res = await Promise.all([post.get(), footer.get()]);
    const fragment = document.createDocumentFragment();
    res[0].splice(0 , 30).forEach((todo) => {
        const a = document.createElement('a');
        const li = document.createElement('li');
        const text = document.createTextNode(todo.title);
        a.setAttribute('href', '');
        a.dataset.id = todo.id;
        a.addEventListener('click', showDetail);
        a.appendChild(text);
        li.appendChild(a);
        fragment.appendChild(li);
        document.querySelector('.return').style.display = 'none';
    });
    const ul = document.createElement('ul');
    ul.appendChild(fragment);
    document.getElementById('main').replaceChildren(ul);
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('footer').innerHTML = res[1];
}

showMain();

document.querySelector('.return').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.overlay').style.display = 'block';
    showMain();
});

document.querySelector('.download').addEventListener('click', (e) => {
    e.preventDefault();
    file.get().then((blob) => downloadBlob(blob));
})
