const searchBar = document.getElementById('searchBar')
const selectTabLimit = document.getElementById('selectTabLimit');
const loadingText = document.getElementById('loadingText');
const fetchContainer = document.getElementById('fetchContainer');
const pageNumber = document.getElementById('pageNumber');
let fetchResult = [];
let searchInput = ''
let tabLimit = 10;
let toDoListPage = 1;

const getToDoList = async () => {
    loadingText.classList.add('show-up');

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        fetchResult = await response.json();

        renderToDoListToFetchContainer(fetchResult);
        loadingText.classList.remove('show-up');

    } catch (err) {
        console.error("To do list cannot be fetched :(");
    };
};

const getAuthorList = async (slicedTodolist) => {
    try {
        const slicedResponses = slicedTodolist.map((toDoTab) =>
            fetch(`https://jsonplaceholder.typicode.com/users/${toDoTab.userId}`)
        );
        const responses = await Promise.all(slicedResponses);
        const authorResults = responses.map((result) => result.json());
        const authorList = await Promise.all(authorResults);

        const toDoAndAuthorList = slicedTodolist.map((toDoTab, index) => ({...toDoTab, ...authorList[index]}));

        return toDoAndAuthorList;

    } catch (err) {
        console.error("Author list cannot be fetched :(")
    }
};

const renderToDoListToFetchContainer = async (toDoList) => {
    if (searchInput !== '') {
        toDoList = fetchResult.filter((toDoTab) => {
            return toDoTab.title.toLowerCase().includes(searchInput.toLowerCase());
        });
    }    
    
    const slicedTodolist = toDoList.slice((toDoListPage - 1) * tabLimit, (toDoListPage * tabLimit));
    let listToRender = slicedTodolist;
    listToRender = await getAuthorList(slicedTodolist);

    let toDoTabs = "";
    listToRender.map((toDoTab) => {
        toDoTabs += 
        `<div class="fetch-box col-sm-6 col-lg-4">
            <div class="h-100 d-flex flex-column justify-content-center px-3 border bg-light text-center shadow-sm">
                <h2 class="fetch-title mt-3">${capitalizeTitle(toDoTab.title)}</h2>
                <p class="is-complete mb-2">${toDoTab.completed
                    ?`<span class="text-green">Completed</span>`
                    :`<span class="text-red">Not Complete`}</p>
                    <div class="author-info mb-3">
                    <p class="mb-0">Author: ${toDoTab.name}</p>
                    <p class="mb-0">Email: ${toDoTab.email}</p>
                    <p class="mb-0">Phone: ${toDoTab.phone}</p>
                </div>
            </div>
        </div>`
    });
    fetchContainer.innerHTML = toDoTabs;
    
    pageNumber.innerHTML = toDoListPage;
    disablePrevButton();
};

const capitalizeTitle = (title) => {
    let searchPattern = /(\w+)/ig;
    let matchedWords = title.match(searchPattern);
    let capitalizedWords = matchedWords.map((word) => {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    })
    return capitalizedWords.join(" ");
};

const disablePrevButton = () => {
    if(toDoListPage == 1){
        document.getElementById('prevButton').classList.add('disabled');
    } else {
        document.getElementById('prevButton').classList.remove('disabled');
    }
};

//load to do list when the page is open
window.addEventListener('load', function () {
	getToDoList();
});

//search tab by title name
searchBar.addEventListener('keyup', (e) => {
    searchInput = e.target.value;
    renderToDoListToFetchContainer(fetchResult);
});

//change tab limit per page
const changeTabLimit = (e) => {
    tabLimit = e.target.value;
    renderToDoListToFetchContainer(fetchResult);
};

//click previous and next button on page
const previousPage = () => {
    if (toDoListPage > 1) {
        toDoListPage--;
        renderToDoListToFetchContainer(fetchResult);
    } else {
        console.error('cannot load the previous page: minimum page has been reached.');
    };
};
const nextPage = () => {
    toDoListPage++;
    renderToDoListToFetchContainer(fetchResult);
};




