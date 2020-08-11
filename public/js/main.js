// global variables
const url = get_url();

main();

async function main() {
  await load_haeder_footer();
  update_cart_qty();
}

// load header and footer
async function load_haeder_footer() {

  await new Promise((resolve, reject) => {
    $("#header").load("/header.html", () => {
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    $("#footer").load("/footer.html", () => {
      resolve();
    });
  });

}

// get query
function getQuery() {
  const query_str = window.location.search;
  // expect starting with ?
  if (!query_str.match(/^\?/)) {
    return {};
  }

  const queryArray = query_str.substring(1).split('&');
  const query = queryArray.reduce((acc, cur) => {
    const key = cur.split('=')[0];
    const value = cur.split('=')[1];
    acc[key] = value;
    return acc;
  }, {})

  return query;

}

// get url
function get_url() {
  let port = '';
  if (location.hostname === 'localhost') {
    port = `:${location.port}`;
  }
  return `${location.protocol}//${location.hostname}${port}`;
}

// update header cart qty
function update_cart_qty() {
  const cart_str = localStorage.getItem('cart');
  if (cart_str) {
    const cart_obj = JSON.parse(cart_str);
    document.querySelector('.cart-qty').innerHTML = cart_obj.list.length;
  }

}

// get subtotal
function get_subtotal(list) {
  let subtotal = 0;
  for (const product of list) {
    subtotal += product.price * product.qty;
  }
  return subtotal;
}
