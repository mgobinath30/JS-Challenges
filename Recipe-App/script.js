const API_URL = "https://forkify-api.jonas.io/api/v2/recipes/";

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
  searchItems: [],
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
    state.searchItems = response?.data?.recipes;
  } catch (err) {
    throw err;
  }
};

searchRecipe("pizza");

// window.addEventListener('hashchange', loadData);
// window.addEventListener('load', loadData);

// view -------------
class ParentView {
  _data;
  render(data) {
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

  _clear() {
    this._parentElement.innerHTML = "";
  }
}

class RecipeView {
  _parentElement = document.querySelector(".recipeContainer");
  _data;
  _errormsg = "No Recipe Found.Please try again!";

  render(data) {
    this._data = data;
    const markup = this._generateView();
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

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

  _generateItem(item) {
    return `<li>${item.quantity ?? ""} ${item.unit ?? ""} ${item.description}</li>`;
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

  _clear() {
    this._parentElement.innerHTML = "";
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

// controller -------------
const recipeview = new RecipeView();
const searchView = new SearchView();

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
    const query = searchView.getSearchValue();
    debugger;
    if (!query) return;
    await searchRecipe(query);
    console.log(state.searchItems);
  } catch (err) {
    console.log(err);
  }
}

const init = function () {
  recipeview.generateRender(loadData);
  searchView.loadDataSearch(ControllerloadSearchData);
};

init();
