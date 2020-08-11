const btn_post = document.querySelector('button');
const input_picture = document.querySelector('input[name="picture"]');

const res_msg = document.querySelector('.res-msg');

execute_campaign();

async function execute_campaign() {

  const url = `${get_url()}/admin/campaign`;

  btn_post.addEventListener('click', async e => {

    res_msg.innerHTML = 'Please wait......';

    const form = document.querySelector('form');
    const formData = new FormData();

    const all_inputs = document.querySelectorAll('input, select, textarea');


    for (let i = 0; i < all_inputs.length; i++) {
      // get each input
      const input = all_inputs[i];
      const name = input.name;

      if (name.match(/^picture$/)) {
        // image
        const files = input.files;
        const campaign_id = document.querySelector('input[name="campaign_id"]').value;

        if (files.length === 0) {
          res_msg.innerHTML = 'Please upload image.';
          return;
        }

        const file = files[0];

        // file type
        if (!file.type.match(/(jpg|jpeg|png)$/i)) {
          res_msg.innerHTML = 'Only image files are allowed.';
          return;
        }

        // size
        if (file.size > 1024 * 1024 * 2) {
          res_msg.innerHTML = 'Image size is too big. The size limit is 2MB.';
          return;
        }

        formData.append(name, file, 'campaign-' + campaign_id + '.' + file.name.split('.').pop());

      } else {

        const value = input.value;
        formData.append(name, value);
      }
    }

    const user_JWT = localStorage.getItem('user_JWT');

    fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${user_JWT}`
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

  });

  // image preview
  input_picture.addEventListener('change', (e) => {
    res_msg.innerHTML = '';

    const picture = input_picture.files[0];
    const img = document.querySelector('.picture');
    img.src = URL.createObjectURL(picture);

    // check image size
    if ((picture.size / 1024 / 1024).toFixed(1) > 2) {
      res_msg.innerHTML = 'This image size is too big. The maximum size of image is 2MB.';
    }
  });

}
