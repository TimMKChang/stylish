execute_profile();
add_log_out_listener();

function execute_profile() {

  const url = `${get_url()}/user/profile`;

  const user_JWT = localStorage.getItem('user_JWT');

  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user_JWT}`,
      'content-type': 'application/json'
    },
  }).then(res => res.json())
    .then(data => {

      if (data.error) {
        // jump to login
        location.href = '/user/login.html';
        return;
      }
      // remove spinner
      setTimeout(() => {
        document.querySelector('.spinner-container').remove();
      }, 1000)

      const user_data = data.data;
      view_profile(user_data);

    })
    .catch(error => console.error('Error:', error))

}

function view_profile(user_data) {
  const { id, name, email } = user_data;
  document.querySelector('.profile-main .view .id .value').textContent = id;
  document.querySelector('.profile-main .view .name .value').textContent = name;
  document.querySelector('.profile-main .view .email .value').textContent = email;
}

function add_log_out_listener() {
  document.querySelector('button.log-out').addEventListener('click', () => {
    localStorage.removeItem('user_JWT');
    alert('帳號已成功登出');
    location.href = '/';
  })
}