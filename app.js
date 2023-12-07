const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts } = require('./utils/conctact');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());
app.get('/', (req, res) => {
  res.status(200);
  const mahasiswa = [
    {
      nama: 'Asep',
      email: 'asep@gmail.com',
    },

    {
      nama: 'Usro',
      email: 'usro@gmail.com',
    },
  ];

  res.render('index', {
    nama: 'Moh Hasbi',
    title: 'Halaman Index',
    mahasiswa: mahasiswa,
    layout: 'layouts/main-layouts',
  });
  // res.sendFile('./index.html',{root: __dirname})
});

app.get('/about', (req, res) => {
  res.status(200);
  res.render('about', {
    layout: 'layouts/main-layouts',
    title: 'Halaman About',
  });
});

app.get('/contact', (req, res) => {
  const contacts = loadContact();
  res.status(200);
  res.render('contact', {
    layout: 'layouts/main-layouts',
    title: 'Halaman Contact',
    contacts,
    msg: req.flash('msg'),
  });
});

app.get('/contact/add', (req, res) => {
  res.status(200);
  res.render('add-contact', {
    layout: 'layouts/main-layouts',
    title: 'Form Tambah Data Contact',
  });
});

app.post(
  '/contact',
  [
    body('nama').custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'email tidak valid!').isEmail(),
    check('nohp', 'no hp tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render('add-contact', {
        layout: 'layouts/main-layouts',
        title: 'Form Tambah Data Contact',
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      req.flash('msg', 'Data berhasil ditambahkan');
      res.redirect('/contact');
    }
  }
);

app.get('/contact/delete/:nama', (req, res) => {
  const contacts = findContact(req.params.nama);
  res.status(200);
  if (!contacts) {
    res.status(404);
    res.send('<h1>404</h1>');
  } else {
    deleteContact(req.params.nama);
    req.flash('msg', 'Data berhasil dihapus');
    res.redirect('/contact');
  }
});

app.get('/contact/:nama', (req, res) => {
  const contacts = findContact(req.params.nama);
  res.status(200);
  res.render('detail', {
    layout: 'layouts/main-layouts',
    title: 'Halaman Detail Contact',
    contacts,
  });
});

app.get('/contact/update/:nama', (req, res) => {
  const contacts = findContact(req.params.nama);
  res.status(200);
  res.render('edit-contact', {
    layout: 'layouts/main-layouts',
    title: 'Form Ubah Data Contact',
    contacts,
  });
});

app.post(
  '/contact/update',
  [
    body('nama').custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'email tidak valid!').isEmail(),
    check('nohp', 'no hp tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render('edit-contact', {
        layout: 'layouts/main-layouts',
        title: 'Form Ubah Data Contact',
        errors: errors.array(),
        contacts: req.body,
      });
    } else {
      updateContacts(req.body);
      req.flash('msg', 'Data berhasil diubah');
      res.redirect('/contact');
    }
  }
);

app.use('/', (req, res) => {
  res.status(404);
  res.send('<h1>Halaman tidak ditemukan!</h1>');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
