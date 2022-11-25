import './styles/theme.css';
import Resource from '../src/spawm/resource';

class Placeholder extends Resource {
    constructor() {
        super('https://jsonplaceholder.typicode.com/todos');
    }

    getDetail(id) {
        this.path = '/{id}';
        return this.get({ id });
    }
}

const jsonPlaceholder = new Placeholder();

async function showDetail(e) {
    e.preventDefault();
    const { id } = e.target.dataset;
    const fragment = document.createDocumentFragment();
    const detail = await jsonPlaceholder.getDetail(id);
    const idNode = document.createElement('li');
    const titleNode = document.createElement('li');
    const doneNode = document.createElement('li');
    idNode.appendChild(document.createTextNode(detail.id));
    titleNode.appendChild(document.createTextNode(detail.title));
    doneNode.appendChild(document.createTextNode(detail.completed ? 'yes' : 'no'));
    console.log(detail);
    fragment.appendChild(idNode);
    fragment.appendChild(titleNode);
    fragment.appendChild(doneNode);
    document.getElementById('main').replaceChildren(fragment);
    document.querySelector('.return').style.display = 'inline';
}

async function showMain() {
    const res = await jsonPlaceholder.get();
    const fragment = document.createDocumentFragment();
    res.splice(0 , 10).forEach((todo) => {
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
    document.getElementById('main').replaceChildren(fragment);
}

showMain();

document.querySelector('.return').addEventListener('click', (e) => {
    e.preventDefault();
    showMain();
});
