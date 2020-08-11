// product.html
const product_stock = {};

execute_product();
add_cart_listener();

function execute_product() {
  // if there is no query id, jump to index.html
  const product_id = getQuery().id;
  if (!product_id) {
    location.href = '/';
  }

  // get detail data
  fetch(`${url}/api/1.0/products/details?id=${product_id}`)
    .then(res => res.json())
    .then(resObj => {
      const { error, data } = resObj;

      if (error) {
        location.href = '/';
      }

      view_product_detail(data);
    })
    .catch(error => console.error('Error:', error))

  // listener for colors and size
  document.querySelector('.details .colors').addEventListener('click', (e) => {
    if (e.target.classList.contains('color')) {
      const color = e.target.dataset.color;
      toggle_color(color);
    }
  });

  document.querySelector('.details .sizes').addEventListener('click', (e) => {
    if (e.target.classList.contains('size')) {
      const size = e.target.innerHTML;
      toggle_size(size);
    }
  });

  document.querySelector('.details .qty .chooser').addEventListener('click', (e) => {
    if (e.target.classList.contains('op')) {
      const valueHTML = document.querySelector('.details .qty .value');
      const max_value = +valueHTML.dataset.max;
      const now_value = +valueHTML.innerHTML;
      const op_value = +e.target.dataset.value;
      const result = now_value + op_value;

      if (result > 0 && result <= max_value) {
        valueHTML.innerHTML = result;
      }
    }

  });
}

function view_product_detail(product) {
  document.querySelector('.main-image').innerHTML = `<img src="${product.main_image}" alt="main image">`;
  document.querySelector('.details .name').textContent = product.title;
  document.querySelector('.details .id').textContent = product.id;
  document.querySelector('.details .price').textContent = `TWD.${product.price}`;

  // save color size stock
  for (const variant of product.variants) {
    const color_code = product_stock[variant.color_code] || {};
    if (Object.keys(color_code).length === 0) {
      product_stock[variant.color_code] = color_code;
    }
    color_code[variant.size] = variant.stock;
  }

  let colorsHTML = '<span class="title">顏色 &nbsp; |</span>';
  // color order in colors and color order in product_stock
  // order follow API data
  for (const color of product.colors) {
    colorsHTML += `<div class="color" style="background-color: #${color.code};" data-color="${color.code}" data-name="${color.name}"></div>`;
  }
  document.querySelector('.details .colors').innerHTML = colorsHTML;

  let sizesHTML = '<span class="title">尺寸 &nbsp; |</span>';
  for (const size of product.sizes) {
    sizesHTML += `<div class="size disabled">${size}</div>`;
  }
  document.querySelector('.details .sizes').innerHTML = sizesHTML;

  // default color size
  const default_color = product.colors[0].code;
  toggle_color(default_color);


  document.querySelector('.details .summary').innerHTML = `
          ${product.note}
          <br>
          <br>
          ${product.texture}
          <br>
          <pre>${product.description}</pre>
          <br>
          清洗：${product.wash}
          <br>
          產地：${product.place}`;

  document.querySelector('.description .story').innerHTML = product.story;
  // avoid repeat, 2 methods are ok
  // const otherImages = [...new Set(product.images)];
  const otherImages = product.images.filter((image, index) => {
    return product.images.indexOf(image) === index;
  });
  let imagesHTML = '';
  for (const image of otherImages) {
    imagesHTML += `<img src="${image}" alt="other image">`;
  }
  document.querySelector('.description .images').innerHTML = imagesHTML;

}

// click to change color
function toggle_color(color_code) {
  // color
  const colorsHTML = document.querySelectorAll('.details .colors .color');
  for (let colorHTML of colorsHTML) {
    if (colorHTML.dataset.color === color_code) {
      colorHTML.classList.add('current');
    } else {
      colorHTML.classList.remove('current');
    }

  }

  const default_size = Object.keys(product_stock[color_code]).find((size) => product_stock[color_code][size] > 0);
  toggle_size(default_size);

}

function toggle_size(click_size) {
  // size
  const current_color = document.querySelector('.details .colors .current').dataset.color;
  // check stock > 0
  const stock = product_stock[current_color][click_size];
  if (stock < 1) {
    return;
  }

  const sizeArray = Object.keys(product_stock[current_color]);
  const sizesHTML = document.querySelectorAll('.details .sizes .size');

  for (let sizeHTML of sizesHTML) {

    const size = sizeHTML.innerHTML;

    if (sizeArray.includes(size) && product_stock[current_color][size] > 0) {
      sizeHTML.classList.remove('disabled');
    } else {
      sizeHTML.classList.add('disabled');
    }

    if (click_size === size) {
      sizeHTML.classList.add('current');
    } else {
      sizeHTML.classList.remove('current');
    }

  }

  // set max stock
  set_max_stock();

  // reset value to 1
  document.querySelector('.details .qty .value').innerHTML = 1;

}

function set_max_stock() {
  // set max stock
  const current_color_HTML = document.querySelector('.details .colors .current');
  const current_size_HTML = document.querySelector('.details .sizes .current');

  if (!current_color_HTML || !current_size_HTML) {
    return;
  }

  const current_color = current_color_HTML.dataset.color;
  const current_size = current_size_HTML.innerHTML;

  const valueHTML = document.querySelector('.details .qty .value');
  valueHTML.dataset.max = product_stock[current_color][current_size];

}

// cart
// add to cart
function add_cart_listener() {
  const btn = document.querySelector('.add-cart-btn');
  btn.addEventListener('click', () => {
    store_cart_product(get_product());
    alert('已加入購物車');
  });
}

function get_product() {
  // product information
  const color = {
    code: document.querySelector('.colors .current').dataset.color,
    name: document.querySelector('.colors .current').dataset.name
  };
  const id = +document.querySelector('.id').textContent;
  const main_image = document.querySelector('.main-image img').getAttribute('src');
  const name = document.querySelector('.name').textContent;
  const price = +document.querySelector('.price').textContent.replace('TWD.', '');
  const qty = +document.querySelector('.qty .value').textContent;
  const size = document.querySelector('.sizes .current').textContent;
  const stock = +document.querySelector('.qty .value').dataset.max;

  const product = {
    color,
    id,
    main_image,
    name,
    price,
    qty,
    size,
    stock
  };

  return product;
}

function store_cart_product(product) {
  // localStorage
  // store json string, get and change to objcet
  // check cart exist
  const cart_str = localStorage.getItem('cart') || JSON.stringify({
    freight: 60,
    list: [],
    payment: 'credit_card',
    recipient: {

    },
    shipping: 'delivery',
    subtotal: 0,
    total: 60
  });

  const cart_obj = JSON.parse(cart_str);
  update_list(cart_obj.list);

  function update_list(list) {
    const index = list.findIndex((list_product) => {
      // check product id, color and size
      return list_product.id === product.id
        && list_product.color.code === product.color.code
        && list_product.size === product.size;
    });
    if (index > -1) {
      list[index] = product;
    } else {
      list.push(product);
    }
  }

  // calculate subtotal
  cart_obj.subtotal = get_subtotal(cart_obj.list);
  cart_obj.total = cart_obj.freight + cart_obj.subtotal;

  // save cart
  localStorage.setItem('cart', JSON.stringify(cart_obj));

  // update cart number
  update_cart_qty();

}
