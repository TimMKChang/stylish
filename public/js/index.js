// carousel
const carousel = {
  // take 3 campaigns as an example
  length: 3,
  now_index: 0,
  last_index: 2,
  timer: 0,
};
// main products
const products = {
  now_paging: 0,
  next_paging: 0
};

execute_index();

function execute_index() {

  fetch(`${url}/api/1.0/marketing/campaigns`)
    .then(res => res.json())
    .then(resObj => {
      const { error, data } = resObj;
      const campaigns = data;

      if (error) {
        return;
      }

      view_carousel(campaigns);

      // default run
      carouselTimer();
      carousel.timer = setInterval(carouselTimer, 5000);

      document.querySelector('.point-button-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('point-button')) {
          // check not click on the same index (last_index)
          const now_index = +e.target.dataset.index;
          if (now_index === carousel.last_index) {
            return;
          }

          clearTimeout(carousel.timer);
          carousel.now_index = now_index;
          carouselTimer();
          carousel.timer = setInterval(carouselTimer, 5000);
        }
      });
    })
    .catch(error => console.error('Error:', error));

  // for category and search keyword
  const filter_word = getQuery().tag || 'all';
  let product_url;
  if (filter_word.match(/^(all|women|men|accessories)$/)) {
    product_url = `${url}/api/1.0/products/${filter_word}`;
  } else {
    product_url = `${url}/api/1.0/products/search?keyword=${filter_word}`;
  }

  fetch(product_url)
    .then(res => res.json())
    .then(resObj => {
      const { error, data, next_paging } = resObj;

      if (error) {
        return;
      }

      view_product(data);
      products.next_paging = next_paging;
    })
    .catch(error => console.error('Error:', error));

  // when scroll to bottom
  window.onscroll = () => {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight * 0.9) {
      if (products.next_paging > products.now_paging) {
        products.now_paging += 1;

        fetch(`${product_url}?paging=${products.next_paging}`)
          .then(res => res.json())
          .then(resObj => {
            const { error, data, next_paging } = resObj;

            if (error) {
              return;
            }

            view_product(data);
            products.next_paging = next_paging;
          })
          .catch(error => console.error('Error:', error));
      }
    }
  };
}

function view_carousel(data) {
  const carouselHTML = document.querySelector('.carousel');
  let carousel_HTML = '';
  let button_HTML = '';
  for (let i = 0; i < data.length; i++) {
    const campaign = data[i];
    carousel_HTML += `
        <a href="${url}/product.html?id=${campaign.product_id}" class="img-container" style="background-image: url(${campaign.picture});">
          <div class="story">`;

    carousel_HTML += campaign.story.replace(/\s/g, '<br>');

    carousel_HTML += `    
          </div>
        </a>`;

    button_HTML += `<div class="point-button" data-index="${i}"></div>`
  }

  carouselHTML.innerHTML = carousel_HTML;
  carouselHTML.innerHTML += `
      <div class="point-button-container">
      ${button_HTML}
      </div>
      `;

  // reset carousel
  carousel.length = data.length;
  carousel.last_index = data.length - 1;

}

function carouselTimer() {
  const length = carousel.length;
  const now_index = carousel.now_index;
  const last_index = carousel.last_index
  const next_index = (now_index + 1) % length;

  // image
  const now_img = document.querySelectorAll('.carousel .img-container')[now_index];
  const last_img = document.querySelectorAll('.carousel .img-container')[last_index];

  last_img.style.opacity = 0;
  now_img.style.opacity = 1;

  // can click on the right product
  last_img.style['z-index'] = 0;
  now_img.style['z-index'] = 100;

  // point button
  const now_point = document.querySelectorAll('.carousel .point-button')[now_index];
  const last_point = document.querySelectorAll('.carousel .point-button')[last_index];

  now_point.style.backgroundColor = '#000000';
  last_point.style.backgroundColor = '#aaaaaa';

  carousel.now_index = next_index;
  carousel.last_index = now_index;
}

function view_product(data) {
  const products = document.querySelector('main .products');
  let html_content = '';

  if (data.length === 0) {
    html_content += '<h2 class="no-result">沒有搜尋到任何產品哦</h2>';

  } else {
    for (const product of data) {
      html_content += `
      <a href="${url}/product.html?id=${product.id}" class="product">
        <img src="${product.main_image}" alt="product">
          <div class="colors">`;

      for (const color of product.colors) {
        html_content += `<div class="color" style="background-color: #${color.code};"></div>`;
      }

      html_content += `    
          </div >
        <div class="name">${product.title}</div>
        <div class="price">TWD.${product.price}</div>
      </a > `;
    }

  }

  products.innerHTML += html_content;
}
