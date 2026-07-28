const API_URL = "https://forkify-api.jonas.io/api/v2/recipes/";
const PER_PAGE = 5;
// Helper

function timeout(sec) {
  return new Promise(function (_, reject) {
    setTimeout(
      () => reject(new Error(`Request Took Look Tong for ${sec}`)),
      sec * 1000,
    );
  });
}

const getJSON = async function (url) {
  try {
    const response = await Promise.race([fetch(url), timeout(1)]);
    const data = await response.json();
    if (!response.ok) throw new Error`${data.message} and ${response.status}`();
    return data;
  } catch (err) {
    throw err;
  }
};

// Model -------------
const state = {
  recipe: {},
  search: {
    searchItems: [],
    pageNumber: 1,
  },
};

const getRecipe = async function (id) {
  try {
    // const response = await fetch(`${API_URL}/${id}`);
    // const data = await response.json();
    // if (!response.ok) throw new Error`${data.message} and ${response.status}`();
    const data = await getJSON(`${API_URL}${id}`);
    const { recipe } = data.data;
    state.recipe = recipe;
  } catch (error) {
    throw error;
  }
};

const searchRecipe = async function (query) {
  try {
    const response = await getJSON(`${API_URL}?search=${query}`);
    state.search.searchItems = response?.data?.recipes;
  } catch (err) {
    throw err;
  }
};

function changePageItem(page = state.search.pageNumber) {
  state.search.pageNumber = page;
  const start = (page - 1) * PER_PAGE;
  const end = page * PER_PAGE;
  return state.search.searchItems.slice(start, end);
}

searchRecipe("pizza");

// window.addEventListener('hashchange', loadData);
// window.addEventListener('load', loadData);

// view -------------
class ParentView {
  _data;
  _errormsg = "No Result Found";
  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.generateErrorMessage();
    this._data = data;
    const markup = this._generateView();
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  generateLoading() {
    const markup = "<h1>Loading...</h1>";
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  generateErrorMessage(message = this._errormsg) {
    const markup = `<div class="error-msg">
    <h1 style="color:red">${message}</h1>
    </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  _generateItem(item) {
    return `<li>${item.quantity ?? ""} ${item.unit ?? ""} ${item.description}</li>`;
  }

  _clear() {
    this._parentElement.innerHTML = "";
  }
}

class RecipeView extends ParentView {
  _parentElement = document.querySelector(".recipeContainer");
  _data;
  _errormsg = "No Recipe Found.Please try again!";

  generateRender(handler) {
    ["hashchange", "load"].forEach((ev) =>
      window.addEventListener(ev, handler),
    );
  }

  _generateView() {
    return `<div class="recipe-section">
            <figure>
              <img src=${this._data.image_url} alt="" />
              <h1>${this._data.title}</h1>
            </figure>
            <div class="intro-section">
              <p>${this._data.cooking_time} Min</p>
              <div class="serve">
                <p>${this._data.servings} Serving</p>
              </div>
              <button class="book">Bookmark</button>
            </div>
            <div class="ingredients">
              <h3>Recipe ingredients</h3>
              <ul>
              ${this._data.ingredients.map(this._generateItem).join("")}
              </ul>
            </div>
            <div class="howto">
              <h3>How to cook it</h3>
              <p>
                This recipe was carefully designed and tested by What's Gaby
                Cooking. Please check out directions at their website.
              </p>
              <button>Directions</button>
            </div>
          </div>`;
  }
}

class SearchView {
  _parentElement = document.querySelector(".searchForm");

  getSearchValue() {
    const query = this._parentElement.querySelector(".search-recipe").value;
    this._clearValue();
    return query;
  }

  _clearValue() {
    this._parentElement.querySelector("input").value = "";
  }

  loadDataSearch(handler) {
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault();
      handler();
    });
  }
}

class ResultView extends ParentView {
  _parentElement = document.querySelector(".result-list");

  _generateView() {
    return `${this._data.map(this._generateItem).join("")}`;
  }

  _generateItem(item) {
    return `<li><a href=${"#" + item.id}> ${item.title}</li>`;
  }
}

class PaginationView extends ParentView {
  _parentElement = document.querySelector(".pagination");

  navigatepage(hanlder) {
    this._parentElement.addEventListener("click", function (e) {
      const el = e.target.closest("button");
      if (!el) return;
      console.log(el);
      const page = +el.dataset.goto;
      console.log(page);
      hanlder(page);
    });

    // querySelector(".pagination-btn");
  }

  _generateView() {
    const numberOfPage = Math.ceil(this._data.searchItems.length / PER_PAGE);
    const currentPage = this._data.pageNumber;
    console.log(numberOfPage);
    console.log(currentPage);
    if (currentPage === 1 && numberOfPage > 1) {
      return `<div class="pagination-btn">
      <button class="next" data-goto="${currentPage + 1}">Page ${currentPage + 1} </button></div>`;
    }
    if (currentPage > 1 && numberOfPage > currentPage) {
      return `<div class="pagination-btn">
      <button class="prev"  data-goto="${currentPage - 1}">Page ${currentPage - 1} </button>
      <p>${"Page " + currentPage}</p>
      <button class="next"  data-goto="${currentPage + 1}">Page ${currentPage + 1} </button></div>`;
    }
    if (currentPage === numberOfPage) {
      return `<div class="pagination-btn">
      <button class="prev"  data-goto="${currentPage - 1}">Page ${currentPage - 1} </button>
      </div>`;
    }
    return "";
  }
}

// controller -------------
const recipeview = new RecipeView();
const searchView = new SearchView();
const resultView = new ResultView();
const pagination = new PaginationView();

async function loadData() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeview.generateLoading();
    await getRecipe(id);
    Object.keys(state.recipe).length && recipeview.render(state.recipe);
  } catch (error) {
    recipeview.generateErrorMessage(error);
    //alert(error);
  }
}

async function ControllerloadSearchData() {
  try {
    resultView.generateLoading();
    const query = searchView.getSearchValue();
    if (!query) return;
    await searchRecipe(query);
    resultView.render(changePageItem());
    pagination.render(state.search);
  } catch (err) {
    console.log(err);
  }
}

function controlPagination(page) {
  resultView.render(changePageItem(page));
  pagination.render(state.search);
}

const init = function () {
  recipeview.generateRender(loadData);
  searchView.loadDataSearch(ControllerloadSearchData);
  pagination.navigatepage(controlPagination);
};

init();
