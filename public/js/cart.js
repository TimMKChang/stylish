execute_cart();

async function execute_cart() {
  const products = get_cart_list();

  // row
  let html_content = '';
  for (const product of products) {
    html_content += get_cart_row_HTML(product);
  }

  if (products.length > 0) {
    const list = document.querySelector('.cart-main .cart .list');
    list.innerHTML = html_content;
  }

  // view empty cart and disabled checkout button
  view_empty_cart(products.length === 0);

  // update total
  view_confirm();

  // remove listener
  cart_remove_product();

  // change qty listener
  modify_cart_product_qty();

  // fill in user data
  await fill_in_user_data();
}

function get_cart_list() {
  const cart_str = localStorage.getItem('cart');
  const cart_obj = JSON.parse(cart_str);
  return cart_obj ? cart_obj.list : [];
}

function get_cart_row_HTML(product) {
  const { main_image, name, id, color, size, stock, price, qty } = product;
  let html_content = `
    <div class="row" data-id="${id}" data-color_name="${color.name}" data-size="${size}">
      <a href="${url}/product.html?id=${id}" class="variant">
        <div class="picture">
          <img src="${main_image}">
        </div>
        <div class="details">
          ${name}
          <br>
          ${id}
          <br>
          <br>
          顏色：${color.name}
          <br>
          尺寸：${size}
        </div>
      </a>
      <div class="qty">
        <select>
  `;

  for (let i = 1; i <= stock; i++) {
    if (i === qty) {
      html_content += `
          <option value="${i}" selected>${i}</option>
      `;
    } else {
      html_content += `
          <option value="${i}">${i}</option>
      `;
    }
  }

  html_content += `
        </select>
      </div>
      <div class="price">NT. ${price}</div>
      <div class="subtotal">NT. ${price * qty}</div>
      <div class="remove">
        <img src="./images/cart-remove.png" alt="cart remove">
      </div>
    </div>
  `;

  return html_content;

}

function view_confirm() {
  const confirmHTML = document.querySelector('.cart-main .confirm');

  const cart_str = localStorage.getItem('cart');
  const cart_obj = JSON.parse(cart_str);

  const { freight, subtotal, total } = cart_obj || { freight: 60, subtotal: 0, total: 60 };
  confirmHTML.querySelector('.freight').textContent = freight;
  confirmHTML.querySelector('.subtotal').textContent = subtotal;
  confirmHTML.querySelector('.total').textContent = total;
}

function cart_remove_product() {
  document.querySelector('.cart .list').addEventListener('click', (e) => {
    if (e.target.closest(".remove")) {
      const rowHTML = e.target.closest(".row");
      const id = rowHTML.dataset.id;
      const color_name = rowHTML.dataset.color_name;
      const size = rowHTML.dataset.size;
      // update cart
      const cart_str = localStorage.getItem('cart');
      const cart_obj = JSON.parse(cart_str);
      const cart_list = cart_obj.list;

      const index = cart_list.findIndex((prodcut) => {
        // check product id, color and size
        return prodcut.id === +id
          && prodcut.color.name === color_name
          && prodcut.size === size;
      });

      // update subtotal total
      cart_obj.subtotal -= cart_list[index].price * cart_list[index].qty;
      cart_obj.total -= cart_list[index].price * cart_list[index].qty;

      cart_list.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart_obj));

      // remove row
      rowHTML.remove();
      alert('已從購物車中移除');

      // update view total
      view_confirm();

      // update cart qty
      update_cart_qty();

      // view empty cart and disabled checkout button
      view_empty_cart(cart_list.length === 0);

    }
  });
}

function modify_cart_product_qty() {
  const listHTML = document.querySelector('.cart-main .cart .list');
  listHTML.addEventListener('click', (e) => {
    if (e.target.tagName === 'SELECT') {

      const rowHTML = e.target.closest(".row");
      const id = rowHTML.dataset.id;
      const color_name = rowHTML.dataset.color_name;
      const size = rowHTML.dataset.size;
      // update cart
      const cart_str = localStorage.getItem('cart');
      const cart_obj = JSON.parse(cart_str);
      const cart_list = cart_obj.list;

      const index = cart_list.findIndex((prodcut) => {
        // check product id, color and size
        return prodcut.id === +id
          && prodcut.color.name === color_name
          && prodcut.size === size;
      });

      // update qty
      if (cart_list[index].qty === +e.target.value) {
        return;
      }
      cart_list[index].qty = +e.target.value;
      // update subtotal total
      cart_obj.subtotal = get_subtotal(cart_obj.list);
      cart_obj.total = cart_obj.freight + cart_obj.subtotal;

      // update row subtotal
      const { qty, price } = cart_list[index];
      rowHTML.querySelector('.subtotal').textContent = `NT. ${qty * price}`;

      localStorage.setItem('cart', JSON.stringify(cart_obj));

      // update view total
      view_confirm();

      // update cart qty
      update_cart_qty();
    }
  })

}

function view_empty_cart(empty) {
  const checkout_btn = document.querySelector('button.checkout');
  if (empty) {
    const list = document.querySelector('.cart-main .cart .list');
    list.innerHTML = '<h4 style="margin-left:20px;">購物車空空的耶</h4>';
    checkout_btn.classList.add('disabled')
  } else {
    checkout_btn.classList.remove('disabled')
  }

}

async function fill_in_user_data() {
  const url = `${get_url()}/user/profile`;

  const user_JWT = localStorage.getItem('user_JWT');

  await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user_JWT}`,
      'content-type': 'application/json'
    },
  }).then(res => res.json())
    .then(_data => {
      const { data, error } = _data;
      if (error) {
        return;
      }
      const { name, email } = data;
      document.querySelector('.recipient input[id="recipient-name"]').value = name;
      document.querySelector('.recipient input[id="recipient-email"]').value = email;
    })
    .catch(error => console.error('Error:', error))
}