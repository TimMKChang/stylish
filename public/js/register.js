const res_msg = document.querySelector('.res-msg');
execute_register();

function execute_register() {
  const btn_post = document.querySelector('button');

  btn_post.addEventListener('click', registerPost);

  document.querySelector('form').addEventListener("keypress", e => {
    if (e.keyCode === 13) {
      registerPost();
    }
  });
}

function registerPost() {
  const name = document.querySelector('input[id="name"]').value;
  const email = document.querySelector('input[id="email"]').value;
  const password = document.querySelector('input[id="password"]').value;
  const password2 = document.querySelector('input[id="password2"]').value;

  if (!name || !email || !password || !password2) {
    res_msg.innerHTML = 'All fields are required.';
    return;
  }

  if (password !== password2) {
    res_msg.innerHTML = "Password and Confirm Password don't match.";
    return;
  }

  const data = { name, email, password };

  const url = `${get_url()}/user/signup`;

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    },
  }).then(res => res.json())
    .then(data => {

      if (data.error) {
        res_msg.innerHTML = data.error;
      } else {
        res_msg.innerHTML = 'Register success!';

        // store in localStorage
        localStorage.setItem('user_JWT', data.access_token);

        // jump to login
        location.href = '/profile.html';
      }
      console.log(data);
    })
    .catch(error => console.error('Error:', error))
}