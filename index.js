const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const index = express();
const PORT = 3000;
const DATA_FILE = 'note.json';

index.use(bodyParser.json());

////////////// Lấy all sp (phân trang, tìm kiếm từ khóa"trong ten", sắp xếp)///
index.get('/v1/products', (req, res) => {
  var page = parseInt(req.query.page) || 1;
  var page_size = parseInt(req.query.page_size) || 10;//10 sp 1 trang
  var key_search = req.query.name || '';
  var sort = req.query.sort || 'id';
  var note = JSON.parse(fs.readFileSync(DATA_FILE));
   
   //phân trang 1 trang có 10sp
   const start = (page - 1) * page_size;
   const end = page * page_size;
  // tìm kiếm theo ký tự trong ten 

  let products = note.products.filter(
    p => p.name.toLowerCase().includes(
      key_search.toLowerCase()
      ));
     // console.log('seart sp:', products);

      //sắp xếp tang dan
  products = products.sort(
    (a, b) => 
    (a[sort] > b[sort]) ? 1 : -1);
 
  const results = products.slice(start, end);

  res.status(200).json(results);
});

// //////////// Lấy 1 sản phẩm theo id //////////////
index.get('/v1/products/:id', (req, res) => {
  const id = parseInt(req.params.id);//check id
  const note = JSON.parse(fs.readFileSync(DATA_FILE));//đọc file 
  
  const p = note.products.find(p => p.id === id);
  //fall thì ra null
  if (!p) {
    res.status(404).json({ message: 'sp--nul' });
    return;
  }
  //true thì trả ra kq
  res.status(200).json(p);
});

// /////// creat//////////////
index.post('/v1/products', (req, res) => {
  const { name, price } = req.body;
  const note = JSON.parse(fs.readFileSync(DATA_FILE));
  
  const new_product = { 
    id: note.products.length + 1, name, price };
  note.products.push(new_product);//thêm
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(note));//ghi vào file

 
  
  res.status(201).json({ 
    message: 'creat susses', product: new_product });
});

///// update//////////
index.put('/v1/products/:id', (req, res) => {
  var id = parseInt(req.params.id);// lay id 
  const { name, price } = req.body;
  const note = JSON.parse(fs.readFileSync(DATA_FILE));
  
  const p = note.products.find(p => p.id === id);
  
  if (!p) {
    res.status(404).json({ 
      message: 'sp--null' });
    return;
  }
  //check them
  p.name = name;
  p.price = price;
  fs.writeFileSync(DATA_FILE, JSON.stringify(note));

  
  res.status(200).json({ 
    message: 'update susses', product: p });
});


/// delete?????????//////////

index.delete('/v1/products/:id', (req, res) => {
  var id = parseInt(req.params.id);

  const note = JSON.parse(fs.readFileSync(DATA_FILE));
  
  const product_index = note.products.findIndex(p => p.id === id);
  
  if (product_index === -1) {
    res.status(404).json({
       message: 'sp--null' });
    return;
  }
  
  note.products.splice(product_index, 1);
  //ghi vào file
  fs.writeFileSync(DATA_FILE, JSON.stringify(note));

  
  res.status(200).json({
     message: 'delete susses' });
});

index.listen(PORT, () => {
  console.log(`run port ${PORT}`);
});
