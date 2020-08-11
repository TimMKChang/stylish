### Host Name

[haboy.xyz](https://haboy.xyz/)

### Demo Website

- Homepage

https://haboy.xyz/

- Product

https://haboy.xyz/product.html?id=201807202157

- Cart

https://haboy.xyz/cart.html

- Thankyou

https://haboy.xyz/thankyou.html?id=77777777

- Profile

https://haboy.xyz/profile.html

- Login

https://haboy.xyz/user/login.html

- Register

https://haboy.xyz/user/register.html

### Admin

- Product

https://haboy.xyz/admin/product.html

- Campaign

https://haboy.xyz/admin/campaign.html

- Delete product or campaign

https://haboy.xyz/admin/delete.html

### API
- Product List API

https://haboy.xyz/api/1.0/products/all

https://haboy.xyz/api/1.0/products/men

https://haboy.xyz/api/1.0/products/women

https://haboy.xyz/api/1.0/products/accessories

https://haboy.xyz/api/1.0/products/women?paging=1

- Product Search API

https://haboy.xyz/api/1.0/products/search?keyword=洋裝

- Product Details API

https://haboy.xyz/api/1.0/products/details?id=202005171001

- Marketing Campaigns API

https://haboy.xyz/api/1.0/marketing/campaigns

- User Sign Up API

https://haboy.xyz/user/register.html

POST https://haboy.xyz/user/signup

- User Sign In API

https://haboy.xyz/user/login.html

POST https://haboy.xyz/user/signin

- User Profile API

https://haboy.xyz/user/profile.html

GET https://haboy.xyz/user/profile

- Order Check Out API

https://haboy.xyz/admin/checkout.html

POST https://haboy.xyz/order/checkout


### Image 
https://<span></span>haboy.xyz/assets/:product_id/main.jpg

https://haboy.xyz/assets/201807201824/main.jpg

https://<span></span>haboy.xyz/assets/:product_id/[other image No.].jpg

https://haboy.xyz/assets/201807201824/1.jpg

https://<span></span>haboy.xyz/campaigns/[campaign id].jpg

https://haboy.xyz/campaigns/1.jpg


### Run Web Server in the Background
#### activate
nohup node app.js > output.log &
#### shutdown
kill &lt;pid&gt;


### Midterm Dashboard

https://www.haboy.xyz/admin/dashboard.html

1. Get and Store Order Data
2. Build the Dashboard
3. Auto-Refresh your Dashboard
4. Performance Tuning and Analysis (Advanced Optional)

- How much time your server spend to aggregate the data and render the page? (This one should be at least better than my sample page)

大約0.6 seconds
在function的前後分別計算時間，再輸出差值。

- How much additional memory your server (or browser) use to aggregate the data?

大約6 MB
藉由process.memoryUsage()在function的前後分別計算，再輸出差值。

- How much data you transfer through the network? (Be careful about browser cache, you should measure it without browser cache)

查看API Network Response Headers Content-Length
1100514，每一單位為8 bytes (B)
大約1.1 MB
或者下載下來，為1.04 MB
