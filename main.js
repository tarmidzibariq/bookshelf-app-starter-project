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

// addBook()
const addBook = () => {
    const bookFormTitle = document.querySelector('#bookFormTitle').value;
    const bookFormAuthor = document.querySelector('#bookFormAuthor').value;
    const bookFormYear = document.querySelector('#bookFormYear').value;
    const bookFormIsComplete = document.querySelector('#bookFormIsComplete').checked;

    const generatedID = generateID();

    const bookObject = {
        id: generatedID,
        title: bookFormTitle,
        author: bookFormAuthor,
        year: Number(bookFormYear),
        isCompleted: bookFormIsComplete,
    };
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
};

// generate ID
function generateID() {
    return +new Date();
}

// simpan data buku
const books = [];

// edit ID
let editingId = null;

// CREATE EVENT
const RENDER_EVENT = 'render-book';

document.addEventListener(RENDER_EVENT, () => {
    const incompleteBookList = document.querySelector('#incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.querySelector('#completeBookList');
    completeBookList.innerHTML = '';

    for (const item of books) {
        const bookElements = makeBook(item);

        if (!item.isCompleted) {
            incompleteBookList.append(bookElements);
        } else {
            completeBookList.append(bookElements);
        }

    }
});

const makeBook = (bookObject) => {

    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-bookid', bookObject.id);
    wrapper.setAttribute('data-testid', 'bookItem');

    wrapper.innerHTML = `
    <h3 data-testid="bookItemTitle">${bookObject.title}</h3>
    <p data-testid="bookItemAuthor">Penulis: ${bookObject.author}</p>
    <p data-testid="bookItemYear">Tahun: ${bookObject.year}</p>
    <div>
        <button data-testid="bookItemIsCompleteButton">${bookObject.isCompleted ? 'Belum selesai ' : 'Sudah dibaca'}</button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
    </div>
    `;

    // ambil tombol2 setelah innerHTML dipasang
    const [btnToggle, btnDelete, btnEdit] = wrapper.querySelectorAll('button');

    // gunakan helper
    btnToggle.addEventListener('click', () => toggleBookStatus(bookObject.id));
    btnDelete.addEventListener('click', () => deleteBook(bookObject.id));
    btnEdit.addEventListener('click', () => startEditBook(bookObject.id));


    return wrapper;
};

// TOOGLE BOOK STATUS
const toggleBookStatus = (id) => {

    const book = books.find(b => b.id === id);
    if (!book) return;

    book.isCompleted = !book.isCompleted;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
};

// DELETE BOOK
const deleteBook = (id) => {
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return; 

    books.splice(idx, 1);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
};


// SIMPAN DATA KE LOCAL WEB STORAGE
const saveData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
};
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

const isStorageExist = () => {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung web storage');
        return false;
    }
    return true;
};

const loadDataFromStorage = () => {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);
    if (data !== null) {
        for (const item of data) {
            books.push(item);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
};

const searchBook = () => {
    const query = document.querySelector('#searchBookTitle').value.toLowerCase();

    const incompleteBookList = document.querySelector('#incompleteBookList');
    const completeBookList = document.querySelector('#completeBookList');
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    for (const book of books) {
        // cek apakah judul mengandung kata pencarian
        if (book.title.toLowerCase().includes(query)) {
            const bookElement = makeBook(book);

            if (!book.isCompleted) {
                incompleteBookList.append(bookElement);
            } else {
                completeBookList.append(bookElement);
            }
        }
    }
}


// EDIT BUKU
function startEditBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;

    // isi form dengan data buku
    document.querySelector('#bookFormTitle').value = book.title;
    document.querySelector('#bookFormAuthor').value = book.author;
    document.querySelector('#bookFormYear').value = book.year;
    document.querySelector('#bookFormIsComplete').checked = book.isCompleted;

    // ubah state & tampilan tombol submit
    editingId = id;
    const submitBtn = document.querySelector('#bookFormSubmit');
    submitBtn.textContent = 'Simpan Perubahan';


    document.querySelector('#bookFormTitle').focus();
}

function saveEdit() {
    const title = document.querySelector('#bookFormTitle').value.trim();
    const author = document.querySelector('#bookFormAuthor').value.trim();
    const year = Number(document.querySelector('#bookFormYear').value);
    const isCompleted = document.querySelector('#bookFormIsComplete').checked;

    const book = books.find(b => b.id === editingId);
    if (!book) return;

    // update field buku
    book.title = title;
    book.author = author;
    book.year = year;
    book.isCompleted = isCompleted;

    // reset mode edit
    editingId = null;
    const form = document.querySelector('#bookForm');
    form.reset();

    const submitBtn = document.querySelector('#bookFormSubmit');
    submitBtn.textContent = 'Masukkan Buku ke rak Belum selesai dibaca';

    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}