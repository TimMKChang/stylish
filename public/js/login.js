const res_msg = document.querySelector('.res-msg');
execute_login();

function execute_login() {
  const btn_post = document.querySelector('button');

  btn_post.addEventListener('click', loginPost);

  document.querySelector('form').addEventListener("keypress", e => {
    if (e.keyCode === 13) {
      loginPost();
    }
  });
}

function loginPost() {
  const url = `${get_url()}/user/signin`;

  const email = document.querySelector('input[id="email"]').value;
  const password = document.querySelector('input[id="password"]').value;

  if (!email || !password) {
    res_msg.innerHTML = 'All fields are required.';
    return;
  }

  const data = { provider: "native", email, password };

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
        res_msg.innerHTML = 'Login success!';

        // store in localStorage
        localStorage.setItem('user_JWT', data.access_token);

        // jump to login
        location.href = '/profile.html';
      }

      console.log(data);

    })
    .catch(error => console.error('Error:', error))
}

// facebook
function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
  // console.log('statusChangeCallback');
  console.log(response);                   // The current login status of the person.
  if (response.status === 'connected') {   // Logged into your webpage and Facebook.

    // send to server
    const data = {
      provider: 'facebook',
      access_token: response.authResponse.accessToken
    }

    const url = `${get_url()}/user/signin`;

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
          res_msg.innerHTML = 'Login success!';

          // store in localStorage
          localStorage.setItem('user_JWT', data.access_token);

          // jump to login
          location.href = '/profile.html';
        }

        console.log(data);
      })
      .catch(error => console.error('Error:', error))

    testAPI();
  } else {                                 // Not logged into your webpage or we are unable to tell.
    // document.getElementById('status').innerHTML = 'Please log ' +
    //   'into this webpage.';
  }
}


function checkLoginState() {               // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function (response) {   // See the onlogin handler
    statusChangeCallback(response);
  });
}


// window.fbAsyncInit = function () {
//   FB.init({
//     appId: '177413736939028',
//     cookie: true,                     // Enable cookies to allow the server to access the session.
//     xfbml: true,                     // Parse social plugins on this webpage.
//     version: 'v7.0'           // Use this Graph API version for this call.
//   });


//   // FB.getLoginStatus(function (response) {   // Called after the JS SDK has been initialized.
//   //   statusChangeCallback(response);        // Returns the login status.
//   // });
// };


(function (d, s, id) {                      // Load the SDK asynchronously
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
  // console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function (response) {
    // console.log('Successful login for: ' + response.name);
    // document.getElementById('status').innerHTML =
    //   'Thanks for logging in, ' + response.name + '!';
  });
}