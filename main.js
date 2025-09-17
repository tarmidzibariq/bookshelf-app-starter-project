// Do your work here...
document.addEventListener('DOMContentLoaded', () => {

  // ADD BOOK
  const form = document.querySelector('#bookForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (editingId === null) {
      addBook(); // mode tambah
    } else {
      saveEdit(); // mode edit
    }
  });

  // SEARCH BOOK
  const searchForm = document.querySelector('#searchBook');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchBook();
  });

  // LOCAL STORAGE
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// generate ID
function generateID() {
  return +new Date();
}

// state
const books = [];
let editingId = null;

// EVENTS
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

// ADD BOOK
const addBook = () => {
  const title = document.querySelector('#bookFormTitle').value;
  const author = document.querySelector('#bookFormAuthor').value;
  const year = Number(document.querySelector('#bookFormYear').value);
  const isComplete = document.querySelector('#bookFormIsComplete').checked;

  const bookObject = {
    id: generateID(),
    title,
    author,
    year,
    isComplete, // ✅ sesuai spesifikasi
  };

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// RENDER LIST
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.querySelector('#incompleteBookList');
  const completeBookList = document.querySelector('#completeBookList');
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const item of books) {
    const bookElements = makeBook(item);
    if (!item.isComplete) {
      incompleteBookList.append(bookElements);
    } else {
      completeBookList.append(bookElements);
    }
  }
});

// ITEM TEMPLATE
const makeBook = (bookObject) => {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-bookid', bookObject.id);
  wrapper.setAttribute('data-testid', 'bookItem');

  wrapper.innerHTML = `
    <h3 data-testid="bookItemTitle">${bookObject.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${bookObject.author}</p>
    <p data-testid="bookItemYear">Tahun: ${bookObject.year}</p>
    <div>
      <button data-testid="bookItemIsCompleteButton">
        ${bookObject.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
      </button>
      <button data-testid="bookItemDeleteButton">Hapus Buku</button>
      <button data-testid="bookItemEditButton">Edit Buku</button>
    </div>
  `;

  const btnToggle = wrapper.querySelector('[data-testid="bookItemIsCompleteButton"]');
  const btnDelete = wrapper.querySelector('[data-testid="bookItemDeleteButton"]');
  const btnEdit   = wrapper.querySelector('[data-testid="bookItemEditButton"]');

  btnToggle.addEventListener('click', () => toggleBookStatus(bookObject.id));
  btnDelete.addEventListener('click', () => deleteBook(bookObject.id));
  btnEdit.addEventListener('click', () => startEditBook(bookObject.id));

  return wrapper;
};

// TOGGLE STATUS
const toggleBookStatus = (id) => {
  const book = books.find(b => b.id === id);
  if (!book) return;
  book.isComplete = !book.isComplete;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// DELETE BOOK
const deleteBook = (id) => {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) return;
  books.splice(idx, 1);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// STORAGE
const saveData = () => {
  if (!isStorageExist()) return;

  // Simpan persis sesuai skema yang diminta (isComplete)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  document.dispatchEvent(new Event(SAVED_EVENT));
};

const isStorageExist = () => {
  if (typeof Storage === 'undefined') {
    alert('Browser tidak mendukung web storage');
    return false;
  }
  return true;
};

const loadDataFromStorage = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(raw) || [];

  // Normalisasi: terima data lama (isCompleted) & baru (isComplete)
  for (const item of data) {
    books.push({
      id: item.id,
      title: item.title,
      author: item.author,
      year: item.year,
      isComplete: item.isComplete ?? item.isCompleted ?? false,
    });
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// SEARCH
const searchBook = () => {
  const query = document.querySelector('#searchBookTitle').value.toLowerCase();

  const incompleteBookList = document.querySelector('#incompleteBookList');
  const completeBookList = document.querySelector('#completeBookList');
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const book of books) {
    if (book.title.toLowerCase().includes(query)) {
      const bookElement = makeBook(book);
      if (!book.isComplete) {
        incompleteBookList.append(bookElement);
      } else {
        completeBookList.append(bookElement);
      }
    }
  }
};

// EDIT
function startEditBook(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  document.querySelector('#bookFormTitle').value = book.title;
  document.querySelector('#bookFormAuthor').value = book.author;
  document.querySelector('#bookFormYear').value = book.year;
  document.querySelector('#bookFormIsComplete').checked = book.isComplete;

  editingId = id;
  const submitBtn = document.querySelector('#bookFormSubmit');
  submitBtn.textContent = 'Simpan Perubahan';
  document.querySelector('#bookFormTitle').focus();
}

function saveEdit() {
  const title = document.querySelector('#bookFormTitle').value.trim();
  const author = document.querySelector('#bookFormAuthor').value.trim();
  const year = Number(document.querySelector('#bookFormYear').value);
  const isComplete = document.querySelector('#bookFormIsComplete').checked;

  const book = books.find(b => b.id === editingId);
  if (!book) return;

  book.title = title;
  book.author = author;
  book.year = year;
  book.isComplete = isComplete;

  editingId = null;
  const form = document.querySelector('#bookForm');
  form.reset();

  const submitBtn = document.querySelector('#bookFormSubmit');
  submitBtn.textContent = 'Masukkan Buku ke rak Belum selesai dibaca';

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}
