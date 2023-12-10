const productSelect = document.querySelector('.productSelect');
const productWrap = document.querySelector('.productWrap');
const shoppingCartTable = document.querySelector('.shoppingCart-table');
const cartList = document.querySelector('.shoppingCart-table-list');
const discardAllBtn = document.querySelector('.discardAllBtn');
const jsTotal = document.querySelector('.js-total');

//取得產品列表
let productData;
function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
        .then(function(response){
            productData = response.data.products;
            renderProductList(productData);
        })
        .catch(function (error) {
            console.log(error);
        })
};
//取得購物車清單
let cartData;
let finalTotalPrice;
function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function(response) {
            cartData = response.data.carts;
            finalTotalPrice = response.data.finalTotal;
            renderCartList();
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
};



getCartList();
getProductList();

//render產品列表
function renderProductList(data) {
    let str = '';
    data.forEach(function(item){
        let content = `
            <li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" data-id="${item.id}" class="addCardBtn">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
            </li>
        `;
        str += content;
    })
    productWrap.innerHTML = str;
}

//render購物車列表
function renderCartList() {
    let str = '';
    cartData.forEach(function(item) {
        let content = `
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${item.product.price}</td>
                <td>${item.quantity}</td>
                <td>NT$${item.product.price * item.quantity}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-delId="${item.id}">
                        clear
                    </a>
                </td>
            </tr>
        `;
        str += content;
    })
    cartList.innerHTML = str;
    jsTotal.textContent = finalTotalPrice;
}

//篩選器邏輯
productSelect.addEventListener('change', function(e){
    let allCategory = productData.filter(function(){
        return e.target.value == '全部'
    })
    let filterCategory = productData.filter(function(item){
        return e.target.value == item.category;
    })
    if(e.target.value == '全部'){
        renderProductList(allCategory)
    }else{
        renderProductList(filterCategory)
    }
})

//加入購物車邏輯
productWrap.addEventListener('click', function(e) {
    e.preventDefault();
    if(e.target.getAttribute("class") !== 'addCardBtn'){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    let numCheck = 1;

    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck  = item.quantity += 1;
        }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function(response){
        getCartList();
    })
});

//刪除購物車品項
cartList.addEventListener('click', function(e){
    e.preventDefault();
    if(e.target.getAttribute("class") !== "material-icons"){
        return;
    }
    let delCartItemId = e.target.getAttribute("data-delid")
    console.log(delCartItemId);

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${delCartItemId}`)
        .then(function(response){
            console.log(response);
            alert("已刪除品項");
            getCartList();
        })
});

//刪除購物車所有品項
discardAllBtn.addEventListener('click', function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then(function(response){
            console.log(response);
            alert("購物車清空成功");
            getCartList();
        })
        .catch(function(response){
            alert("購物車已清空！")
        })
})

//送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');

orderInfoBtn.addEventListener('click', function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert('請加入購物車');
        return;
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;
    if(customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == '' || tradeWay == ''){
        alert('請填入正確資訊');
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": tradeWay
            }
        }
    }).then(function(response){
        alert('訂單建立成功');
        getCartList();
    })
})

