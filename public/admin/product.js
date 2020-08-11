const btn_post = document.querySelector('.create-btn');
const input_main_image = document.querySelector('input[name="main_image"]');
const input_other_images = document.querySelector('input[name="other_images"]');

const res_msg = document.querySelector('.res-msg');

execute_product();
selectColor();

async function execute_product() {

  const url = `${get_url()}/admin/product`;

  btn_post.addEventListener('click', async e => {

    res_msg.innerHTML = 'Please wait......';

    const form = document.querySelector('form');
    const formData = new FormData();

    const all_inputs = document.querySelectorAll('input, select, textarea');


    for (let i = 0; i < all_inputs.length; i++) {
      // get each input
      const input = all_inputs[i];
      const name = input.name;

      if (name.match(/images?$/)) {
        // image
        const files = input.files;
        const id = document.querySelector('input[name="id"]').value;

        if (files.length === 0) {
          res_msg.innerHTML = 'Please upload image.';
          return;
        }

        if (name.match(/^main/)) {
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

          formData.append(name, file, id + `-main` + '.' + file.name.split('.').pop());

        } else if (name.match(/^other/)) {

          // other images amount
          if (files.length > 3) {
            res_msg.innerHTML = 'The maximum number of other images is 3.';
            return;
          }

          for (let j = 0; j < files.length; j++) {
            const file = files[j];

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

            formData.append(name, file, id + `-${j + 1}` + '.' + file.name.split('.').pop());

          }

        }

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
  input_main_image.addEventListener('change', (e) => {
    res_msg.innerHTML = '';

    const main_image = input_main_image.files[0];
    const img = document.querySelector('.main_image');
    img.src = URL.createObjectURL(main_image);

    // check image size
    if ((main_image.size / 1024 / 1024).toFixed(1) > 2) {
      res_msg.innerHTML = 'This image size is too big. The maximum size of image is 2MB.';
    }
  });

  input_other_images.addEventListener('change', (e) => {
    res_msg.innerHTML = '';

    const other_images = input_other_images.files;
    const imgs = document.querySelectorAll('.other_images');
    for (let i = 0; i < other_images.length; i++) {
      imgs[i].src = URL.createObjectURL(other_images[i]);

      // check image size
      if ((other_images[i].size / 1024 / 1024).toFixed(1) > 2) {
        res_msg.innerHTML = 'This image size is too big. The maximum size of image is 2MB.';
      }
    }
  });
}

function selectColor() {
  const colorCodesHTML = document.querySelector('textarea[id="colorCodes"]');
  const colorNamesHTML = document.querySelector('input[id="colorNames"]');

  document.querySelector('.btn-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
      if (colorCodesHTML.value === '') {
        e.target.classList.add('btn-light');
        e.target.classList.remove('btn-dark');

        colorCodesHTML.value = e.target.dataset.code;
        colorNamesHTML.value = e.target.textContent;

      } else if (!colorCodesHTML.value.includes(e.target.dataset.code)) {
        e.target.classList.add('btn-light');
        e.target.classList.remove('btn-dark');

        colorCodesHTML.value += ',' + e.target.dataset.code;
        colorNamesHTML.value += ',' + e.target.textContent;

      } else if (colorCodesHTML.value.includes(e.target.dataset.code)) {
        e.target.classList.remove('btn-light');
        e.target.classList.add('btn-dark');

        if (colorCodesHTML.value.includes(',' + e.target.dataset.code)) {
          colorCodesHTML.value = colorCodesHTML.value.replace(',' + e.target.dataset.code, '');
          colorNamesHTML.value = colorNamesHTML.value.replace(',' + e.target.textContent, '');
        } else if (colorCodesHTML.value.includes(e.target.dataset.code + ',')) {
          colorCodesHTML.value = colorCodesHTML.value.replace(e.target.dataset.code + ',', '');
          colorNamesHTML.value = colorNamesHTML.value.replace(e.target.textContent + ',', '');
        } else {
          colorCodesHTML.value = colorCodesHTML.value.replace(e.target.dataset.code, '');
          colorNamesHTML.value = colorNamesHTML.value.replace(e.target.textContent, '');
        }

      }
    }
  });
}