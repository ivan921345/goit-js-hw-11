// imports
import Notiflix from 'notiflix';
import axios from 'axios';
import './sass/index.scss';
import * as basicLightbox from 'basiclightbox';
import '../node_modules/basiclightbox/dist/basicLightbox.min.css';
//variables
const BASE_URL = 'https://pixabay.com/api/';
const URL_KEY = '45197188-964a3d40e0cf282ecb9c097d6';
let page = 1;

//refs
const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  infinityScrollTarget: document.querySelector('.js-guard'),
};

//IntersectionObserverOptions options
const IntersectionObserverOptions = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

//initialisation libs

let observer = new IntersectionObserver(
  IntersectionObserverCallback,
  IntersectionObserverOptions
);
observer.observe(refs.infinityScrollTarget);

Notiflix.Notify.init({
  width: '500px',
  clickToClose: true,
  cssAnimationStyle: 'zoom',
});

//hide guard
refs.infinityScrollTarget.classList.add('hideGuard');

// func declaration
function IntersectionObserverCallback(entries) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      return;
    }
    fetchImages(BASE_URL, refs.searchForm.children.searchQuery.value).then(
      ({ hits }) => {
        refs.galleryContainer.insertAdjacentHTML(
          'beforeend',
          createMarkup(hits)
        );
      }
    );
  });
}

function fetchImages(url, targetToSearch) {
  const response = axios
    .get(`${url}?`, {
      params: {
        key: URL_KEY,
        q: targetToSearch,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: page,
      },
    })
    .then(resp => resp.data);

  page++;
  return response;
}
function createMarkup(arr) {
  return arr
    .map(el => {
      return `
		<div class="photo-card">
			<img src="${el.webformatURL}" class="photoCardImg" data-large-image="${el.largeImageURL}" alt="$tags }" loading="lazy" />
			<div class="info">
				<p class="info-item">
					<b>Likes ${el.likes}</b>
				</p>
				<p class="info-item">
					<b>Views ${el.views}</b>
				</p>
				<p class="info-item">
					<b>Comments ${el.comments}</b>
				</p>
				<p class="info-item">
					<b>Downloads ${el.downloads}</b>
				</p>
			</div>
		</div>
		`;
    })
    .join('');
}

function clearUi() {
  refs.galleryContainer.innerHTML = '';
}

//event functions
function onSubmit(e) {
  e.preventDefault();
  clearUi();
  page = 1;
  fetchImages(BASE_URL, e.target.children.searchQuery.value).then(
    ({ hits, totalHits }) => {
      if (hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      refs.infinityScrollTarget.classList.remove('hideGuard');
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      refs.galleryContainer.insertAdjacentHTML('beforeend', createMarkup(hits));
    }
  );
}

function onGalleryClick(e) {
  if (!e.target.classList.contains('photoCardImg')) {
    return;
  }
  const instance = basicLightbox.create(`
    <img src="${e.target.dataset.largeImage}" alt="">
  `);
  instance.show();
}

// adding event listener
refs.searchForm.addEventListener('submit', onSubmit);
refs.galleryContainer.addEventListener('click', onGalleryClick);
