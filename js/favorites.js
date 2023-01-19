import { GithubUser } from "./githubuser.js";

// classe que vai conter a lógica dos dados
//como os dados serão estruturados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    console.log(this.entries);
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username);

      if (userExists) {
        throw new Error('Usuário já favoritado!')
      }

      const githubUser = await GithubUser.search(username);

      if (githubUser.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [githubUser, ...this.entries];
      this.update();
      this.save();

    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry =>
      entry.login !== user.login);

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody');

    this.update();
    this.onAdd();
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button');
    const addFav = this.root.querySelector('.search .device');

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');

      this.add(value);
    }
    
    addFav.onclick = () => {
      const { value } = this.root.querySelector('.search input');

      this.add(value);
    }
  }

  verifyFavorites() {
    if (this.entries.length > 0) {
      document.querySelector('.zeroFav').classList.add('hide');
      document.querySelector('.zeroFav').classList.remove('noFav');
    }
    else {
      document.querySelector('.zeroFav').classList.remove('hide');
      document.querySelector('.zeroFav').classList.add('noFav');
      console.log('igual a zero');
    }
  }

  update() {
    this.verifyFavorites();
    this.removeAllTr();

    this.entries.forEach(user => {
      const row = this.createRow();

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${user.name}`;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      row.querySelector('.user p').textContent = user.name;
      row.querySelector('.user span').textContent = user.login;
      row.querySelector('.repositories ').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar este Favorito?');
        if (isOk) {
          this.delete(user);
        }
      }

      this.tbody.append(row);
    });

  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/manoela-moyses.png" alt="imagem de usuário">
        <a href="https://github.com/manoela-moyses" target="_blank">
          <p>Manoela Moyses</p>
          <span>/manoela-moyses</span>
        </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        9589
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove();
    });

    this.root.querySelector('.search input').value = ''
  }

}