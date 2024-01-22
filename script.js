"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
  locale: "de-DE",
  currency: "EUR",
};

const account2 = {
  owner: "Umar Ibn",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  locale: "ar-SY",
  currency: "SAR",
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  locale: "en-GB",
  currency: "GBP",
};

const account4 = {
  owner: "Asilbek Saidov",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  locale: "en-US",
  currency: "USD",
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Function

const formatCur = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// Function for Timer
const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    time--;
  };

  // Setting time
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Methods

const displayMovements = (movements, sort = false) => {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? "deposit" : "withdrawal";

    // Internationalize Numbers

    const formattedMov = formatCur(
      mov,
      currentAccount.locale,
      currentAccount.currency
    );

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${date} ${checkMonth()} ${year}, ${hour}:${minute}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

/////////////////////////////////////////////////////////////

const calcPrintBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

////////////////////////////////////////////////////////////

const calcDisplaySummary = (acc) => {
  ///
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);

  ///
  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  ///
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

///////////////////////////////////////////////////////////////

const createUserNames = (accs) => {
  accs.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => {
        return name[0];
      })
      .join("");
  });
};

//////////////////////////////////////////////////////

createUserNames(accounts);

const updateUI = (acc) => {
  // Display movements
  displayMovements(acc.movements);
  // Display balance
  calcPrintBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////////////////////////

// Event handlers

let currentAccount, timer;

btnLogin.addEventListener("click", (e) => {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);
  if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
    // Clear input fields

    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    containerApp.style.opacity = 100;

    // Timer
    if (timer) clearInterval(timer);

    timer = startLogOutTimer();

    // Update Ui
    updateUI(currentAccount);

    // Experimenting API

    const now = new Date();
    const options = {
      day: "numeric",
      month: "long",
      weekday: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
  } else {
    labelWelcome.textContent = `Sorry this kind of user do not found!`;
  }
});

////////////////////////////////////////////////////////////

btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find((acc) => {
    return acc.username === inputTransferTo.value;
  });

  // Clear input fields

  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer

    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update Ui
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

////////////////////////////////////////////////////////

btnLoan.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = Math.round(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      // Update Ui
      updateUI(currentAccount);
    }, 5000);
    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    setTimeout(() => {
      alert("Sorry we cannot give you such amount of loan!");
    }, 2000);
  }
  inputLoanAmount.value = "";
});

///////////////////////////////////////////////////////

btnClose.addEventListener("click", (e) => {
  e.preventDefault();

  // inputCloseUsername.value = inputClosePin.value = "";

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex((acc) => {
      return acc.username === inputCloseUsername.value;
    });
    console.log(index);

    // Delete user from array

    accounts.splice(index, 1);
    console.log(accounts);
    // Hide Ui

    containerApp.style.opacity = 0;
  } else {
    alert("Sorry the username and pin you entered are not correct");
  }
  // Clear input

  inputCloseUsername.value = inputClosePin.value = "";
});

///////////////////////////////////////////////////////////
let sorted = false;
btnSort.addEventListener("click", (e) => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

//////////////////////////////////////////////////////////////

// Full Date

const date = `${new Date().getDate()}`.padStart(2, 0);
const year = new Date().getFullYear();
const hour = new Date().getHours();
const minute = new Date().getMinutes();
// labelDate.textContent = `${date}/${month}/${year}, ${hour}:${minute}`;

//  Switch Case

const checkMonth = () => {
  const newMonth = new Date().getMonth() + 1;
  let result;
  switch (newMonth) {
    case 1:
      result = "January";
      break;
    case 2:
      result = "February";
      break;
    case 3:
      result = "March";
      break;
    case 4:
      result = "April";
      break;
    case 5:
      result = "May";
      break;
    case 6:
      result = "June";
      break;
    case 7:
      result = "July";
      break;
    case 8:
      result = "August";
      break;
    case 9:
      result = "September";
      break;
    case 10:
      result = "October";
      break;
    case 11:
      result = "November";
      break;
    case 12:
      result = "December";
      break;
  }
  return result;
};

//////////////////////////////////////////////////////////////

// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

/* labelBalance.addEventListener("click", () => {
  [...document.querySelectorAll(".movements__row")].forEach((row, i) => {
    if (i % 2 === 0) {
      row.style.backgroundColor = "orange";
    }
  });
}); */

// Using Flat and Chaining only

/* const accountsMovements = accounts
  .map((acc) => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov);
 
console.log(accountsMovements); */

//  2nd Way using flatMap

/* const allMovements = accounts
  .flatMap((acc) => acc.movements)
  .reduce((acc, mov) => acc + mov);
console.log(allMovements); */

////////////////////////////////////////////////////////////////////////////////

/* labelBalance.addEventListener("click", () => {
  const movementsUI = Array.from(
    document.querySelectorAll(".movements__value"),
    (el) => Number(el.textContent.replace("€", ""))
  );
  console.log(movementsUI);
});
 */
