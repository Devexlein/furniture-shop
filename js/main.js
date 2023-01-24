

/* Проверка мобильного браузера */
let isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };
/* Добавление класса touch для HTML если браузер мобильный */
function addTouchClass() {
   if (isMobile.any()) document.documentElement.classList.add('touch');
}

// Убрать класс из всех элементов массива
function removeClasses(array, className) {
   for (var i = 0; i < array.length; i++) {
      array[i].classList.remove(className);
   }
}

// Отслеживание события click
window.onload = function () {
   document.addEventListener("click", documentActions);

   // Actions (делегирование события click)
   function documentActions(e) {
      const targetElement = e.target;
      if (window.innerWidth > 768 && isMobile.any()) {
         if (targetElement.classList.contains('menu__arrow')) {
            targetElement.closest('.menu__item').classList.toggle('_hover');
         }
         // убираем класс при клике вне области меню
         if (!targetElement.closest('.menu__item') && document.querySelectorAll('.menu__item._hover').length > 0) {
            removeClasses(document.querySelectorAll('.menu__item._hover'), "_hover");
         }
      }

      if (targetElement.classList.contains('search-form__icon')) {
         document.querySelector('.search-form').classList.toggle('_active');
      } else if (!targetElement.closest('.search-form') && document.querySelectorAll('.search-form._active').length > 0) {
         document.querySelector('.search-form').classList.remove('_active');
      }
   }
}

// Модуль работы со спойлерами =======================================================================================================================================================================================================================
/*
Для родителя слойлеров пишем атрибут data-spollers
Для заголовков слойлеров пишем атрибут data-spoller
Если нужно включать\выключать работу спойлеров на разных размерах экранов
пишем параметры ширины и типа брейкпоинта.
 
Например: 
data-spollers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
data-spollers="768,min" - спойлеры будут работать только на экранах больше или равно 768px
 
Если нужно что бы в блоке открывался болько один слойлер добавляем атрибут data-one-spoller
*/
let func = function spollers() {
   const spollersArray = document.querySelectorAll('[data-spollers]');
   if (spollersArray.length > 0) {
      // Получение обычных слойлеров
      const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
         return !item.dataset.spollers.split(",")[0];
      });
      // Инициализация обычных слойлеров
      if (spollersRegular.length) {
         initSpollers(spollersRegular);
      }
      // Получение слойлеров с медиа запросами
      let mdQueriesArray = dataMediaQueries(spollersArray, "spollers");
      if (mdQueriesArray && mdQueriesArray.length) {
         mdQueriesArray.forEach(mdQueriesItem => {
            // Событие
            mdQueriesItem.matchMedia.addEventListener("change", function () {
               initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
            });
            initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
         });
      }

      // Инициализация
      function initSpollers(spollersArray, matchMedia = false) {
         spollersArray.forEach(spollersBlock => {
            spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
            if (matchMedia.matches || !matchMedia) {
               spollersBlock.classList.add('_spoller-init');
               initSpollerBody(spollersBlock);
               spollersBlock.addEventListener("click", setSpollerAction);
            } else {
               spollersBlock.classList.remove('_spoller-init');
               initSpollerBody(spollersBlock, false);
               spollersBlock.removeEventListener("click", setSpollerAction);
            }
         });
      }
      // Работа с контентом
      function initSpollerBody(spollersBlock, hideSpollerBody = true) {
         const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
         if (spollerTitles.length > 0) {
            spollerTitles.forEach(spollerTitle => {
               if (hideSpollerBody) {
                  spollerTitle.removeAttribute('tabindex');
                  if (!spollerTitle.classList.contains('_spoller-active')) {
                     spollerTitle.nextElementSibling.hidden = true;
                  }
               } else {
                  spollerTitle.setAttribute('tabindex', '-1');
                  spollerTitle.nextElementSibling.hidden = false;
               }
            });
         }
      }
      function setSpollerAction(e) {
         const el = e.target;
         if (el.closest('[data-spoller]')) {
            const spollerTitle = el.closest('[data-spoller]');
            const spollersBlock = spollerTitle.closest('[data-spollers]');
            const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
            if (!spollersBlock.querySelectorAll('._slide').length) {
               if (oneSpoller && !spollerTitle.classList.contains('_spoller-active')) {
                  hideSpollersBody(spollersBlock);
               }
               spollerTitle.classList.toggle('_spoller-active');
               _slideToggle(spollerTitle.nextElementSibling, 500);
            }
            e.preventDefault();
         }
      }
      function hideSpollersBody(spollersBlock) {
         const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._spoller-active');
         if (spollerActiveTitle) {
            spollerActiveTitle.classList.remove('_spoller-active');
            _slideUp(spollerActiveTitle.nextElementSibling, 500);
         }
      }
   }
}

