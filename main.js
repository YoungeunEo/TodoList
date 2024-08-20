let date = new Date();  //현재날짜를 기준으로 date 객체 생성
let selectedDate = null; //선택된 날짜를 저장할 변수
let todos = {}; // 날짜별 투두리스트를 저장할 객체
const modal = document.querySelector('.modal'); // 모달을 전역에서 사용할 수 있도록 변경


//모달 보이고,숨기도록 하는 함수
const showModal = () => {
    modal.style.display = 'block';
};

const hideModal = () => {
    modal.style.display = 'none';
};



// 캘린더 관련 코드
const renderCalender = () => {
    const viewYear = date.getFullYear();
    const viewMonth = date.getMonth();
// 캘린더 상단에 연도, 월 표시
    document.querySelector('.year-month').textContent = `${viewYear}년 ${viewMonth + 1}월`;
// 이전달 마지막 날과 현재달 마지막 날 계산
    const prevLast = new Date(viewYear, viewMonth, 0);
    const thisLast = new Date(viewYear, viewMonth + 1, 0);

    const PLDate = prevLast.getDate();  // 이전 달의 마지막 날
    const PLDay = prevLast.getDay();    // 이전 달 마지막 날의 요일

    const TLDate = thisLast.getDate();  // 현재 달의 마지막 날
    const TLDay = thisLast.getDay();    // 현재 달의 마지막 날 요일

    const prevDates = [];  // 이전 달 날짜 배열
    const thisDates = [...Array(TLDate).keys()].map(i => i + 1);  //현재 달 날짜 배열
    const nextDates = [];  // 다음 달 날짜 배열


    // 이전 달 날짜 채우기
    if (PLDay !== 6) {
        for (let i = 0; i < PLDay + 1; i++) {
            prevDates.unshift(PLDate - i);
        }
    }
  // 다음 달 날짜 채우기
    for (let i = 1; i < 7 - TLDay; i++) {
        nextDates.push(i);
    }
// 전체 날짜 배열 합치기
    const dates = prevDates.concat(thisDates, nextDates);
    const firstDateIndex = dates.indexOf(1);
    const lastDateIndex = dates.lastIndexOf(TLDate);
// 날짜를 html로 변환
    const datesHTML = dates.map((date, i) => {
        const condition = i >= firstDateIndex && i <= lastDateIndex ? 'this' : 'other';
        return `<div class="date" data-date="${date}"><span class="${condition}">${date}</span></div>`;
    }).join('');

    document.querySelector('.dates').innerHTML = datesHTML;

    //오늘 날짜 강조
    const today = new Date();
    if (viewMonth === today.getMonth() && viewYear === today.getFullYear()) {
        for (let dateElem of document.querySelectorAll('.this')) {
            if (+dateElem.innerText === today.getDate()) {
                dateElem.classList.add('today');
                break;
            }
        }
    }
};

renderCalender();
// 이전달로 이동
const prevMonth = () => {
    date.setMonth(date.getMonth() - 1);
    renderCalender();
};
// 다음달로 이동
const nextMonth = () => {
    date.setMonth(date.getMonth() + 1);
    renderCalender();
};
// 오늘로 이동
const goToday = () => {
    date = new Date();
    renderCalender();
};



// 투두리스트 관련 코드
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const ul = document.getElementById('todo-list');

//투두리스트를 로컬 스토리지에 저장하는 함수
const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
};
// 로컬 스토리지에서 로드
const loadTodos = () => {
    const storedTodos = JSON.parse(localStorage.getItem('todos'));
    if (storedTodos) {
        todos = storedTodos;
    }
};
// 선택된 날짜의 투두리스트를 렌더링
const renderTodos = () => {
    ul.innerHTML = '';  // 기존 리스트 클리어
    if (selectedDate && todos[selectedDate]) {
        todos[selectedDate].forEach(todo => {
            addTodoItem(todo);  // 각 투두항목을 리스트에 추가
        });
    }
};



// 투두리스트 항목 추가
const addTodoItem = (todo) => {
    if (todo.text !== '') {
        const li = document.createElement('li');
        const delButton = document.createElement('button');
        const editButton = document.createElement('button');
        const completeButton = document.createElement('button');
        const span = document.createElement('span');

        span.innerText = todo.text;
        delButton.innerText = '삭제';
        editButton.innerText = '수정';
        completeButton.innerText = '달성';

        delButton.classList.add('del-btn');
        editButton.classList.add('edit-btn');
        completeButton.classList.add('complete-btn');
//이벤트리스너 추가
        delButton.addEventListener('click', () => {
            deleteTodoItem(todo.id);
        });
        editButton.addEventListener('click', () => {
            editTodoItem(todo.id);
        });
        completeButton.addEventListener('click', () => {
            toggleCompleteTodoItem(todo.id); 
        });

        li.appendChild(span);
        li.appendChild(delButton);
        li.appendChild(editButton);
        li.appendChild(completeButton);
        ul.appendChild(li);
        li.id = todo.id;
        if (todo.completed) {
            li.classList.add('completed');
             // 항목이 이미 달성된 상태라면 스타일 적용
        }
    }
};

//투두리스트 삭제
const deleteTodoItem = (id) => {
    if (selectedDate && todos[selectedDate]) {
        todos[selectedDate] = todos[selectedDate].filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
};

//투두리스트 수정
const editTodoItem = (id) => {
    if (selectedDate && todos[selectedDate]) {
        const todo = todos[selectedDate].find(todo => todo.id === id);
        if (todo) {
            const newText = prompt("수정할 내용을 입력하세요!", todo.text);
            if (newText) {
                todo.text = newText;
                saveTodos();
                renderTodos();
            }
        }
    }
};


// 투두리스트 달성
const toggleCompleteTodoItem = (id) => {
    if (selectedDate && todos[selectedDate]) {
        const todo = todos[selectedDate].find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed; // 달성 상태를 반전
            saveTodos(); // 변경된 상태를 저장
            renderTodos(); // 업데이트된 리스트 렌더링
        }
    }
};

//투두리스트 폼 제출시 호출
const handleFormSubmit = (event) => {
    event.preventDefault();
    if (selectedDate && input.value) {
        const todo = {
            id: Date.now(),
            text: input.value
            
        };
     todo.completed = false; 
        if (!todos[selectedDate]) {
            todos[selectedDate] = [];
        }
        todos[selectedDate].push(todo);
        saveTodos();
        addTodoItem(todo);  //리스트에 새로운 항목 추가
        input.value = '';   // 입력 필드 초기화
    }
};

form.addEventListener('submit', handleFormSubmit);

const init = () => {
    loadTodos();
    renderCalender();
};

init();



// 모달 관련 코드
document.addEventListener('DOMContentLoaded', function() {
    const datesContainer = document.querySelector('.dates');
    const closeModalButton = document.querySelector('.close');

    datesContainer.addEventListener('click', function(event) {
        const dateElement = event.target.closest('.date');
        if (dateElement) {
            const day = dateElement.dataset.date;
            selectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            renderTodos();
            showModal();   // 모달 열기
        }
    });
// 모달 닫기 클릭시 모달 숨기기

    closeModalButton.onclick = function() {
        hideModal(); // 모달 닫기
    };

    // 모달 외부 클릭시 모달 숨기기
    window.onclick = function(event) {
        if (event.target === modal) {
            hideModal(); // 모달 닫기
        }
    };
});
