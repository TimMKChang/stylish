TPDirect.setupSDK(12348, 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF', 'sandbox');
TPDirect.card.setup({
  fields: {
    number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****'
    },
    expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY'
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'ccv'
    }
  },
  styles: {
    // Style all elements
    'input': {
      'color': 'gray'
    },
    // Styling ccv field
    'input.cvc': {
      // 'font-size': '16px'
    },
    // Styling expiration-date field
    'input.expiration-date': {
      // 'font-size': '16px'
    },
    // Styling card-number field
    'input.card-number': {
      // 'font-size': '16px'
    },
    // style focus state
    ':focus': {
      // 'color': 'black'
    },
    // style valid state
    '.valid': {
      'color': 'green'
    },
    // style invalid state
    '.invalid': {
      'color': 'red'
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
      'input': {
        'color': 'orange'
      }
    }
  }
})
TPDirect.card.onUpdate(function (update) {
  // update.canGetPrime === true
  // --> you can call TPDirect.card.getPrime()
  if (update.canGetPrime) {
    // Enable submit Button to get prime.
    // submitButton.removeAttribute('disabled')
  } else {
    // Disable submit Button to get prime.
    // submitButton.setAttribute('disabled', true)
  }

  // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
  if (update.cardType === 'visa') {
    // Handle card type visa.
  }

  // number 欄位是錯誤的
  if (update.status.number === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.number === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }

  if (update.status.expiry === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.expiry === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }

  if (update.status.ccv === 2) {
    // setNumberFormGroupToError()
  } else if (update.status.ccv === 0) {
    // setNumberFormGroupToSuccess()
  } else {
    // setNumberFormGroupToNormal()
  }
})

document.querySelector('.cart-main .checkout').addEventListener('click', function onSubmit(event) {
  event.preventDefault()

  const cart_str = localStorage.getItem('cart') || JSON.stringify({});
  const cart_obj = JSON.parse(cart_str);
  if (!cart_obj.list || cart_obj.list.length === 0) {
    alert('尚未選購任何商品');
    return;
  }
  const { freight, subtotal, total } = cart_obj;
  const list = cart_obj.list;
  for (let product of list) {
    delete product.main_image;
    delete product.stock;
  }

  // get recipient data
  const name = document.querySelector('.recipient input[id="recipient-name"]').value;
  const email = document.querySelector('.recipient input[id="recipient-email"]').value;
  const phone = document.querySelector('.recipient input[id="recipient-phone"]').value;
  const address = document.querySelector('.recipient input[id="recipient-address"]').value;
  const time = document.querySelector('.recipient input[name="recipient-time"]:checked').value;
  const recipient = {
    name,
    phone,
    email,
    address,
    time
  };
  if (!name) {
    alert('請輸入收件人姓名');
    return;
  }
  if (!email) {
    alert('請輸入Email');
    return;
  }
  if (!phone) {
    alert('請輸入手機號碼');
    return;
  }
  if (!address) {
    alert('請輸入收件地址');
    return;
  }

  const data = {
    prime: '',
    order: {
      shipping: "delivery",
      payment: "credit_card",
      subtotal,
      freight,
      total,
      recipient,
      list
    }
  };

  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus()

  // 確認是否可以 getPrime
  if (tappayStatus.canGetPrime === false) {
    alert('信用卡資料錯誤');
    return
  }

  // wait for checkout
  wait_checkout();

  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      document.querySelector('.after-checkout-container').innerHTML = '';
      alert('get prime error ' + result.msg)
      return
    }
    data.prime = result.card.prime;
    checkout(data);
    // alert('get prime 成功，prime: ' + result.card.prime)

    // send prime to your server, to pay with Pay by Prime API .
    // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
  })
})

function wait_checkout() {
  const container = document.querySelector('.after-checkout-container');
  container.innerHTML = `
    <div class="after-checkout"></div>
    <div class="spinner-container">
      <div class="spinner-border text-dark" role="status" style="width: 5rem; height: 5rem; border-width: 10px;">
        <span class="sr-only">Loading...</span>
      </div>
      <div class="title">交易處理中請稍候</div>
    </div>
  `;
}

function checkout(data) {
  const url = `${get_url()}/order/checkout`

  const { total, list } = newOrder(data);

  function newOrder(_data) {
    const dataStr = JSON.stringify(_data);
    const data = JSON.parse(dataStr);
    const { total } = data.order;
    const list = data.order.list.map(product => {
      const { id, price, color, size, qty } = product;
      return { id, price, color, size, qty };
    })
    return { total, list };
  }

  // example
  // const data = {
  //   prime,
  //   order: {
  //     shipping: "delivery",
  //     payment: "credit_card",
  //     subtotal,
  //     freight,
  //     total,
  //     recipient,
  //     list
  //   }
  // };

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    }
  }).then(res => res.json())
    .then(res => {
      const { error, data } = res;
      if (error) {
        console.log(error);

      } else {
        // socket order data
        socket.emit('new-order', JSON.stringify({ total, list }));

        const number = data.number;
        // clear cart
        localStorage.removeItem('cart');
        // jump to thankyou.html
        location.href = `./thankyou.html?number=${number}`;

      }

    })
    .catch(error => console.error('Error:', error))

}