// Модуль работы с меню (бургер) =======================================================================================================================================================================================================================
function menuInit() {
   let iconMenu = document.querySelector(".icon-menu");
   if (iconMenu) {
      iconMenu.addEventListener("click", function (e) {
         if (bodyLockStatus) {
            bodyLockToggle();
            document.documentElement.classList.toggle("menu-open");
         }
      });
   };
}
function menuOpen() {
   bodyLock();
   document.documentElement.classList.add("menu-open");
}
function menuClose() {
   bodyUnlock();
   document.documentElement.classList.remove("menu-open");
}

// Модуль работы с формой ===============================================================================================================================================================================================================================================================================================================================

/*
Чтобы поле участвовало в валидации добавляем атрибут data-required
Особые проверки:
data-required="email" - вадидация E-mail

Чтобы поле валидировалось при потере фокуса, 
к атрибуту data-required добавляем атрибут data-validate

Чтобы вывести текст ошибки, нужно указать его в атрибуте data-error

data-popup-message - указываем селектор попапа который нужно показать после отправки формы (режимы data-ajax или data-dev) ! необходимо подключить функционал попапов в app.js
data-ajax - отправляем данные формы AJAX запросом по адресу указанному в action методом указанным в method
data-dev - режим разработчика - эмитируем отправку формы
data-goto-error - прокрутить страницу к ошибке
*/

