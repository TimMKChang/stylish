// get url
function get_url() {
  let port = '';
  if (location.hostname === 'localhost') {
    port = `:${location.port}`;
  }
  return `${location.protocol}//${location.hostname}${port}`;
}
const url = get_url();
const orderData = [];

execute_product();

async function execute_product() {
  const startTime = Date.now();

  orderData.push(...await getOrderData());

  showTotalRevenue(orderData);
  showColorPercentage(orderData);
  showQtyPrice(orderData);
  showQtyTop5(orderData);

  const endTime = Date.now();
  console.log(`Total used time: ${(endTime - startTime) / 1000} seconds`);
}

const socket = io();

socket.on('connect', () => {
  socket.emit('dashboard', '');
});

socket.on('new-order', function (newOrderStr) {
  orderData.push(JSON.parse(newOrderStr));
  showTotalRevenue(orderData);
  showColorPercentage(orderData);
  showQtyPrice(orderData);
  showQtyTop5(orderData);
});

async function getOrderData() {
  // get order data
  return fetch(`${url}/api/1.0/order/data`)
    .then(res => res.json())
    .then(resObj => {
      return resObj;
    })
    .catch(error => console.error('Error:', error))
}

function showTotalRevenue(orderData) {
  const totalRevenue = orderData.reduce((acc, cur) => {
    return acc += cur.total
  }, 0);
  const numberHTML = document.querySelector('.total-revenue .number');
  numberHTML.textContent = `Total Revenue: ${totalRevenue}`;
}

function showColorPercentage(orderData) {
  const pieChartHTML = document.querySelector('.color-percentage .pie-chart');

  const colorQty = orderData.reduce((acc, cur) => {
    const { list } = cur;
    for (let i = 0; i < list.length; i++) {
      if (!acc[list[i].color.name]) {
        acc[list[i].color.name] = {
          code: list[i].color.code,
          qty: list[i].qty
        }
      } else {
        acc[list[i].color.name].qty += list[i].qty;
      }
    }
    return acc;
  }, {});

  const values = [];
  const labels = [];
  const colors = [];

  for (const name in colorQty) {
    values.push(colorQty[name].qty);
    labels.push(name);
    colors.push(colorQty[name].code);
  }

  const data = [{
    values,
    labels,
    type: 'pie',
    marker: {
      colors
    },
  }];

  const layout = {
    title: 'Product sold percentage in different colors',
    height: 300,
    width: 700,
    margin: { "t": 80, "b": 50 },
  };

  Plotly.newPlot(pieChartHTML, data, layout);
}

function showQtyPrice(orderData) {
  const histogramHTML = document.querySelector('.qty-price .histogram');

  const x = [];
  for (let orderIndex = 0; orderIndex < orderData.length; orderIndex++) {
    const { list } = orderData[orderIndex];

    for (let listIndex = 0; listIndex < list.length; listIndex++) {

      const { qty, price } = list[listIndex];
      for (let count = 0; count < qty; count++) {
        x.push(price);
      }

    }

  }

  const trace = {
    x: x,
    type: 'histogram',
  };
  const data = [trace];

  const layout = {
    title: 'Product sold quantity in different price range',
    xaxis: {
      title: {
        text: 'Price Range',
      },
    },
    yaxis: {
      title: {
        text: 'Quantity',
      },
    },
    height: 300,
    width: 700,
    margin: { "t": 80, "b": 50 },
  };

  Plotly.newPlot(histogramHTML, data, layout);
}

function showQtyTop5(orderData) {
  const stackerBarChartHTML = document.querySelector('.qty-top5 .stacked-bar-chart');

  const productSizeQty = orderData.reduce((acc, cur) => {
    const { list } = cur;

    for (let i = 0; i < list.length; i++) {
      const { id, size, qty } = list[i];

      if (!acc[id]) {
        acc[id] = {
          name: `product ${id}`,
          total: 0,
          S: 0,
          M: 0,
          L: 0
        }
      } else {
        acc[id][size] += qty;
        acc[id].total += qty;
      }
    }

    return acc;
  }, {});

  const qtyArray = [];
  for (const id in productSizeQty) {
    qtyArray.push(productSizeQty[id]);
  }

  // sort order by total descend
  qtyArray.sort(function (a, b) {
    return b.total - a.total;
  });

  const top5QtyArray = qtyArray.slice(0, 5);

  const top5ProductName = top5QtyArray.map(product => {
    return product.name;
  });

  const traceArray = [];
  const sizeArray = ['L', 'M', "S"];
  for (let sizeIndex = 0; sizeIndex < sizeArray.length; sizeIndex++) {
    const size = sizeArray[sizeIndex];
    const y = top5QtyArray.map(product => {
      return product[size];
    });

    traceArray.push({
      x: top5ProductName,
      y,
      name: size,
      type: 'bar',
    });
  }

  const data = [...traceArray];

  const layout = {
    barmode: 'stack',
    title: 'Quantity of top 5 sold prodcuts in different sizes',
    yaxis: {
      title: {
        text: 'Quantity',
      },
    },
    height: 300,
    width: 700,
    margin: { "t": 80, "b": 50 },
  };

  Plotly.newPlot(stackerBarChartHTML, data, layout);
}
