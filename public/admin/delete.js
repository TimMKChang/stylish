const res_msg = document.querySelector('.res-msg');

document.querySelector('.product-delete-btn').addEventListener('click', () => {

  const id = document.querySelector('input[id="product"]').value;
  if (!id) {
    res_msg.innerHTML = '請輸入id';
    return;
  }

  const url = `${get_url()}/test/product/${id}/delete`;
  execute_delete(url);
})

document.querySelector('.campaign-delete-btn').addEventListener('click', () => {

  const id = document.querySelector('input[id="campaign"]').value;
  if (!id) {
    res_msg.innerHTML = '請輸入id';
    return;
  }

  const url = `${get_url()}/test/campaign/${id}/delete`;
  execute_delete(url);
})

function execute_delete(url) {

  const user_JWT = localStorage.getItem('user_JWT');

  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user_JWT}`,
      'content-type': 'application/json'
    },
  }).then(res => res.json())
    .then(resObj => {

      if (resObj.error) {
        res_msg.innerHTML = resObj.error;
        return;
      }

      res_msg.innerHTML = resObj.message;

    })
    .catch(error => console.error('Error:', error))

}