// Работа с полями формы. Добавление классов, работа с placeholder
function formFieldsInit() {
   const formFields = document.querySelectorAll('input[placeholder],textarea[placeholder]');
   if (formFields.length) {
      formFields.forEach(formField => {
         formField.dataset.placeholder = formField.placeholder;
      });
   }
   document.body.addEventListener("focusin", function (e) {
      const targetElement = e.target;
      if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
         if (targetElement.dataset.placeholder) {
            targetElement.placeholder = '';
         }
         targetElement.classList.add('_form-focus');
         targetElement.parentElement.classList.add('_form-focus');

         formValidate.removeError(targetElement);
      }
   });
   document.body.addEventListener("focusout", function (e) {
      const targetElement = e.target;
      if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
         if (targetElement.dataset.placeholder) {
            targetElement.placeholder = targetElement.dataset.placeholder;
         }
         targetElement.classList.remove('_form-focus');
         targetElement.parentElement.classList.remove('_form-focus');

         // Моментальная валидация
         if (targetElement.hasAttribute('data-validate')) {
            formValidate.validateInput(targetElement);
         }
      }
   });
}
// Валидация форм
let formValidate = {
   getErrors(form) {
      let error = 0;
      let formRequiredItems = form.querySelectorAll('*[data-required]');
      if (formRequiredItems.length) {
         formRequiredItems.forEach(formRequiredItem => {
            if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
               error += this.validateInput(formRequiredItem);
            }
         });
      }
      return error;
   },
   validateInput(formRequiredItem) {
      let error = 0;
      if (formRequiredItem.dataset.required === "email") {
         formRequiredItem.value = formRequiredItem.value.replace(" ", "");
         if (this.emailTest(formRequiredItem)) {
            this.addError(formRequiredItem);
            error++;
         } else {
            this.removeError(formRequiredItem);
         }
      } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
         this.addError(formRequiredItem);
         error++;
      } else {
         if (!formRequiredItem.value) {
            this.addError(formRequiredItem);
            error++;
         } else {
            this.removeError(formRequiredItem);
         }
      }
      return error;
   },
   addError(formRequiredItem) {
      formRequiredItem.classList.add('_form-error');
      formRequiredItem.parentElement.classList.add('_form-error');
      let inputError = formRequiredItem.parentElement.querySelector('.form__error');
      if (inputError) formRequiredItem.parentElement.removeChild(inputError);
      if (formRequiredItem.dataset.error) {
         formRequiredItem.parentElement.insertAdjacentHTML('beforeend', `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
      }
   },
   removeError(formRequiredItem) {
      formRequiredItem.classList.remove('_form-error');
      formRequiredItem.parentElement.classList.remove('_form-error');
      if (formRequiredItem.parentElement.querySelector('.form__error')) {
         formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector('.form__error'));
      }
   },
   formClean(form) {
      form.reset();
      setTimeout(() => {
         let inputs = form.querySelectorAll('input,textarea');
         for (let index = 0; index < inputs.length; index++) {
            const el = inputs[index];
            el.parentElement.classList.remove('_form-focus');
            el.classList.remove('_form-focus');
            formValidate.removeError(el);
            el.value = el.dataset.placeholder;
         }
         let checkboxes = form.querySelectorAll('.checkbox__input');
         if (checkboxes.length > 0) {
            for (let index = 0; index < checkboxes.length; index++) {
               const checkbox = checkboxes[index];
               checkbox.checked = false;
            }
         }
         if (formsModules.selectModule) {
            let selects = form.querySelectorAll('.select');
            if (selects.length) {
               for (let index = 0; index < selects.length; index++) {
                  const select = selects[index].querySelector('select');
                  formsModules.selectModule.selectBuild(select);
               }
            }
         }
      }, 0);
   },
   emailTest(formRequiredItem) {
      return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
   }
}
/* Отправка форм */
function formSubmit(validate) {
   const forms = document.forms;
   if (forms.length) {
      for (const form of forms) {
         form.addEventListener('submit', function (e) {
            const form = e.target;
            formSubmitAction(form, e);
         });
         form.addEventListener('reset', function (e) {
            const form = e.target;
            formValidate.formClean(form);
         });
      }
   }
   async function formSubmitAction(form, e) {
      const error = validate ? formValidate.getErrors(form) : 0;
      if (error === 0) {
         const ajax = form.hasAttribute('data-ajax');
         if (ajax) { // Если режим ajax
            e.preventDefault();
            const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
            const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
            const formData = new FormData(form);

            form.classList.add('_sending');
            const response = await fetch(formAction, {
               method: formMethod,
               body: formData
            });
            if (response.ok) {
               let responseResult = await response.json();
               form.classList.remove('_sending');
               formSent(form);
            } else {
               alert("Ошибка");
               form.classList.remove('_sending');
            }
         } else if (form.hasAttribute('data-dev')) {	// Если режим разработки
            e.preventDefault();
            formSent(form);
         }
      } else {
         e.preventDefault();
         const formError = form.querySelector('._form-error');
         if (formError && form.hasAttribute('data-goto-error')) {
            gotoBlock(formError, true, 1000);
         }
      }
   }
   // Действия после отправки формы
   function formSent(form) {
      // Создаем событие отправки формы
      document.dispatchEvent(new CustomEvent("formSent", {
         detail: {
            form: form
         }
      }));
      // Очищаем форму
      formValidate.formClean(form);
      // Сообщаем в консоль
      formLogging(`Форма отправлена!`);
   }
   function formLogging(message) {
      FLS(`[Формы]: ${message}`);
   }
}
/* Маски для полей (в работе) */
function formMasks(logging) {
   formsModules.inputMaskModule = new InputMask({
      logging: logging
   });
}
/* Модуль работы с select */
function formSelect() {
   formsModules.selectModule = new SelectConstructor({});
}
/* Модуь формы "показать пароль" */
function formViewpass() {
   document.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.closest('[class*="__viewpass"]')) {
         let inputType = targetElement.classList.contains('active') ? "password" : "text";
         targetElement.parentElement.querySelector('input').setAttribute("type", inputType);
         targetElement.classList.toggle('active');
      }
   });
}
/* Модуь формы "колличество" */
function formQuantity() {
   document.addEventListener("click", function (e) {
      let targetElement = e.target;
      if (targetElement.closest('.quantity__button')) {
         let value = parseInt(targetElement.closest('.quantity').querySelector('input').value);
         if (targetElement.classList.contains('quantity__button_plus')) {
            value++;
         } else {
            --value;
            if (value < 1) value = 1;
         }
         targetElement.closest('.quantity').querySelector('input').value = value;
      }
   });
}
/* Модуь звездного рейтинга */
function formRating() {
   const ratings = document.querySelectorAll('.rating');
   if (ratings.length > 0) {
      initRatings();
   }
   // Основная функция
   function initRatings() {
      let ratingActive, ratingValue;
      // "Бегаем" по всем рейтингам на странице
      for (let index = 0; index < ratings.length; index++) {
         const rating = ratings[index];
         initRating(rating);
      }
      // Инициализируем конкретный рейтинг
      function initRating(rating) {
         initRatingVars(rating);

         setRatingActiveWidth();

         if (rating.classList.contains('rating_set')) {
            setRating(rating);
         }
      }
      // Инициализайция переменных
      function initRatingVars(rating) {
         ratingActive = rating.querySelector('.rating__active');
         ratingValue = rating.querySelector('.rating__value');
      }
      // Изменяем ширину активных звезд
      function setRatingActiveWidth(index = ratingValue.innerHTML) {
         const ratingActiveWidth = index / 0.05;
         ratingActive.style.width = `${ratingActiveWidth}%`;
      }
      // Возможность указать оценку 
      function setRating(rating) {
         const ratingItems = rating.querySelectorAll('.rating__item');
         for (let index = 0; index < ratingItems.length; index++) {
            const ratingItem = ratingItems[index];
            ratingItem.addEventListener("mouseenter", function (e) {
               // Обновление переменных
               initRatingVars(rating);
               // Обновление активных звезд
               setRatingActiveWidth(ratingItem.value);
            });
            ratingItem.addEventListener("mouseleave", function (e) {
               // Обновление активных звезд
               setRatingActiveWidth();
            });
            ratingItem.addEventListener("click", function (e) {
               // Обновление переменных
               initRatingVars(rating);

               if (rating.dataset.ajax) {
                  // "Отправить" на сервер
                  setRatingValue(ratingItem.value, rating);
               } else {
                  // Отобразить указанную оцнку
                  ratingValue.innerHTML = index + 1;
                  setRatingActiveWidth();
               }
            });
         }
      }
      async function setRatingValue(value, rating) {
         if (!rating.classList.contains('rating_sending')) {
            rating.classList.add('rating_sending');

            // Отправика данных (value) на сервер
            let response = await fetch('rating.json', {
               method: 'GET',

               //body: JSON.stringify({
               //	userRating: value
               //}),
               //headers: {
               //	'content-type': 'application/json'
               //}

            });
            if (response.ok) {
               const result = await response.json();

               // Получаем новый рейтинг
               const newRating = result.newRating;

               // Вывод нового среднего результата
               ratingValue.innerHTML = newRating;

               // Обновление активных звезд
               setRatingActiveWidth();

               rating.classList.remove('rating_sending');
            } else {
               alert("Ошибка");

               rating.classList.remove('rating_sending');
            }
         }
      }
   }
}