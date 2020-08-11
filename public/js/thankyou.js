execute_thankyou();

function execute_thankyou() {
  const number = getQuery().number;
  if (!number) {
    location.href = '/';
  }

  document.querySelector('.thankyou-main .view #number').textContent = number;
}
